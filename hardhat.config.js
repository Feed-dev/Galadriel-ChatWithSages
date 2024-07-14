require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const GALADRIEL_DEVNET_URL = process.env.GALADRIEL_DEVNET_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: "galadrielDevnet",
  networks: {
    hardhat: {},
    localhost: {
      url: "http://127.0.0.1:8545",
    },
    galadrielDevnet: {
      url: GALADRIEL_DEVNET_URL,
      accounts: [PRIVATE_KEY],
      chainId: 696969,
      gasPrice: 1000000000,
      gas: 2100000,
    },
  },
  solidity: {
    version: "0.8.24",
    settings: {
      viaIR: true,
      evmVersion: "cancun",
    },
  },
};
