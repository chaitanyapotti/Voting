var DelegatedVoteTest = artifacts.require("./DelegatedVoteTest.sol");
var ElectusProtocol = artifacts.require("./Protocol.sol");
const truffleAssert = require("truffle-assertions");
const { assertRevert } = require("./utils/assertRevert");
const increaseTime = require("./utils/increaseTime");

contract("DelegatedVoteTest", function(accounts) {
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
    await protocol1Contract.assignTo(accounts[5], [0], {
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
    await protocol2Contract.assignTo(accounts[3], [0], {
      from: accounts[0]
    });
    await protocol2Contract.assignTo(accounts[4], [0], {
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
    await protocol3Contract.assignTo(accounts[2], [0], {
      from: accounts[0]
    });
    await protocol3Contract.assignTo(accounts[3], [0], {
      from: accounts[0]
    });
    await protocol3Contract.assignTo(accounts[4], [0], {
      from: accounts[0]
    });
    await protocol3Contract.assignTo(accounts[5], [0], {
      from: accounts[0]
    });
    var presentTime = web3.eth.getBlock(web3.eth.blockNumber).timestamp;
    const startTime = presentTime + 1000;
    pollContract = await DelegatedVoteTest.new(
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
  it("calculate vote weight : is a member and has no delegation", async () => {
    const voteWeight = await pollContract.calculateVoteWeight(accounts[1]);
    assert.equal(web3.toDecimal(voteWeight), 1);
  });
  it("calculate vote weight : is a member and has delegation", async () => {
    await pollContract.delegate(accounts[1], { from: accounts[2] });
    const voteWeight = await pollContract.calculateVoteWeight(accounts[1]);
    assert.equal(web3.toDecimal(voteWeight), 2);
  });
  it("calculate vote weight : is a member & has delegated his vote", async () => {
    await pollContract.delegate(accounts[1], { from: accounts[2] });
    const voteWeight = await pollContract.calculateVoteWeight(accounts[2]);
    assert.equal(web3.toDecimal(voteWeight), 0);
  });
  it("calculate vote weight : not a member", async () => {
    const voteWeight = await pollContract.calculateVoteWeight(accounts[3]);
    assert.equal(web3.toDecimal(voteWeight), 1);
  });
  it("cast vote : member with no delegation", async () => {
    await increaseTime(10000);
    const vote = await pollContract.vote(0, { from: accounts[1] });
    const proposalVoteWeight = await pollContract.getVoteTally(0);
    assert.equal(web3.toDecimal(proposalVoteWeight), 1);
    truffleAssert.eventEmitted(vote, "CastVote");
    truffleAssert.eventNotEmitted(vote, "TriedToVote");
  });
  // it("cast vote : delegation loop - failure", async () => {
  //   await pollContract.delegate(accounts[2], { from: accounts[1] });
  //   await pollContract.delegate(accounts[3], { from: accounts[2] });
  //   // await pollContract.delegate(accounts[4], { from: accounts[3] });
  //   // await pollContract.delegate(accounts[5], { from: accounts[4] });
  //   try {
  //     await pollContract.delegate(accounts[1], { from: accounts[3] });
  //   } catch (error) {
  //     assert.exists(error);
  //   }
  // });
  it("cast vote : member with delegations", async () => {
    await increaseTime(10000);
    await pollContract.delegate(accounts[1], { from: accounts[2] });
    await pollContract.delegate(accounts[1], { from: accounts[3] });
    await pollContract.delegate(accounts[1], { from: accounts[4] });
    const vote = await pollContract.vote(0, { from: accounts[1] });
    const proposalVoteWeight = await pollContract.getVoteTally(0);
    assert.equal(web3.toDecimal(proposalVoteWeight), 4);
    truffleAssert.eventEmitted(vote, "CastVote");
    truffleAssert.eventNotEmitted(vote, "TriedToVote");
  });
  it("cast vote : member with delegations but wrong proposal", async () => {
    await increaseTime(10000);
    await pollContract.delegate(accounts[1], { from: accounts[2] });
    await pollContract.delegate(accounts[1], { from: accounts[3] });
    await pollContract.delegate(accounts[1], { from: accounts[4] });
    const vote = await pollContract.vote(3, { from: accounts[1] });
    truffleAssert.eventEmitted(vote, "TriedToVote");
    truffleAssert.eventNotEmitted(vote, "CastVote");
  });
  it("cast vote : not a member", async () => {
    await increaseTime(10000);
    const vote = await pollContract.vote(0, { from: accounts[6] });
    truffleAssert.eventEmitted(vote, "TriedToVote");
    truffleAssert.eventNotEmitted(vote, "CastVote");
  });
  it("delgation to a member who has already voted", async () => {
    await increaseTime(10000);
    const vote = await pollContract.vote(0, { from: accounts[1] });
    await pollContract.delegate(accounts[1], { from: accounts[2] });
    await pollContract.delegate(accounts[1], { from: accounts[3] });
    await pollContract.delegate(accounts[1], { from: accounts[4] });
    const voteWeight = await pollContract.getVoteTally(0);
    assert.equal(web3.toDecimal(voteWeight), 4);
    truffleAssert.eventEmitted(vote, "CastVote");
    truffleAssert.eventNotEmitted(vote, "TriedToVote");
  });
  it("revoke vote reverts", async () => {
    await increaseTime(10000);
    await assertRevert(pollContract.revokeVote());
  });
  it("poll hasn't started yet", async () => {
    await assertRevert(pollContract.vote(0, { from: accounts[1] }));
  });
});
