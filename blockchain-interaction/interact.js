import dotenv from "dotenv";
import { ethers } from "ethers";

dotenv.config();

const { RPC_URL, PRIVATE_KEY, CONTRACT_ADDRESS } = process.env;

if (!RPC_URL || !PRIVATE_KEY || !CONTRACT_ADDRESS) {
    throw new Error("Missing RPC_URL, PRIVATE_KEY or CONTRACT_ADDRESS in .env");
}

console.log("Connexion au contrat StudentClubPoints :", CONTRACT_ADDRESS);

// Provider & Wallet (signer pour les transactions)
export const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// ABI complète et à jour (exactement comme ton contrat actuel)
const contractABI = [
    // === Écriture ===
    "function givePoints(address to, uint256 amount, string reason) external",
    "function burnPoints(address to, uint256 amount, string reason) external",

    // === Lecture ===
    "function getBalance(address account) external view returns (uint256)",
    "function isOwner(address account) external view returns (bool)",
    "function owner() external view returns (address)",

    // === Events ===
    "event PointsMinted(address indexed to, uint256 amount, string reason)",
    "event PointsBurned(address indexed account, uint256 amount, string reason)",
];

// Contrat connecté au wallet (pour envoyer des tx)
const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, wallet);
// Contrat en lecture seule (plus rapide pour les view)
export const contractRead = new ethers.Contract(CONTRACT_ADDRESS, contractABI, provider);

// ================================
// SERVICE BLOCKCHAIN
// ================================
export const blockchain = {

    // Admin : donner des points à quelqu'un
    async givePoints(toAddress, amount, reason = "Récompense manuelle") {
        const tx = await contract.givePoints(toAddress, amount, reason);
        const receipt = await tx.wait();
        console.log(`${amount} points donnés à ${toAddress} – Tx: ${receipt.hash}`);
        return receipt;
    },

    // Admin : brûler les points d'un utilisateur (sanction, correction, etc.)
    async burnUserPoints(userAddress, amount, reason = "Correction / sanction") {
        const tx = await contract.burnPoints(userAddress, amount, reason); // "to" dans le contrat
        const receipt = await tx.wait();
        console.log(`${amount} points brûlés pour ${userAddress} – Tx: ${receipt.hash}`);
        return receipt;
    },

    // Lecture : solde d'une adresse
    async getBalance(address) {
        const balance = await contractRead.getBalance(address);
        return Number(balance); // ou ethers.formatUnits(balance, 0)
    },

    // Vérifier si une adresse est admin
    async isOwner(address) {
        return await contractRead.isOwner(address);
    },

    // Adresse du owner
    async getOwner() {
        return await contractRead.owner();
    },

    // Solde du wallet connecté (pratique pour les logs)
    async getMyBalance() {
        return await this.getBalance(wallet.address);
    },

    // Utilitaire : attendre X confirmations (optionnel)
    async waitForTx(txHash, confirmations = 1) {
        const receipt = await provider.waitForTransaction(txHash, confirmations);
        return receipt;
    }
};

export default blockchain;