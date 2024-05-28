// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./ERC721A.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract SolyContract is ERC721A, Ownable, ReentrancyGuard {
    bool public isScanned = false;
    string public baseURI;
    bool public saleIsActive;
    uint256 public totalTickets;
    uint256 public availableTickets;
    uint256 public mintPrice;
    string public contractName;
    string public contractTag;

    mapping(uint256 => string) public tokenURIs; // tokenId => URI

    address public adminForMetadata;

    event TicketMinted(address indexed minter, uint256 tokenId);
    event TokenURIUpdated(uint256 indexed tokenId, string newURI);

    constructor(
        bool _saleIsActive,
        uint256 _totalTickets,
        uint256 _availableTickets,
        uint256 _mintPrice,
        string memory _name,
        string memory _tag
    ) ERC721A(_name, _tag) {
        saleIsActive = _saleIsActive;
        totalTickets = _totalTickets;
        availableTickets = _availableTickets;
        mintPrice = _mintPrice;
        contractName = _name;
        contractTag = _tag;
        baseURI = "ipfs://";
        adminForMetadata = tx.origin;
    }
    
    function mint() external payable nonReentrant {
        require(availableTickets > 0, "No available tickets");
        require(saleIsActive, "Sale is not active");
        require(totalSupply() < totalTickets, "Not enough tickets left");
        require(msg.value >= mintPrice, "Insufficient funds sent");
        
        _safeMint(msg.sender, 1);
        availableTickets--;

        emit TicketMinted(msg.sender, totalSupply() - 1);
    }

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        return string(abi.encodePacked(baseURI, tokenURIs[tokenId])); 
    }

    function addTokenURI(uint256[] memory tokenIds, string[] memory newURIs) external {
        require(msg.sender == adminForMetadata, "Unauthorized");
        require(tokenIds.length == newURIs.length, "Mismatched lengths");

        for (uint256 i = 0; i < tokenIds.length; i++) {
            tokenURIs[tokenIds[i]] = newURIs[i];
            emit TokenURIUpdated(tokenIds[i], newURIs[i]);
        }
    }

    function updateTokenURI(uint256 tokenId, string memory newURI) external {
        require(msg.sender == adminForMetadata, "Unauthorized");

        tokenURIs[tokenId] = newURI;
        emit TokenURIUpdated(tokenId, newURI);
    }

    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }

    function setMintPrice(uint256 newMintPrice) external onlyOwner {
        mintPrice = newMintPrice;
    }

    function markScanned() external onlyOwner {
        isScanned = true;
    }

    function setSaleStatus(bool isActive) external onlyOwner {
        saleIsActive = isActive;
    }
}
