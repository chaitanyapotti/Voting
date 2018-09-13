var OnePersonOneVoteTest = artifacts.require(
  "../contracts/testContracts/OnePersonOneVoteTest.sol"
);
var electusProtocol = artifacts.require("../contracts/protocol/protocol.sol");
module.exports = function(deployer, network, accounts) {
  // let instance1;
  // let instance2;
  // let instance3;
  // deployer
  //   .deploy(electusProtocol, "Wanchain", "WAN", { gas: 3000000 })
  //   .then(protocol => {
  //     instance1 = protocol.address;
  //     protocol.assignTo(accounts[1], [0], {
  //       from: accounts[0]
  //     });
  //     console.log(instance1, "ins1");
  //   });
  // deployer.deploy(electusProtocol, "US & China", "UC").then(protocol1 => {
  //   instance2 = protocol1.address;
  //   protocol1.assignTo(accounts[2], [0], {
  //     from: accounts[0]
  //   });
  //   console.log(instance2, "ins2");
  //   console.log(instance1, "ins1");
  // });
  // deployer.deploy(electusProtocol, "Developers", "DEV").then(protocol2 => {
  //   instance3 = protocol2.address;
  //   protocol2.assignTo(accounts[3], [0], {
  //     from: accounts[0]
  //   });
  //   protocol2.assignTo(accounts[1], [0], {
  //     from: accounts[0]
  //   });
  //   protocol2.assignTo(accounts[2], [0], {
  //     from: accounts[0]
  //   });
  //   console.log(instance3, "ins3");
  //   console.log(instance2, "ins2");
  //   console.log(instance1, "ins1");
  // });
  // deployer.deploy(
  //   OnePersonOneVoteTest,
  //   [instance1, instance2, instance3],
  //   ["0x68656c6c6f", "0x776f726c64"],
  //   "0x57616e636861696e",
  //   "0x41646d696e20456c656374696f6e20466f722032303138",
  //   "0x4f6e6520506572736f6e204f6e6520566f7465"
  // );
  // .then(protocol2 => {
  //   instance3 = protocol2.address;
  //   protocol2.assignTo(accounts[3], [0], {
  //     from: accounts[0]
  //   })
  //   protocol2.assignTo(accounts[1], [0], {
  //     from: accounts[0]
  //   })
  //   protocol2.assignTo(accounts[2], [0], {
  //     from: accounts[0]
  //   })
  // console.log(instance3, "ins3")
  // console.log(instance2, "ins2")
  // console.log(instance1, "ins1")
  // })
  // .then(deployer.deploy(electusProtocol, "chain", "WAN").then(protocol1 => {
  //   instance2 = protocol1.address;
  //   protocol1.assignTo(accounts[2], [0], {
  //     from: accounts[0]
  //   })
  // console.log(instance2, "ins")
  // console.log(instance1, "ins")
  // }))
  // .then(deployer.deploy(electusProtocol, "chain", "WAN").then(protocol2 => {
  //   instance3 = protocol2.address;
  // })).then(deployer.deploy(onePersonOneVote, [instance1, instance2]));
  // deployer.link(electusProtocol, electusProtocolMetaData);
  // deployer.deploy(electusProtocolMetaData);
  //deployer.deploy(onePersonOneVote, [], []);
};
