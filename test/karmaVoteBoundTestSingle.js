var KarmaVoteBoundTest = artifacts.require("./KarmaVoteBoundTest.sol");
var KarmaProtocol = artifacts.require("./KarmaProtocol.sol");
const truffleAssert = require("truffle-assertions");
const { assertRevert } = require("./utils/assertRevert");
const increaseTime = require("./utils/increaseTime");

contract("Karma Vote Bound Test", function(accounts) {
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
    pollContract = await KarmaVoteBoundTest.new(
      [protocolContract.address],
      ["0x68656c6c6f"],
      "0x57616e636861696e",
      "0x41646d696e20456c656374696f6e20466f722032303138",
      "0x4f6e6520506572736f6e204f6e6520566f7465",
      startTime,
      "100000000000000"
    );
  });
  it("gets total member count", async () => {
    await increaseTime(10000);
    const memberCount = await pollContract.getVoterBaseDenominator();
    assert.equal(web3.utils.toDecimal(memberCount), 5);
  });
});
