// SPDX-License-Identifier: UNLICENSED
// pragma solidity ^0.8.28;
pragma solidity ^0.8.19; 

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "hardhat/console.sol";

contract OERVoting {
    // struct vote {
    //     uint256 tokenAmount;
    //     uint256 timestamp;
    // }
    uint256 public constant DECIMALS = 18;
    mapping (uint256 => mapping (address => uint256)) public oerPerUserVotes; // oerId -> userAddress -> vote
    mapping (uint256 => uint256) public oerTotalVotes; // oerId -> total vote || stored in wei
    IERC20 public votingToken;
    constructor(address _tokenAddress) {
        votingToken = IERC20(_tokenAddress);
    }

    function voteToken(uint256 oerId, uint256 tokenAmount) external payable{

        require(tokenAmount > 0, "Token amount must be positive");
        require(
            votingToken.balanceOf(msg.sender) >= tokenAmount,
            "Not have enough tokens"
        );

        votingToken.transferFrom(msg.sender, address(this), tokenAmount );
        oerPerUserVotes[oerId][msg.sender] += tokenAmount;
        // oerTotalVotes[oerId] += tokenAmount / (10 ** DECIMALS);
        // In wei 
        console.log("Vote token amount: ", tokenAmount);
        oerTotalVotes[oerId] += tokenAmount;
    }

    function getOerVotes(uint256 oerId) external view returns (uint256) {
        return oerTotalVotes[oerId];
    }

    function hasVotes(uint256 oerId) external view returns (bool) {
        return oerTotalVotes[oerId] > 0;
    }
    function getOerVotesInOERT(uint256 oerId) external view returns (uint256) {
        return oerTotalVotes[oerId] / (10 ** DECIMALS);
    }
}
