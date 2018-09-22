var TokenProportionalUncappedBoundTest = artifacts.require("./TokenProportionalUncappedBoundTest.sol");
var ElectusProtocol = artifacts.require("./Protocol.sol");
const truffleAssert = require("truffle-assertions");
var TestToken = artifacts.require("./FreezableTestToken.sol");
const { assertRevert } = require("./utils/assertRevert");
const increaseTime = require("./utils/increaseTime");

contract("Token Proportional Uncapped Bound Test", function(accounts) {
  let protocol1Contract;
  let protocol2Contract;
  let protocol3Contract;
  let pollContract;
  let token;
  beforeEach("setup", async () => {
    protocol1Contract = await ElectusProtocol.new("0x57616e636861696e", "0x57414e");
    await protocol1Contract.addAttributeSet(web3.utils.fromAscii("hair"), [web3.utils.fromAscii("black")]);
    await protocol1Contract.assignTo(accounts[1], [0], {
      from: accounts[0]
    });
    protocol2Contract = await ElectusProtocol.new("0x55532026204368696e61", "0x5543");
    await protocol2Contract.addAttributeSet(web3.utils.fromAscii("hair"), [web3.utils.fromAscii("black")]);
    await protocol2Contract.assignTo(accounts[2], [0], {
      from: accounts[0]
    });
    protocol3Contract = await ElectusProtocol.new("0x55532026204368696e61", "0x5543");
    await protocol3Contract.addAttributeSet(web3.utils.fromAscii("hair"), [web3.utils.fromAscii("black")]);
    await protocol3Contract.assignTo(accounts[2], [0], {
      from: accounts[0]
    });
    token = await TestToken.new();
    await token.transfer(accounts[2], 100);
    var presentTime = (await web3.eth.getBlock(await web3.eth.getBlockNumber())).timestamp;
    const startTime = presentTime + 1000;
    pollContract = await TokenProportionalUncappedBoundTest.new(
      [protocol1Contract.address, protocol2Contract.address, protocol3Contract.address],
      ["0x68656c6c6f", "0x776f726c64"],
      token.address,
      "0x57616e636861696e",
      "0x41646d696e20456c656374696f6e20466f722032303138",
      "0x4f6e6520506572736f6e204f6e6520566f7465",
      startTime,
      "1000000"
    );
    await token.addAuthorized(pollContract.address);
  });
  it("calculate vote weight : is a member", async () => {
    const voteWeight = await pollContract.calculateVoteWeight(accounts[2]);
    assert.equal(web3.utils.toDecimal(voteWeight), 100);
  });
  it("calculate vote weight : not a member", async () => {
    const voteWeight = await pollContract.calculateVoteWeight(accounts[3]);
    assert.equal(web3.utils.toDecimal(voteWeight), 0);
  });
  it("cast vote: is a member & poll has started", async () => {
    await increaseTime(10000);
    const result = await pollContract.vote(1, { from: accounts[2] });
    const voteTally = await pollContract.getVoteTally(1);
    assert.equal(web3.utils.toDecimal(voteTally), 100);
    assert.equal(await token.isFrozen(accounts[2]), true);
    truffleAssert.eventEmitted(result, "CastVote");
  });
  it("cast vote: is a member & poll has not started", async () => {
    await assertRevert(pollContract.vote(1, { from: accounts[2] }));
  });
  it("cast vote: is a member & poll has ended", async () => {
    await increaseTime(1000000000);
    await assertRevert(pollContract.vote(1, { from: accounts[2] }));
  });
  it("cast vote: not a member & poll has started", async () => {
    await increaseTime(10000);
    const result = await pollContract.vote(1, { from: accounts[3] });
    const voteTally = await pollContract.getVoteTally(1);
    assert.equal(web3.utils.toDecimal(voteTally), 0);
    truffleAssert.eventEmitted(result, "TriedToVote");
  });
  it("cast vote: is a member voted & tries to vote again", async () => {
    await increaseTime(10000);
    const result = await pollContract.vote(1, { from: accounts[2] });
    const voteTally = await pollContract.getVoteTally(1);
    assert.equal(web3.utils.toDecimal(voteTally), 100);
    const result1 = await pollContract.vote(1, { from: accounts[2] });
    truffleAssert.eventEmitted(result, "CastVote");
    truffleAssert.eventEmitted(result1, "TriedToVote");
    truffleAssert.eventNotEmitted(result1, "CastVote");
  });
  it("revoke vote: is a member & voted (poll has started and in progress)", async () => {
    await increaseTime(10000);
    await pollContract.vote(1, { from: accounts[2] });
    assert.equal(await pollContract.getVoteTally(1), 100);
    assert.equal(await pollContract.getVoterCount(1), 1);
    assert.equal(await token.isFrozen(accounts[2]), true);
    const revokeResult = await pollContract.revokeVote({ from: accounts[2] });
    assert.equal(await pollContract.getVoteTally(1), 0);
    assert.equal(await pollContract.getVoterCount(1), 0);
    assert.equal(await token.isFrozen(accounts[2]), false);
    truffleAssert.eventEmitted(revokeResult, "RevokedVote");
  });
  it("revoke vote: is a member & not voted", async () => {
    await increaseTime(10000);
    await assertRevert(pollContract.revokeVote({ from: accounts[2] }));
  });
  it("revoke vote: not a member", async () => {
    await increaseTime(10000);
    await assertRevert(pollContract.revokeVote({ from: accounts[3] }));
  });
  it("member tries to unfreeze his account after poll ends", async () => {
    await increaseTime(1000000000000);
    await assertRevert(pollContract.unFreezeTokens({ from: accounts[2] }));
  });
});
