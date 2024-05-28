// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;
import './SolyContract.sol';
import "@openzeppelin/contracts/access/Ownable.sol";

contract Factory is Ownable {
    string public factoryName;
    string public factoryTag;
    SolyContract[] public deployedContracts;

    event ContractDeployed(address indexed by, address indexed contractAddress);

    constructor(string memory _factoryName, string memory _factoryTag) {
        factoryName = _factoryName;
        factoryTag = _factoryTag;
    }

    function createTicket(
        bool saleIsActive,
        uint256 totalTickets,
        uint256 availableTickets,
        uint256 mintPrice,
        string memory name,
        string memory tag
    ) public onlyOwner returns (address) {
        SolyContract newContract = new SolyContract(saleIsActive, totalTickets, availableTickets, mintPrice, name, tag);
        deployedContracts.push(newContract);
        emit ContractDeployed(msg.sender, address(newContract));
        return address(newContract);
    }

    function getTotalContracts() public view returns (uint256) {
        return deployedContracts.length;
    }
}
