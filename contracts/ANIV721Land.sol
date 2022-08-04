// SPDX-License-Identifier: MIT

pragma solidity 0.8.15;

import "./erc721/ERC721Tradable.sol";

contract ANIV721Land is ERC721Tradable {
    constructor(address _proxyRegistryAddress) ERC721Tradable("Aniverse", "ANIV", _proxyRegistryAddress) public {}

    function baseTokenURI() override public pure returns (string memory) {
        return 'https://api-dev.aniv.io/';
    }

}
