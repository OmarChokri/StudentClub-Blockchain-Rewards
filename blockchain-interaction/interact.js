require('dotenv').config();
const { ethers } = require('ethers');

// Provider + wallet
const provider = new ethers.JsonRpcProvider(process.env.GANACHE_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// ABI correcte pour TON contrat
const contractABI = [
    "function givePoints(address to, uint256 amount, string memory reason) public",
    "function transferPoints(address to, uint256 amount) public",
    "function usePoints(uint256 amount, string memory reason) public",
    "function getBalance(address user) public view returns (uint256)",
    "function checkIsOwner(address user) public view returns (bool)",
    "function owner() public view returns (address)",
    "function rewardActivity(address[] memory participants, uint256 pointsEach, string memory activityName) public",

    "event PointsMinted(address indexed to, uint256 amount, string reason)",
    "event PointsTransferred(address indexed from, address indexed to, uint256 amount)",
    "event PointsBurned(address indexed from, uint256 amount, string reason)"
];

// Contract instance
const contract = new ethers.Contract(
    process.env.CONTRACT_ADDRESS,
    contractABI,
    wallet
);

// --- FUNCTIONS -----------------------------------------------------

async function givePoints(toAddress, amount, reason) {
    const tx = await contract.givePoints(toAddress, amount, reason);
    await tx.wait();
    console.log(`Points donnés à ${toAddress}`);
}

async function transferPoints(toAddress, amount) {
    const tx = await contract.transferPoints(toAddress, amount);
    await tx.wait();
    console.log(`Transfert effectué`);
}

async function usePoints(amount, reason) {
    const tx = await contract.usePoints(amount, reason);
    await tx.wait();
    console.log(`Points brûlés`);
}

async function getBalance(address) {
    const balance = await contract.getBalance(address);
    console.log(`Solde : ${balance}`);
    return balance;
}

// --- MAIN EXECUTION -------------------------------------------------

async function main() {
    console.log("Owner:", await contract.owner());

    const testAddress = "0x0000000000000000000000000000000000000001";

    await givePoints(testAddress, 100, "Test points");

    await getBalance(testAddress);
}

// Lancer main()
main().catch(err => console.error(err));
