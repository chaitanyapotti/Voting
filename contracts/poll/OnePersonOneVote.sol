pragma solidity ^0.4.24;

import "./BasePoll.sol";


//these poll contracts are independent. Hence, protocol must be passed as a ctor parameter
contract OnePersonOneVote is BasePoll {

    constructor(address _electusProtocol, bytes32[] _proposalNames) public BasePoll(_electusProtocol, _proposalNames) {
        
    }

    function vote(uint8 proposal) public isCurrentMember {
        Voter storage sender = voters[msg.sender];
        require(!sender.voted, "Already voted.");
        sender.voted = true;
        sender.vote = proposal;
        sender.weight = 1;

        proposals[proposal].voteCount += sender.weight;
    }

    function revokeVote() public isCurrentMember {
        Voter storage sender = voters[msg.sender];
        require(sender.voted, "Hasn't yet voted.");
        sender.voted = false;
        proposals[sender.vote].voteCount -= sender.weight;
        sender.vote = 0;
        sender.weight = 0;
    }

    function countVotes() public view returns (uint8 winningProposal_) {
        uint winningVoteCount = 0;
        for (uint8 p = 0; p < proposals.length; p++) {
            if (proposals[p].voteCount > winningVoteCount) {
                winningVoteCount = proposals[p].voteCount;
                winningProposal_ = p;
            }
        }
    }
}