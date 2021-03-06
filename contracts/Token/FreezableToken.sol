pragma solidity ^0.4.25;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "./IFreezableToken.sol";

contract FreezableToken is ERC20, IFreezableToken {
    struct FreezablePolls {
        uint currentPollsParticipating;
        mapping(address => bool) pollAddress;
    }

    bool private _mintingFinished = false;
    uint public totalMintableSupply;
    event MintingFinish();
    event FrozenFunds(address target, bool frozen);

    mapping(address => FreezablePolls) public frozenAccounts;

    modifier onlyBeforeMintingFinished() {
        require(!_mintingFinished);
        _;
    }

    // @dev Limit token transfer if _sender is frozen.
    modifier canTransfer(address _sender) {
        FreezablePolls storage user = frozenAccounts[_sender];
        require(user.currentPollsParticipating == 0, "Is part of certain polls");
        _;
    }

    function isFrozen(address _target) external view returns (bool) {
        return (frozenAccounts[_target].currentPollsParticipating != 0);
    }

    function freezeAccount(address _target) public {
        FreezablePolls storage user = frozenAccounts[_target];
        require(!user.pollAddress[msg.sender], "Already frozen by this poll");
        user.currentPollsParticipating += 1;
        user.pollAddress[msg.sender] = true;
        emit FrozenFunds(_target, true);
    }

    function unFreezeAccount(address _target) public {
        FreezablePolls storage user = frozenAccounts[_target];
        require(user.pollAddress[msg.sender], "Not already frozen by this poll");
        user.currentPollsParticipating -= 1;
        user.pollAddress[msg.sender] = false;
        emit FrozenFunds(_target, false);
    }

    function transfer(address _to, uint256 _value) public canTransfer(msg.sender) returns (bool success) {
        // Call StandardToken.transfer()
        return super.transfer(_to, _value);
    }

    function transferFrom(address _from, address _to, uint256 _value) public canTransfer(_from) returns (bool success) {
        // Call StandardToken.transferForm()
        return super.transferFrom(_from, _to, _value);
    }

    function getTotalMintableSupply() public view returns (uint) {
        return totalMintableSupply;
    }

    function mintingFinished() public view returns (bool) {
        return _mintingFinished;
    }

    function mint(address _to, uint256 _amount) public onlyBeforeMintingFinished returns (bool) {
        require(totalSupply() <= totalMintableSupply, "Can't mint more than totalSupply");
        _mint(_to, _amount);
        return true;
    }

    function finishMinting() public onlyBeforeMintingFinished returns (bool) {
        _mintingFinished = true;
        emit MintingFinish();
        return true;
    }
}
