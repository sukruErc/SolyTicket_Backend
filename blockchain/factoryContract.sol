// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;
import './SolyContract.sol';

contract Factory is Ownable {
  string public _factoryName;
  string public _factoryTag;

  SolyContract[] public solyContract;


   event SolyContractDeployed(address indexed by, address indexed contractAddress);

  constructor(string memory factoryName, string memory factoryTag) {
    _factoryName = factoryName;
    _factoryTag = factoryTag;
  }

  function createTicket(
    bool saleIsActive,
    uint256 totalTickets,
    uint256 availableTickets,
    uint256 mintPrice,
    string memory name,
    string memory tag
  ) public onlyOwner returns(address) {
    SolyContract solyTicket = new SolyContract(saleIsActive, totalTickets, availableTickets, mintPrice, name, tag);
    solyContract.push(solyTicket);
    emit SolyContractDeployed(msg.sender,address(solyTicket));

    return address(solyTicket);
  }

  function totalSolyContracts() public view returns(uint256){
      return solyContract.length;
  }
}
