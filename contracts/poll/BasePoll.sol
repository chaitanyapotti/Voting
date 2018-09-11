pragma solidity ^0.4.24;

import "electusprotocol/contracts/Protocol/IElectusProtocol.sol";
import "./IPoll.sol";


contract BasePoll /*is IPoll */{
    struct Proposal {
        uint voteCount;
        uint voteWeight;
        bytes32 name;
    }

    struct Voter {
        bool voted;
        uint8 vote;   // index of the voted proposal
        address delegate;
        uint weight;
        //uint timeStamp;
    }

    string public pollName;
    string public pollType;
    string public voterBaseLogic;

    Proposal[] public proposals;
    address[] public protocolAddresses;

    mapping(address => Voter) public voters;

    modifier isValidVoter() {
        require(canVote(msg.sender), "Not a valid voter");
        _;
    }

    constructor(address[] _protocolAddresses, bytes32[] _proposalNames) public {
        protocolAddresses = _protocolAddresses;
        voterBaseLogic = ""; //initialize here
        pollName = ""; //initialize here
        voterBaseLogic=""; //initialize here
        for (uint8 i = 0; i < _proposalNames.length; i++) {
            proposals.push(Proposal({name: _proposalNames[i], voteCount: 0, voteWeight: 0}));
        }
    }

    function getName() external view returns (string) {
        return name;
    }

    function getPollType() external view returns (string) {
        return pollType;
    }

    function getVoterBaseLogic() external view returns (string) {
        return voterBaseLogic;
    }

    function getProtocolAddresses() external view returns (address[]) {
        return protocolAddresses;
    }

    function getProposals() external view returns (bytes32[]) {
        uint proposalCount = proposals.length;
        bytes32[] memory proposalNames = new bytes32[proposalCount];
        for(uint index = 0; index < proposals.length; index++) {
            proposalNames[index] = proposals[index].name;
        }
        return proposalNames;
    }

    function canVote(address _to) external view returns (bool) {
        //This is to be filled by user before deploying poll. Can't be modified after poll is deployed
        return IElectusProtocol(protocolAddresses[0]).isCurrentMember(_to) && IElectusProtocol(protocolAddresses[1]).isCurrentMember(_to);
    }

    function getVoteTally(uint _proposalId) external view returns (uint) {
        return proposals[_proposalId].voteWeight;
    }

    function getVoteTallies() external view returns (uint[]) {
        uint proposalCount = proposals.length;
        uint[] memory proposalWeights = new bytes32[proposalCount];
        for(uint index = 0; index < proposals.length; index++) {
            proposalWeights[index] = proposals[index].voteWeight;
        }
        return proposalWeights;
    }

    function getVoterCount(uint _proposalId) external view returns (uint) {
        return proposals[_proposalId].voteCount;
    }

    function getVoterCounts() external view returns (uint[]) {
        uint proposalCount = proposals.length;
        uint[] memory proposalCounts = new bytes32[proposalCount];
        for(uint index = 0; index < proposals.length; index++) {
            proposalCounts[index] = proposals[index].voteCount;
        }
        return proposalCounts;
    }

    function calculateVoteWeight(address _to) external returns (uint);
    function vote(uint _proposalId) external;
    function revokeVote() external;
    function onPollFinish(uint _winningProposal) external;
}