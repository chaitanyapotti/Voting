pragma solidity ^0.4.24;

import "./FreezableToken.sol";


//Authorizable because contracts(poll) can freeze funds
//Note that poll contract must be added into Authorizable
//This can be inherited because Authorizable is deployed with Freezable Token
contract StakedToken is FreezableToken {

    struct Stake {
        uint amount;
        uint endTime;
    }

    struct stakebalance {
        uint stakedBalance; //stakedbalance + spendablebalance = balanceOfUser
        uint spendableBalance;
        uint stakedAgainstBalance;
        uint stakeWeight;  //token * time
        uint lastStakedAt;
    }

    event Staked(address target, uint amount, uint endTime);

    mapping(address => mapping(address => Stake[4])) stakedTokens; //stake[].length <= 8

    //Transfer / stake - we check prev stakes and delete expired ones delete arr[]

    mapping(address => address[10]) stakedAddresses; //stake for 5 addresses

    mapping(address => stakebalance) stakedbalances;



    //No Unstake

    //When user stakes a token, the amount becomes frozen and non-transferable. Need to modify 
    //Freezable Token to.. not freeze account but account + balance. 
    //Need some sort of transferableBalance check

    //Need calculation for totalTransferable Balance at this moment
    //Need calculation for totalStaked Balance at this moment
    //Sum of both must be user balance

    //Query for staked against you + balances
    
    //Query to return all stakes you made for others. Cum balances

    //Vote weightage calculation based on this.


    function stakeBalance(address target, uint amount, uint endTime) external onlyAuthorized {

         freezeAccount(target);
        
    }

    // @dev Limit token transfer if _sender is frozen.
    modifier canTransfer(address _sender) {
        require(!frozenAccounts[_sender]); //&& stake period end
        _;
    }

    function transfer(address _to, uint256 _value) public canTransfer(msg.sender) returns (bool success) {
        // Call StandardToken.transfer()
        //Check if staked
        return super.transfer(_to, _value);
    }

    function transferFrom(address _from, address _to, uint256 _value) public canTransfer(_from) 
    returns (bool success) {
        // Call StandardToken.transferForm()
        //Check if staked
        return super.transferFrom(_from, _to, _value);
    }
}


