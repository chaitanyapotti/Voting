pragma solidity ^0.4.24;

import "./BasePollBound.sol";


//All time bound contracts are abstract in nature. They need to be used within action contracts to 
//fulfill OnPollFinish() implementation.
//these poll contracts are independent. Hence, protocol must be passed as a ctor parameter. 
//These contracts will usually be deployed by Action contracts. Hence, these must refer Authorizable
contract DelegatedVoteBound is BasePollBound {

    constructor(address[] _protocolAddresses, bytes32[] _proposalNames, bytes32 _voterBaseLogic, bytes32 _pollName, 
        bytes32 _pollType, uint _startTime, uint _duration) 
        public BasePollBound(_protocolAddresses, _proposalNames, _voterBaseLogic, _pollName, _pollType, 
            _startTime, _duration) {
        }

    function vote(uint8 _proposal) external checkTime {
        Voter storage sender = voters[msg.sender];
        uint voteWeight = calculateVoteWeight(msg.sender);
        
        if (canVote(msg.sender) && !sender.voted && sender.delegate == address(0) && _proposal < proposals.length) {
            sender.weight = voteWeight;
            sender.voted = true;
            sender.vote = _proposal;
            proposals[_proposal].voteWeight += sender.weight;
            proposals[_proposal].voteCount += 1;
            emit CastVote(msg.sender, _proposal, voteWeight);
        } else {
            emit TriedToVote(msg.sender, _proposal, voteWeight);
        }
    }

    function revokeVote() external checkTime {
        revert("Can't revoke vote in delegated vote");
    }

    function delegate(address _to) external isValidVoter checkTime {
        Voter storage sender = voters[msg.sender];
        require(!sender.voted, "You already voted.");
        require(_to != msg.sender, "Self-delegation is disallowed.");
        require(canVote(_to), "dont have enough rights");
        // Forward the delegation as long as
        // `to` also delegated.
        // In general, such loops are very dangerous,
        // because if they run too long, they might
        // need more gas than is available in a block.
        // In this case, the delegation will not be executed,
        // but in other situations, such loops might
        // cause a contract to get "stuck" completely.
        while (voters[_to].delegate != address(0)) {
            address to = voters[_to].delegate;

            // We found a loop in the delegation, not allowed.
            require(to != msg.sender, "Found loop in delegation.");
        }

        sender.voted = true;
        Voter storage delegate_ = voters[_to];
        if (delegate_.voted) {
            // If the delegate already voted,
            // directly add to the number of votes
            proposals[delegate_.vote].voteWeight += calculateVoteWeight(msg.sender);
        } else {
            // If the delegate did not vote yet,
            // add to her weight.
            delegate_.weight = calculateVoteWeight(_to) + calculateVoteWeight(msg.sender);
        }
        sender.delegate = _to;
    }

    function calculateVoteWeight(address _to) public view returns (uint) {
        Voter storage sender = voters[_to];
        if (sender.delegate != address(0)) return 0;
        if (sender.weight == 0) return 1;
        return sender.weight;
    }
}