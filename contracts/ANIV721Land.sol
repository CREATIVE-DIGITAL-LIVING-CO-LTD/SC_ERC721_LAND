// SPDX-License-Identifier: MIT

pragma solidity 0.8.16;

import "./erc721/ERC721Tradable.sol";

contract ANIV721Land is ERC721Tradable {
	using Counters for Counters.Counter;
	Counters.Counter private _totalSupply;
	uint256 public immutable MAX_LANDS;
	string private _baseTokenURI;
	
	constructor(address _proxyRegistryAddress, uint256 _maxlands, string memory _tokenUri)
	ERC721Tradable(
		"ANIV's Poseidon land",
		"Aposeidon",
		_proxyRegistryAddress
	){
		MAX_LANDS = _maxlands;
		_baseTokenURI = _tokenUri;
	}
	
	function baseTokenURI() public view override returns (string memory) {
		return _baseTokenURI;
	}
	
	function setBaseTokenURI(string memory uri) public onlyOwner {
		_baseTokenURI = uri;
	}
	
	function totalSupply() public view returns (uint256) {
		return _totalSupply.current();
	}
	
	function mint(address _to, uint256 tokenId) public onlyOwner {
		require(_totalSupply.current() < MAX_LANDS, "Total supply is Maxed");
		require( tokenId > 0 && tokenId <= MAX_LANDS, "Token Id must be more than 0 AND less than MAX_LANDS");
		_safeMint(_to, tokenId);
		_totalSupply.increment();
	}
}
