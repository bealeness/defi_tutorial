const DaiToken = artifacts.require('DaiToken')
const DappToken = artifacts.require('DappToken')
const TokenFarm = artifacts.require('TokenFarm')

module.exports = async function(deployer, network, accounts) {
    //deploy mock DAI tokens
    await deployer.deploy(DaiToken);
    const daiToken = await DaiToken.deployed()

    //deploy DAPP tokens
    await deployer.deploy(DappToken);
    const dappToken = await DappToken.deployed()

    //deploy TokenFarm
    await deployer.deploy(TokenFarm, dappToken.address, daiToken.address)
    const tokenFarm = await TokenFarm.deployed()

    //transfer all Dapp tokens to TokenFarm (1million)
    await dappToken.transfer(tokenFarm.address, '1000000000000000000000000')

    //transfer 100 mock DAI tokens to investor
    await daiToken.transfer(accounts[1], '100000000000000000000')
};