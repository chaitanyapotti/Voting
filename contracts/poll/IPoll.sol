pragma solidity ^0.4.24;

//Voterbase logic is hard coded and kept in the checkIfVoter function. The function takes input voterAddress and applies the necessary logic(custom implement) and returns a bool
interface IPoll {
    function getName() external view returns (bytes32);
    function getPollType() external view returns (bytes32);
    function getVoterBaseLogic() external view returns (bytes32);
    function getProposals() external view returns (bytes32[]);
    function canVote(address _to) external view returns (bool);
    function getVoteTally(uint _proposalId) external view returns (uint);
    function getVoterCount(uint _proposalId) external view returns (uint);
    function calculateVoteWeight(address _to) external view returns (uint);
    function vote(uint _proposalId) external;
    function revokeVote() external;
    function onPollFinish(uint _winningProposal) external;
}