pragma solidity ^0.4.24;

import "../Protocol/IElectusProtocol.sol";


contract BasePoll {
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

    mapping(address => Voter) public voters;

    Proposal[] public proposals;
    IElectusProtocol public protocol;

    modifier isCurrentMember() {
        require(protocol.isCurrentMember(msg.sender), "Not an electus member");
        _;
    }

    constructor(address _electusProtocol, bytes32[] _proposalNames) public {
        protocol = IElectusProtocol(_electusProtocol);
        for (uint8 i = 0; i < _proposalNames.length; i++) {
            proposals.push(Proposal({name: _proposalNames[i], voteCount: 0}));
        }
    }

    function vote(uint8 proposal) public;

    function revokeVote() public;

    function onPollFinish(uint8 winningProposal_) internal;
}