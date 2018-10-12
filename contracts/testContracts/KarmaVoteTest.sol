pragma solidity ^0.4.25;

import "../poll/KarmaVote.sol";
import "electusprotocol/contracts/Protocol/IElectusProtocol.sol";
import "../protocol/KarmaProtocol.sol";


contract KarmaVoteTest is KarmaVote {
    
    constructor(address[] _protocolAddresses, bytes32[] _proposalNames, bytes32 _voterBaseLogic, 
        bytes32 _pollName, bytes32 _pollType, uint _startTime, uint _duration) 
        public KarmaVote(_protocolAddresses, _proposalNames, _voterBaseLogic, _pollName, _pollType,
        _startTime, _duration) {        
        }

    function canVote(address _to) public view returns (bool) {
        //return true;
        KarmaProtocol contract1 = KarmaProtocol(protocolAddresses[0]);
        return (contract1.isCurrentMember(_to));
    }

    function calculateVoteWeight(address _to) public view returns (uint) {
        KarmaProtocol contract1 = KarmaProtocol(protocolAddresses[0]);
        return (contract1.getCurrentKarma(_to) + 1);
    }

    function getVoterBaseDenominator() public view returns (uint) {
        uint totalMemberCount = 0;
        if (proposals.length <= 1) {
            for (uint i = 0; i < protocolAddresses.length; i++) {
                KarmaProtocol instance = KarmaProtocol(protocolAddresses[i]);
                totalMemberCount += instance.getTotalKarma();
            }
            return totalMemberCount;
        }
        uint proposalWeight = 0;
        for (uint8 index = 0; index < proposals.length; index++) {
            proposalWeight += proposals[index].voteWeight;
        }
        return proposalWeight;
    }
}   