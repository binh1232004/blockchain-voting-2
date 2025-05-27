const { task } = require("hardhat/config");

task("test-tokens", "Gives 1000 OERT tokens to an address for testing")
  .addParam("receiver", "The address that will receive the test tokens")
  .setAction(async ({ receiver }, { ethers }) => {
    // Validate address format
    if (ethers.utils && ethers.utils.isAddress) {
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

    console.log(`🎯 Giving 1000 OERT test tokens to: ${receiver}`);

    try {
      // Load the token contract
      const tokenAddress = require("../frontend/app/contracts/tokenAddress.json");
      const tokenArtifact = require("../frontend/app/contracts/tokenArtifact.json");
      
      // Get the signer (deployer account)
      const [deployer] = await ethers.getSigners();
      console.log(`📤 Sending from deployer: ${deployer.address}`);
        // Connect to the token contract
      console.log(`🔗 Token address: ${tokenAddress.Token}`);
      
      if (!tokenAddress.Token) {
        throw new Error("Token address not found. Make sure contracts are deployed.");
      }
      
      const token = await ethers.getContractAt(tokenArtifact.abi, tokenAddress.Token);
      
      // Check deployer's balance first
      const deployerBalance = await token.balanceOf(deployer.address);
      console.log(`💰 Deployer balance: ${ethers.formatEther(deployerBalance)} OERT`);
      
      if (deployerBalance < ethers.parseEther("1000")) {
        console.log("⚠️  Deployer doesn't have enough tokens. Minting more...");
        
        // Try to mint more tokens (if the contract has a mint function)
        try {
          const mintTx = await token.mint(deployer.address, ethers.parseEther("10000"));
          await mintTx.wait();
          console.log(`✅ Minted 10,000 OERT tokens to deployer`);
        } catch (mintError) {
          console.log("❌ Could not mint tokens. Using available balance.");
        }
      }
      
      // Transfer 1000 tokens to the receiver
      const tokenAmount = ethers.parseEther("1000");
      const tokenTx = await token.transfer(receiver, tokenAmount);
      await tokenTx.wait();
      
      // Check final balances
      const receiverBalance = await token.balanceOf(receiver);
      
      console.log(`✅ Successfully sent 1000 OERT tokens!`);
      console.log(`📊 Transaction hash: ${tokenTx.hash}`);
      console.log(`💳 Receiver balance: ${ethers.formatEther(receiverBalance)} OERT`);
      
    } catch (error) {
      console.error("❌ Error sending test tokens:", error.message);
      
      if (error.message.includes("contract not deployed")) {
        console.log("💡 Make sure the contracts are deployed first:");
        console.log("   npx hardhat run scripts/deploy.js --network localhost");
      } else if (error.message.includes("insufficient funds")) {
        console.log("💡 The deployer account doesn't have enough tokens.");
        console.log("   Try running the faucet task first or deploy fresh contracts.");
      }
      
      throw error;
    }
  });

task("test-tokens-bulk", "Gives 1000 OERT tokens to multiple addresses for testing")
  .addVariadicPositionalParam("receivers", "The addresses that will receive test tokens")
  .setAction(async ({ receivers }, { ethers }) => {
    console.log(`🎯 Giving 1000 OERT test tokens to ${receivers.length} addresses`);
    
    for (let i = 0; i < receivers.length; i++) {
      const receiver = receivers[i];
      console.log(`\n📦 Processing ${i + 1}/${receivers.length}: ${receiver}`);
      
      try {
        await hre.run("test-tokens", { receiver });
      } catch (error) {
        console.error(`❌ Failed to send tokens to ${receiver}:`, error.message);
      }
    }
    
    console.log(`\n🎉 Bulk token distribution completed!`);
  });

module.exports = {};
