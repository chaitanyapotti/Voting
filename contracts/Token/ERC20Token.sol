pragma solidity ^0.4.24;


//For truffle compilation, use path zeppelin-solidity/contracts/ownership/Ownable.sol
//For linting purposes, use path zeppelin-solidity/ownership/Ownable.sol
import "./IERC20Token.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";


//generic implementation of ERC20 Token
contract ERC20Token is IERC20Token {

    mapping (address => uint256) public balances;
    mapping (address => mapping (address => uint256)) public allowed;

    function totalSupplyAmount() public view returns (uint256) {
        return totalSupply;
    }

    function transfer(address _to, uint256 _value) public returns (bool) {
        require(_to != address(0));
        require(balances[msg.sender] >= _value);

        balances[msg.sender] = SafeMath.safeSub(balances[msg.sender], _value);
        balances[_to] = SafeMath.safeAdd(balances[_to], _value);
        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    function transferFrom(address _from, address _to, uint256 _value) public returns (bool) {
        require(_to != address(0));
        require(balances[_from] >= _value && allowed[_from][msg.sender] >= _value);

        balances[_to] = SafeMath.safeAdd(balances[_to], _value);
        balances[_from] = SafeMath.safeSub(balances[_from], _value);
        allowed[_from][msg.sender] = SafeMath.safeSub(allowed[_from][msg.sender], _value);
        emit Transfer(_from, _to, _value);
        return true;
    }

    function balanceOf(address _owner) public view returns (uint256) {
        return balances[_owner];
    }

    function approve(address _spender, uint256 _value) public returns (bool) {
        allowed[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    function allowance(address _owner, address _spender) public view returns (uint256) {
        return allowed[_owner][_spender];
    }
}