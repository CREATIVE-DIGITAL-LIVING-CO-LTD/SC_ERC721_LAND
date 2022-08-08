pragma solidity 0.8.15;

contract Operators {
    mapping(address => bool) public operators;

    event OperatorChanged(address oldOperator, address newOperator);

    // /// @notice gives the current administrator of this contract.
    // /// @return all operators of this contract.
    // function getAllOperator() external view returns (operators[] memory) {
    //     return operators;
    // }

    // /// @notice change the administrator to be `newOperator`.
    // /// @param newOperator address of the new operator.
    // function changeAdmin(address newOperator) external {
    //     require(msg.sender == operator, "only owner can change operator.");
    //     emit OperatorChanged(operator, newOperator);
    //     operator = newOperator;
    // }

    modifier onlyOperator() {
        require(operators[msg.sender], 'only operator allowed');
        _;
    }
}
