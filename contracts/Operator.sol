// SPDX-License-Identifier: MIT
pragma solidity 0.8.15;

contract Operator {
    mapping(address => bool) private _operators;

    function _addOperator(address operatorAddr) internal virtual {
        require(operatorAddr != address(0), "Operator can't be address zero");
        require(!_operators[operatorAddr], "Duplicate operator");
        _operators[operatorAddr] = true;
    }

    function _revokeOperator(address operatorAddr) internal virtual {
        require(operatorAddr != address(0), "Operator can't be address zero");
        require(_operators[operatorAddr], "operator not found");
        delete _operators[operatorAddr];
    }

    function isOperator(address operatorAddr) public view returns (bool) {
        return _operators[operatorAddr];
    }
}
