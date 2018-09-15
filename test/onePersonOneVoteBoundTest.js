OnePersonOneVoteBoundTest = artifacts.require(
  "./OnePersonOneVoteBoundTest.sol"
);
ElectusProtocol = artifacts.require("./Protocol.sol");

const truffleAssert = require("truffle-assertions");

contract("one Person One Vote Bound Test", function(accounts) {
  context("poll hasn't started or ended", () => {
    beforeEach("setup", async () => {
      protocol1Contract = await ElectusProtocol.new(
        web3.fromAscii("Wanchain"),
        web3.fromAscii("WAN"),
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
        web3.fromAscii("US & China"),
        web3.fromAscii("UC"),
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
        web3.fromAscii("Developers"),
        web3.fromAscii("DEV"),
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
      pollContract = await OnePersonOneVoteBoundTest.new(
        [
          protocol1Contract.address,
          protocol2Contract.address,
          protocol3Contract.address
        ],
        ["0x68656c6c6f", "0x776f726c64"],
        presentTime + 1000,
        presentTime + 10000,
        "0x57616e636861696e",
        "0x41646d696e20456c656374696f6e20466f722032303138",
        "0x4f6e6520506572736f6e204f6e6520566f7465"
      );
    });
    it("cast vote: is a member but poll hasnt started yet", async () => {
      try {
        await pollContract.vote(1, { from: accounts[1] });
      } catch (error) {
        assert.exists(error);
      }
    });
  });
  context("poll has started", () => {
    beforeEach("setup", async () => {
      protocol1Contract = await ElectusProtocol.new(
        web3.fromAscii("Wanchain"),
        web3.fromAscii("WAN"),
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
        web3.fromAscii("US & China"),
        web3.fromAscii("UC"),
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
        web3.fromAscii("Developers"),
        web3.fromAscii("DEV"),
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
      pollContract = await OnePersonOneVoteBoundTest.new(
        [
          protocol1Contract.address,
          protocol2Contract.address,
          protocol3Contract.address
        ],
        ["0x68656c6c6f", "0x776f726c64"],
        presentTime + 0.55,
        10098544260000000,
        "0x57616e636861696e",
        "0x41646d696e20456c656374696f6e20466f722032303138",
        "0x4f6e6520506572736f6e204f6e6520566f7465"
      );
    });
    it("calculate vote weight : is a member", async () => {
      voteWeight = await pollContract.calculateVoteWeight(accounts[1]);
      assert.equal(voteWeight, 1);
    });
    it("calculate vote weight : not a member", async () => {
      voteWeight = await pollContract.calculateVoteWeight(accounts[3]);
      assert.equal(voteWeight, 1);
    });
    it("cast vote: is a member", async () => {
      result = await pollContract.vote(1, { from: accounts[1] });
      assert.equal(await pollContract.getVoteTally(1), 1);
      truffleAssert.eventEmitted(result, "CastVote");
    });
    it("cast vote: is a member but gives wrong proposal", async () => {
      result = await pollContract.vote(2, { from: accounts[1] });
      assert.equal(await pollContract.getVoteTally(1), 0);
      assert.equal(await pollContract.getVoteTally(0), 0);
      truffleAssert.eventEmitted(result, "TriedToVote");
      truffleAssert.eventNotEmitted(result, "CastVote");
    });
    it("cast vote: not a member", async () => {
      result = await pollContract.vote(1, { from: accounts[2] });
      assert.equal(await pollContract.getVoteTally(1), 0);
      assert.equal(await pollContract.getVoteTally(0), 0);
      truffleAssert.eventEmitted(result, "TriedToVote");
      truffleAssert.eventNotEmitted(result, "CastVote");
    });
    it("cast vote: is a member voted & tries to vote again", async () => {
      result = await pollContract.vote(1, { from: accounts[1] });
      assert.equal(await pollContract.getVoteTally(1), 1);
      result1 = await pollContract.vote(1, { from: accounts[1] });
      truffleAssert.eventEmitted(result, "CastVote");
      truffleAssert.eventEmitted(result1, "TriedToVote");
      truffleAssert.eventNotEmitted(result1, "CastVote");
    });
    it("revoke vote: is a member & voted", async () => {
      result = await pollContract.vote(1, { from: accounts[1] });
      assert.equal(await pollContract.getVoteTally(1), 1);
      assert.equal(await pollContract.getVoterCount(1), 1);
      revokeResult = await pollContract.revokeVote({ from: accounts[1] });
      assert.equal(await pollContract.getVoteTally(1), 0);
      assert.equal(await pollContract.getVoterCount(1), 0);
      truffleAssert.eventEmitted(revokeResult, "RevokedVote");
    });
    it("has poll ended", async () => {
      result = await pollContract.hasPollEnded({ from: accounts[1] });
      assert.equal(result, false);
    });
    it("revoke vote: is a member & not voted", async () => {
      try {
        await pollContract.revokeVote({ from: accounts[1] });
      } catch (error) {
        assert.exists(error);
      }
    });
    it("revoke vote: not a member", async () => {
      try {
        await pollContract.revokeVote({ from: accounts[3] });
      } catch (error) {
        assert.exists(error);
      }
    });
  });
});
