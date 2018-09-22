pragma solidity ^0.4.25;

import "../Token/FreezableToken.sol";


contract FreezableTestToken is FreezableToken {
    constructor() public {
        totalSupply_ = 100;
        balances[msg.sender] = totalSupply_;
    }
} 