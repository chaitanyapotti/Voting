pragma solidity ^0.4.24;

//Voterbase logic is hard coded and kept in the checkIfVoter function. The function takes input voterAddress and applies the necessary logic(custom implement) and returns a bool
interface IPoll {
    event TriedToVote(address indexed _from, uint indexed _to, uint voteWeight);
    event CastVote(address indexed _from, uint indexed _to, uint voteWeight);

    event RevokedVote(address indexed _from, uint indexed _to, uint voteWeight);

    //gets the name of the poll e.g.: "Admin Election for Autumn 2018"
    function getName() external view returns (bytes32);
    //gets Poll Type : Token (WAN) weighted poll
    function getPollType() external view returns (bytes32);
    //gets voterbaselogic : "WanChain | US & China | Developers". Use this and protocolAddresses to fill in hover over.
    function getVoterBaseLogic() external view returns (bytes32);
    //returns the protocol addresses e.g.: address for Wanchain, Us & China etc.
    function getProtocolAddresses() external view returns (address[]);
    //returns the proposal names
    function getProposals() external view returns (bytes32[]);
    //returns whether the user can vote
    function canVote(address _to) external view returns (bool);
    //gets the vote weight against the proposalid
    function getVoteTally(uint _proposalId) external view returns (uint);
    //gets the vote weight against all proposals
    function getVoteTallies() external view returns (uint[]);
    //gets the vote count against the proposalid
    function getVoterCount(uint _proposalId) external view returns (uint);
    //gets the vote count against all proposals
    function getVoterCounts() external view returns (uint[]);

    function calculateVoteWeight(address _to) external view returns (uint);
    //don't throw at all.. change state if canVote() .. else log
    function vote(uint _proposalId) external;
    function revokeVote() external;
    function onPollFinish(uint _winningProposal) external;
}