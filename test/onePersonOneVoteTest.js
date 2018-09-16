var OnePersonOneVoteTest = artifacts.require("./OnePersonOneVoteTest.sol");
var ElectusProtocol = artifacts.require("./Protocol.sol");
const truffleAssert = require("truffle-assertions");

contract("One Person One Vote Test", function(accounts) {
  context("poll has started", () => {
    beforeEach("setup", async () => {
      protocol1Contract = await ElectusProtocol.new(
        "0x57616e636861696e",
        "0x57414e",
        {
          gas: 3000000
        }
      );
      await protocol1Contract.addAttributeSet(web3.fromAscii("hair"), [
        web3.fromAscii("black")
      ]);
      await protocol1Contract.assignTo(accounts[1], [0], {
        from: accounts[0]
      });
      protocol2Contract = await ElectusProtocol.new(
        "0x55532026204368696e61",
        "0x5543",
        {
          gas: 3000000
        }
      );
      await protocol2Contract.addAttributeSet(web3.fromAscii("hair"), [
        web3.fromAscii("black")
      ]);
      await protocol2Contract.assignTo(accounts[2], [0], {
        from: accounts[0]
      });
      protocol3Contract = await ElectusProtocol.new(
        "0x55532026204368696e61",
        "0x5543",
        {
          gas: 3000000
        }
      );
      await protocol3Contract.addAttributeSet(web3.fromAscii("hair"), [
        web3.fromAscii("black")
      ]);
      await protocol3Contract.assignTo(accounts[1], [0], {
        from: accounts[0]
      });
      var presentTime = new Date().getTime() / 1000;
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
        presentTime + 0.5,
        0
      );
    });
    it("calculate vote weight : is a member", async () => {
        voteWeight = await pollContract.calculateVoteWeight(accounts[1]);
        assert.equal(web3.toDecimal(voteWeight), 1);
      });
      it("calculate vote weight : not a member", async () => {
        voteWeight = await pollContract.calculateVoteWeight(accounts[3]);
        assert.equal(web3.toDecimal(voteWeight), 1);
      });
      it("cast vote: is a member", async () => {
        result = await pollContract.vote(1, { from: accounts[1] });
        assert.equal(web3.toDecimal(await pollContract.getVoteTally(1)), 1);
        truffleAssert.eventEmitted(result, "CastVote");
      });
      it("cast vote: is a member but gives wrong proposal", async () => {
        result = await pollContract.vote(2, { from: accounts[1] });
        assert.equal(web3.toDecimal(await pollContract.getVoteTally(1)), 0);
        assert.equal(web3.toDecimal(await pollContract.getVoteTally(0)), 0);
        truffleAssert.eventEmitted(result, "TriedToVote");
        truffleAssert.eventNotEmitted(result, "CastVote");
      });
  });
});
