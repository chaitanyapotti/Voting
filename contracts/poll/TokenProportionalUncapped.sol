pragma solidity ^0.4.25;

import "./BasePoll.sol";
import "../Token/FreezableToken.sol";

//these poll contracts are independent. Hence, protocol must be passed as a ctor parameter.
//These contracts will usually be deployed by Action contracts. Hence, these must refer Authorizable
//All poll contracts post deployment must be authorized in the authorizable
contract TokenProportionalUncapped is BasePoll {
    FreezableToken public token;

    constructor(
        address[] _protocolAddresses,
        bytes32[] _proposalNames,
        address _tokenAddress,
        bytes32 _voterBaseLogic,
        bytes32 _pollName,
        bytes32 _pollType,
        uint _startTime,
        uint _duration
    ) public BasePoll(_protocolAddresses, _proposalNames, _voterBaseLogic, _pollName, _pollType, _startTime, _duration) {
        token = FreezableToken(_tokenAddress);
    }

    function vote(uint8 _proposal) external isPollStarted {
        Voter storage sender = voters[msg.sender];
        uint voteWeight = calculateVoteWeight(msg.sender);

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

    function revokeVote() external isValidVoter {
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

    function calculateVoteWeight(address _to) public view returns (uint) {
        return token.balanceOf(_to);
    }
}
