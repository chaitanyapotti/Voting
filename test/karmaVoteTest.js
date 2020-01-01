var KarmaVoteTest = artifacts.require("./KarmaVoteTest.sol");
var KarmaProtocol = artifacts.require("./KarmaProtocol.sol");
const truffleAssert = require("truffle-assertions");
const {assertRevert} = require("./utils/assertRevert");
const increaseTime = require("./utils/increaseTime");

contract("Karma Vote Test", function(accounts) {
  let protocolContract;
  let pollContract;

  beforeEach("setup", async () => {
    protocolContract = await KarmaProtocol.new("0x57616e636861696e", "0x57414e");
    await protocolContract.addAttributeSet(web3.utils.fromAscii("hair"), [web3.utils.fromAscii("black")]);
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
    var presentTime = (await web3.eth.getBlock(await web3.eth.getBlockNumber())).timestamp;
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
    await protocolContract.upvote(accounts[1], {from: accounts[2]});
    await protocolContract.upvote(accounts[1], {from: accounts[3]});
    const currentKarma = await protocolContract.getCurrentKarma(accounts[1]);
    assert.equal(web3.utils.toDecimal(currentKarma), 2);
  });
  it("get total karma", async () => {
    await protocolContract.upvote(accounts[1], {from: accounts[2]});
    await protocolContract.upvote(accounts[1], {from: accounts[3]});
    await protocolContract.upvote(accounts[2], {from: accounts[3]});
    await protocolContract.downvote(accounts[2], {from: accounts[3]});
    const currentKarma = await protocolContract.getTotalKarma();
    assert.equal(web3.utils.toDecimal(currentKarma), 7);
  });
  it("upvote karma: not a member", async () => {
    await assertRevert(protocolContract.upvote(accounts[1], {from: accounts[7]}));
  });
  it("upvote karma: has given already & trying it again", async () => {
    await protocolContract.upvote(accounts[1], {from: accounts[2]});
    await assertRevert(protocolContract.upvote(accounts[1], {from: accounts[2]}));
  });
  it("upvote karma: self delegating failure", async () => {
    await assertRevert(protocolContract.upvote(accounts[1], {from: accounts[1]}));
  });
  it("downvote karma", async () => {
    await protocolContract.upvote(accounts[1], {from: accounts[2]});
    await protocolContract.upvote(accounts[1], {from: accounts[3]});
    await protocolContract.downvote(accounts[1], {from: accounts[2]});
    await protocolContract.downvote(accounts[1], {from: accounts[3]});
    const currentKarma = await protocolContract.getCurrentKarma(accounts[1]);
    assert.equal(web3.utils.toDecimal(currentKarma), 0);
  });
  it("downvote karma : self downvote failure", async () => {
    await assertRevert(protocolContract.downvote(accounts[1], {from: accounts[1]}));
  });
  it("downvote karma: not a member", async () => {
    await assertRevert(protocolContract.downvote(accounts[1], {from: accounts[7]}));
  });
  it("downvote karma: cant downvote as the member hasn't upvoted", async () => {
    try {
      await assertRevert(protocolContract.upvote(accounts[1], {from: accounts[2]}));
    } catch (error) {
      assert.exists(error);
    }
  });
  it("calculate vote weight : is a member", async () => {
    const voteWeight = await pollContract.calculateVoteWeight(accounts[1]);
    assert.equal(web3.utils.toDecimal(voteWeight), 1);
  });
  it("calculate vote weight : is a member and has karma", async () => {
    await protocolContract.upvote(accounts[1], {from: accounts[2]});
    await protocolContract.upvote(accounts[1], {from: accounts[3]});
    const voteWeight = await pollContract.calculateVoteWeight(accounts[1]);
    assert.equal(web3.utils.toDecimal(voteWeight), 3);
  });
  it("calculate vote weight : not a member", async () => {
    const voteWeight = await pollContract.calculateVoteWeight(accounts[7]);
    assert.equal(web3.utils.toDecimal(voteWeight), 1);
  });
  it("cast vote: is a member", async () => {
    await increaseTime(10000);
    const result = await pollContract.vote(1, {from: accounts[1]});
    const voteTally = await pollContract.getVoteTally(1);
    assert.equal(web3.utils.toDecimal(voteTally), 1);
    truffleAssert.eventEmitted(result, "CastVote");
  });
  it("cast vote: is a member but gives wrong proposal", async () => {
    await increaseTime(10000);
    const result = await pollContract.vote(2, {from: accounts[1]});
    const voteTally0 = await pollContract.getVoteTally(0);
    const voteTally1 = await pollContract.getVoteTally(1);
    assert.equal(web3.utils.toDecimal(voteTally0), 0);
    assert.equal(web3.utils.toDecimal(voteTally1), 0);
    truffleAssert.eventEmitted(result, "TriedToVote");
    truffleAssert.eventNotEmitted(result, "CastVote");
  });
  it("cast vote: not a member", async () => {
    await increaseTime(10000);
    const result = await pollContract.vote(1, {from: accounts[7]});
    const voteTally0 = await pollContract.getVoteTally(0);
    const voteTally1 = await pollContract.getVoteTally(1);
    assert.equal(web3.utils.toDecimal(voteTally0), 0);
    assert.equal(web3.utils.toDecimal(voteTally1), 0);
    truffleAssert.eventEmitted(result, "TriedToVote");
    truffleAssert.eventNotEmitted(result, "CastVote");
  });
  it("cast vote: is a member voted & tries to vote again", async () => {
    await increaseTime(10000);
    const result = await pollContract.vote(1, {from: accounts[1]});
    const voteTally = await pollContract.getVoteTally(1);
    assert.equal(web3.utils.toDecimal(voteTally), 1);
    const result1 = await pollContract.vote(1, {from: accounts[1]});
    truffleAssert.eventEmitted(result, "CastVote");
    truffleAssert.eventEmitted(result1, "TriedToVote");
    truffleAssert.eventNotEmitted(result1, "CastVote");
  });
  it("cast vote: member who has karma", async () => {
    await increaseTime(10000);
    await protocolContract.upvote(accounts[1], {from: accounts[2]});
    await protocolContract.upvote(accounts[1], {from: accounts[3]});
    const result = await pollContract.vote(1, {from: accounts[1]});
    const voteTally = await pollContract.getVoteTally(1);
    assert.equal(web3.utils.toDecimal(voteTally), 3);
    truffleAssert.eventEmitted(result, "CastVote");
    truffleAssert.eventNotEmitted(result, "TriedToVote");
  });
  it("revoke vote: is a member & voted", async () => {
    await increaseTime(10000);
    await pollContract.vote(1, {from: accounts[1]});
    const voteTally = await pollContract.getVoteTally(1);
    const voterCount = await pollContract.getVoterCount(1);
    assert.equal(web3.utils.toDecimal(voteTally), 1);
    assert.equal(web3.utils.toDecimal(voterCount), 1); // proposal voter count
    const revokeResult = await pollContract.revokeVote({from: accounts[1]});
    const voteTally1 = await pollContract.getVoteTally(1);
    const voterCount1 = await pollContract.getVoterCount(1);
    assert.equal(web3.utils.toDecimal(voteTally1), 0);
    assert.equal(web3.utils.toDecimal(voterCount1), 0);
    truffleAssert.eventEmitted(revokeResult, "RevokedVote");
  });
  it("revoke vote: is a member who has karma & Voted", async () => {
    await increaseTime(10000);
    await protocolContract.upvote(accounts[1], {from: accounts[2]});
    await protocolContract.upvote(accounts[1], {from: accounts[3]});
    await pollContract.vote(1, {from: accounts[1]});
    const voteTally = await pollContract.getVoteTally(1);
    const voterCount = await pollContract.getVoterCount(1);
    assert.equal(web3.utils.toDecimal(voteTally), 3);
    assert.equal(web3.utils.toDecimal(voterCount), 1); // proposal voter count
    const revokeResult = await pollContract.revokeVote({from: accounts[1]});
    const voteTally1 = await pollContract.getVoteTally(1);
    const voterCount1 = await pollContract.getVoterCount(1);
    assert.equal(web3.utils.toDecimal(voteTally1), 0);
    assert.equal(web3.utils.toDecimal(voterCount1), 0);
    truffleAssert.eventEmitted(revokeResult, "RevokedVote");
  });
  it("revoke vote: is a member & not voted", async () => {
    await increaseTime(10000);
    await assertRevert(pollContract.revokeVote({from: accounts[1]}));
  });
  it("revoke vote: not a member", async () => {
    await increaseTime(10000);
    await assertRevert(pollContract.revokeVote({from: accounts[3]}));
  });
  it("tries to vote : but poll hasn't started yet", async () => {
    await assertRevert(pollContract.vote(1, {from: accounts[1]}));
  });

  it("gets proposal vote weight", async () => {
    await increaseTime(10000);
    await pollContract.vote(1, {from: accounts[1]});
    const proposalWeight = await pollContract.getVoterBaseDenominator();
    assert.equal(web3.utils.toDecimal(proposalWeight), 1);
  });
});
