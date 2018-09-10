pragma solidity ^0.4.24;

import "./BasePollBound.sol";


//All time bound contracts are abstract in nature. They need to be used within action contracts to 
//fulfill OnPollFinish() implementation.
//these poll contracts are independent. Hence, protocol must be passed as a ctor parameter. 
//These contracts will usually be deployed by Action contracts. Hence, these must refer Authorizable
contract OnePersonOneVoteBound is BasePollBound {

    constructor(address _electusProtocol, address _authorizable, bytes32[] _proposalNames, 
    uint _startTime, uint _endTime) public BasePollBound(_electusProtocol, _authorizable, _proposalNames,
    _startTime, _endTime) {
    }

    function vote(uint8 proposal) public isCurrentMember checkTime {
        Voter storage sender = voters[msg.sender];
        require(!sender.voted, "Already voted.");
        sender.voted = true;
        sender.vote = proposal;
        sender.weight = 1;

        proposals[proposal].voteCount += sender.weight;
    }

    function revokeVote() public isCurrentMember checkTime {
        Voter storage sender = voters[msg.sender];
        require(sender.voted, "Hasn't yet voted.");
        sender.voted = false;
        proposals[sender.vote].voteCount -= sender.weight;
        sender.vote = 0;
        sender.weight = 0;
    }

    function finalizePoll() public isAuthorized {
        require(now > endTime, "Poll has not ended");
        uint winningVoteCount = 0;
        uint8 winningProposal_ = 0;
        for (uint8 p = 0; p < proposals.length; p++) {
            if (proposals[p].voteCount > winningVoteCount) {
                winningVoteCount = proposals[p].voteCount;
                winningProposal_ = p;
            }
        }
        onPollFinish(winningProposal_);
    }
}