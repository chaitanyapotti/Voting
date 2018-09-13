pragma solidity ^0.4.24;

import "../../contracts/poll/OnePersonOneVote.sol";


contract OnePersonOneVoteTest is OnePersonOneVote {
    
    constructor(address[] _protocolAddresses, bytes32[] _proposalNames, string _voterBaseLogic, string _pollName, string _pollType) 
        public OnePersonOneVote(_protocolAddresses, _proposalNames, _voterBaseLogic, _pollName, _pollType) {
        
    }

    function canVote(_to) public view returns (bool) {
        return (protocolAddresses[0].isCurrentMember(_to) || 
        protocolAddresses[1].isCurrentMember(_to)) && (protocolAddresses[2].isCurrentMember(_to) &&
        protocolAddresses[2].getAttributeByName("color") == "black");
    }
}   