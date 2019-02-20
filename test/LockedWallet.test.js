const LockedWallet = artifacts.require("LockedWallet");
const SimpleToken = artifacts.require("SimpleToken");

const { BN, time, shouldFail } = require("openzeppelin-test-helpers");

contract("LockedWallet", function ([admin, sender, receiver, user1]) {
  const BN_ZERO = new BN("0");
  const BN_ONE = new BN("1");
  const BN_TWO = new BN("2");
  const DECIMALS = new BN("10").pow(new BN("18"));
  const PERIOD_LENGTH = new BN("60").mul(new BN("60")).mul(new BN("24")).mul(new BN("7")); // 1 week = 168 hours = 10080 minutes = 604800 seconds
  const AMOUNT = new BN("1136").mul(new BN("10000")).mul(DECIMALS);
  const DEPOSIT_AMOUNT = new BN("15625000").mul(DECIMALS);
  const PERIOD_COUNT = DEPOSIT_AMOUNT.div(AMOUNT).mul(AMOUNT) < DEPOSIT_AMOUNT ? DEPOSIT_AMOUNT.div(AMOUNT).add(BN_ONE) : DEPOSIT_AMOUNT.div(AMOUNT);

  beforeEach(async function () {
    this.erc20 = await SimpleToken.new({ from: admin });
    this.wallet = await LockedWallet.new(PERIOD_LENGTH, AMOUNT, this.erc20.address, { from: receiver });
    await this.erc20.mint(sender, DEPOSIT_AMOUNT.mul(new BN("10")), { from: admin });
  });

  it("should correctly set values", async function () {
    (await this.wallet.periodLength()).should.be.bignumber.equal(PERIOD_LENGTH);
    (await this.wallet.amountPerPeriod()).should.be.bignumber.equal(AMOUNT);
    (await this.wallet.token()).should.be.equal(this.erc20.address);
  });

  it("should deposit", async function () {
    await this.erc20.approve(this.wallet.address, DEPOSIT_AMOUNT, { from: sender });
    await this.wallet.deposit(DEPOSIT_AMOUNT, { from: sender });

    (await this.erc20.balanceOf(this.wallet.address)).should.be.bignumber.equal(DEPOSIT_AMOUNT);
  });

  it("should not deposit again", async function () {
    await this.erc20.approve(this.wallet.address, DEPOSIT_AMOUNT.mul(BN_TWO), { from: sender });
    await this.wallet.deposit(DEPOSIT_AMOUNT, { from: sender });

    (await this.erc20.balanceOf(this.wallet.address)).should.be.bignumber.equal(DEPOSIT_AMOUNT);

    await shouldFail.reverting(
      this.wallet.deposit(DEPOSIT_AMOUNT, { from: sender })
    );

    (await this.erc20.balanceOf(this.wallet.address)).should.be.bignumber.equal(DEPOSIT_AMOUNT);
  });

  it("should not withdraw if not deposited", async function () {
    await time.increase(PERIOD_LENGTH.div(BN_TWO));

    await shouldFail.reverting(
      this.wallet.withdraw({ from: receiver })
    );

    (await this.erc20.balanceOf(receiver)).should.be.bignumber.equal(BN_ZERO);
  });

  context("with deposit", function () {
    beforeEach(async function () {
      await this.erc20.approve(this.wallet.address, DEPOSIT_AMOUNT, { from: sender });
      await this.wallet.deposit(DEPOSIT_AMOUNT, { from: sender });
      this.depositedTime = await time.latest();
    });

    it("should correctly set values", async function () {
      (await this.wallet.depositedTime()).should.be.bignumber.equal(this.depositedTime);
      (await this.wallet.depositedAmount()).should.be.bignumber.equal(DEPOSIT_AMOUNT);
    });

    it("should withdraw when period passed", async function () {
      await time.increase(PERIOD_LENGTH);

      (await this.wallet.withdraw({ from: receiver }));

      (await this.erc20.balanceOf(receiver)).should.be.bignumber.equal(AMOUNT);
    });

    it("should not withdraw when not called by owner", async function () {
      await time.increase(PERIOD_LENGTH);


      await shouldFail.reverting(
        this.wallet.withdraw({ from: user1 })
      );

      (await this.erc20.balanceOf(receiver)).should.be.bignumber.equal(BN_ZERO);
    });

    it("should not withdraw if time not passed", async function () {
      await time.increase(PERIOD_LENGTH.div(BN_TWO));

      await shouldFail.reverting(
        this.wallet.withdraw({ from: receiver })
      );

      (await this.erc20.balanceOf(receiver)).should.be.bignumber.equal(BN_ZERO);
    });

    it("should not withdraw if already withdrawn", async function () {
      await time.increase(PERIOD_LENGTH);

      await this.wallet.withdraw({ from: receiver });

      await shouldFail.reverting(
        this.wallet.withdraw({ from: receiver })
      );

      (await this.erc20.balanceOf(receiver)).should.be.bignumber.equal(AMOUNT);
    });

    it("should withdraw every amount", async function () {
      for (i = 0; i < PERIOD_COUNT; i++) {
        await time.increase(PERIOD_LENGTH);
        if (i % 3 === 0) {
          await time.increase(PERIOD_LENGTH);
        }

        let before = await this.erc20.balanceOf(receiver);
        await this.wallet.withdraw({ from: receiver });
        let after = await this.erc20.balanceOf(receiver);

        let expected = after.sub(before).lt(AMOUNT) ? after.sub(before) : AMOUNT;
        after.sub(before).should.be.bignumber.equal(expected);
      }

      (await this.erc20.balanceOf(receiver)).should.be.bignumber.equal(DEPOSIT_AMOUNT);
      (await this.erc20.balanceOf(this.wallet.address)).should.be.bignumber.equal(BN_ZERO);
    });
  });
});
