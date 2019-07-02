pragma solidity ^0.4.25;

import "../Token/FreezableToken.sol";

contract FreezableTestToken is FreezableToken {
    constructor() public {
        totalMintableSupply = 100000;
        mint(msg.sender, 100000);
    }
}
