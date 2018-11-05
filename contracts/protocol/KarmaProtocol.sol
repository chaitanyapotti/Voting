pragma solidity ^0.4.25;

import "membershipverificationtoken/contracts/ERC1261MetaData.sol";


contract KarmaProtocol is ERC1261MetaData {

    struct KarmaData {
        uint currentKarma;
        mapping(address => bool) givenFrom;
    }

    mapping(address => KarmaData) public karma;

    uint private totalKarmaPresent;

    constructor(bytes32 _orgName, bytes32 _orgSymbol) public ERC1261MetaData(_orgName, _orgSymbol) {
    }

    function getCurrentKarma(address _to) public view returns (uint) {
        return karma[_to].currentKarma;
    }

    function getTotalKarma() public view returns (uint) {
        return totalKarmaPresent + currentMemberCount;
    }

    function upvote(address _to) public isCurrentHolder {
        require(_to != address(0), "can't increase karma for zero address");
        require(_to != msg.sender, "can't upvote self");
        require(isCurrentMember(_to), "the person upvoted must be a member");
        KarmaData storage data = karma[_to];
        require(!data.givenFrom[msg.sender], "Already given karma");
        data.givenFrom[msg.sender] = true;
        data.currentKarma += 1;
        totalKarmaPresent += 1;
    }

    function downvote(address _to) public isCurrentHolder {
        require(_to != address(0), "can't decrease karma for zero address");
        require(_to != msg.sender, "can't downvote self");
        require(isCurrentMember(_to), "the person downvoted must be a member");
        KarmaData storage data = karma[_to];
        require(data.givenFrom[msg.sender], "Haven't given karma yet. can't reduce now");
        data.givenFrom[msg.sender] = false;
        data.currentKarma -= 1;
        totalKarmaPresent -= 1;
    }
}