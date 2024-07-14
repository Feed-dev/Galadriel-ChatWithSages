import { ethers } from 'ethers';
import ChatGptABI from './ChatGptABI.json';

export const CONTRACT_ADDRESS = '0xe49c399841C437AD3248D1ad296373Afc2612A05'; // Your deployed contract address

export async function getContract() {
  if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ChatGptABI, signer);
    return contract;
  }
  return null;
}