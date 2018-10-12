const HDWalletProvider = require("truffle-hdwallet-provider");
/*
 * NB: since truffle-hdwallet-provider 0.0.5 you must wrap HDWallet providers in a 
 * function when declaring them. Failure to do so will cause commands to hang. ex:
 * ```
 * mainnet: {
 *     provider: function() { 
 *       return new HDWalletProvider(mnemonic, 'https://mainnet.infura.io/<infura-key>') 
 *     },
 *     network_id: '1',
 *     gas: 4500000,
 *     gasPrice: 10000000000,
 *   },
 */

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*"
    },
    coverage: {
      host: "localhost",
      port: 8555, // <-- Use port 8555
      gas: 0xfffffffffff, // <-- Use this high gas value
      gasPrice: 0x01, // <-- Use this low gas price
      network_id: "1999"
    },
    rinkeby: {
      provider: new HDWalletProvider(
        "blue inherit drum enroll amused please camp false estate flash sell right",
        "https://rinkeby.infura.io/v3/dc22c9c6245742069d5fe663bfa8a698",
        0,
        25
      ),
      network_id: "3",
      gas: 6900000,
      gasPrice: 2000000000
    }
  },
  mocha: {
    useColors: true,
    enableTimeouts: false
  },
  compilers: {
    solc: {
      version: "0.4.25",
      settings: {
        optimizer: {
          enabled: true, // Default: false
          runs: 600 // Default: 200
        }
      }
    }
  }
};
