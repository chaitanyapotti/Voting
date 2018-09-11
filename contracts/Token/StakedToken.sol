pragma solidity ^0.4.24;

import "./ERC20Token.sol";
import "../ownership/Authorizable.sol";
import "./IStakeableToken.sol";


//Authorizable because contracts(poll) can freeze funds
//Note that poll contract must be added into Authorizable
//This can be inherited because Authorizable is deployed with Freezable Token
contract StakedToken is ERC20Token, Authorizable, IStakeable {

    uint public minStakeAmount;

    struct Stake {
        uint amount;
        uint endTime;
    }

    struct StakeBalance {
        uint stakedBalance; //stakedbalance + spendablebalance = balanceOfUser
        uint transferableBalance;
        uint stakedAgainstBalance;
        uint stakeWeight;  //token * time
        uint lastStakedAt;
    }

    event Staked(address indexed from, address indexed target, uint indexed endTime, uint amount, bytes32 data);

    mapping(address => mapping(address => Stake[3])) stakedTokens; //stake[].length <= 3

    //Transfer / stake - we check prev stakes and delete expired ones delete arr[]

    mapping(address => address[15]) stakedAddresses; //stake for 15 addresses

    mapping(address => StakeBalance) stakedbalances;

    constructor(uint _minStakeAmount) public {
        minStakeAmount = _minStakeAmount;
    }

    function stakeFor(address _to, uint _amount, uint _endTime, bytes32 data) external {
        require(to != address(0), "Don't stake to zero address");
        require(_amount >= minStakeAmount, "Amount less than Minimum Stake amount of (in ether) " + SafeMath.mul(minStakeAmount * 10^-18));
        Stake[] storage currentStakes = stakedTokens[msg.sender][_to];
        
        for (uint8 index = 0; index < currentStakes.length; index++) {
            if(currentStakes[index].amount == 0) {
                currentStakes[index] = Stake({amount: _amount, endTime: _endTime});
            }
        }
        if(!isOldAddress) stakedAddresses.push(_to);

    }



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


