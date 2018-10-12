pragma solidity ^0.4.25;

import "electusprotocol/contracts/Protocol/IElectusProtocol.sol";
import "./IPoll.sol";


contract BasePoll is IPoll {
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

    bytes32 public pollName;
    bytes32 public pollType;
    bytes32 public voterBaseLogic;
    uint public startTime;
    uint public endTime;

    Proposal[] public proposals;
    address[] public protocolAddresses;

    mapping(address => Voter) public voters;

    event TriedToVote(address indexed _from, uint8 indexed _to, uint voteWeight);
    event CastVote(address indexed _from, uint8 indexed _to, uint voteWeight);
    event RevokedVote(address indexed _from, uint8 indexed _to, uint voteWeight);

    modifier isValidVoter() {
        require(canVote(msg.sender), "Not a valid voter");
        _;
    }

    modifier isPollStarted() {
        require(hasPollStarted(), "Poll hasn't started");
        _;
    }

    constructor(address[] _protocolAddresses, bytes32[] _proposalNames, bytes32 _voterBaseLogic, bytes32 _pollName, 
        bytes32 _pollType, uint _startTime, uint _duration) public {
        //Make sure _proposalNames length < 32
        require(_proposalNames.length <= 32, "Proposals must be less than 32");
        protocolAddresses = _protocolAddresses;
        voterBaseLogic = _voterBaseLogic;
        pollName = _pollName;
        pollType = _pollType;
        startTime = _startTime;
        endTime = _startTime + _duration;
        require(_startTime >= now && _startTime <= _startTime + _duration, "Invalid Times");
        for (uint8 i = 0; i < _proposalNames.length; i++) {
            proposals.push(Proposal({name: _proposalNames[i], voteCount: 0, voteWeight: 0}));
        }
    }

    function vote(uint8 _proposalId) external;
    function revokeVote() external;

    function getName() external view returns (bytes32) {
        return pollName;
    }

    function getPollType() external view returns (bytes32) {
        return pollType;
    }

    function getVoterBaseLogic() external view returns (bytes32) {
        return voterBaseLogic;
    }

    function getProtocolAddresses() external view returns (address[]) {
        return protocolAddresses;
    }

    function getStartTime() external view returns (uint) {
        return startTime;
    }

    function getEndTime() external view returns (uint) {
        return endTime;
    }

    function getProposals() external view returns (bytes32[]) {
        bytes32[] memory proposalNames = new bytes32[](32);
        for (uint8 index = 0; index < proposals.length; index++) {
            proposalNames[index] = (proposals[index].name);
        }
        return proposalNames;
    }

    function getVoteTally(uint _proposalId) external view returns (uint) {
        return proposals[_proposalId].voteWeight;
    }

    function getVoteTallies() external view returns (uint[]) {
        uint[] memory proposalWeights = new uint[](32);
        for (uint8 index = 0; index < proposals.length; index++) {
            proposalWeights[index] = proposals[index].voteWeight;
        }
        return proposalWeights;
    }

    function getVoterCount(uint _proposalId) external view returns (uint) {
        return proposals[_proposalId].voteCount;
    }

    function getVoterCounts() external view returns (uint[]) {        
        uint[] memory proposalCounts = new uint[](32);
        for (uint8 index = 0; index < proposals.length; index++) {
            proposalCounts[index] = proposals[index].voteCount;
        }
        return proposalCounts;
    }

    function winningProposal() external view returns (uint8) {
        uint8 winningProposalIndex = 0;
        uint winningVoteCount = 0;
        for (uint8 p = 0; p < proposals.length; p++) {
            if (proposals[p].voteCount > winningVoteCount) {
                winningVoteCount = proposals[p].voteCount;
                winningProposalIndex = p;
            }
        }
        return winningProposalIndex;
    }
    
    function hasPollStarted() public view returns (bool) {
        return (now >= startTime);
    }

    //This is to be filled by user before deploying poll. 
    //User can't deploy a poll without implementing canVote function.
    //Can't be modified after poll is deployed. Here is a sample.
    //You can also use attributes to set parameters here
    //IERC1261 contract1 = IERC1261(protocolAddresses[0]);
    //IERC1261 contract2 = IERC1261(protocolAddresses[1]);
    //IERC1261 contract3 = IERC1261(protocolAddresses[2]);
    //&& contract2.isCurrentMember(_to) && (contract3.getAttributeByName(_to, 'Country') == 'India')
    //return contract1.isCurrentMember(_to);
    function canVote(address _to) public view returns (bool);
    function calculateVoteWeight(address _to) public view returns (uint);    
    function getVoterBaseDenominator() public view returns (uint);
}