require("@nomicfoundation/hardhat-toolbox");

// Import the faucet task
require("./tasks/faucet");
require("./tasks/accounts");
require("./tasks/testTokens");

const { vars } = require("hardhat/config");
/** @type import('hardhat/config').HardhatUserConfig */

// Go to https://infura.io, sign up, create a new API key
// in its dashboard, and add it to the configuration variables
const INFURA_API_KEY = vars.get("INFURA_API_KEY");

// Add your Sepolia account private key to the configuration variables
// To export your private key from Coinbase Wallet, go to
// Settings > Developer Settings > Show private key
// To export your private key from Metamask, open Metamask and
// go to Account Details > Export Private Key
// Beware: NEVER put real Ether into testing accounts
const SEPOLIA_PRIVATE_KEY = vars.get("SEPOLIA_PRIVATE_KEY");
module.exports = {
  solidity: "0.8.28",
  settings:{
    optimizer: {
      enabled: true,
      runs: 200
    },
  },
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    sepolia: {
      url: `https://sepolia.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [SEPOLIA_PRIVATE_KEY],
    },
  },
};
