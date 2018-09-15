OnePersonOneVoteBoundTest = artifacts.require("../contracts/testContracts/OnePersonOneVoteBoundTest.sol");
ElectusProtocol = artifacts.require("../contracts/protocol/protocol.sol")

const truffleAssert = require("truffle-assertions");

contract("one Person One Vote Bound Success Test", function(accounts){
    var x=0;
    beforeEach("setup", async()=>{
        x+=1;
        if (x==6){

        }
        else {} protocol1Contract = await ElectusProtocol.new("Wanchain", "WAN", {
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
            presentTime+1000,
            presentTime+10000,
            "0x57616e636861696e",
            "0x41646d696e20456c656374696f6e20466f722032303138",
            "0x4f6e6520506572736f6e204f6e6520566f7465"
          );
    })
    it("cast vote: is a member but poll hasnt started yet", async () => {
        try{await pollContract.vote(1, { from: accounts[1] })}
        catch(error){
            assert.exists(error)
        } 
    });
    it("cast vote: is a member ,gives wrong proposal but poll hasnt started yet", async () => {
        try{await pollContract.vote(2, { from: accounts[1] })}
        catch(error){
            assert.exists(error)
        }
    });
    it("cast vote: not a member but poll hasnt started yet", async () => {
        try{await pollContract.vote(2, { from: accounts[3] })}
        catch(error){
            assert.exists(error)
        }
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