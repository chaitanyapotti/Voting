var KarmaVoteTest = artifacts.require("./KarmaVoteTest.sol");
var KarmaProtocol = artifacts.require("./KarmaProtocol.sol");
const truffleAssert = require("truffle-assertions");

const increaseTime = function(duration) {
  const id = Date.now();
  return new Promise((resolve, reject) => {
    web3.currentProvider.sendAsync(
      {
        jsonrpc: "2.0",
        method: "evm_increaseTime",
        params: [duration],
        id: id
      },
      err1 => {
        if (err1) return reject(err1);
        web3.currentProvider.sendAsync(
          {
            jsonrpc: "2.0",
            method: "evm_mine",
            id: id + 1
          },
          (err2, res) => {
            return err2 ? reject(err2) : resolve(res);
          }
        );
      }
    );
  });
};

contract("Karma Vote Test", function(accounts) {
  beforeEach("setup", async () => {
    protocolContract = await KarmaProtocol.new(
      "0x57616e636861696e",
      "0x57414e",
      {
        gas: 3000000
      }
    );
    await protocolContract.addAttributeSet(web3.fromAscii("hair"), [
      web3.fromAscii("black")
    ]);
    await protocolContract.assignTo(accounts[1], [0], {
      from: accounts[0]
    });
    await protocolContract.assignTo(accounts[2], [0], {
      from: accounts[0]
    });
    await protocolContract.assignTo(accounts[3], [0], {
      from: accounts[0]
    });
    await protocolContract.assignTo(accounts[4], [0], {
      from: accounts[0]
    });
    await protocolContract.assignTo(accounts[5], [0], {
      from: accounts[0]
    });
    var presentTime = web3.eth.getBlock(web3.eth.blockNumber).timestamp;
    const startTime = presentTime + 1000;
    pollContract = await KarmaVoteTest.new(
      [protocolContract.address],
      ["0x68656c6c6f", "0x776f726c64"],
      "0x57616e636861696e",
      "0x41646d696e20456c656374696f6e20466f722032303138",
      "0x4f6e6520506572736f6e204f6e6520566f7465",
      startTime,
      "0"
    );
  });
  it("upvote karma", async () => {
    await protocolContract.upvote(accounts[1], { from: accounts[2] });
    await protocolContract.upvote(accounts[1], { from: accounts[3] });
    currentKarma = await protocolContract.getCurrentKarma(accounts[1]);
    assert.equal(web3.toDecimal(currentKarma), 2);
  });
  it("upvote karma: not a member", async () => {
    try {
      await protocolContract.upvote(accounts[1], { from: accounts[7] });
    } catch (error) {
      assert.exists(error);
    }
  });
  it("upvote karma: has given already & trying it again", async () => {
    await protocolContract.upvote(accounts[1], { from: accounts[2] });
    try {
      await protocolContract.upvote(accounts[1], { from: accounts[2] });
    } catch (error) {
      assert.exists(error);
    }
  });
  it("upvote karma: self delegating failure", async () => {
    try {
      await protocolContract.upvote(accounts[1], { from: accounts[1] });
    } catch (error) {
      assert.exists(error);
    }
  });
  it("downvote karma", async () => {
    await protocolContract.upvote(accounts[1], { from: accounts[2] });
    await protocolContract.upvote(accounts[1], { from: accounts[3] });
    await protocolContract.downvote(accounts[1], { from: accounts[2] });
    await protocolContract.downvote(accounts[1], { from: accounts[3] });
    currentKarma = await protocolContract.getCurrentKarma(accounts[1]);
    assert.equal(web3.toDecimal(currentKarma), 0);
  });
  it("downvote karma : self downvote failure", async () => {
    try {
      await protocolContract.downvote(accounts[1], { from: accounts[1] });
    } catch (error) {
      assert.exists(error);
    }
  });
  it("downvote karma: not a member", async () => {
    try {
      await protocolContract.downvote(accounts[1], { from: accounts[7] });
    } catch (error) {
      assert.exists(error);
    }
  });
  it("downvote karma: cant downvote as the member hasn't upvoted", async () => {
    try {
      await protocolContract.upvote(accounts[1], { from: accounts[2] });
    } catch (error) {
      assert.exists(error);
    }
  });
  it("calculate vote weight : is a member", async () => {
    voteWeight = await pollContract.calculateVoteWeight(accounts[1]);
    assert.equal(web3.toDecimal(voteWeight), 1);
  });
  it("calculate vote weight : is a member and has karma", async () => {
    await protocolContract.upvote(accounts[1], { from: accounts[2] });
    await protocolContract.upvote(accounts[1], { from: accounts[3] });
    voteWeight = await pollContract.calculateVoteWeight(accounts[1]);
    assert.equal(web3.toDecimal(voteWeight), 3);
  });
  it("calculate vote weight : not a member", async () => {
    voteWeight = await pollContract.calculateVoteWeight(accounts[7]);
    assert.equal(web3.toDecimal(voteWeight), 1);
  });
  it("cast vote: is a member", async () => {
    await increaseTime(10000);
    result = await pollContract.vote(1, { from: accounts[1] });
    voteTally = await pollContract.getVoteTally(1);
    assert.equal(web3.toDecimal(voteTally), 1);
    truffleAssert.eventEmitted(result, "CastVote");
  });
  it("cast vote: is a member but gives wrong proposal", async () => {
    await increaseTime(10000);
    result = await pollContract.vote(2, { from: accounts[1] });
    voteTally0 = await pollContract.getVoteTally(0);
    voteTally1 = await pollContract.getVoteTally(1);
    assert.equal(web3.toDecimal(voteTally0), 0);
    assert.equal(web3.toDecimal(voteTally1), 0);
    truffleAssert.eventEmitted(result, "TriedToVote");
    truffleAssert.eventNotEmitted(result, "CastVote");
  });
  it("cast vote: not a member", async () => {
    await increaseTime(10000);
    result = await pollContract.vote(1, { from: accounts[7] });
    voteTally0 = await pollContract.getVoteTally(0);
    voteTally1 = await pollContract.getVoteTally(1);
    assert.equal(web3.toDecimal(voteTally0), 0);
    assert.equal(web3.toDecimal(voteTally1), 0);
    truffleAssert.eventEmitted(result, "TriedToVote");
    truffleAssert.eventNotEmitted(result, "CastVote");
  });
  it("cast vote: is a member voted & tries to vote again", async () => {
    await increaseTime(10000);
    result = await pollContract.vote(1, { from: accounts[1] });
    voteTally = await pollContract.getVoteTally(1);
    assert.equal(web3.toDecimal(voteTally), 1);
    result1 = await pollContract.vote(1, { from: accounts[1] });
    truffleAssert.eventEmitted(result, "CastVote");
    truffleAssert.eventEmitted(result1, "TriedToVote");
    truffleAssert.eventNotEmitted(result1, "CastVote");
  });
  it("cast vote: member who has karma", async () => {
    await increaseTime(10000);
    await protocolContract.upvote(accounts[1], { from: accounts[2] });
    await protocolContract.upvote(accounts[1], { from: accounts[3] });
    result = await pollContract.vote(1, { from: accounts[1] });
    voteTally = await pollContract.getVoteTally(1);
    assert.equal(web3.toDecimal(voteTally), 3);
    truffleAssert.eventEmitted(result, "CastVote");
    truffleAssert.eventNotEmitted(result, "TriedToVote");
  });
  it("revoke vote: is a member & voted", async () => {
    await increaseTime(10000);
    result = await pollContract.vote(1, { from: accounts[1] });
    voteTally = await pollContract.getVoteTally(1);
    voterCount = await pollContract.getVoterCount(1);
    assert.equal(web3.toDecimal(voteTally), 1);
    assert.equal(web3.toDecimal(voterCount), 1); //proposal voter count
    revokeResult = await pollContract.revokeVote({ from: accounts[1] });
    voteTally1 = await pollContract.getVoteTally(1);
    voterCount1 = await pollContract.getVoterCount(1);
    assert.equal(web3.toDecimal(voteTally1), 0);
    assert.equal(web3.toDecimal(voterCount1), 0);
    truffleAssert.eventEmitted(revokeResult, "RevokedVote");
  });
  it("revoke vote: is a member who has karma & Voted", async () => {
    await increaseTime(10000);
    await protocolContract.upvote(accounts[1], { from: accounts[2] });
    await protocolContract.upvote(accounts[1], { from: accounts[3] });
    result = await pollContract.vote(1, { from: accounts[1] });
    voteTally = await pollContract.getVoteTally(1);
    voterCount = await pollContract.getVoterCount(1);
    assert.equal(web3.toDecimal(voteTally), 3);
    assert.equal(web3.toDecimal(voterCount), 1); //proposal voter count
    revokeResult = await pollContract.revokeVote({ from: accounts[1] });
    voteTally1 = await pollContract.getVoteTally(1);
    voterCount1 = await pollContract.getVoterCount(1);
    assert.equal(web3.toDecimal(voteTally1), 0);
    assert.equal(web3.toDecimal(voterCount1), 0);
    truffleAssert.eventEmitted(revokeResult, "RevokedVote");
  });
  it("revoke vote: is a member & not voted", async () => {
    await increaseTime(10000);
    try {
      revokeResult = await pollContract.revokeVote({ from: accounts[1] });
    } catch (error) {
      assert.exists(error);
    }
  });
  it("revoke vote: not a member", async () => {
    await increaseTime(10000);
    try {
      revokeResult = await pollContract.revokeVote({ from: accounts[3] });
    } catch (error) {
      assert.exists(error);
    }
  });
  it("tries to vote : but poll hasn't started yet", async () => {
    try {
      await pollContract.vote(1, { from: accounts[1] });
    } catch (error) {
      assert.exists(error);
    }
  });
});
