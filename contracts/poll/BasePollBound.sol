pragma solidity ^0.4.24;

import "./BasePoll.sol";
import "../Ownership/Authorizable.sol";

//Need to unfreeze all accounts at the end of poll

contract BasePollBound is BasePoll {
    
    uint public startTime;
    uint public endTime;    

    Authorizable public authorizable;

    modifier checkTime() {
        require(now >= startTime && now <= endTime);
        _;
    }

    modifier isAuthorized() {
        require(authorizable.isAuthorized(msg.sender), "Not enough access rights");
        _;
    }

    constructor(address _electusProtocol, address _authorizable, bytes32[] _proposalNames,
    uint _startTime, uint _endTime) public BasePoll(_electusProtocol, _proposalNames) {        
        authorizable = Authorizable(_authorizable);
        require(_startTime >= now && _endTime > _startTime);
        startTime = _startTime;
        endTime = _endTime;
    }
}