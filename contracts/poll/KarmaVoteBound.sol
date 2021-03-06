pragma solidity ^0.4.25;

import "./BasePollBound.sol";

//All time bound contracts are abstract in nature. They need to be used within action contracts to
//fulfill OnPollFinish() implementation.
//these poll contracts are independent. Hence, protocol must be passed as a ctor parameter.
//These contracts will usually be deployed by Action contracts. Hence, these must refer Authorizable
contract KarmaVoteBound is BasePollBound {
    constructor(
        address[] _protocolAddresses,
        bytes32[] _proposalNames,
        bytes32 _voterBaseLogic,
        bytes32 _pollName,
        bytes32 _pollType,
        uint _startTime,
        uint _duration
    ) public BasePollBound(_protocolAddresses, _proposalNames, _voterBaseLogic, _pollName, _pollType, _startTime, _duration) {}

    function vote(uint8 _proposal) external checkTime {
        Voter storage sender = voters[msg.sender];
        uint voteWeight = calculateVoteWeight(msg.sender);

        if (canVote(msg.sender) && !sender.voted && _proposal < proposals.length) {
            sender.voted = true;
            sender.vote = _proposal;
            sender.weight = voteWeight;
            proposals[_proposal].voteWeight += voteWeight;
            proposals[_proposal].voteCount += 1;
            emit CastVote(msg.sender, _proposal, voteWeight);
        } else {
            emit TriedToVote(msg.sender, _proposal, voteWeight);
        }
    }

    function revokeVote() external isValidVoter checkTime {
        Voter storage sender = voters[msg.sender];
        require(sender.voted, "Hasn't yet voted.");
        uint8 votedProposal = sender.vote;
        uint voteWeight = sender.weight;
        sender.voted = false;
        proposals[sender.vote].voteWeight -= sender.weight;
        proposals[sender.vote].voteCount -= 1;

        sender.vote = 0;
        if (sender.weight == 1) {
            sender.weight = 0;
        }
        emit RevokedVote(msg.sender, votedProposal, voteWeight);
    }

    function calculateVoteWeight(address _to) public view returns (uint);
}
