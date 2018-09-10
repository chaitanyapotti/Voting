pragma solidity ^0.4.24;

import "./BasePoll.sol";
import "../math/SafeMath.sol";
import "../Token/IFreezableToken.sol";


//these poll contracts are independent. Hence, protocol must be passed as a ctor parameter. 
//These contracts will usually be deployed by Action contracts. Hence, these must refer Authorizable
contract TokenProportionalCapped is BasePoll {

    IFreezableToken public token;
    uint8 public capPercent;

    constructor(address _electusProtocol, bytes32[] _proposalNames, address _tokenAddress, uint8 _capPercent) 
    public BasePoll(_electusProtocol, _proposalNames) {
        token = IFreezableToken(_tokenAddress);
        capPercent = _capPercent;
    }

    function vote(uint proposal) public isCurrentMember {
        Voter storage sender = voters[msg.sender];
        require(!sender.voted, "Already voted.");
        sender.voted = true;
        sender.vote = proposal;
        //Reduce gas consumption here
        sender.weight = SafeMath.safeMul(SafeMath.safeDiv(token.balanceOf(msg.sender), 
        token.totalSupply()), 100) > capPercent ? capPercent : SafeMath.safeDiv(token.balanceOf(msg.sender), 
        token.totalSupply());
        proposals[proposal].voteCount += sender.weight;
        token.freezeAccount(msg.sender);
    }

    function revokeVote() public isCurrentMember {
        Voter storage sender = voters[msg.sender];
        require(sender.voted, "Hasn't yet voted.");
        sender.voted = false;
        proposals[sender.vote].voteCount -= sender.weight;
        sender.vote = 0;
        sender.weight = 0;
        token.unFreezeAccount(msg.sender);
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