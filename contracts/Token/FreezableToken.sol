pragma solidity ^0.4.24;

import "./ERC20Token.sol";
import "../ownership/Authorizable.sol";
import "./IFreezableToken.sol";


//Authorizable because contracts(poll) can freeze funds
//Note that poll contract must be added into Authorizable
//This can be inherited because Authorizable is deployed with Freezable Token
contract FreezableToken is ERC20Token, Authorizable, IFreezableToken {
    struct FreezablePolls{
        uint currentPollsParticipating;
        mapping(address => bool) pollAddress;
    }

    mapping (address => FreezablePolls) public frozenAccounts;

    event FrozenFunds(address target, bool frozen);

    function freezeAccount(address _target) external onlyAuthorized {
        FreezablePolls storage user = frozenAccounts[_target];
        require(!user.pollAddress[msg.sender], "Already frozen by this poll");
        user.currentPollsParticipating += 1;
        user.pollAddress[msg.sender] = true;
        emit FrozenFunds(_target, true);
    }

    function unFreezeAccount(address _target) external onlyAuthorized {
        FreezablePolls storage user = frozenAccounts[_target];
        require(user.pollAddress[msg.sender], "Not already frozen by this poll");
        user.currentPollsParticipating -= 1;
        user.pollAddress[msg.sender] = false;
        emit FrozenFunds(_target, false);
    }

    // @dev Limit token transfer if _sender is frozen.
    modifier canTransfer(address _sender) {
        FreezablePolls storage user = frozenAccounts[_sender];
        require(user.currentPollsParticipating == 0, "Is part of certain polls");
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


