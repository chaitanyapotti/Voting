var onePersonOneVote = artifacts.require(
  "../test/contracts/OnePersonOneVote.sol"
);
var electusProtocol = artifacts.require("../contracts/protocol/protocol.sol");
var electusProtocolMetaData = artifacts.require(
  "../node_modules/electusprotocol/contracts/ERC1261MetaData.sol"
);
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
  //   onePersonOneVote,
  //   [instance1, instance2, instance3],
  //   [
  //     "0x68656c6c6f0000000000000000000000",
  //     "0x776f726c640000000000000000000000"
  //   ],
  //   "Wanchain",
  //   "Admin Election For 2018",
  //   "One Person One Vote"
  // );
  deployer.deploy(
    onePersonOneVote,
    ["0x1c3b7db8327e7683697363e88ebe14186d6c9f72", "0xd3a7f6246e51eb0f76f08f3770ba0cca000e9781", "0x9403ec4c3587a7ae55279374b7325051a818c705"],
    [
      "0x68656c6c6f0000000000000000000000",
      "0x776f726c640000000000000000000000"
    ],
    "Wanchain",
    "Admin Election For 2018",
    "One Person One Vote"
  );

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
