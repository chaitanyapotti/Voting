var DelegatedVoteTest = artifacts.require("./DelegatedVoteTest.sol");
var ElectusProtocol = artifacts.require("./Protocol.sol");
const increaseTime = require("./utils/increaseTime");

contract("DelegatedVoteTest", function(accounts) {
  let protocol1Contract;
  let protocol2Contract;
  let protocol3Contract;
  let pollContract;

  beforeEach("setup", async () => {
    protocol1Contract = await ElectusProtocol.new("0x57616e636861696e", "0x57414e");
    await protocol1Contract.addAttributeSet(web3.utils.fromAscii("hair"), [web3.utils.fromAscii("black")]);
    await protocol1Contract.assignTo(accounts[1], [0], {
      from: accounts[0]
    });
    await protocol1Contract.assignTo(accounts[5], [0], {
      from: accounts[0]
    });
    protocol2Contract = await ElectusProtocol.new("0x55532026204368696e61", "0x5543");
    await protocol2Contract.addAttributeSet(web3.utils.fromAscii("hair"), [web3.utils.fromAscii("black")]);
    await protocol2Contract.assignTo(accounts[2], [0], {
      from: accounts[0]
    });
    await protocol2Contract.assignTo(accounts[3], [0], {
      from: accounts[0]
    });
    await protocol2Contract.assignTo(accounts[4], [0], {
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
    await protocol3Contract.assignTo(accounts[3], [0], {
      from: accounts[0]
    });
    await protocol3Contract.assignTo(accounts[4], [0], {
      from: accounts[0]
    });
    await protocol3Contract.assignTo(accounts[5], [0], {
      from: accounts[0]
    });
    var presentTime = (await web3.eth.getBlock(await web3.eth.getBlockNumber())).timestamp;
    const startTime = presentTime + 1000;
    pollContract = await DelegatedVoteTest.new(
      [protocol1Contract.address, protocol2Contract.address, protocol3Contract.address],
      ["0x68656c6c6f"],
      "0x57616e636861696e",
      "0x41646d696e20456c656374696f6e20466f722032303138",
      "0x4f6e6520506572736f6e204f6e6520566f7465",
      startTime,
      "0"
    );
  });
  it("gets total member count", async () => {
    await increaseTime(10000);
    const memberCount = await pollContract.getVoterBaseDenominator();
    assert.equal(web3.utils.toDecimal(memberCount), 10);
  });
});
