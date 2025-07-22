// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./UserAccount.sol";
import "./CourseManager.sol";

contract AccountFactory {
    struct Account {
        string name;
        address accountAddress;
        uint256 createdAt;
        bool isActive;
    }

    address public owner;
    Account[] public accounts;
    bool public paused;
    
    mapping(address => address) public userToAccount; // user address => UserAccount address
    mapping(address => bool) public hasAccount; // user address => has account
    mapping(address => bool) public authorizedAccounts; // UserAccount address => is authorized
    mapping(address => uint256) public accountIndex; // UserAccount address => index in accounts array
    
    address public nftAddress;
    address public courseManagerAddress;

    event AccountCreated(string name, address userAddress, address accountAddress);
    event AccountDeactivated(address userAddress, address accountAddress);
    event AccountActivated(address userAddress, address accountAddress);
    event CourseManagerSet(address courseManagerAddress);
    event Paused();
    event Unpaused();
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    modifier notPaused() {
        require(!paused, "Factory is paused");
        _;
    }

    constructor(address _nftAddress) {
        require(_nftAddress != address(0), "Invalid NFT address");
        owner = msg.sender;
        nftAddress = _nftAddress;
        paused = false;
    }

    function createAccount(string memory name_, uint256 _duration) external notPaused {
        require(!hasAccount[msg.sender], "Account already exists");
        require(bytes(name_).length > 0, "Name cannot be empty");
        require(_duration > 0, "Duration must be greater than 0");
        
        UserAccount account = new UserAccount(
            name_,
            msg.sender,
            _duration,
            nftAddress,
            msg.sender
        );
        
        address accountAddress = address(account);
        
        // Store account information
        accounts.push(Account({
            name: name_,
            accountAddress: accountAddress,
            createdAt: block.timestamp,
            isActive: true
        }));
        
        userToAccount[msg.sender] = accountAddress;
        hasAccount[msg.sender] = true;
        authorizedAccounts[accountAddress] = true;
        accountIndex[accountAddress] = accounts.length - 1;
        
        emit AccountCreated(name_, msg.sender, accountAddress);
    }

    function setCourseManager(address _courseManagerAddress) external onlyOwner {
        require(_courseManagerAddress != address(0), "Invalid address");
        courseManagerAddress = _courseManagerAddress;
        emit CourseManagerSet(_courseManagerAddress);
    }

    function deactivateAccount(address userAddress) external onlyOwner {
        require(hasAccount[userAddress], "Account does not exist");
        
        address accountAddress = userToAccount[userAddress];
        uint256 index = accountIndex[accountAddress];
        
        accounts[index].isActive = false;
        authorizedAccounts[accountAddress] = false;
        
        emit AccountDeactivated(userAddress, accountAddress);
    }

    function activateAccount(address userAddress) external onlyOwner {
        require(hasAccount[userAddress], "Account does not exist");
        
        address accountAddress = userToAccount[userAddress];
        uint256 index = accountIndex[accountAddress];
        
        accounts[index].isActive = true;
        authorizedAccounts[accountAddress] = true;
        
        emit AccountActivated(userAddress, accountAddress);
    }

    function pause() external onlyOwner {
        paused = true;
        emit Paused();
    }

    function unpause() external onlyOwner {
        paused = false;
        emit Unpaused();
    }

    // Read Functions
    function getAllAccounts() external view returns (Account[] memory) {
        return accounts;
    }

    function getAccount(address userAddress) external view returns (Account memory) {
        require(hasAccount[userAddress], "Account does not exist");
        address accountAddress = userToAccount[userAddress];
        uint256 index = accountIndex[accountAddress];
        return accounts[index];
    }

    function getUserAccount(address userAddress) external view returns (address) {
        require(hasAccount[userAddress], "Account does not exist");
        return userToAccount[userAddress];
    }

    function hasUserAccount(address userAddress) external view returns (bool) {
        return hasAccount[userAddress];
    }

    function isAccountAuthorized(address accountAddress) external view returns (bool) {
        return authorizedAccounts[accountAddress];
    }

    function getTotalAccounts() external view returns (uint256) {
        return accounts.length;
    }

    function getActiveAccounts() external view returns (Account[] memory) {
        uint256 activeCount = 0;
        
        // Count active accounts
        for (uint256 i = 0; i < accounts.length; i++) {
            if (accounts[i].isActive) {
                activeCount++;
            }
        }
        
        Account[] memory activeAccounts = new Account[](activeCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < accounts.length; i++) {
            if (accounts[i].isActive) {
                activeAccounts[index] = accounts[i];
                index++;
            }
        }
        
        return activeAccounts;
    }

    // Interface function for Certificate contract
    function AccountcontractState(address contractAccount) external view returns (bool) {
        return authorizedAccounts[contractAccount];
    }
}