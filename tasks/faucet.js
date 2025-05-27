const { task } = require("hardhat/config");

task("faucet", "Sends ETH and tokens to an address")
  .addParam("receiver", "The address that will receive them")
  .setAction(async ({ receiver }, { ethers }) => {
    if (ethers.utils && ethers.utils.isAddress(receiver)) {
      // Legacy ethers v5
      if (!ethers.utils.isAddress(receiver)) {
        throw new Error(`Invalid address: ${receiver}`);
      }
    } else {
      // Modern ethers v6
      if (!ethers.isAddress(receiver)) {
        throw new Error(`Invalid address: ${receiver}`);
      }
    }

    const [sender] = await ethers.getSigners();

    // Send 1 ETH for gas fees
    const ethTx = await sender.sendTransaction({
      to: receiver,
      value: ethers.parseEther("1.0")
    });

    await ethTx.wait();
    console.log(`Sent 1 ETH to ${receiver} (${ethTx.hash})`);

    // Load the token contract and send tokens
    try {
      const tokenAddress = require("../frontend/app/contracts/tokenAddress.json");
      const tokenArtifact = require("../frontend/app/contracts/tokenArtifact.json");
      
      const token = await ethers.getContractAt(tokenArtifact.abi, tokenAddress.Token);
      
      // Send 1000 tokens (adjust decimals as needed)
      const tokenTx = await token.transfer(receiver, ethers.parseEther("1000"));
      await tokenTx.wait();
      
      console.log(`Sent 1000 OERT tokens to ${receiver} (${tokenTx.hash})`);
    } catch (error) {
      console.log("Could not send tokens (contract may not be deployed):", error.message);
      console.log("ETH sent successfully for gas fees.");
    }
  });

module.exports = {};
