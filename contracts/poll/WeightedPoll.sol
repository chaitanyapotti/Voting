pragma solidity ^0.4.24;

import "../Protocol/IElectusProtocol.sol";
import "../Token/ERC20Token.sol";


contract WeightedPoll is IElectusProtocol, ERC20Token {

    struct Proposal {
        bytes32 name;
        uint256 voteCount;
    }

    struct Voter {
        uint weight;
        bool voted;
        address delegate;
        uint vote;   // index of the voted proposal
    }

    address public chairperson;

    mapping(address => Voter) public voters;

    Proposal[] public proposals;

    constructor(bytes32[] proposalNames) public {
        chairperson = msg.sender;
        // voters[chairperson].weight = 1;

        for (uint i = 0; i < proposalNames.length; i++) {
            proposals.push(Proposal({name: proposalNames[i], voteCount: 0}));
        }
    }

    function vote(uint proposal) public {
        require(isCurrentMember(msg.sender));
        Voter storage sender = voters[msg.sender];
        require(!sender.voted, "Already voted.");
        sender.voted = true;
        sender.vote = proposal;
        //cap is the max of total weightage percentage owned by an individual
        sender.weight = balanceOf(msg.sender) > safeMul(totalSupplyAmount(), cap) 
        ? safeMul(totalSupplyAmount(), cap) : balanceOf(msg.sender); //TODO

        proposals[proposal].voteCount += sender.weight;
    }

    function winningProposal() public view returns (uint winningProposal_)
    {
        uint winningVoteCount = 0;
        for (uint p = 0; p < proposals.length; p++) {
            if (proposals[p].voteCount > winningVoteCount) {
                winningVoteCount = proposals[p].voteCount;
                winningProposal_ = p;
            }
        }
    }

    function winnerName() public view returns (bytes32 winnerName_)
    {
        winnerName_ = proposals[winningProposal()].name;
    }

    function delegate(address to) public {
        Voter storage sender = voters[msg.sender];
        require(!sender.voted, "You already voted.");

        require(to != msg.sender, "Self-delegation is disallowed.");

        address _to = to;
        // Forward the delegation as long as
        // `to` also delegated.
        // In general, such loops are very dangerous,
        // because if they run too long, they might
        // need more gas than is available in a block.
        // In this case, the delegation will not be executed,
        // but in other situations, such loops might
        // cause a contract to get "stuck" completely.
        while (voters[_to].delegate != address(0)) {
            _to = voters[_to].delegate;

            // We found a loop in the delegation, not allowed.
            require(_to != msg.sender, "Found loop in delegation.");
        }

        // Since `sender` is a reference, this
        // modifies `voters[msg.sender].voted`
        sender.voted = true;
        sender.delegate = _to;
        Voter storage delegate_ = voters[_to];
        if (delegate_.voted) {
            // If the delegate already voted,
            // directly add to the number of votes
            proposals[delegate_.vote].voteCount += sender.weight;
        } else {
            // If the delegate did not vote yet,
            // add to her weight.
            delegate_.weight += sender.weight;
        }
    }    
}