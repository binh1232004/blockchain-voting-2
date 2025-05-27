# How to deploy in local
1. npx hardhat node
2. npx hardhat ignition deploy ignition/modules/OERVoting.js --network localhost (deploy on localhost )
3. npx hardhat run scripts/deploy.js --network localhost  (save on frontend files)
4. npx hardhat faucet --network localhost --receiver <receiverId> (to get 1 eth for gas fee)