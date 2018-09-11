pragma solidity ^0.4.24;

//import "../Protocol/IElectusProtocol.sol";
import "./IPoll.sol";


contract BasePoll /*is IPoll */{
    struct Proposal {
        bytes32 name;
        uint256 voteCount;
    }

    struct Voter {
        bool voted;
        uint8 vote;   // index of the voted proposal
        address delegate;
        uint256 weight;
    }

    string public name;

    mapping(address => Voter) public voters;

    Proposal[] public proposals;
    //IElectusProtocol public protocol;

    modifier isCurrentMember() {
        //require(protocol.isCurrentMember(msg.sender), "Not an electus member");
        _;
    }

    constructor(address _electusProtocol, bytes32[] _proposalNames) public {
        //protocol = IElectusProtocol(_electusProtocol);
        //return "address(1).isCurrentMember(msg.sender) | address(2).isCurrentMember(msg.sender) & address(3).isCurrentMember(msg.sender)";
        for (uint8 i = 0; i < _proposalNames.length; i++) {
            proposals.push(Proposal({name: _proposalNames[i], voteCount: 0}));
        }
    }

    function getName() external view returns (string) {
        return name;
    }

    function getProposals() external view returns (bytes32[]) {
        bytes32[] proposalNames;
        for(uint index = 0; index < proposals.length; index++) {
            proposalNames.push(proposals[index].name);
        }
        return proposalNames;
    }

    function canVote(address _to) external view returns (bool) {
        return true;
    }

    function getVoteTally(uint _proposalId) external returns (uint[]) {
        
    }
    // function getVoterCount(uint _proposalId) external returns (uint);
    // function getVoterBaseLogic() external returns (bytes32);
    // function calculateVoteWeight(address _to) external returns (uint);
    // function vote(uint _proposalId) external;
    // function revokeVote() external;
    // function onPollFinish(uint _winningProposal) external;
}