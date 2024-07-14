import os
from tqdm import tqdm
import settings
from typing import List
import fitz  # PyMuPDF
import pytesseract
from PIL import Image
from dotenv import load_dotenv

from langchain_community.document_loaders import UnstructuredFileLoader
from langchain_community.document_loaders import TextLoader
from langchain.schema import Document
from langchain.text_splitter import TextSplitter

# Load environment variables
load_dotenv()

# Configure pytesseract path from .env file
pytesseract.pytesseract.tesseract_cmd = os.getenv('TESSERACT_PATH', r'C:\Program Files\Tesseract-OCR\tesseract.exe')

def extract_text_from_page(page):
    try:
        text = page.get_text()
        if text.strip():  # If there's text, it's not a scan
            return text
        else:  # If no text, it's likely a scan
            pix = page.get_pixmap()
            img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
            text = pytesseract.image_to_string(img)
            return text
    except Exception as e:
        print(f"Error extracting text from page: {e}")
        return ""

def load_pdf(file_path: str) -> List[Document]:
    try:
        doc = fitz.open(file_path)
        documents = []
        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            text = extract_text_from_page(page)
            if text.strip():
                documents.append(Document(page_content=text, metadata={"source": file_path, "page": page_num + 1}))
        doc.close()
        return documents
    except Exception as e:
        print(f"Error loading PDF {file_path}: {e}")
        return []

def execute(data_dir: str, text_splitter: TextSplitter) -> List[Document]:
    files = []
    if not data_dir or not os.path.isdir(data_dir):
        return []
    ignore_files = [".DS_Store"]
    for dir_path, dir_names, file_names in os.walk(data_dir):
        for file_name in file_names:
            if file_name not in ignore_files:
                files.append(os.path.join(dir_path, file_name))

    files_count = len(files)
    if files_count > 0:
        print(f"[Loading {files_count} file{'s'[:files_count ^ 1]} from {data_dir}.]")
    else:
        raise Exception(f"[Add files to {data_dir}.]")

    documents = []
    for file_path in tqdm(files, desc="Processing Files", unit="file"):
        new_documents = []
        if (file_size := _get_file_size(file_path)) > settings.MAX_DOCUMENT_SIZE_MB:
            print(
                f"Document {file_path} too big ({file_size} > {settings.MAX_DOCUMENT_SIZE_MB}), skipping."
            )
            continue
        try:
            if file_path.endswith(".json") or file_path.endswith(".txt"):
                # treat as text file, unstructured will try to load as json and fail
                loader = TextLoader(file_path)
                new_documents = loader.load()
            elif file_path.lower().endswith(".pdf"):
                # Use custom PDF loader with OCR capability
                new_documents = load_pdf(file_path)
            else:
                loader = UnstructuredFileLoader(file_path)
                new_documents = loader.load()
        except Exception as e:
            print(f"Error loading {file_path}: {e}")
        if text_splitter:
            document_chunks = _split_documents(text_splitter, new_documents)
            documents.extend(document_chunks)
        else:
            documents.extend(new_documents)
    print(f"Generated {len(documents)} documents from {files_count} files.")
    return documents

def _get_file_size(file_path):
    size_in_bytes = os.path.getsize(file_path)
    size_in_mb = size_in_bytes / 1024 / 1024
    return size_in_mb

def _split_documents(
    text_splitter: TextSplitter, documents: List[Document]
) -> List[Document]:
    document_chunks = []
    for document in documents:
        for chunk in text_splitter.split_text(document.page_content):
            document_chunks.append(
                Document(page_content=chunk, metadata=document.metadata)
            )
    return document_chunks
