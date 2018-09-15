var DelegatedVoteTest = artifacts.require(
  "../contracts/testContracts/DelegatedVoteTest.sol"
);

var electusProtocol = artifacts.require("../contracts/protocol/protocol.sol");

const truffleAssert = require("truffle-assertions");

contract("DelegatedVoteTest", function(accounts) {
  beforeEach("setup", async () => {
    protocol1Contract = await electusProtocol.new("Wanchain", "WAN", {
      gas: 3000000
    });
    protocol1Contract.assignTo(accounts[1], [0], {
      from: accounts[0]
    });
    protocol1Contract.assignTo(accounts[5], [0], {
        from: accounts[0]
      });
    protocol2Contract = await electusProtocol.new("US & China", "UC", {
      gas: 3000000
    });
    protocol2Contract.assignTo(accounts[2], [0], {
      from: accounts[0]
    });
    protocol2Contract.assignTo(accounts[3], [0], {
        from: accounts[0]
      });
    protocol2Contract.assignTo(accounts[4], [0], {
        from: accounts[0]
      });
    protocol3Contract = await electusProtocol.new("Developers", "DEV", {
      gas: 3000000
    });
    protocol3Contract.assignTo(accounts[1], [0], {
      from: accounts[0]
    });
    protocol3Contract.assignTo(accounts[2], [0], {
      from: accounts[0]
    });
    protocol3Contract.assignTo(accounts[3], [0], {
        from: accounts[0]
    });
    protocol3Contract.assignTo(accounts[4], [0], {
        from: accounts[0]
    });
    protocol3Contract.assignTo(accounts[5], [0], {
        from: accounts[0]
    });
    protocol3Contract.addAttributeSet(web3.fromAscii("hair"), [
      web3.fromAscii("black")
    ]);

    pollContract = await DelegatedVoteTest.new(
      [
        protocol1Contract.address,
        protocol2Contract.address,
        protocol3Contract.address
      ],
      ["0x68656c6c6f", "0x776f726c64"],
      "0x57616e636861696e",
      "0x41646d696e20456c656374696f6e20466f722032303138",
      "0x4f6e6520506572736f6e204f6e6520566f7465"
    );
  });
  it("calculate vote weight : is a member and has no delegation", async () => {
    voteWeight = await pollContract.calculateVoteWeight(accounts[1]);
    assert.equal(voteWeight, 1);
  });
  it("calculate vote weight : is a member and has delegation", async () => {
    await pollContract.delegate(accounts[1], { from: accounts[2] });
    voteWeight = await pollContract.calculateVoteWeight(accounts[1]);
    assert.equal(web3.toDecimal(voteWeight), 2);
  });
  it("calculate vote weight : is a member & has delegated his vote", async () => {
    await pollContract.delegate(accounts[1], { from: accounts[2] });
    voteWeight = await pollContract.calculateVoteWeight(accounts[2]);
    voteWeight = await pollContract.calculateVoteWeight(accounts[2]);
    assert.equal(web3.toDecimal(voteWeight), 0);
  });
  it("calculate vote weight : not a member", async () => {
    voteWeight = await pollContract.calculateVoteWeight(accounts[3]);
    assert.equal(voteWeight, 1);
  });
  it("cast vote : member with no delegation", async() => {
    vote = await pollContract.vote(0, {from: accounts[1]});
    proposalVoteWeight = await pollContract.getVoteTally(0);
    assert.equal(proposalVoteWeight, 1);
    truffleAssert.eventEmitted(vote, "TriedToVote");
    truffleAssert.eventEmitted(vote, "CastVote");
  })
  it("cast vote : delegation loop - failure", async() => {
    await pollContract.delegate(accounts[2], {from: accounts[1]});
    await pollContract.delegate(accounts[3], {from: accounts[2]});
    await pollContract.delegate(accounts[4], {from: accounts[3]});
    await pollContract.delegate(accounts[4], {from: accounts[5]});
    try{
        await pollContract.delegate(accounts[5], {from: accounts[1]})
    }
    catch(error){
        assert.exists(error)
    } 
  })
  it("cast vote : member with delegations", async() => {
    await pollContract.delegate(accounts[1], {from: accounts[2]});
    await pollContract.delegate(accounts[1], {from: accounts[3]});
    await pollContract.delegate(accounts[1], {from: accounts[4]});
    vote = await pollContract.vote(0, {from: accounts[1]});
    proposalVoteWeight = await pollContract.getVoteTally(0);
    assert.equal(proposalVoteWeight, 4);
    truffleAssert.eventEmitted(vote, "TriedToVote");
    truffleAssert.eventEmitted(vote, "CastVote");
  })
  it("cast vote : not a member", async() => {
    vote = await pollContract.vote(0, {from: accounts[6]});
    truffleAssert.eventEmitted(vote, "TriedToVote");
    truffleAssert.eventNotEmitted(vote, "CastVote");
  })
  it ("delgation to a member who has already voted", async() => {
    vote = await pollContract.vote(0, {from: accounts[1]});
    await pollContract.delegate(accounts[1], {from: accounts[2]});
    await pollContract.delegate(accounts[1], {from: accounts[3]});
    await pollContract.delegate(accounts[1], {from: accounts[4]});
    voteWeight = await pollContract.getVoteTally(0);
    assert.equal(voteWeight, 4)
    truffleAssert.eventEmitted(vote, "TriedToVote");
    truffleAssert.eventEmitted(vote, "CastVote");
  })
});
