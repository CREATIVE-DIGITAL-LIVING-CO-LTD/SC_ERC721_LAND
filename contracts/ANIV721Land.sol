// SPDX-License-Identifier: MIT

pragma solidity 0.8.16;

import "./erc721/ERC721Tradable.sol";

contract ANIV721Land is ERC721Tradable {
    using Counters for Counters.Counter;
    Counters.Counter private _totalSupply;
    uint256 public immutable MAX_LANDS;

    constructor(address _proxyRegistryAddress, uint256 _maxlands)
        ERC721Tradable(
            "ANIV's Poseidon land",
            "Aposeidon",
            _proxyRegistryAddress
        )
    {
        MAX_LANDS = _maxlands;
    }

    function baseTokenURI() public pure override returns (string memory) {
        return "https://api-asset-dev.aniv.io/v1/LandMetadata/by_token/";
    }

    function totalSupply() public view returns (uint256) {
        return _totalSupply.current();
    }

    function mint(address _to, uint256 tokenId) public onlyOwner {
        require(_totalSupply.current() < MAX_LANDS, "tokenId is out of bounds");
        _safeMint(_to, tokenId);
        _totalSupply.increment();
    }
}
