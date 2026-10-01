import { expect } from "chai";
import hre from "hardhat";

describe("MiniBank", () => {
    let bank;
    let owner;
    let alice;
    let bob;
    let ethers;

    beforeEach(async () => {
        // Connect to the Hardhat network
        const connection = await hre.network.connect();

        // Get ethers from the Hardhat network connection
        ethers = connection.ethers;

        // Get test accounts
        [owner, alice, bob] = await ethers.getSigners();

        // Create contract factory
        const Factory = await ethers.getContractFactory("MiniBank");

        // Deploy a fresh MiniBank before every test
        bank = await Factory.deploy();
    });

    it("starts with a zero balance", async () => {
        expect(
            await bank.balances(alice.address)
        ).to.equal(0n);
    });

    it("allows a user to deposit ETH", async () => {
        const depositAmount = ethers.parseEther("1");

        await bank.connect(alice).deposit({
            value: depositAmount
        });

        expect(
            await bank.balances(alice.address)
        ).to.equal(depositAmount);
    });

    it("keeps user balances separate", async () => {
        const aliceDeposit = ethers.parseEther("1");
        const bobDeposit = ethers.parseEther("2");

        await bank.connect(alice).deposit({
            value: aliceDeposit
        });

        await bank.connect(bob).deposit({
            value: bobDeposit
        });

        expect(
            await bank.balances(alice.address)
        ).to.equal(aliceDeposit);

        expect(
            await bank.balances(bob.address)
        ).to.equal(bobDeposit);
    });

    it("accumulates multiple deposits", async () => {
        const firstDeposit = ethers.parseEther("1");
        const secondDeposit = ethers.parseEther("2");

        await bank.connect(alice).deposit({
            value: firstDeposit
        });

        await bank.connect(alice).deposit({
            value: secondDeposit
        });

        expect(
            await bank.balances(alice.address)
        ).to.equal(firstDeposit + secondDeposit);
    });

    it("emits a Deposited event", async () => {
        const depositAmount = ethers.parseEther("1");

        await expect(
            bank.connect(alice).deposit({
                value: depositAmount
            })
        )
            .to.emit(bank, "Deposited")
            .withArgs(alice.address, depositAmount);
    });

    it("allows a user to withdraw ETH", async () => {
        const depositAmount = ethers.parseEther("2");
        const withdrawalAmount = ethers.parseEther("1");

        await bank.connect(alice).deposit({
            value: depositAmount
        });

        await bank.connect(alice).withdraw(withdrawalAmount);

        expect(
            await bank.balances(alice.address)
        ).to.equal(
            depositAmount - withdrawalAmount
        );
    });

    it("rejects withdrawals greater than the user's balance", async () => {
        const depositAmount = ethers.parseEther("1");
        const withdrawalAmount = ethers.parseEther("2");

        await bank.connect(alice).deposit({
            value: depositAmount
        });

        await expect(
            bank.connect(alice).withdraw(withdrawalAmount)
        ).to.be.revertedWith(
            "MiniBank: insufficient balance"
        );
    });

    it("does not change the balance after a failed withdrawal", async () => {
        const depositAmount = ethers.parseEther("1");
        const withdrawalAmount = ethers.parseEther("2");

        await bank.connect(alice).deposit({
            value: depositAmount
        });

        const balanceBefore = await bank.balances(alice.address);

        await expect(
            bank.connect(alice).withdraw(withdrawalAmount)
        ).to.be.revertedWith(
            "MiniBank: insufficient balance"
        );

        const balanceAfter = await bank.balances(alice.address);

        expect(balanceAfter).to.equal(balanceBefore);
    });

    it("emits a Withdrawn event", async () => {
        const depositAmount = ethers.parseEther("2");
        const withdrawalAmount = ethers.parseEther("1");

        await bank.connect(alice).deposit({
            value: depositAmount
        });

        await expect(
            bank.connect(alice).withdraw(withdrawalAmount)
        )
            .to.emit(bank, "Withdrawn")
            .withArgs(alice.address, withdrawalAmount);
    });
});