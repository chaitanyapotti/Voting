OnePersonOneVoteBoundTest = artifacts.require("../contracts/testContracts/OnePersonOneVoteBoundTest.sol");
ElectusProtocol = artifacts.require("../contracts/protocol/protocol.sol")

const truffleAssert = require("truffle-assertions");

contract("one Person One Vote Bound Success Test", function(accounts){
    beforeEach("setup", async()=>{
        protocol1Contract = await ElectusProtocol.new("Wanchain", "WAN", {
            gas: 3000000
          });
          
          protocol1Contract.assignTo(accounts[1], [0], {
            from: accounts[0]
          });
          
          protocol2Contract = await ElectusProtocol.new("US & China", "UC", {
            gas: 3000000
          });
         
          protocol2Contract.assignTo(accounts[2], [0], {
            from: accounts[0]
          });
          
          protocol3Contract = await ElectusProtocol.new("Developers", "DEV", {
            gas: 3000000
          });
          protocol3Contract.assignTo(accounts[1], [0], {
            from: accounts[0]
          });
          protocol3Contract.addAttributeSet(web3.fromAscii("hair"), [
            web3.fromAscii("black")
          ]);
          var presentTime = new Date().getTime() / 1000;
          pollContract = await OnePersonOneVoteBoundTest.new(
            [
              protocol1Contract.address,
              protocol2Contract.address,
              protocol3Contract.address
            ],
            ["0x68656c6c6f", "0x776f726c64"],
            presentTime+0.55,
            presentTime+1009854426,
            "0x57616e636861696e",
            "0x41646d696e20456c656374696f6e20466f722032303138",
            "0x4f6e6520506572736f6e204f6e6520566f7465"
          );
    })
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
      truffleAssert.eventEmitted(result, "TriedToVote");
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
      result = await pollContract.vote(2, { from: accounts[3] });
      assert.equal(await pollContract.getVoteTally(1), 0);
      assert.equal(await pollContract.getVoteTally(0), 0);
      truffleAssert.eventEmitted(result, "TriedToVote");
      truffleAssert.eventNotEmitted(result, "CastVote");
    });
    it("cast vote: is a member voted & tries to vote again", async () => {
      result = await pollContract.vote(1, { from: accounts[1] });
      assert.equal(await pollContract.getVoteTally(1), 1);
      result1 = await pollContract.vote(1, { from: accounts[1] });
      truffleAssert.eventEmitted(result, "TriedToVote");
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
})