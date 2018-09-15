pragma solidity ^0.4.24;

/// @title ERC-1420 Poll Standard
/// @dev See https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1420.md
///  Note: the ERC-165 identifier for this interface is 0x1d8362cf.
interface IPoll {
    /// @dev This emits when a person tries to vote without necessary permissions. Useful for auditing purposes.
    ///  E.g.: This is to prevent an admin to revoke permissions and to calculate the poll result had they not been removed.
    /// @param _from User who tried to vote
    /// @param _to the index of the proposal he voted to
    /// @param voteWeight the weight of his vote
    event TriedToVote(address indexed _from, uint8 _to, uint voteWeight);

    /// @dev This emits when a person votes successfully
    /// @param _from User who successfully voted
    /// @param _to the index of the proposal he voted to
    /// @param voteWeight the weight of his vote
    event CastVote(address indexed _from, uint8 _to, uint voteWeight);

    /// @dev This emits when a person revokes his vote
    /// @param _from User who successfully unvoted
    /// @param _to the index of the proposal he unvoted
    /// @param voteWeight the weight of his vote
    event RevokedVote(address indexed _from, uint8 _to, uint voteWeight);

    //returns the proposal names
    function getProposals() external view returns (bytes32[]);
    //returns whether the user can vote
    function canVote(address _to) external view returns (bool);
    //gets the vote weight against the proposalid
    function getVoteTally(uint _proposalId) external view returns (uint);
   
    //gets the vote count against the proposalid
    function getVoterCount(uint _proposalId) external view returns (uint);
    
    function calculateVoteWeight(address _to) external view returns (uint);
    //don't throw at all.. change state if canVote() .. else log

    function winningProposal() external view returns (uint8);

    function vote(uint8 _proposalId) external;

    function revokeVote() external;

    /// @notice gets the name of the poll e.g.: "Admin Election for Autumn 2018"
    /// @dev Set the name in the constructor of the poll
    /// @return the name of the poll
    function getName() external view returns (bytes32);
    
    /// @notice gets the type of the Poll e.g.: Token (XYZ) weighted poll
    /// @dev Set the poll type in the constructor of the poll
    /// @return the type of the poll
    function getPollType() external view returns (bytes32);

    /// @notice gets the logic to be used in a poll's `canVote` function e.g.: "XYZ Token | US & China(attributes in erc-1261) | Developers(attributes in erc-1261)"
    /// @dev Set the Voterbase logic in the constructor of the poll
    /// @return the voterbase logic
    function getVoterBaseLogic() external view returns (bytes32);

    /// @notice gets the start time for the poll
    /// @dev Set the start time in the constructor of the poll as Unix Standard Time
    /// @return start time as Unix Standard Time
    function getStartTime() external view returns (uint);

    /// @notice gets the end time for the poll
    /// @dev Set the end time in the constructor of the poll as Unix Standard Time or specify duration in constructor
    /// @return end time as Unix Standard Time
    function getEndTime() external view returns (uint);

    /// @notice retuns the list of entity addresses (eip-1261) used for perimissioning purposes. 
    /// @dev the protocol addresses list can be used along with IERC1261 interface to define the logic inside `canVote()` function
    /// @return the list of addresses of entities 
    function getProtocolAddresses() external view returns (address[]);

    /// @notice gets the vote weight against all proposals
    /// @dev limit the proposal count to 32 (for practical reasons), loop and generate the vote tally list
    /// @return the list of vote weights against all proposals
    function getVoteTallies() external view returns (uint[]);

    /// @notice gets the no. of people who voted against each proposal
    /// @dev limit the proposal count to 32 (for practical reasons), loop and generate the vote count list
    /// @return the list of voter count against all proposals
    function getVoterCounts() external view returns (uint[]);

}