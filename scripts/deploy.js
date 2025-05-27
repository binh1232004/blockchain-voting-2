const VotingModule = require('../ignition/modules/OERVoting');
const hre = require('hardhat');
const fs = require('fs');
const path = require('path');

async function main() {
    // Get the network name
    const network = hre.network.name;
    console.log(`Deploying to ${network} network...`);
    
    // Deploy contracts with Ignition
    console.log("Deploying contracts...");
    const { votingContract, tokenContract } = await hre.ignition.deploy(VotingModule);
    
    // Optionally deploy faucet contract (only for local networks)
    // if (network === 'localhost' || network === 'hardhat') {
    //     console.log("Deploying faucet...");
    //     const { faucetContract } = await hre.ignition.deploy(FaucetModule);
    //     const faucetAddress = await faucetContract.getAddress();
    //     saveFrontendFiles(faucetAddress, "faucetAddress", "faucetArtifact", "Faucet");
    //     console.log(`Faucet contract deployed at: ${faucetAddress}`);
    // }
    
    // Get contract addresses
    const votingAddress = await votingContract.getAddress();
    const tokenAddress = await tokenContract.getAddress();
    
    // Save contract info for frontend use
    saveFrontendFiles(votingAddress, "votingAddress", "votingArtifact", "OERVoting");
    saveFrontendFiles(tokenAddress, "tokenAddress", "tokenArtifact", "OERToken");
    
    console.log(`OERToken contract deployed at: ${tokenAddress}`);
    console.log(`OERVoting contract deployed at: ${votingAddress}`);
    console.log(`Network: ${network}`);
    
    // Log information for contract verification
    if (network !== 'hardhat' && network !== 'localhost') {
        console.log("\nTo verify contracts on Etherscan:");
        console.log(`npx hardhat verify --network ${network} ${tokenAddress}`);
        console.log(`npx hardhat verify --network ${network} ${votingAddress} ${tokenAddress}`);
    }
}

function saveFrontendFiles(tokenAddress, fileAddressName, fileAbiName, contractName) {
    const contractsDir = path.join(
        __dirname,
        '../',
        'frontend',
        'app',
        'contracts',
    );

    if (!fs.existsSync(contractsDir)) {
        fs.mkdirSync(contractsDir);
    }

    fs.writeFileSync(
        path.join(contractsDir, fileAddressName + ".json"),
        JSON.stringify({ Token: tokenAddress }, undefined, 2),
    );

    const TokenArtifact = artifacts.readArtifactSync(contractName);

    fs.writeFileSync(
        path.join(contractsDir, fileAbiName + ".json"),
        JSON.stringify(TokenArtifact, null, 2),
    );
}

main().catch(console.error);
