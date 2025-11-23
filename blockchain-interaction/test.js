const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("StudentClubPoints", function () {
    let contract;
    let owner;
    let member1;
    let member2;

    beforeEach(async function () {
        [owner, member1, member2] = await ethers.getSigners();
        const Contract = await ethers.getContractFactory("StudentClubPoints");
        contract = await Contract.deploy();
    });

    it("Devrait déployer avec le bon owner", async function () {
        expect(await contract.owner()).to.equal(owner.address);
    });

    it("Devrait donner des points (givePoints)", async function () {
        await contract.givePoints(member1.address, 100, "Test");
        expect(await contract.getBalance(member1.address)).to.equal(100);
    });

    it("Devrait transférer des points (transferPoints)", async function () {
        await contract.givePoints(member1.address, 100, "Initial");
        await contract.connect(member1).transferPoints(member2.address, 50);
        expect(await contract.getBalance(member2.address)).to.equal(50);
    });

    it("Devrait brûler des points (usePoints)", async function () {
        await contract.givePoints(member1.address, 100, "Initial");
        await contract.connect(member1).usePoints(30, "Burn Test");
        expect(await contract.getBalance(member1.address)).to.equal(70);
    });

    it("Devrait récompenser une activité (rewardActivity)", async function () {
        const participants = [member1.address, member2.address];
        await contract.rewardActivity(participants, 20, "Hackathon");

        expect(await contract.getBalance(member1.address)).to.equal(20);
        expect(await contract.getBalance(member2.address)).to.equal(20);
    });
});
