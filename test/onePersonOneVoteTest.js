var OnePersonOneVoteTest = artifacts.require("./OnePersonOneVoteTest.sol");
var ElectusProtocol = artifacts.require("./Protocol.sol");
const truffleAssert = require("truffle-assertions");
const { assertRevert } = require("./utils/assertRevert");
const increaseTime = require("./utils/increaseTime");

contract("One Person One Vote Test", function(accounts) {
  let protocol1Contract;
  let protocol2Contract;
  let protocol3Contract;
  let pollContract;
  beforeEach("setup", async () => {
    protocol1Contract = await ElectusProtocol.new(
      "0x57616e636861696e",
      "0x57414e"
    );
    await protocol1Contract.addAttributeSet(web3.fromAscii("hair"), [
      web3.fromAscii("black")
    ]);
    await protocol1Contract.assignTo(accounts[1], [0], {
      from: accounts[0]
    });
    protocol2Contract = await ElectusProtocol.new(
      "0x55532026204368696e61",
      "0x5543"
    );
    await protocol2Contract.addAttributeSet(web3.fromAscii("hair"), [
      web3.fromAscii("black")
    ]);
    await protocol2Contract.assignTo(accounts[2], [0], {
      from: accounts[0]
    });
    protocol3Contract = await ElectusProtocol.new(
      "0x55532026204368696e61",
      "0x5543"
    );
    await protocol3Contract.addAttributeSet(web3.fromAscii("hair"), [
      web3.fromAscii("black")
    ]);
    await protocol3Contract.assignTo(accounts[1], [0], {
      from: accounts[0]
    });
    var presentTime = web3.eth.getBlock(web3.eth.blockNumber).timestamp;
    const startTime = presentTime + 1000;
    pollContract = await OnePersonOneVoteTest.new(
      [
        protocol1Contract.address,
        protocol2Contract.address,
        protocol3Contract.address
      ],
      ["0x68656c6c6f", "0x776f726c64"],
      "0x57616e636861696e",
      "0x41646d696e20456c656374696f6e20466f722032303138",
      "0x4f6e6520506572736f6e204f6e6520566f7465",
      startTime,
      "0"
    );
  });
  it("calculate vote weight : is a member", async () => {
    const voteWeight = await pollContract.calculateVoteWeight(accounts[1]);
    assert.equal(web3.toDecimal(voteWeight), 1);
  });
  it("calculate vote weight : not a member", async () => {
    const voteWeight = await pollContract.calculateVoteWeight(accounts[3]);
    assert.equal(web3.toDecimal(voteWeight), 1);
  });
  it("cast vote: is a member", async () => {
    await increaseTime(10000);
    const result = await pollContract.vote(1, { from: accounts[1] });
    const voteTally = await pollContract.getVoteTally(1);
    assert.equal(web3.toDecimal(voteTally), 1);
    truffleAssert.eventEmitted(result, "CastVote");
  });
  it("cast vote: is a member but gives wrong proposal", async () => {
    await increaseTime(10000);
    const result = await pollContract.vote(2, { from: accounts[1] });
    const voteTally0 = await pollContract.getVoteTally(0);
    const voteTally1 = await pollContract.getVoteTally(1);
    assert.equal(web3.toDecimal(voteTally0), 0);
    assert.equal(web3.toDecimal(voteTally1), 0);
    truffleAssert.eventEmitted(result, "TriedToVote");
    truffleAssert.eventNotEmitted(result, "CastVote");
  });
  it("cast vote: not a member", async () => {
    await increaseTime(10000);
    const result = await pollContract.vote(1, { from: accounts[3] });
    const voteTally0 = await pollContract.getVoteTally(0);
    const voteTally1 = await pollContract.getVoteTally(1);
    assert.equal(web3.toDecimal(voteTally0), 0);
    assert.equal(web3.toDecimal(voteTally1), 0);
    truffleAssert.eventEmitted(result, "TriedToVote");
    truffleAssert.eventNotEmitted(result, "CastVote");
  });
  it("cast vote: is a member voted & tries to vote again", async () => {
    await increaseTime(10000);
    const result = await pollContract.vote(1, { from: accounts[1] });
    const voteTally = await pollContract.getVoteTally(1);
    assert.equal(web3.toDecimal(voteTally), 1);
    const result1 = await pollContract.vote(1, { from: accounts[1] });
    truffleAssert.eventEmitted(result, "CastVote");
    truffleAssert.eventEmitted(result1, "TriedToVote");
    truffleAssert.eventNotEmitted(result1, "CastVote");
  });
  it("revoke vote: is a member & voted", async () => {
    await increaseTime(10000);
    await pollContract.vote(1, { from: accounts[1] });
    const voteTally = await pollContract.getVoteTally(1);
    const voterCount = await pollContract.getVoterCount(1);
    assert.equal(web3.toDecimal(voteTally), 1);
    assert.equal(web3.toDecimal(voterCount), 1); // proposal voter count
    const revokeResult = await pollContract.revokeVote({ from: accounts[1] });
    const voteTally1 = await pollContract.getVoteTally(1);
    const voterCount1 = await pollContract.getVoterCount(1);
    assert.equal(web3.toDecimal(voteTally1), 0);
    assert.equal(web3.toDecimal(voterCount1), 0);
    truffleAssert.eventEmitted(revokeResult, "RevokedVote");
  });
  it("revoke vote: is a member & not voted", async () => {
    await increaseTime(10000);
    await assertRevert(pollContract.revokeVote({ from: accounts[1] }));
  });
  it("revoke vote: not a member", async () => {
    await increaseTime(10000);
    await assertRevert(pollContract.revokeVote({ from: accounts[3] }));
  });
  it("tries to vote : but poll hasn't started yet", async () => {
    await assertRevert(pollContract.vote(1, { from: accounts[1] }));
  });
});
