import { ethers } from "ethers";

const CONTRACT_ADDRESS = "0x54894b653C434931dDA06fb420912EF1bB807262" ;
const CONTRACT_ABI = [
  "function usePoints(uint256 amount, string reason) external",
  "function getBalance(address account) external view returns (uint256)",
  "function transferPointsFrom(address from, address to, uint256 amount) external",
  "event PointsTransferred(address indexed from, address indexed to, uint256 amount)"
];

let provider: ethers.BrowserProvider;
let signer: ethers.Signer;
let contract: ethers.Contract;

export const frontendBlockchain = {
  connectWallet: async (): Promise<string | null> => {
    
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return null;
    }

    await window.ethereum.request({ method: "eth_requestAccounts" });
    provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();
    contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

    const address = await signer.getAddress();
    console.log("Connected wallet:", address);
    return address;
  },

  getBalance: async (): Promise<number> => {
    if (!contract || !signer) await frontendBlockchain.connectWallet();
    const address = await signer.getAddress();
    const balance = await contract.getBalance(address);
    return Number(balance);
  },

  usePoints: async (amount: number, reason: string): Promise<any> => {
    if (!contract || !signer) await frontendBlockchain.connectWallet();
    const tx = await contract.usePoints(amount, reason);
    const receipt = await tx.wait();
    console.log(`Used ${amount} points – Tx: ${receipt.transactionHash}`);
    return receipt;
  },

  transferPoints: async (to: string, amount: number): Promise<any> => {
    if (!contract || !signer) await frontendBlockchain.connectWallet();
    const from = await signer.getAddress();
    const tx = await contract.transferPointsFrom(from, to, amount);
    const receipt = await tx.wait();
    console.log(`Transferred ${amount} points from ${from} → ${to}`);
    return receipt;
  }
};