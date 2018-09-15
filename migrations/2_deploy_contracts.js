var OnePersonOneVoteTest = artifacts.require(
  "../contracts/testContracts/OnePersonOneVoteTest.sol"
);
var DelegatedVoteTest = artifacts.require("../contracts/testContracts/DelegatedVoteTest.sol");
var electusProtocol = artifacts.require("../contracts/protocol/protocol.sol");
module.exports = function(deployer, network, accounts) {
  let instance1;
  let instance2;
  let instance3;
  deployer
    .then(function() {
      return electusProtocol.new("Wanchain", "WAN", { gas: 3000000 });
    })
    .then(function(instance) {
      instance1 = instance;
      return electusProtocol.new("US & China", "UC", { gas: 3000000 });
    })
    .then(function(instanceB) {
      instance2 = instanceB;
      return electusProtocol.new("Developers", "DEV", { gas: 3000000 });
    })
    .then(function(instanceC) {
      instance3 = instanceC;
      return OnePersonOneVoteTest.new(
        [instance1.address, instance2.address, instance3.address],
        ["0x68656c6c6f", "0x776f726c64"],
        "0x57616e636861696e",
        "0x41646d696e20456c656374696f6e20466f722032303138",
        "0x4f6e6520506572736f6e204f6e6520566f7465"
      );
    })
    .then(function(instanceD) {
      return DelegatedVoteTest.new(
        [instance1.address, instance2.address, instance3.address],
        ["0x68656c6c6f", "0x776f726c64"],
        "0x57616e636861696e",
        "0x41646d696e20456c656374696f6e20466f722032303138",
        "0x4f6e6520506572736f6e204f6e6520566f7465"
      );
    });
};
