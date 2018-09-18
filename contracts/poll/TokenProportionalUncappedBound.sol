pragma solidity ^0.4.24;

import "./BasePollBound.sol";
import "../Token/FreezableToken.sol";


contract TokenProportionalUncappedBound is BasePollBound {

    FreezableToken public token;

    constructor(address[] _protocolAddresses, bytes32[] _proposalNames, address _tokenAddress, bytes32 _voterBaseLogic, bytes32 _pollName, bytes32 _pollType, uint _startTime, uint _duration) 
        public BasePollBound(_protocolAddresses, _proposalNames, _voterBaseLogic, _pollName, _pollType, _startTime, _duration) {
        token = FreezableToken(_tokenAddress);
    }

    function calculateVoteWeight(address _to) public view returns (uint) {
        return token.balanceOf(_to);
    }

    function vote(uint8 _proposal) external checkTime {
        Voter storage sender = voters[msg.sender];
        uint voteWeight = calculateVoteWeight(msg.sender);
        
        if(canVote(msg.sender) && !sender.voted && _proposal < proposals.length) {
            sender.voted = true;
            sender.vote = _proposal;
            sender.weight = voteWeight;
            proposals[_proposal].voteWeight += sender.weight;
            proposals[_proposal].voteCount += 1;
            emit CastVote(msg.sender, _proposal, sender.weight);
            //Need to check whether we can freeze or not.!
            token.freezeAccount(msg.sender);
        }
        else {
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
        sender.weight = 0;
        emit RevokedVote(msg.sender, votedProposal, voteWeight);
        token.unFreezeAccount(msg.sender);
    }

    //At the end of poll, user must call unfreeze himself
    function unFreezeTokens() external isValidVoter {
        require(hasPollEnded(), "Poll has not ended");
        token.unFreezeAccount(msg.sender);
    }
}