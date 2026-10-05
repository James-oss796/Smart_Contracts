//SPDX_License_Identifier: MIT

pragma solidity ^0.8.34;

contract MiniBank{
    mapping(address => uint256) public balances;

    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);

    function deposit() external payable{
        balances[msg.sender] += msg.value;

        emit Deposited(msg.sender, msg.value);
    }

    function withdraw(uint256 amount) external {

        //check
        require(balances[msg.sender] >= amount, "MiniBank: insufficient balance");

        //effect
        balances[msg.sender] -=amount;

        //interaction
        payable(msg.sender).transfer(amount);

        //logs
        emit Withdrawn(msg.sender, amount);
    }

    function getBalance() external view returns(uint256) {
        return balances[msg.sender];
    }
}