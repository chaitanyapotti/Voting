pragma solidity ^0.4.24;

import "./ERC20Token.sol";
import "../Ownership/Authorizable.sol";
import "./IFreezableToken.sol";


//Authorizable because contracts(poll) can freeze funds
//Note that poll contract must be added into Authorizable
//This can be inherited because Authorizable is deployed with Freezable Token
contract FreezableToken is ERC20Token, Authorizable, IFreezableToken {
    mapping (address => bool) public frozenAccounts;
    event FrozenFunds(address target, bool frozen);

    function freezeAccount(address target) external onlyAuthorized {
        frozenAccounts[target] = true;
        emit FrozenFunds(target, true);
    }

    function unFreezeAccount(address target) external onlyAuthorized {
        frozenAccounts[target] = false;
        emit FrozenFunds(target, false);
    }

    function isFrozen(address _target) external view returns (bool) {
        return frozenAccounts[_target];
    }

    // @dev Limit token transfer if _sender is frozen.
    modifier canTransfer(address _sender) {
        require(!frozenAccounts[_sender]);
        _;
    }

    function transfer(address _to, uint256 _value) public canTransfer(msg.sender) returns (bool success) {
        // Call StandardToken.transfer()
        return super.transfer(_to, _value);
    }

    function transferFrom(address _from, address _to, uint256 _value) public canTransfer(_from) 
    returns (bool success) {
        // Call StandardToken.transferForm()
        return super.transferFrom(_from, _to, _value);
    }
}


