pragma solidity ^0.4.25;

import "./BasePollBound.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "../Token/FreezableToken.sol";


contract TokenProportionalCappedBound is BasePollBound {

    FreezableToken public token;    
    uint public capPercent;
    uint public capWeight;

    constructor(address[] _protocolAddresses, bytes32[] _proposalNames, address _tokenAddress, uint _capPercent, 
        bytes32 _voterBaseLogic, bytes32 _pollName, bytes32 _pollType, uint _startTime, uint _duration) public 
        BasePollBound (_protocolAddresses, _proposalNames, _voterBaseLogic, _pollName, _pollType, _startTime, 
        _duration) {
        token = FreezableToken(_tokenAddress);
        capPercent = _capPercent;
        capWeight = SafeMath.mul(_capPercent, token.getTotalMintableSupply());
        require(_capPercent < 100, "Percentage must be less than 100");
    }

    function vote(uint8 _proposal) external checkTime {
        Voter storage sender = voters[msg.sender];
        uint voteWeight = calculateVoteWeight(msg.sender);
        //vote weight is multiplied by 100 to account for decimals
        
        if (canVote(msg.sender) && !sender.voted && _proposal < proposals.length) {
            sender.voted = true;
            sender.vote = _proposal;
            sender.weight = voteWeight;
            proposals[_proposal].voteWeight += sender.weight;
            proposals[_proposal].voteCount += 1;
            emit CastVote(msg.sender, _proposal, sender.weight);
            //Need to check whether we can freeze or not.!
            token.freezeAccount(msg.sender);
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
        sender.weight = 0;        
        emit RevokedVote(msg.sender, votedProposal, voteWeight);
        token.unFreezeAccount(msg.sender);
    }

    //At the end of poll, user must call unfreeze himself
    function unFreezeTokens() external isValidVoter {
        require(hasPollEnded(), "Poll has not ended");
        token.unFreezeAccount(msg.sender);
    }

    function calculateVoteWeight(address _to) public view returns (uint) {
        uint currentWeight = SafeMath.mul(token.balanceOf(_to), 100);
        return currentWeight > capWeight ? capWeight : currentWeight;
    }
}