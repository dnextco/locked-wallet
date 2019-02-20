const LockedWallet = artifacts.require("./LockedWallet.sol");
const BN = web3.utils.BN;

module.exports = async function (callback) {
  try {
    let periodLength = new BN("604800");
    let amountPerPeriod = new BN("1136").mul(new BN("10000")).mul(new BN("10").pow(new BN("18")));
    let tokenAddress = "0xB0514a5b4Aa58aC6E954f537598dD42a71916581";

    LockedWallet.new(periodLength, amountPerPeriod, tokenAddress)
      .on("receipt", receipt => {
        console.log(receipt);
        callback();
      })
      .on("error", e => {
        console.error(e);
        callback(e);
      });
  } catch (e) {
    console.error(e);
    callback(e);
  }
};
