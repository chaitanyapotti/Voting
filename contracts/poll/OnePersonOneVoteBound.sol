pragma solidity ^0.4.24;

import "./BasePollBound.sol";


//All time bound contracts are abstract in nature. They need to be used within action contracts to 
//fulfill OnPollFinish() implementation.
//these poll contracts are independent. Hence, protocol must be passed as a ctor parameter. 
//These contracts will usually be deployed by Action contracts. Hence, these must refer Authorizable
contract OnePersonOneVoteBound is BasePollBound {

    constructor(address[] _electusProtocol, address _authorizable, bytes32[] _proposalNames, 
    uint _startTime, uint _endTime) public BasePollBound(_electusProtocol, _authorizable, _proposalNames,
    _startTime, _endTime) {
    }

    function calculateVoteWeight(address _to) external returns (uint) {
        return 1;
    }

    function vote(uint8 proposal) external isValidVoter checkTime {
        Voter storage sender = voters[msg.sender];
        require(!sender.voted, "Already voted.");
        sender.voted = true;
        sender.vote = _proposal;
        sender.weight = calculateVoteWeight(msg.sender);

        proposals[proposal].voteWeight += sender.weight;
        proposals[proposal].voteCount += 1;
    }

    function revokeVote() external isValidVoter checkTime {
        Voter storage sender = voters[msg.sender];
        require(sender.voted, "Hasn't yet voted.");
        sender.voted = false;
        proposals[sender.vote].voteWeight -= sender.weight;
        proposals[sender.vote].voteCount -= 1;
        sender.vote = 0;
        sender.weight = 0;
    }

    function onPollFinish(uint _winningProposal) external;
}