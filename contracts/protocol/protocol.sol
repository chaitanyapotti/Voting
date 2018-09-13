pragma solidity ^0.4.24;

import "electusprotocol/contracts/ERC1261MetaData.sol";


contract Protocol is ERC1261MetaData {
    constructor(string _orgName, string _orgSymbol) public {
        orgName = _orgName;
        orgSymbol = _orgSymbol;
    }
}