// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./UserAccount.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Address.sol";

interface ICertificate {
    function initializeFactory(address _factoryAddress) external;
}

contract AccountFactory is Ownable {
    using Address for address;

    struct Account {
        bool isActive;
        string name;
        string role;
        uint256 createdAt;
    }

    mapping(address => Account) public accounts;
    mapping(address => bool) public isAccountContract;
    address public certificateContract;

    event AccountCreated(address indexed account, string name, string role);
    event AccountDeactivated(address indexed account);
    event AccountReactivated(address indexed account);
    event CertificateContractSet(address indexed certificateContract);

    constructor(address initialOwner) Ownable(initialOwner) {}

    function setCertificateContract(address _certificateContract) external onlyOwner {
        require(_certificateContract != address(0), "Invalid certificate contract address");
        certificateContract = _certificateContract;
        emit CertificateContractSet(_certificateContract);
    }

    // Modified to allow anyone to create their own account
    function createAccount(string memory _name, string memory _role) external {
        require(!accounts[msg.sender].isActive, "Account already exists");
        
        accounts[msg.sender] = Account({
            isActive: true,
            name: _name,
            role: _role,
            createdAt: block.timestamp
        });

        emit AccountCreated(msg.sender, _name, _role);
    }

    function deactivateAccount(address _account) external onlyOwner {
        require(accounts[_account].isActive, "Account not active");
        accounts[_account].isActive = false;
        emit AccountDeactivated(_account);
    }

    function reactivateAccount(address _account) external onlyOwner {
        require(!accounts[_account].isActive, "Account already active");
        accounts[_account].isActive = true;
        emit AccountReactivated(_account);
    }

    function AccountcontractState(address _account) external view returns (bool) {
        return accounts[_account].isActive;
    }

    function getAccountDetails(address _account) external view returns (
        bool isActive,
        string memory name,
        string memory role,
        uint256 createdAt
    ) {
        Account memory account = accounts[_account];
        return (account.isActive, account.name, account.role, account.createdAt);
    }
}