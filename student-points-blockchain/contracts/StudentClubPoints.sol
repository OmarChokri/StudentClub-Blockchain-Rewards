// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract StudentClubPoints {
    // ============================
    // Storage
    // ============================
    mapping(address => uint256) public balances;
    address public immutable owner;

    // ============================
    // Events
    // ============================
    event PointsMinted(address indexed to, uint256 amount, string reason);
    event PointsTransferred(address indexed from, address indexed to, uint256 amount);
    event PointsBurned(address indexed account, uint256 amount, string reason);
    event ActivityReward(address indexed participant, uint256 amount, string activityName);

    // ============================
    // Modifiers
    // ============================
    modifier onlyOwner() {
        require(msg.sender == owner, "Seul l'administrateur peut effectuer cette action");
        _;
    }

    // ============================
    // Constructor
    // ============================
    constructor(uint256 initialSupply) {
        owner = msg.sender;
        if (initialSupply > 0) {
            balances[msg.sender] = initialSupply;
            emit PointsMinted(msg.sender, initialSupply, "Initial admin supply");
        }
    }

    // ============================
    // 1. Admin : donner des points
    // ============================
    function givePoints(
        address to,
        uint256 amount,
        string calldata reason
    ) external onlyOwner {
        require(to != address(0), "Adresse invalide");
        require(amount > 0, "Montant doit etre > 0");

        balances[to] += amount;
        emit PointsMinted(to, amount, reason);
    }

    // ============================
    // 2. Transfert entre membres
    // ============================
    // Example with owner-only transfers (or you can implement allowance logic)
    function transferPointsFrom(
        address from,
        address to,
        uint256 amount
    ) external {
        require(from != address(0), "Adresse source invalide");
        require(to != address(0), "Adresse destination invalide");
        require(amount > 0, "Montant doit etre > 0");
        require(balances[from] >= amount, "Solde insuffisant");

        // Optional: only allow certain callers (like owner or approved addresses)
        // require(msg.sender == owner || allowed[msg.sender][from], "Non autorisé");

        balances[from] -= amount;
        balances[to] += amount;

        emit PointsTransferred(from, to, amount);
    }


    // ============================
    // 3. Utiliser / brûler ses propres points
    // ============================
    function usePoints(uint256 amount, string calldata reason) external {
        require(amount > 0, "Montant doit etre > 0");
        require(balances[msg.sender] >= amount, "Solde insuffisant");

        balances[msg.sender] -= amount;
        emit PointsBurned(msg.sender, amount, reason);
    }

    // ============================
    // 4. Admin : brûler les points d'un utilisateur
    // ============================
    function burnPoints(
        address to,
        uint256 amount,
        string calldata reason
    ) external onlyOwner {
        require(to != address(0), "Adresse invalide");
        require(amount > 0, "Montant doit etre > 0");
        require(balances[to] >= amount, "Solde insuffisant");

        balances[to] -= amount;
        emit PointsBurned(to, amount, reason);
    }

    // ============================
    // 5. Récompenser une liste de participants (optimisé gas)
    // ============================
    function rewardActivity(
        address[] calldata participants,
        uint256 pointsEach,
        string calldata activityName
    ) external onlyOwner {
        require(participants.length > 0, "Liste vide");
        require(pointsEach > 0, "Points doivent etre > 0");

        uint256 length = participants.length;
        for (uint256 i = 0; i < length; ) {
            address participant = participants[i];
            if (participant != address(0)) {
                balances[participant] += pointsEach;
                emit PointsMinted(participant, pointsEach, activityName);
                // Event séparé plus pratique pour le frontend
                emit ActivityReward(participant, pointsEach, activityName);
            }
            unchecked { ++i; }
        }
    }

    // ============================
    // View functions
    // ============================
    function getBalance(address account) external view returns (uint256) {
        return balances[account];
    }

    function isOwner(address account) external view returns (bool) {
        return account == owner;
    }
}