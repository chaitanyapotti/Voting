var onePersonOneVote = artifacts.require("./poll/OnePersonOneVote.sol");

module.exports = function(deployer) {
  deployer.deploy(onePersonOneVote);
};
