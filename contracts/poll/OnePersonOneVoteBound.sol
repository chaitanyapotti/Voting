pragma solidity ^0.4.24;

import "./BasePollBound.sol";


//All time bound contracts are abstract in nature. They need to be used within action contracts to 
//fulfill OnPollFinish() implementation.
//these poll contracts are independent. Hence, protocol must be passed as a ctor parameter. 
//These contracts will usually be deployed by Action contracts. Hence, these must refer Authorizable
contract OnePersonOneVoteBound is BasePollBound {

    constructor(address[] _protocolAddresses, address _authorizable, bytes32[] _proposalNames, 
    uint _startTime, uint _endTime) public BasePollBound(_protocolAddresses, _authorizable, _proposalNames,
    _startTime, _endTime) {
    }

    function calculateVoteWeight(address _to) external pure returns (uint) {
        return 1;
    }

    function vote(uint8 _proposal) public checkTime {
       Voter storage sender = voters[msg.sender];
        uint voteWeight = calculateVoteWeight(msg.sender);
        emit TriedToVote(msg.sender, _proposal, voteWeight);
        if(canVote(msg.sender) && !sender.voted) {
            sender.voted = true;
            sender.vote = _proposal;
            sender.weight = voteWeight;
            proposals[proposal].voteWeight += sender.weight;
            proposals[proposal].voteCount += 1;
            emit CastVote(msg.sender, _proposal, sender.weight);
        }
    }

    function revokeVote() public isValidVoter checkTime {
        Voter storage sender = voters[msg.sender];
        require(sender.voted, "Hasn't yet voted.");
        sender.voted = false;
        proposals[sender.vote].voteWeight -= sender.weight;
        proposals[sender.vote].voteCount -= 1;
        sender.vote = 0;
        sender.weight = 0;
    }
}