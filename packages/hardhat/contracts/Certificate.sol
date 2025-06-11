// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "./Ifactory.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Address.sol";

contract Certificate is ERC1155, Ownable {
    using Address for address;

    address public factoryAddress;

    constructor(string memory uri_, address initialOwner) ERC1155(uri_) Ownable(initialOwner) {
        factoryAddress = msg.sender;
    }

    function Mintcert(address to, uint id, uint amount) external{
        bool result = Ifactory(factoryAddress).AccountcontractState(msg.sender);
        require(result == true, 'non_user');
        require(to != address(0), 'non-zero');
        _mint(to, id, amount, '');
    }

    function Burn(address from, uint id, uint amount) external {
         bool result = Ifactory(factoryAddress).AccountcontractState(msg.sender);
        require(result == true, 'non_user');
        _burn(from, id, amount);
    }
    
    //over-rides
    function safeTransferFrom(
        address from,
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) public override {
        revert('non-transferable');
    }

    function safeBatchTransferFrom(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) public override {
       revert('non-transferable');
    }

    function initializeFactory(address _factoryAddress) external {
        require(msg.sender == factoryAddress, 'not authorized');
        factoryAddress = _factoryAddress;
    }

    // Local polyfill for isContract
    function isContract(address account) internal view returns (bool) {
        return account.code.length > 0;
    }
}