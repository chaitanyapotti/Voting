var OnePersonOneVoteTest = artifacts.require(
  "../contracts/testContracts/OnePersonOneVoteTest.sol"
);

var electusProtocol = artifacts.require("../contracts/protocol/protocol.sol");

contract("OnePersonOneVoteTest", function(accounts) {
  beforeEach("setup", async () => {
    protocol1Contract = await electusProtocol.new("Wanchain", "WAN", {
      gas: 3000000
    });
    protocol2Contract = await electusProtocol.new("US & China", "UC", {
      gas: 3000000
    });
    protocol3Contract = await electusProtocol.new("Developers", "DEV", {
      gas: 3000000
    });

    pollContract = await OnePersonOneVoteTest.new(
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
  it("setup1", async () => {
    console.log(protocol1Contract.address);
    console.log(protocol2Contract.address);
    console.log(protocol3Contract.address);
    console.log(await pollContract.getProtocolAddresses());
  });
  it("setup2", async () => {
    console.log(await pollContract.getProtocolAddresses());
  });
});
