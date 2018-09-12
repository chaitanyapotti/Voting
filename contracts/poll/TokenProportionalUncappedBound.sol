pragma solidity ^0.4.24;

import "./BasePollBound.sol";
import "../Token/IFreezableToken.sol";


contract TokenProportionalUncappedBound is BasePollBound {

    IFreezableToken public token;

    constructor(address[] _protocolAddresses, address _tokenAddress, bytes32[] _proposalNames,uint _startTime, uint _endTime) 
        public BasePollBound(_protocolAddresses, _proposalNames, _startTime, _endTime) {
        token = IFreezableToken(_tokenAddress);
    }

    function calculateVoteWeight(address _to) external view returns (uint) {
        return token.balanceOf(_to);
    }

    function vote(uint _proposal) external checkTime {
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
            //Need to check whether we can freeze or not.!
            token.freezeAccount(msg.sender);
        }
    }

    function revokeVote() external isValidVoter checkTime {
        Voter storage sender = voters[msg.sender];
        require(sender.voted, "Hasn't yet voted.");
        sender.voted = false;
        proposals[sender.vote].voteWeight -= sender.weight;
        proposals[sender.vote].voteCount -= 1;
        sender.vote = 0;
        sender.weight = 0;
        token.unFreezeAccount(msg.sender);
    }

    //At the end of poll, user must call unfreeze himself
    function unFreezeTokens() external isValidVoter {
        require(hasPollEnded(), "Poll has not ended");
        token.unFreezeAccount(msg.sender);
    }
}