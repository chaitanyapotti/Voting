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
}   