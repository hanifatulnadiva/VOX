
import { defineConfig } from "hardhat/config";
import hardhatEthers from "@nomicfoundation/hardhat-ethers";

export default defineConfig({
  plugins: [hardhatEthers],

  solidity: "0.8.28",

  paths: {
    sources: "./contracts",
  },

  networks: {
    localhost: {
      type: "http",
      url: "http://127.0.0.1:8545",
    },
  },
});