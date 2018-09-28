pragma solidity ^0.4.25;

import "../poll/OnePersonOneVote.sol";
import "electusprotocol/contracts/Protocol/IElectusProtocol.sol";
import "../ownership/Authorizable.sol";


contract OnePersonOneVoteTest is OnePersonOneVote, Authorizable {
    
    constructor(address[] _protocolAddresses, bytes32[] _proposalNames, bytes32 _voterBaseLogic,
    bytes32 _pollName, bytes32 _pollType, uint _startTime, uint _duration) 
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
}