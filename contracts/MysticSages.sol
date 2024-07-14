// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

contract MysticSages is Ownable {
    string public greeting = "Welcome to Mystic Sages!";

    constructor(address initialOwner) Ownable(initialOwner) {
        // Additional constructor logic if needed
    }

    function setGreeting(string memory _greeting) public onlyOwner {
        greeting = _greeting;
    }
}
