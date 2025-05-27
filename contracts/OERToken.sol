// SPDX-License-Identifier: UNLICENSED
// pragma solidity ^0.8.28;
pragma solidity ^0.8.19; 
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
contract OERToken is ERC20 {
    string public constant TOKEN_NAME = "Open Educational Resources Token";
    string public constant TOKEN_SYMBOL = "OERT";
    mapping(address => uint256) public lastVoteTimestamp;
    uint256 public constant DECIMALS = 18;
    uint256 public constant TOKENS_PER_CLAIM_PERIOD = 10 * (10 ** DECIMALS);
    uint256 public constant VOTING_COOLDOWN = 1 days;
    uint256 public constant MAX_TOKENS_PER_USER = 100 * (10 ** DECIMALS);
    uint256 public constant TOTAL_SUPPLY_TOKENS = 1000000 * (10 ** DECIMALS);


    constructor() ERC20(TOKEN_NAME, TOKEN_SYMBOL) {
    }
    function claimVotingTokens() public {

        require(
            block.timestamp >= lastVoteTimestamp[msg.sender] + VOTING_COOLDOWN,
            "Waiting for next claim"
        );
        require(
            balanceOf(msg.sender) + TOKENS_PER_CLAIM_PERIOD <= MAX_TOKENS_PER_USER,
            "Max tokens per user reached"
        );
        require(
            totalSupply() + (TOKENS_PER_CLAIM_PERIOD) <= TOTAL_SUPPLY_TOKENS,
            "Max tokens reached"
        );
        _mint(msg.sender, TOKENS_PER_CLAIM_PERIOD);
        lastVoteTimestamp[msg.sender] = block.timestamp;
    }
}
