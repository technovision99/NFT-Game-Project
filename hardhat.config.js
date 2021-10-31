require("@nomiclabs/hardhat-waffle");
require("dotenv").config();
require("@appliedblockchain/chainlink-plugins-fund-link");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.0",
  networks: {
    rinkeby: {
      url: process.env.ALCHEMY_DEV_KEY,
      accounts: [process.env.PRIVATE_KEY],
      gas: 2100000,
      maxFeePerGas: 30000000000,
      saveDeployments: true,
    },
  },
};
