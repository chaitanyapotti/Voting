pragma solidity ^0.4.25;

import "./BasePoll.sol";

//Need to unfreeze all accounts at the end of poll

contract BasePollBound is BasePoll {

    modifier checkTime() {
        require(isPollValid(), "Poll hasn't started or has ended");
        _;
    }

    constructor(address[] _protocolAddresses, bytes32[] _proposalNames, bytes32 _voterBaseLogic, bytes32 _pollName, 
        bytes32 _pollType, uint _startTime, uint _duration) 
        public BasePoll(_protocolAddresses, _proposalNames, _voterBaseLogic, _pollName, _pollType, 
            _startTime, _duration) {
        }

    function isPollValid() public view returns (bool) {
        return (now >= startTime && now <= endTime);
    }

    function hasPollEnded() public view returns (bool) {
        return (now > endTime);
    }
}