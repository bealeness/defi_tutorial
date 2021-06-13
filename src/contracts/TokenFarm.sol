pragma solidity ^0.5.0;

import "./DaiToken.sol";
import "./DappToken.sol";

contract TokenFarm {
    string public name = "Dapp Token Farm";
    address public owner;
    DappToken public dappToken;
    DaiToken public daiToken;

    // the address array will keep track of all addresses that have staked
    address[] public stakers;
    // mapping is a solidity data structure with key => value pairs
    mapping(address => uint) public stakingBalance;
    mapping(address => bool) public hasStaked;
    mapping(address => bool) public isStaking;

    constructor(DappToken _dappToken, DaiToken _daiToken) public {
        dappToken = _dappToken;
        daiToken = _daiToken;
        owner = msg.sender;
    }

    // Stake tokens (Deposit)
    function stakeTokens(uint _amount) public {
        //Require that stake amount is greater than zero
        require(_amount > 0, "Amount cannot be zero");

        // transfer Dai tokens to this contract for staking
        daiToken.transferFrom(msg.sender, address(this), _amount);

        // Update staking balance
        stakingBalance[msg.sender] = stakingBalance[msg.sender] + _amount;

        // Add user to stakers array only if they haven't staked
        if(!hasStaked[msg.sender]) {
            stakers.push(msg.sender);
        }

        // Update staking status
        isStaking[msg.sender] = true;
        hasStaked[msg.sender] = true; 

    }

    // Unstake tokens (Withdraw)
    function unstakeTokens() public {
        //fetch staking balance
        uint balance = stakingBalance[msg.sender];

        //require amount greater than zero
        require(balance > 0, "staked balance cannot be zero");

        //transfer Dai tokens back to the user
        daiToken.transfer(msg.sender, balance);

        //reset staking balance
        stakingBalance[msg.sender] = 0;

        //update staking status
        isStaking[msg.sender] = false;
    }

    // Issuing tokens (Earning interest)
    function issueTokens() public {
        // Only owner can call this function
        require(msg.sender == owner, "Caller must be the owner");

        // Issue tokens to all stakers
        for (uint i=0; i < stakers.length; i++) {
            address recipient = stakers[i];
            uint balance = stakingBalance[recipient];
            if (balance > 0) {
                dappToken.transfer(recipient, balance);
            }
        }
    }
}
