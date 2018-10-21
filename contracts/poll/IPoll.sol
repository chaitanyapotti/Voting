pragma solidity ^0.4.25;


/// @title ERC-1417 Poll Standard
/// @dev See https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1417.md
///  Note: the ERC-165 identifier for this interface is 0x4fad898b.
interface IPoll {
    /// @dev This emits when a person tries to vote without permissions. Useful for auditing purposes.
    ///  E.g.: To prevent an admin to revoke permissions; calculate the result had they not been removed.
    /// @param _from User who tried to vote
    /// @param _to the index of the proposal he voted to
    /// @param voteWeight the weight of his vote
    event TriedToVote(address indexed _from, uint8 indexed _to, uint voteWeight);

    /// @dev This emits when a person votes successfully
    /// @param _from User who successfully voted
    /// @param _to the index of the proposal he voted to
    /// @param voteWeight the weight of his vote
    event CastVote(address indexed _from, uint8 indexed _to, uint voteWeight);

    /// @dev This emits when a person revokes his vote
    /// @param _from User who successfully unvoted
    /// @param _to the index of the proposal he unvoted
    /// @param voteWeight the weight of his vote
    event RevokedVote(address indexed _from, uint8 indexed _to, uint voteWeight);

    /// @notice Handles the vote logic
    /// @dev updates the appropriate data structures regarding the vote.
    ///  stores the proposalId against the user to allow for unvote
    /// @param _proposalId the index of the proposal in the proposals array
    function vote(uint8 _proposalId) external;

    /// @notice Handles the unvote logic
    /// @dev updates the appropriate data structures regarding the unvote
    function revokeVote() external;

    /// @notice gets the proposal names
    /// @dev limit the proposal count to 32 (for practical reasons), loop and generate the proposal list
    /// @return the list of names of proposals
    function getProposals() external view returns (bytes32[]);

    /// @notice returns a boolean specifying whether the user can vote
    /// @dev implement logic to enable checks to determine whether the user can vote
    ///  if using eip-1261, use protocol addresses and interface (IERC1261) to enable checking with attributes
    /// @param _to the person who can vote/not
    /// @return a boolean as to whether the user can vote
    function canVote(address _to) external view returns (bool);
    
    /// @notice gets the vote weight of the proposalId
    /// @dev returns the current cumulative vote weight of a proposal
    /// @param _proposalId the index of the proposal in the proposals array 
    /// @return the cumulative vote weight of the specified proposal
    function getVoteTally(uint _proposalId) external view returns (uint);
   
    /// @notice gets the no. of voters who voted for the proposal
    /// @dev use a struct to keep a track of voteWeights and voterCount
    /// @param _proposalId the index of the proposal in the proposals array 
    /// @return the voter count of the people who voted for the specified proposal
    function getVoterCount(uint _proposalId) external view returns (uint);
    
    /// @notice calculates the vote weight associated with the person `_to`
    /// @dev use appropriate logic to determine the vote weight of the individual
    ///  For sample implementations, refer to end of the eip
    /// @param _to the person whose vote weight is being calculated
    /// @return the vote weight of the individual
    function calculateVoteWeight(address _to) external view returns (uint);
    
    /// @notice gets the leading proposal at the current time
    /// @dev calculate the leading proposal at the current time
    ///  For practical reasons, limit proposal count to 32.
    /// @return the index of the proposal which is leading
    function winningProposal() external view returns (uint8);

    /// @notice gets the name of the poll e.g.: "Admin Election for Autumn 2018"
    /// @dev Set the name in the constructor of the poll
    /// @return the name of the poll
    function getName() external view returns (bytes);
    
    /// @notice gets the type of the Poll e.g.: Token (XYZ) weighted poll
    /// @dev Set the poll type in the constructor of the poll
    /// @return the type of the poll
    function getPollType() external view returns (bytes);

    /// @notice gets the logic to be used in a poll's `canVote` function 
    ///  e.g.: "XYZ Token | US & China(attributes in erc-1261) | Developers(attributes in erc-1261)"
    /// @dev Set the Voterbase logic in the constructor of the poll
    /// @return the voterbase logic
    function getVoterBaseLogic() external view returns (bytes);

    /// @notice gets the start time for the poll
    /// @dev Set the start time in the constructor of the poll as Unix Standard Time
    /// @return start time as Unix Standard Time
    function getStartTime() external view returns (uint);

    /// @notice gets the end time for the poll
    /// @dev Set the end time in the constructor of the poll as Unix Time or specify duration in constructor
    /// @return end time as Unix Standard Time
    function getEndTime() external view returns (uint);

    /// @notice retuns the list of entity addresses (eip-1261) used for perimissioning purposes. 
    /// @dev addresses list can be used along with IERC1261 interface to define the logic inside `canVote()` function
    /// @return the list of addresses of entities 
    function getProtocolAddresses() external view returns (address[]);

    /// @notice gets the vote weight against all proposals
    /// @dev limit the proposal count to 32 (for practical reasons), loop and generate the vote tally list
    /// @return the list of vote weights against all proposals
    function getVoteTallies() external view returns (uint[]);

    /// @notice gets the no. of people who voted against all proposals
    /// @dev limit the proposal count to 32 (for practical reasons), loop and generate the vote count list
    /// @return the list of voter count against all proposals
    function getVoterCounts() external view returns (uint[]);

    /// @notice For single proposal polls, returns the total voterbase count. 
    ///  For multi proposal polls, returns the total vote weight against all proposals
    ///  this is used to calculate the percentages for each proposal
    /// @dev limit the proposal count to 32 (for practical reasons), loop and generate the voter base denominator
    /// @return an integer which specifies the above mentioned amount
    function getVoterBaseDenominator() external view returns (uint);
}