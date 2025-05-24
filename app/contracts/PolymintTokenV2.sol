// SPDX-License-Identifier: MIT
 pragma solidity ^0.8.20;
 
 import "@openzeppelin/contracts@5.0.0/token/ERC721/ERC721.sol";
 import "@openzeppelin/contracts@5.0.0/token/ERC721/extensions/ERC721URIStorage.sol";
 import "@openzeppelin/contracts@5.0.0/token/ERC721/extensions/ERC721Burnable.sol";
 import "@openzeppelin/contracts@5.0.0/access/Ownable.sol";
 
 contract MyToken is ERC721, ERC721URIStorage, ERC721Burnable, Ownable {
     uint256 public mintPrice = 1 ether; // 1 Matic (adjust depending on Matic's current value)
     uint256 private _tokenIdCounter = 1; // Starting token ID from 1
 
     // Mapping to store whitelisted addresses
     mapping(address => bool) public whitelisted;
 
     // Address to withdraw funds
     address public withdrawAddress;
 
     constructor(address initialOwner)
         ERC721("MyToken", "MTK")
         Ownable(initialOwner)
     {
        withdrawAddress=msg.sender;
     }
 
     // Modifier to restrict access to the owner or whitelisted addresses
     modifier onlyWhitelisted() {
         require(owner() == msg.sender || whitelisted[msg.sender], "Not authorized");
         _;
     }
 
     // Function to update mint price, only callable by the owner or whitelisted addresses
     function setMintPrice(uint256 newPrice) external onlyWhitelisted {
         mintPrice = newPrice;
     }
 
     // Function to add a new address to the whitelist (only owner can call this)
     function addToWhitelist(address account) external onlyOwner {
         whitelisted[account] = true;
     }
 
     // Function to remove an address from the whitelist (only owner can call this)
     function removeFromWhitelist(address account) external onlyOwner {
         whitelisted[account] = false;
     }
 
     // Function to set the withdraw address, only callable by the owner
     function setWithdrawAddress(address _withdrawAddress) external onlyOwner {
         withdrawAddress = _withdrawAddress;
     }
 
     // Function to mint a new token and pay the mint price
     function safeMint(address to, string memory uri)
         public
         payable
     {
         require(msg.value == mintPrice, "Please send 1 Matic for minting.");
 
         // Use the counter for the next tokenId
         uint256 tokenId = _tokenIdCounter;
 
         // Increment the counter for the next mint
         _tokenIdCounter++;
 
         // Mint the token
         _safeMint(to, tokenId);
         _setTokenURI(tokenId, uri);
     }
 
     // Withdraw funds to the specified withdraw address (only owner)
     function withdraw() public onlyOwner {
         require(withdrawAddress != address(0), "Withdraw address not set");
         payable(withdrawAddress).transfer(address(this).balance);
     }
 
     // Function to get the total number of minted tokens (total token IDs minted)
     function getTotalMinted() public view returns (uint256) {
         return _tokenIdCounter - 1; // Subtract 1 because the counter starts at 1
     }
 
     // The following functions are overrides required by Solidity.
     function tokenURI(uint256 tokenId)
         public
         view
         override(ERC721, ERC721URIStorage)
         returns (string memory)
     {
         return super.tokenURI(tokenId);
     }
 
     function supportsInterface(bytes4 interfaceId)
         public
         view
         override(ERC721, ERC721URIStorage)
         returns (bool)
     {
         return super.supportsInterface(interfaceId);
     }
 }