pragma solidity ^0.4.24;

import "./BasePoll.sol";

//Need to unfreeze all accounts at the end of poll

contract BasePollBound is BasePoll {
    
    uint public startTime;
    uint public endTime;

    modifier checkTime() {
        require(hasPollStarted(), "Poll hasn't started or has ended");
        _;
    }

    constructor(address[] _protocolAddresses, bytes32[] _proposalNames, uint _startTime, uint _endTime, bytes32 _voterBaseLogic, bytes32 _pollName, bytes32 _pollType) 
        public BasePoll(_protocolAddresses, _proposalNames, _voterBaseLogic, _pollName, _pollType) {
        require(_startTime >= now && _endTime > _startTime);
        startTime = _startTime;
        endTime = _endTime;
    }

    function hasPollStarted() public view returns (bool) {
        return (now >= startTime && now <= endTime);
    }

    function hasPollEnded() public view returns (bool) {
        return (now > endTime);
    }
}