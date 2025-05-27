// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("VotingModule", (m) => {
  const tokenContract = m.contract("OERToken");
  const votingContract = m.contract("OERVoting", [tokenContract]);
  return {votingContract, tokenContract};
})