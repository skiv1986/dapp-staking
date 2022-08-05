const {expect} = require("chai");
const {ethers} = require("hardhat");

describe("Staking", function () {
    let Staking, staking;
    let owner;
    let addr1;
    let addr2;
    let addr3;
    let addr4;
    let addr5;
    let addrs;

    before(async function () {
        [owner, addr1, addr2, addr3, addr4, addr5, ...addrs] = await ethers.getSigners();

        Staking = await hre.ethers.getContractFactory("Staking");
        staking = await Staking.deploy({
            value: ethers.utils.parseEther('10')
        });

        await staking.deployed();

        console.log("contract staking deployed to:", staking.address);

    });

    it('should set owner', async function () {

        expect(await staking.owner()).to.equal(owner.address);
    });

    it('sets up tiers and lockperiods', async function () {

        expect(await staking.lockPeriods(0)).to.equal(30);
        expect(await staking.lockPeriods(1)).to.equal(90);
        expect(await staking.lockPeriods(2)).to.equal(180);

        expect(await staking.tiers(30)).to.equal(700);
        expect(await staking.tiers(90)).to.equal(1000);
        expect(await staking.tiers(180)).to.equal(1200);
    });


    it('transfer ether  ', async function () {

        const provider = waffle.provider;
        let contractBalance;
        let signerBalance;
        const transferAmount = ethers.utils.parseEther('2.0')

        contractBalance = await provider.getBalance(staking.address)
        signerBalance = await owner.getBalance()

        const data = { value: transferAmount }
        const transaction =  await staking.connect(owner).stakeEther(30, data);
        const receipt = await transaction.wait()
        const gasUsed = receipt.gasUsed.mul(receipt.effectiveGasPrice)

        console.log(`gas used ${gasUsed}`)
        console.log(`signerBalance ${signerBalance}`)

        //test the change in owner ether balance
        expect(
            await owner.getBalance()
        ).to.equal(
            signerBalance.sub(transferAmount).sub(gasUsed)
        )


        //test the change in contract ether balance
        expect(
            await provider.getBalance(staking.address)
        ).to.equal(
            contractBalance.add(transferAmount)
        )
    });
});