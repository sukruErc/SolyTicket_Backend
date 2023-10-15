// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./ERC721A.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SolyContract is ERC721A, Ownable {

    bool isScanned = false;

    string public baseURI;
    bool public _saleIsActive;
    uint256 public _totalTickets;
    uint256 public _availableTickets;
    uint256 public _mintPrice;
    string public _name;
    string public _tag;

    mapping(uint256 => string) public mapCidWithNftId; // nftid => cid

    address public adminForMetadata;

    constructor(
        bool saleIsActive,
        uint256 totalTickets,
        uint256 availableTickets,
        uint256 mintPrice,
        string memory name,
        string memory tag
    ) ERC721A(name, tag) {
        _saleIsActive = saleIsActive;
        _totalTickets = totalTickets;
        _availableTickets = availableTickets;
        _mintPrice = mintPrice;
        _name = name;
        _tag = tag;
        baseURI = "ipfs://";

        adminForMetadata = tx.origin;
    }
    
    function mint() external payable {
        // _safeMint's second argument now takes in a quantity, not a tokenId.
        require(_availableTickets > 0, "There is no availble tickets");
        require(_saleIsActive, "Sale does not active");
        require(totalSupply() <= _totalTickets, "Not enough tickets left");
        require(msg.value >= _mintPrice, "Not enough matic sent");
        _safeMint(msg.sender, 1);
        _availableTickets = _availableTickets -1;
    }


    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId),"token Doesn't exits");
        return string(abi.encodePacked(baseURI, mapCidWithNftId[tokenId])); 
    }


    function addTokenUriForNft(uint256[] memory tokenId, string[] memory _newCID) public {
        require(msg.sender == adminForMetadata);

        require(tokenId.length==_newCID.length,"both's length should be equal");
        for (uint i = 0; i < tokenId.length; i++) {
            mapCidWithNftId[tokenId[i]] = _newCID[i];
        }
    }

    function updateTokenUriForNFT(uint256 tokenId, string memory _newCID) public {
        require(msg.sender == adminForMetadata);

        mapCidWithNftId[tokenId] = _newCID;
    }


    function withdraw() external payable onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }

    function setMintRate(uint256 _mintRate) public onlyOwner {
        _mintPrice = _mintRate;
    }

    function setScanned() public onlyOwner{
        isScanned = true;
    }

    function setActive()public onlyOwner{
        _saleIsActive = false;
    }
}