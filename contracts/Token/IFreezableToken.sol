pragma solidity ^0.4.24;


interface IFreezableToken {
    event FrozenFunds(address target, bool frozen);

    function freezeAccount(address target) external;
    function unFreezeAccount(address target) external;
    function isFrozen(address _target) external view returns (bool);
}