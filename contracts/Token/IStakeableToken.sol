pragma solidity ^0.4.24;


interface IStakeableToken {
    event Staked(address indexed from, address indexed target, uint indexed endTime, uint amount, bytes32 data);

    function stakeFor(address _to, uint _amount, uint _endTime, bytes32 data) external;
    function stake(uint _amount, uint _endTime, bytes32 data) external;
    function increaseStake(uint _amount, uint _endTime, bytes32 data) external;
    function increaseStakeFor(address _to, uint _amount, uint _endTime, bytes32 data) external;
    function getTotalStakedBalance(address _user) external returns (uint);
    function getTotalStakedAgainstBalance(address _user) external returns (uint);
    function getTransferableBalance(address _user) external returns (uint);
    function getStakeableBalance(address _user) external returns (uint);
    function getCurrentStakeWeight(address _user) external returns (uint);
    function getStakedToAddress(address _user) external returns (address[15]);
    function getTotalStakedFor(address _to) external returns (uint);
}