// SPDX-License-Identifier: MIT

pragma solidity 0.8.15;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "./common/meta-transactions/ContentMixin.sol";
import "./common/meta-transactions/NativeMetaTransaction.sol";

import "../Operator.sol";

contract OwnableDelegateProxy {}

/**
 * Used to delegate ownership of a contract to another address, to save on unneeded transactions to approve contract use for users
 */
contract ProxyRegistry {
    mapping(address => OwnableDelegateProxy) public proxies;
}

/**
 * @title ERC721Tradable
 * ERC721Tradable - ERC721 contract that whitelists a trading address, and has minting functionality.
 */
abstract contract ERC721Tradable is
    ERC721,
    ContextMixin,
    NativeMetaTransaction,
    Operator
{
    using SafeMath for uint256;
    using Counters for Counters.Counter;

    mapping(address => uint256[]) private _operartorLandApproval;

    /**
     * We rely on the OZ Counter util to keep track of the next available ID.
     * We track the nextTokenId instead of the currentTokenId to save users on gas costs.
     * Read more about it here: https://shiny.mirror.xyz/OUampBbIz9ebEicfGnQf5At_ReMHlZy0tB4glb9xQ0E
     */

    address proxyRegistryAddress;

    constructor(
        string memory _name,
        string memory _symbol,
        address _proxyRegistryAddress
    ) ERC721(_name, _symbol) {
        proxyRegistryAddress = _proxyRegistryAddress;
        _initializeEIP712(_name);
    }

    /**
        @dev Returns the total tokens minted so far.
        1 is always subtracted from the Counter since it tracks the next available tokenId.
     */

    function baseTokenURI() public pure virtual returns (string memory);

    function tokenURI(uint256 _tokenId)
        public
        pure
        override
        returns (string memory)
    {
        return
            string(
                abi.encodePacked(baseTokenURI(), Strings.toString(_tokenId))
            );
    }

    /**
     * Override isApprovedForAll to whitelist user's OpenSea proxy accounts to enable gas-less listings.
     */
    function isApprovedForAll(address owner, address operator)
        public
        view
        override
        returns (bool)
    {
        // Whitelist OpenSea proxy contract for easy trading.
        ProxyRegistry proxyRegistry = ProxyRegistry(proxyRegistryAddress);
        if (address(proxyRegistry.proxies(owner)) == operator) {
            return true;
        }

        return super.isApprovedForAll(owner, operator);
    }

    /**
     * This is used instead of msg.sender as transactions won't be sent by the original token owner, but by OpenSea.
     */
    function _msgSender() internal view override returns (address sender) {
        return ContextMixin.msgSender();
    }

    /**
     * This is for addition logic for only operator can get approve from owner.
     */
    function approve(address to, uint256 tokenId) public override {
        if (msgSender() == owner()) {
            _addLandToOperator(to, tokenId);
        }
        super.approve(to, tokenId);
    }

    function addOperator(address to) public onlyOwner {
        _addOperator(to);
    }

    function revokeOperator(address to) public onlyOwner {
        uint256[] memory _tokenId = _operartorLandApproval[to];
        for (uint256 i = 0; i < _tokenId.length; i++) {
            _approve(address(0), _tokenId[i]);
        }
        _revokeOperator(to);
    }

    function _addLandToOperator(address to, uint256 tokenId) internal virtual {
        require(isOperator(to), "Address is not operator");
        require(ERC721.ownerOf(tokenId) == owner(), "Land not owned by owner");
        uint256[] storage _tokenId = _operartorLandApproval[to];
        _tokenId.push(tokenId);
        _operartorLandApproval[to] = _tokenId;
    }
}
