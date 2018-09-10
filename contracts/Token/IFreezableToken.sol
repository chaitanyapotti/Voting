pragma solidity ^0.4.24;

import "./IERC20Token.sol";


contract IFreezableToken is IERC20Token {
    event FrozenFunds(address target, bool frozen);

    function freezeAccount(address target) external;
    function unFreezeAccount(address target) external;
    function isFrozen(address _target) external view returns (bool);
}