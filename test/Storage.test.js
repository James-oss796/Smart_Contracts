import { expect } from "chai";
import hre from "hardhat";


describe("Storage", () => {
    let storage, owner, stranger;

    beforeEach(async () => {

        const connection = await hre.network.connect();
        const {ethers} = connection;

        [owner, stranger] = await ethers.getSigners();

        const Factory = await ethers.getContractFactory("SecureStorage");
        storage = await Factory.deploy();
    });

    it("Sets the deployer as owner", async () => {
        expect(await storage.owner()).to.equal(owner.address);
    });

    it("Lets the owner update the value", async () => {
        await storage.set(42);

        expect(await storage.get()).to.equal(42n);
    });

    it("blocks a stranger from setting the value", async () => {
        await expect(
            storage.connect(stranger).set(99)
        ).to.be.revertedWith(
            "SecureStorage: Caller is not the owner"
        );
    });

    it("emits ValueChanged with old and new values", async () => {
        await expect(storage.set(7))
            .to.emit(storage, "ValueChanged")
            .withArgs(0n, 7n, owner.address);
    });
});