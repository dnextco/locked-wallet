require('dotenv').config();
const HDWalletProvider = require('truffle-hdwallet-provider');

module.exports = {
  networks: {
    development: {
     host: "127.0.0.1",
     port: 7545,
     network_id: "*",
    },
    coverage: {
      host: "localhost",
      port: 8555,
      gas: 0xfffffffffff,
      gasPrice: 0x01,
      network_id: "*"
    },
    ropsten: {
      provider: () => new HDWalletProvider(process.env.ROPSTEN_PRIVATE_KEY, 'https://ropsten.infura.io'),
      network_id: 3,
      gas: 5500000,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true
    },
    mainnet: {
      provider: () => new HDWalletProvider(process.env.MAINNET_PRIVATE_KEY, 'https://mainnet.infura.io'),
      gasPrice: 10000000000,
      network_id: 1,
    }
  },
  compilers: {
    solc: {
      version: "0.5.0",
      settings: {
       optimizer: {
         enabled: true,
         runs: 200
       }
      }
    }
  }
};
