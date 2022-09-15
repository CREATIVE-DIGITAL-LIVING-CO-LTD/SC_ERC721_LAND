// SPDX-License-Identifier: MIT

pragma solidity 0.8.16;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "./common/meta-transactions/ContextMixin.sol";
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
	Operator,
	Ownable
{
	using SafeMath for uint256;
	using Counters for Counters.Counter;
	
	mapping(address => uint256[]) public _operatorLandApproval;
	mapping(address => mapping(uint256 => bool)) public _operatorTokenApproval;
	/**
	 * We rely on the OZ Counter util to keep track of the next available ID.
	 * We track the nextTokenId instead of the currentTokenId to save users on gas costs.
	 * Read more about it here: https://shiny.mirror.xyz/OUampBbIz9ebEicfGnQf5At_ReMHlZy0tB4glb9xQ0E
	 */
	uint256 public maxOperatorLand = 600;
	uint256 public immutable MAX_VALUE_OPERATOR_LAND = 1000;
	address public proxyRegistryAddress;
	address public candidateOwner;
	
	event SetProxyRegistryAddressInitial(address indexed proxyRegistryAddress);
	event SetProxyRegistryAddress(address indexed _oldAddress, address indexed _newAddress);
	event AddLandToOperator(uint256 indexed tokenId, address indexed operatorAddr);
	event SetMaxOperatorLand(uint256 indexed _oldMaxOperator, uint256 indexed _newMaxOperator);
	event NewCandidateOwner(address indexed _candidateOwner);
	
	constructor(
		string memory _name,
		string memory _symbol,
		address _proxyRegistryAddress
	) ERC721(_name, _symbol) {
		proxyRegistryAddress = _proxyRegistryAddress;
		_initializeEIP712(_name);
		emit SetProxyRegistryAddressInitial(proxyRegistryAddress);
	}
	
	/**
	@dev Returns the total tokens minted so far.
        1 is always subtracted from the Counter since it tracks the next available tokenId.
     */
	
	function baseTokenURI() public view virtual returns (string memory);
	
	function tokenURI(uint256 _tokenId) public view override returns (string memory){
		require(_exists(_tokenId), "_tokenId does not exist");
		return string(
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
		if (_msgSender() == owner()) { // audit 8
			_addLandToOperator(to, tokenId);
		}
		super.approve(to, tokenId);
	}
	
	function addOperator(address to) public onlyOwner {
		_addOperator(to);
	}
	
	function revokeOperator(address to) public onlyOwner {
		_revokeOperator(to);
		uint256[] memory _tokenId = _operatorLandApproval[to];
		for (uint256 i = 0; i < _tokenId.length; i++) {
			if (getApproved(_tokenId[i]) == to) {
				_approve(address(0), _tokenId[i]);
			}
		}
		delete _operatorLandApproval[to];
	}
	
	function _addLandToOperator(address to, uint256 tokenId) internal virtual {
		require(isOperator(to), "Address is not operator");
		require(ERC721.ownerOf(tokenId) == owner(), "Land not owned by owner");
		require(!_operatorTokenApproval[to][tokenId], "Token id was approved");
		uint256[] storage _tokenId = _operatorLandApproval[to];
		require(_tokenId.length <= maxOperatorLand, "Current operator has maxed land");
		_tokenId.push(tokenId);
		_operatorTokenApproval[to][tokenId] = true;
		emit AddLandToOperator(tokenId, to);

	}
	
	function _beforeTokenTransfer(
		address from,
		address to,
		uint256 tokenId
	) internal virtual override {
		if (isOperator(to)) {
			require(_msgSender() != to, "Operator can't transfer to itself");
		}
		super._beforeTokenTransfer(from, to, tokenId);
	}
	
	function renounceOwnership() public view override onlyOwner {
		revert("Ownable: renounceOwnership function is disabled");
	}
	
	function transferOwnership(address _candidateOwner) public override onlyOwner {
		require(_candidateOwner != address(0), "Ownable : candidate owner is the zero address");
		candidateOwner = _candidateOwner;
		emit NewCandidateOwner(_candidateOwner);
	}
	
	function claimOwnership() external {
		require(candidateOwner == _msgSender(), "Ownable : caller is not the candidate owner");
		_transferOwnership(candidateOwner);
		candidateOwner = address(0);
	}
	
	function setProxyRegistryAddress(address _newProxyRegistryAddress) external onlyOwner {
		require(_newProxyRegistryAddress != address(0), "Set proxy registry address to zero address");
		address _oldAddress = proxyRegistryAddress;
		proxyRegistryAddress = _newProxyRegistryAddress;
		emit SetProxyRegistryAddress(_oldAddress, _newProxyRegistryAddress);
	}
	
	function setMaxOperatorLand(uint256 _newMaxOperatorLand) external onlyOwner {
		require(_newMaxOperatorLand > 0 && _newMaxOperatorLand <= MAX_VALUE_OPERATOR_LAND, "Operator must be operate lands between 1 - 1000");
		uint256 _oldMaxOperatorLand = maxOperatorLand;
		maxOperatorLand = _newMaxOperatorLand;
		emit SetMaxOperatorLand(_oldMaxOperatorLand, _newMaxOperatorLand);
	}
}
