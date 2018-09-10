pragma solidity ^0.4.24;

import "./BasePoll.sol";


//these poll contracts are independent. Hence, protocol must be passed as a ctor parameter
contract DelegatedVote is BasePoll {

    constructor(address _electusProtocol, bytes32[] _proposalNames) public BasePoll(_electusProtocol, _proposalNames) {
        
    }

    function vote(uint8 proposal) public isCurrentMember {
        Voter storage sender = voters[msg.sender];
        require(!sender.voted, "Already voted.");
        sender.voted = true;
        sender.vote = proposal;
        if (sender.weight == 0) {
            sender.weight = 1;
        }

        proposals[proposal].voteCount += sender.weight;
    }

    function revokeVote() public isCurrentMember {
        Voter storage sender = voters[msg.sender];
        require(sender.voted, "Hasn't yet voted.");
        sender.voted = false;
        proposals[sender.vote].voteCount -= sender.weight;
        sender.vote = 0;
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

    function delegate(address to) public isCurrentMember {
        Voter storage sender = voters[msg.sender];
        require(!sender.voted, "You already voted.");
        require(to != msg.sender, "Self-delegation is disallowed.");
        require(protocol.isCurrentMember(to), "Not an electus member");
        if (sender.weight == 0) {
            sender.weight = 1;
        }
        // Forward the delegation as long as
        // `to` also delegated.
        // In general, such loops are very dangerous,
        // because if they run too long, they might
        // need more gas than is available in a block.
        // In this case, the delegation will not be executed,
        // but in other situations, such loops might
        // cause a contract to get "stuck" completely.
        while (voters[to].delegate != address(0)) {
            to = voters[to].delegate;

            // We found a loop in the delegation, not allowed.
            require(to != msg.sender, "Found loop in delegation.");
        }

        sender.voted = true;
        sender.delegate = to;
        Voter storage delegate_ = voters[to];
        if (delegate_.voted) {
            // If the delegate already voted,
            // directly add to the number of votes
            proposals[delegate_.vote].voteCount += sender.weight;
        } else {
            // If the delegate did not vote yet,
            // add to her weight.
            delegate_.weight += sender.weight;
        }
    }
}