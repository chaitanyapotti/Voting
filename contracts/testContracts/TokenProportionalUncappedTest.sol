pragma solidity ^0.4.25;

import "../poll/TokenProportionalUncapped.sol";
import "membershipverificationtoken/contracts/Protocol/IERC1261.sol";

contract TokenProportionalUncappedTest is TokenProportionalUncapped {
    constructor(
        address[] _protocolAddresses,
        bytes32[] _proposalNames,
        address _tokenAddress,
        bytes32 _voterBaseLogic,
        bytes32 _pollName,
        bytes32 _pollType,
        uint _startTime,
        uint _duration
    )
        public
        TokenProportionalUncapped(_protocolAddresses, _proposalNames, _tokenAddress, _voterBaseLogic, _pollName, _pollType, _startTime, _duration)
    {}

    function canVote(address _to) public view returns (bool) {
        //return true;
        IERC1261 contract1 = IERC1261(protocolAddresses[0]);
        IERC1261 contract2 = IERC1261(protocolAddresses[1]);
        IERC1261 contract3 = IERC1261(protocolAddresses[2]);
        return (contract1.isCurrentMember(_to) || contract2.isCurrentMember(_to)) && (
            contract3.isCurrentMember(_to) && contract3.getAttributeByIndex(_to, 0) == 0
        );
    }

    function getVoterBaseDenominator() public view returns (uint) {
        if (proposals.length <= 1) {
            return token.totalSupply();
        }
        uint proposalWeight = 0;
        for (uint8 index = 0; index < proposals.length; index++) {
            proposalWeight += proposals[index].voteWeight;
        }
        return proposalWeight;
    }
}
