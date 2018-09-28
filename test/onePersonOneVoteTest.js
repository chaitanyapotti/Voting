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
    await protocol3Contract.assignTo(accounts[2], [0], {
      from: accounts[0]
    });
    var presentTime = (await web3.eth.getBlock(await web3.eth.getBlockNumber())).timestamp;
    startTime = presentTime + 1000;
    pollContract = await OnePersonOneVoteTest.new(
      [protocol1Contract.address, protocol2Contract.address, protocol3Contract.address],
      ["0x446576656c6f70657273", "0x776f726c64"],
      "0x57616e636861696e",
      "0x41646d696e20456c656374696f6e20466f722032303138",
      "0x4f6e6520506572736f6e204f6e6520566f7465",
      startTime,
      "0"
    );
  });
  it("tests is autorized method", async () => {
    const result = await pollContract.isAuthorized(accounts[1]);
    assert.equal(result, false);
  });
  it("Adds Authorization and later removes it ", async () => {
    await pollContract.addAuthorized(accounts[1]);
    await pollContract.removeAuthorized(accounts[1]);
  });
  it("Adds Authorization for a member and that member revokes membership himself ", async () => {
    await pollContract.addAuthorized(accounts[1]);
    await pollContract.selfRemoveAuthorized({ from: accounts[1] });
  });
  it("Adds Authorization for a member and that member transfer ownership ", async () => {
    await pollContract.addAuthorized(accounts[1]);
    await pollContract.transferAuthorization(accounts[2], { from: accounts[1] });
  });
  it("calculate vote weight : is a member", async () => {
    const voteWeight = await pollContract.calculateVoteWeight(accounts[1]);
    assert.equal(web3.utils.toDecimal(voteWeight), 1);
  });
  it("calculate vote weight : not a member", async () => {
    const voteWeight = await pollContract.calculateVoteWeight(accounts[3]);
    assert.equal(web3.utils.toDecimal(voteWeight), 1);
  });
  it("cast vote: is a member", async () => {
    await increaseTime(10000);
    const result = await pollContract.vote(1, { from: accounts[1] });
    const voteTally = await pollContract.getVoteTally(1);
    assert.equal(web3.utils.toDecimal(voteTally), 1);
    truffleAssert.eventEmitted(result, "CastVote");
  });
  it("cast vote: is a member but gives wrong proposal", async () => {
    await increaseTime(10000);
    const result = await pollContract.vote(2, { from: accounts[1] });
    const voteTally0 = await pollContract.getVoteTally(0);
    const voteTally1 = await pollContract.getVoteTally(1);
    assert.equal(web3.utils.toDecimal(voteTally0), 0);
    assert.equal(web3.utils.toDecimal(voteTally1), 0);
    truffleAssert.eventEmitted(result, "TriedToVote");
    truffleAssert.eventNotEmitted(result, "CastVote");
  });
  it("cast vote: not a member", async () => {
    await increaseTime(10000);
    const result = await pollContract.vote(1, { from: accounts[3] });
    const voteTally0 = await pollContract.getVoteTally(0);
    const voteTally1 = await pollContract.getVoteTally(1);
    assert.equal(web3.utils.toDecimal(voteTally0), 0);
    assert.equal(web3.utils.toDecimal(voteTally1), 0);
    truffleAssert.eventEmitted(result, "TriedToVote");
    truffleAssert.eventNotEmitted(result, "CastVote");
  });
  it("cast vote: is a member voted & tries to vote again", async () => {
    await increaseTime(10000);
    const result = await pollContract.vote(1, { from: accounts[1] });
    const voteTally = await pollContract.getVoteTally(1);
    assert.equal(web3.utils.toDecimal(voteTally), 1);
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
    assert.equal(web3.utils.toDecimal(voteTally), 1);
    assert.equal(web3.utils.toDecimal(voterCount), 1); // proposal voter count
    const revokeResult = await pollContract.revokeVote({ from: accounts[1] });
    const voteTally1 = await pollContract.getVoteTally(1);
    const voterCount1 = await pollContract.getVoterCount(1);
    assert.equal(web3.utils.toDecimal(voteTally1), 0);
    assert.equal(web3.utils.toDecimal(voterCount1), 0);
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
  it("gets poll name", async () => {
    const pollName = await pollContract.getName();
    // eslint-disable-next-line no-control-regex
    assert.equal(web3.utils.toAscii(pollName).replace(/\u0000/g, ""), "Admin Election For 2018", 32);
  });
  it("gets poll type", async () => {
    const pollType = await pollContract.getPollType();
    // eslint-disable-next-line no-control-regex
    assert.equal(web3.utils.toAscii(pollType).replace(/\u0000/g, ""), "One Person One Vote", 32);
  });
  it("gets Voter Basic Logic", async () => {
    const voterBaseLogic = await pollContract.getVoterBaseLogic();
    // eslint-disable-next-line no-control-regex
    assert.equal(web3.utils.toAscii(voterBaseLogic).replace(/\u0000/g, ""), "Wanchain", 32);
  });
  it("gets protocol address", async () => {
    const protocolAdresses = await pollContract.getProtocolAddresses();
    assert.equal(protocolAdresses[0], protocol1Contract.address);
    assert.equal(protocolAdresses[1], protocol2Contract.address);
    assert.equal(protocolAdresses[2], protocol3Contract.address);
  });
  it("gets start time of the poll", async () => {
    const pollStartTime = await pollContract.getStartTime();
    assert.equal(pollStartTime, startTime);
  });
  it("get proposals", async () => {
    const proposals = await pollContract.getProposals();
    // eslint-disable-next-line no-control-regex
    assert.equal(web3.utils.toAscii(proposals[0]).replace(/\u0000/g, ""), "Developers", 32);
  });
  it("gets vote tallies", async () => {
    await increaseTime(10000);
    await pollContract.vote(0, { from: accounts[1] });
    await pollContract.vote(1, { from: accounts[2] });
    const voteTallies = await pollContract.getVoteTallies();
    assert.equal(web3.utils.toDecimal(voteTallies[0]), 1);
    assert.equal(web3.utils.toDecimal(voteTallies[1]), 1);
  });
  it("gets voter counts", async () => {
    await increaseTime(10000);
    await pollContract.vote(0, { from: accounts[1] });
    await pollContract.vote(1, { from: accounts[2] });
    const voterCounts = await pollContract.getVoterCounts();
    assert.equal(web3.utils.toDecimal(voterCounts[0]), 1);
    assert.equal(web3.utils.toDecimal(voterCounts[1]), 1);
  });
  it("gets winning proposal", async () => {
    await increaseTime(10000);
    await pollContract.vote(1, { from: accounts[1] });
    const winninfProposalIndex = await pollContract.winningProposal();
    assert.equal(web3.utils.toDecimal(winninfProposalIndex), 1);
  });
});
