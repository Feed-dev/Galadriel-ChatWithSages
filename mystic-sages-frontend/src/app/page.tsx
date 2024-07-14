'use client';
import { useState, useEffect } from 'react';
import { getContract } from '../utils/contract';
import { ethers } from 'ethers';

export default function Home() {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [contract, setContract] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    async function initContract() {
      const c = await getContract();
      if (c) {
        setContract(c);
        setIsConnected(true);
      }
    }
    initContract();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (contract) {
      try {
        const tx = await contract.startChat(message);
        await tx.wait();
        
        const receipt = await tx.wait();
        const chatCreatedEvent = receipt.events.find(e => e.event === 'ChatCreated');
        const chatId = chatCreatedEvent.args.chatId.toNumber();

        const history = await contract.getMessageHistory(chatId);
        
        setChatHistory(history.map(msg => ({
          role: msg.role,
          content: msg.content[0].value
        })));

        setMessage('');
      } catch (error) {
        console.error("Error starting chat:", error);
      }
    }
  }

  if (!isConnected) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Mystic Sages Chat</h1>
        <p>Please connect your wallet to use the chat.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Mystic Sages Chat</h1>
      <div className="mb-4">
        {chatHistory.map((msg, index) => (
          <div key={index} className={`mb-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
            <span className={`inline-block p-2 rounded ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
              {msg.content}
            </span>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="flex">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-grow border p-2 rounded-l"
          placeholder="Type your message..."
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded-r">Send</button>
      </form>
    </div>
  );
}
