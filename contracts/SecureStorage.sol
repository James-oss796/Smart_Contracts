//SPDX-license-Identifier: MIT

pragma solidity ^0.8.34;

//contract to store a value 
//the value is only modifiable by the owner
//ownership can be transferred.
contract SecureStorage{
    //the variables

    uint256 private value;
    address public owner;
    
    //events
    event ValueChanged(uint256 oldValue, uint256 newValue, address indexed changedBy);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    //modifiers
    modifier onlyOwner{
        require(msg.sender == owner , "SecureStorage: Caller is not the owner");
        _;
    }

    //constructor
    constructor(){
        owner= msg.sender;
    }

    //functions
    function set(uint256 newValue) external onlyOwner {
        uint256 old = value;
        value = newValue;
        emit ValueChanged(old, newValue, msg.sender);
    }

    function get() external view returns (uint256) {
        return value;
    }

    function transferOwnership(address newOwner) external onlyOwner{
        require(newOwner != address(0), "SecureStorage: zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
}