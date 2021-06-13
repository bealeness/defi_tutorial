const { assert } = require('chai')
const { default: Web3 } = require('web3')
const DaiToken = artifacts.require('DaiToken')
const DappToken = artifacts.require('DappToken')
const TokenFarm = artifacts.require('TokenFarm')

require('chai')
    .use(require('chai-as-promised'))
    .should()

function tokens(n) {
    return web3.utils.toWei(n, 'ether');
}

contract('TokenFarm', ([owner, investor]) => {
    //Write tests here

    let daiToken, dappToken, tokenFarm;

    before(async () => {
        //load contracts
        daiToken = await DaiToken.new()
        dappToken = await DappToken.new()
        tokenFarm = await TokenFarm.new(dappToken.address, daiToken.address)

        //transfer all Dapp tokens to farm
        await dappToken.transfer(tokenFarm.address, tokens('1000000'))

        //send tokens to investor
        await daiToken.transfer(investor, tokens('100'), { from: owner })
    }) 

    describe('Dapp Token deployment', async () => {
        it('has a name', async () => {
            const name = await dappToken.name()
            assert.equal(name, 'DApp Token')
        })
    })

    describe('Mock DAI deployment', async () => {
        it('has a name', async () => {
            const name = await daiToken.name()
            assert.equal(name, 'Mock DAI Token')
        })
    })

    describe('Token Farm deployment', async () => {
        it('has a name', async () => {
            const name = await tokenFarm.name()
            assert.equal(name, 'Dapp Token Farm')
        })
    })

    it('Contract has tokens', async () => {
        let balance = await dappToken.balanceOf(tokenFarm.address)
        assert.equal(balance.toString(), tokens('1000000'))
    })

    describe('Farming tokens', async () => {
        
        it('Rewards investors for staking Dai tokens', async () => {
            let result;

            // check investor balance before staking
            result = await daiToken.balanceOf(investor);
            assert.equal(result.toString(), tokens('100'), 'Investor Dai wallet balance correct before staking')

            // stake Dai tokens
            await daiToken.approve(tokenFarm.address, tokens('100'), { from: investor })
            await tokenFarm.stakeTokens(tokens('100'), { from: investor })

            // check investor staking result
            result = await daiToken.balanceOf(investor)
            assert.equal(result.toString(), tokens('0'), 'Investor Dai wallet balance correct after staking')

            // check token farm staking result
            result = await daiToken.balanceOf(tokenFarm.address)
            assert.equal(result.toString(), tokens('100'), 'Token Farm Dai balance correct after staking')

            // check staking balance
            result = await tokenFarm.stakingBalance(investor)
            assert.equal(result.toString(), tokens('100'), 'Investor staking balance correct after staking')

            //check to see the investor is staking
            result = await tokenFarm.isStaking(investor)
            assert.equal(result.toString(), 'true', 'Investor staking status correct after staking')

            //issue tokens
            await tokenFarm.issueTokens({ from: owner })

            //check balances after issueance
            result = await dappToken.balanceOf(investor)
            assert.equal(result.toString(), tokens('100'), 'Investor Dapp Token wallet correct after issuance')

            //ensure that only owner can issue tokens
            await tokenFarm.issueTokens({ from: investor }).should.be.rejected;

            //unstake tokens
            await tokenFarm.unstakeTokens({ from: investor })

            //check investor balance after unstaking
            result = await daiToken.balanceOf(investor)
            assert.equal(result.toString(), tokens('100'), 'Investor Dai wallet balance correct after unstaking')

            //check token farm balance after unstaking
            result = await daiToken.balanceOf(tokenFarm.address)
            assert.equal(result.toString(), tokens('0'), 'Token farm Dai balance correct after unstaking')

            //check investor staking balance after unstaking
            result = await tokenFarm.stakingBalance(investor)
            assert.equal(result.toString(), tokens('0'), 'Investor staking balance correct after unstaking')

            //check investor staking status after unstaking
            result = await tokenFarm.isStaking(investor)
            assert.equal(result.toString(), 'false', 'Investor staking status correct after unstaking')

        })
    })




}) 