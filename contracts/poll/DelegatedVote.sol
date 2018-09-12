pragma solidity ^0.4.24;

import "./BasePoll.sol";


//these poll contracts are independent. Hence, protocol must be passed as a ctor parameter
contract DelegatedVote is BasePoll {

    constructor(address[] _protocolAddresses, bytes32[] _proposalNames) public BasePoll(_protocolAddresses, _proposalNames) {
        
    }

    function calculateVoteWeight(address _to) public view returns (uint) {
        Voter storage sender = voters[_to];
        if (sender.delegate != address(0)) return 0;
        if(sender.weight == 0) return 1;
        return sender.weight;
    }

    function vote(uint8 _proposal) external {
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

    function revokeVote() external {
        revert("Can't revoke vote in delegated vote");
    }
}