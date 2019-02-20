var LockedWallet = artifacts.require("./LockedWallet.sol");
const BN = web3.utils.BN;

module.exports = function (deployer) {
  const PERIOD_LENGTH = 604800;
  const AMOUNT_PER_PERIOD = new BN("15625000").mul(new BN("10").pow(new BN("18")));
  const TOKEN_ADDRESS = "0xB0514a5b4Aa58aC6E954f537598dD42a71916581";

  deployer.deploy(LockedWallet, PERIOD_LENGTH, AMOUNT_PER_PERIOD, TOKEN_ADDRESS)
};
