var OnePersonOneVoteBoundTest = artifacts.require("./OnePersonOneVoteBoundTest.sol");
var ElectusProtocol = artifacts.require("./Protocol.sol");
const truffleAssert = require("truffle-assertions");
const { assertRevert } = require("./utils/assertRevert");
const increaseTime = require("./utils/increaseTime");

contract("One Person One Vote Bound Test", function(accounts) {
  let protocol1Contract;
  let protocol2Contract;
  let protocol3Contract;
  let pollContract;
  let startTime;
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
    await protocol3Contract.assignTo(accounts[1], [0], {
      from: accounts[0]
    });
    var presentTime = (await web3.eth.getBlock(await web3.eth.getBlockNumber())).timestamp;
    startTime = presentTime + 1000;
    pollContract = await OnePersonOneVoteBoundTest.new(
      [protocol1Contract.address, protocol2Contract.address, protocol3Contract.address],
      ["0x68656c6c6f", "0x776f726c64"],
      "0x57616e636861696e",
      "0x41646d696e20456c656374696f6e20466f722032303138",
      "0x4f6e6520506572736f6e204f6e6520566f7465",
      startTime,
      "1000000"
    );
  });
  it("gets end time of the poll", async () => {
    const endTime = await pollContract.getEndTime();
    assert.equal(web3.utils.toDecimal(endTime), startTime + 1000000);
  });
  it("calculate vote weight : is a member", async () => {
    const voteWeight = await pollContract.calculateVoteWeight(accounts[1]);
    assert.equal(web3.utils.toDecimal(voteWeight), 1);
  });
  it("cast vote: is a member & poll has started", async () => {
    await increaseTime(10000);
    const result = await pollContract.vote(1, { from: accounts[1] });
    const voteTally = await pollContract.getVoteTally(1);
    assert.equal(web3.utils.toDecimal(voteTally), 1);
    truffleAssert.eventEmitted(result, "CastVote");
  });
  it("cast vote: is a member & poll has not started", async () => {
    await assertRevert(pollContract.vote(1, { from: accounts[1] }));
  });
  it("cast vote: not a member & poll has started", async () => {
    await increaseTime(10000);
    const result = await pollContract.vote(1, { from: accounts[3] });
    const voteTally = await pollContract.getVoteTally(1);
    assert.equal(web3.utils.toDecimal(voteTally), 0);
    truffleAssert.eventEmitted(result, "TriedToVote");
  });
  it("revoke vote: is a member & voted (poll has started)", async () => {
    await increaseTime(10000);
    await pollContract.vote(1, { from: accounts[1] });
    assert.equal(await pollContract.getVoteTally(1), 1);
    assert.equal(await pollContract.getVoterCount(1), 1);
    const revokeResult = await pollContract.revokeVote({ from: accounts[1] });
    assert.equal(await pollContract.getVoteTally(1), 0);
    assert.equal(await pollContract.getVoterCount(1), 0);
    truffleAssert.eventEmitted(revokeResult, "RevokedVote");
  });
  it("has poll ended", async () => {
    await increaseTime(10000);
    const result = await pollContract.hasPollEnded({ from: accounts[1] });
    assert.equal(result, false);
  });
  it("gets end time of the poll", async () => {
    const endTime = await pollContract.getEndTime();
    assert.equal(web3.utils.toDecimal(endTime), startTime + 1000000);
  });
});
