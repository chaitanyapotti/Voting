var TokenProportionalCappedBoundTest = artifacts.require("./TokenProportionalCappedBoundTest.sol");
var ElectusProtocol = artifacts.require("./Protocol.sol");
const truffleAssert = require("truffle-assertions");
var TestToken = artifacts.require("./FreezableTestToken.sol");
const { assertRevert } = require("./utils/assertRevert");
const increaseTime = require("./utils/increaseTime");

contract("Token Proportional Capped Bound Test", function(accounts) {
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
    pollContract = await TokenProportionalCappedBoundTest.new(
      [protocol1Contract.address, protocol2Contract.address, protocol3Contract.address],
      ["0x68656c6c6f"],
      token.address,
      100,
      "0x57616e636861696e",
      "0x41646d696e20456c656374696f6e20466f722032303138",
      "0x4f6e6520506572736f6e204f6e6520566f7465",
      startTime,
      "1000000"
    );
  });
  it("gets total member count", async () => {
    const totalSupply = await pollContract.getVoterBaseDenominator();
    assert.equal(web3.utils.toDecimal(totalSupply), 100000);
  });
});
