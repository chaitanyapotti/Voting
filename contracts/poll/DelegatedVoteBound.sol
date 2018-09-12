pragma solidity ^0.4.24;

import "./BasePollBound.sol";


//All time bound contracts are abstract in nature. They need to be used within action contracts to 
//fulfill OnPollFinish() implementation.
//these poll contracts are independent. Hence, protocol must be passed as a ctor parameter. 
//These contracts will usually be deployed by Action contracts. Hence, these must refer Authorizable
contract DelegatedVoteBound is BasePollBound {

    constructor(address[] _electusProtocol, address _authorizable, bytes32[] _proposalNames, 
    uint _startTime, uint _endTime) public BasePollBound(_electusProtocol, _authorizable, _proposalNames,
    _startTime, _endTime) {
    }

    function calculateVoteWeight(address _to) public view returns (uint) {
        Voter storage sender = voters[_to];
        if (sender.delegate != address(0)) return 0;
        if(sender.weight == 0) return 1;
        return sender.weight;
    }

    function vote(uint8 proposal) public checkTime {
        Voter storage sender = voters[msg.sender];
        uint voteWeight = calculateVoteWeight(msg.sender);
        emit TriedToVote(msg.sender, _propsal, voteWeight);
        if(canVote(msg.sender) && !sender.voted && sender.delegate == address(0)){
            sender.weight = voteWeight;
            sender.voted = true;
            sender.vote = _proposal;
            proposals[_proposal].voteWeight += sender.weight;
            proposals[_proposal].voteCount += 1;
            emit CastVote(msg.sender, _proposal, voteWeight);
        }
    }

    function revokeVote() external checkTime {
        revert("Can't revoke vote in delegated vote");
    }

}