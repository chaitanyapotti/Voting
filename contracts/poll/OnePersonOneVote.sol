pragma solidity ^0.4.24;

import "./BasePoll.sol";


//these poll contracts are independent. Hence, protocol must be passed as a ctor parameter
contract OnePersonOneVote is BasePoll {

    constructor(address[] _protocolAddresses, bytes32[] _proposalNames) public BasePoll(_protocolAddresses, _proposalNames) {
        
    }
    
    function calculateVoteWeight(address _to) external pure returns (uint) {
        return 1;
    }

    function vote(uint8 _proposal) external {
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

    function revokeVote() external isValidVoter {
        Voter storage sender = voters[msg.sender];
        require(sender.voted, "Hasn't yet voted.");
        sender.voted = false;
        proposals[sender.vote].voteWeight -= sender.weight;
        proposals[sender.vote].voteCount -= 1;
        sender.vote = 0;
        sender.weight = 0;
    }
}