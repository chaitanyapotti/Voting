pragma solidity ^0.4.25;

import "../poll/OnePersonOneVote.sol";
import "electusprotocol/contracts/Protocol/IElectusProtocol.sol";
import "../ownership/Authorizable.sol";


contract OnePersonOneVoteTest is OnePersonOneVote, Authorizable {
    
    constructor(address[] _protocolAddresses, bytes32[] _proposalNames, bytes _voterBaseLogic,
    bytes _pollName, bytes _pollType, uint _startTime, uint _duration) 
        public OnePersonOneVote(_protocolAddresses, _proposalNames, _voterBaseLogic, _pollName,
        _pollType, _startTime, _duration) {
        }

    function canVote(address _to) public view returns (bool) {
        //return true;
        IERC1261 contract1 = IERC1261(protocolAddresses[0]);
        IERC1261 contract2 = IERC1261(protocolAddresses[1]);
        IERC1261 contract3 = IERC1261(protocolAddresses[2]);
        return (contract1.isCurrentMember(_to) || 
        contract2.isCurrentMember(_to)) && (contract3.isCurrentMember(_to) &&
        contract3.getAttributeByName(_to, 0x6861697200000000000000000000000000000000000000000000000000000000)
        == 0x626c61636b000000000000000000000000000000000000000000000000000000);
    }

    function getVoterBaseDenominator() public view returns (uint) {
        uint totalMemberCount = 0;
        if (proposals.length <= 1) {
            for (uint i = 0; i < protocolAddresses.length; i++) {
                IERC1261 instance = IERC1261(protocolAddresses[i]);
                totalMemberCount += instance.getCurrentMemberCount();
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