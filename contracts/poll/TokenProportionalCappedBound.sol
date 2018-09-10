pragma solidity ^0.4.24;

import "./BasePollBound.sol";
import "../math/SafeMath.sol";
import "../Token/IFreezableToken.sol";


contract TokenProportionalCappedBound is BasePollBound {

    IFreezableToken public token;    
    uint8 public capPercent;

    constructor(address _electusProtocol, address _authorizable, address _tokenAddress, bytes32[] _proposalNames, 
    uint8 _capPercent, uint _startTime, uint _endTime) public BasePollBound(_electusProtocol, _authorizable,
    _proposalNames, _startTime, _endTime) {
        token = IFreezableToken(_tokenAddress);
        capPercent = _capPercent;
    }

    function vote(uint8 proposal) public isCurrentMember checkTime {
        Voter storage sender = voters[msg.sender];
        require(!sender.voted, "Already voted.");
        sender.voted = true;
        sender.vote = proposal;
        sender.weight = SafeMath.safeMul(SafeMath.safeDiv(token.balanceOf(msg.sender), 
        token.totalSupply()), 100) > capPercent ? capPercent : SafeMath.safeDiv(token.balanceOf(msg.sender), 
        token.totalSupply());
        proposals[proposal].voteCount += sender.weight;
        //Need to check whether we can freeze or not.!
        token.freezeAccount(msg.sender);
    }

    function revokeVote() public isCurrentMember {
        Voter storage sender = voters[msg.sender];
        require(sender.voted, "Hasn't yet voted.");
        if (now <= endTime && now >= startTime) {
            sender.voted = false;
            proposals[sender.vote].voteCount -= sender.weight;
            sender.vote = 0;
            sender.weight = 0;
        }
        token.unFreezeAccount(msg.sender);
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