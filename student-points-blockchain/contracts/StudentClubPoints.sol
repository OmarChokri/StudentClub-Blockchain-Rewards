// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract StudentClubPoints {
    // Stockage des balances de points
    mapping(address => uint256) public balances;
    
    // Administrateur du système
    address public owner;
    
    // Événements pour le frontend
    event PointsMinted(address indexed to, uint256 amount, string reason);
    event PointsTransferred(address indexed from, address indexed to, uint256 amount);
    event PointsBurned(address indexed from, uint256 amount, string reason);
    
    // Modificateur pour restreindre à l'admin
    modifier onlyOwner() {
        require(msg.sender == owner, "Seul l'admin peut effectuer cette action");
        _;
    }
    
    // Constructeur - exécuté au déploiement
    constructor() {
        owner = msg.sender; // Celui qui déploie devient admin
        balances[msg.sender] = 1000; // L'admin reçoit des points initiaux
    }
    
    // 1. DONNER des points (Admin seulement)
    function givePoints(address to, uint256 amount, string memory reason) public onlyOwner {
        require(to != address(0), "Adresse invalide");
        require(amount > 0, "Le montant doit etre superieur a 0");
        
        balances[to] += amount;
        emit PointsMinted(to, amount, reason);
    }
    
    // 2. TRANSFÉRER des points (Entre membres)
    function transferPoints(address to, uint256 amount) public {
        require(balances[msg.sender] >= amount, "Solde insuffisant");
        require(to != address(0), "Adresse destination invalide");
        require(amount > 0, "Le montant doit etre superieur a 0");
        
        balances[msg.sender] -= amount;
        balances[to] += amount;
        emit PointsTransferred(msg.sender, to, amount);
    }
    
    // 3. UTILISER des points (Brûler)
    function usePoints(uint256 amount, string memory reason) public {
        require(balances[msg.sender] >= amount, "Solde insuffisant");
        require(amount > 0, "Le montant doit etre superieur a 0");
        
        balances[msg.sender] -= amount;
        emit PointsBurned(msg.sender, amount, reason);
    }
    
    // 4. LIRE le solde d'un membre
    function getBalance(address user) public view returns (uint256) {
        return balances[user];
    }
    
    // 5. VÉRIFIER si une address est admin
    function checkIsOwner(address user) public view returns (bool) {
        return user == owner;
    }
    
    // 6. Fonction spéciale pour les activités (Admin)
    function rewardActivity(address[] memory participants, uint256 pointsEach, string memory activityName) public onlyOwner {
        require(participants.length > 0, "Aucun participant");
        require(pointsEach > 0, "Points doivent etre positifs");
        
        for(uint i = 0; i < participants.length; i++) {
            if(participants[i] != address(0)) {
                balances[participants[i]] += pointsEach;
                emit PointsMinted(participants[i], pointsEach, activityName);
            }
        }
    }
}