const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AccountFactory", function () {
  let certificate, factory, courseManager, owner, user1, user2, user3;

  beforeEach(async function () {
    [owner, user1, user2, user3] = await ethers.getSigners();

    // Deploy Certificate contract
    const Certificate = await ethers.getContractFactory("Certificate");
    certificate = await Certificate.deploy("https://educert.com/api/metadata/", owner.address);
    await certificate.deployed();

    // Deploy AccountFactory contract
    const AccountFactory = await ethers.getContractFactory("AccountFactory");
    factory = await AccountFactory.deploy(certificate.address);
    await factory.deployed();

    // Deploy CourseManager contract
    const CourseManager = await ethers.getContractFactory("CourseManager");
    courseManager = await CourseManager.deploy(
      factory.address,
      certificate.address,
      owner.address
    );
    await courseManager.deployed();

    // Set up contract integrations
    await factory.setCourseManager(courseManager.address);
    
    // Initialize factory address in Certificate contract
    await certificate.initializeFactory(factory.address);
  });

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      expect(await factory.owner()).to.equal(owner.address);
    });

    it("Should set the correct NFT address", async function () {
      expect(await factory.nftAddress()).to.equal(certificate.address);
    });

    it("Should start with factory not paused", async function () {
      expect(await factory.paused()).to.be.false;
    });

    it("Should start with zero accounts", async function () {
      expect((await factory.getTotalAccounts()).toNumber()).to.equal(0);
    });
  });

  describe("Account Creation", function () {
    it("Should create account successfully", async function () {
      const tx = await factory.connect(user1).createAccount("Test Institution", 365);
      const receipt = await tx.wait();
      
      const event = receipt.events.find(e => e.event === "AccountCreated");
      expect(event.args.name).to.equal("Test Institution");
      expect(event.args.userAddress).to.equal(user1.address);
      expect(event.args.accountAddress).to.not.equal(ethers.constants.AddressZero);

      expect(await factory.hasUserAccount(user1.address)).to.be.true;
      expect((await factory.getTotalAccounts()).toNumber()).to.equal(1);
    });

    it("Should create UserAccount contract with correct parameters", async function () {
      await factory.connect(user1).createAccount("Test Institution", 365);
      
      const accountAddress = await factory.getUserAccount(user1.address);
      const UserAccount = await ethers.getContractFactory("UserAccount");
      const userAccount = UserAccount.attach(accountAddress);
      
      const institution = await userAccount.getInstitution();
      expect(institution.name).to.equal("Test Institution");
      expect(institution.proprietor).to.equal(user1.address);
      expect(institution.courseDuration.toNumber()).to.equal(365);
      expect(institution.isActive).to.be.true;
      expect(institution.certMinted.toNumber()).to.equal(0);
    });

    it("Should not allow double account creation", async function () {
      await factory.connect(user1).createAccount("Test Institution", 365);
      
      await expect(
        factory.connect(user1).createAccount("Another Institution", 180)
      ).to.be.revertedWith("Account already exists");
    });

    it("Should not allow empty account name", async function () {
      await expect(
        factory.connect(user1).createAccount("", 365)
      ).to.be.revertedWith("Name cannot be empty");
    });

    it("Should not allow zero duration", async function () {
      await expect(
        factory.connect(user1).createAccount("Test Institution", 0)
      ).to.be.revertedWith("Duration must be greater than 0");
    });

    it("Should not allow account creation when paused", async function () {
      await factory.pause();
      
      await expect(
        factory.connect(user1).createAccount("Test Institution", 365)
      ).to.be.revertedWith("Factory is paused");
    });
  });

  describe("Account Management", function () {
    let accountAddress;

    beforeEach(async function () {
      await factory.connect(user1).createAccount("Test Institution", 365);
      accountAddress = await factory.getUserAccount(user1.address);
    });

    it("Should get account details correctly", async function () {
      const account = await factory.getAccount(user1.address);
      expect(account.name).to.equal("Test Institution");
      expect(account.accountAddress).to.equal(accountAddress);
      expect(account.isActive).to.be.true;
      expect(account.createdAt.toNumber()).to.be.gt(0);
    });

    it("Should get user account address", async function () {
      const address = await factory.getUserAccount(user1.address);
      expect(address).to.equal(accountAddress);
    });

    it("Should check if user has account", async function () {
      expect(await factory.hasUserAccount(user1.address)).to.be.true;
      expect(await factory.hasUserAccount(user2.address)).to.be.false;
    });

    it("Should check if account is authorized", async function () {
      expect(await factory.isAccountAuthorized(accountAddress)).to.be.true;
      expect(await factory.isAccountAuthorized(user2.address)).to.be.false;
    });

    it("Should deactivate account", async function () {
      await factory.deactivateAccount(user1.address);
      
      const account = await factory.getAccount(user1.address);
      expect(account.isActive).to.be.false;
      expect(await factory.isAccountAuthorized(accountAddress)).to.be.false;
    });

    it("Should activate account", async function () {
      await factory.deactivateAccount(user1.address);
      await factory.activateAccount(user1.address);
      
      const account = await factory.getAccount(user1.address);
      expect(account.isActive).to.be.true;
      expect(await factory.isAccountAuthorized(accountAddress)).to.be.true;
    });

    it("Should not allow non-owner to deactivate account", async function () {
      await expect(
        factory.connect(user2).deactivateAccount(user1.address)
      ).to.be.revertedWith("Not authorized");
    });

    it("Should not allow non-owner to activate account", async function () {
      await factory.deactivateAccount(user1.address);
      
      await expect(
        factory.connect(user2).activateAccount(user1.address)
      ).to.be.revertedWith("Not authorized");
    });

    it("Should not allow deactivation of non-existent account", async function () {
      await expect(
        factory.deactivateAccount(user2.address)
      ).to.be.revertedWith("Account does not exist");
    });

    it("Should not allow activation of non-existent account", async function () {
      await expect(
        factory.activateAccount(user2.address)
      ).to.be.revertedWith("Account does not exist");
    });
  });

  describe("Factory Management", function () {
    it("Should pause factory", async function () {
      await factory.pause();
      expect(await factory.paused()).to.be.true;
    });

    it("Should unpause factory", async function () {
      await factory.pause();
      await factory.unpause();
      expect(await factory.paused()).to.be.false;
    });

    it("Should not allow non-owner to pause", async function () {
      await expect(
        factory.connect(user1).pause()
      ).to.be.revertedWith("Not authorized");
    });

    it("Should not allow non-owner to unpause", async function () {
      await factory.pause();
      
      await expect(
        factory.connect(user1).unpause()
      ).to.be.revertedWith("Not authorized");
    });

    it("Should set course manager address", async function () {
      const newCourseManager = ethers.Wallet.createRandom().address;
      await factory.setCourseManager(newCourseManager);
      
      expect(await factory.courseManagerAddress()).to.equal(newCourseManager);
    });

    it("Should not allow non-owner to set course manager", async function () {
      const newCourseManager = ethers.Wallet.createRandom().address;
      
      await expect(
        factory.connect(user1).setCourseManager(newCourseManager)
      ).to.be.revertedWith("Not authorized");
    });

    it("Should not allow setting invalid course manager address", async function () {
      await expect(
        factory.setCourseManager(ethers.constants.AddressZero)
      ).to.be.revertedWith("Invalid address");
    });
  });

  describe("Read Functions", function () {
    beforeEach(async function () {
      await factory.connect(user1).createAccount("Institution 1", 365);
      await factory.connect(user2).createAccount("Institution 2", 180);
      await factory.connect(user3).createAccount("Institution 3", 90);
    });

    it("Should get all accounts", async function () {
      const accounts = await factory.getAllAccounts();
      expect(accounts.length).to.equal(3);
      expect(accounts[0].name).to.equal("Institution 1");
      expect(accounts[1].name).to.equal("Institution 2");
      expect(accounts[2].name).to.equal("Institution 3");
    });

    it("Should get active accounts", async function () {
      await factory.deactivateAccount(user2.address);
      
      const activeAccounts = await factory.getActiveAccounts();
      expect(activeAccounts.length).to.equal(2);
      expect(activeAccounts[0].name).to.equal("Institution 1");
      expect(activeAccounts[1].name).to.equal("Institution 3");
    });

    it("Should get total accounts count", async function () {
      expect((await factory.getTotalAccounts()).toNumber()).to.equal(3);
    });

    it("Should return correct account index", async function () {
      const account1Address = await factory.getUserAccount(user1.address);
      const account2Address = await factory.getUserAccount(user2.address);
      const account3Address = await factory.getUserAccount(user3.address);
      
      const accounts = await factory.getAllAccounts();
      expect(accounts[0].accountAddress).to.equal(account1Address);
      expect(accounts[1].accountAddress).to.equal(account2Address);
      expect(accounts[2].accountAddress).to.equal(account3Address);
    });
  });

  describe("Interface Functions", function () {
    let accountAddress;

    beforeEach(async function () {
      await factory.connect(user1).createAccount("Test Institution", 365);
      accountAddress = await factory.getUserAccount(user1.address);
    });

    it("Should return true for authorized account", async function () {
      expect(await factory.AccountcontractState(accountAddress)).to.be.true;
    });

    it("Should return false for unauthorized account", async function () {
      expect(await factory.AccountcontractState(user2.address)).to.be.false;
    });

    it("Should return false for deactivated account", async function () {
      await factory.deactivateAccount(user1.address);
      expect(await factory.AccountcontractState(accountAddress)).to.be.false;
    });
  });

  describe("Integration with UserAccount", function () {
    let userAccount;

    beforeEach(async function () {
      await factory.connect(user1).createAccount("Test Institution", 365);
      const accountAddress = await factory.getUserAccount(user1.address);
      
      const UserAccount = await ethers.getContractFactory("UserAccount");
      userAccount = UserAccount.attach(accountAddress);
    });

    it("Should allow institution to update details", async function () {
      await userAccount.connect(user1).updateInstitution("Updated Institution", 180);
      
      const institution = await userAccount.getInstitution();
      expect(institution.name).to.equal("Updated Institution");
      expect(institution.courseDuration.toNumber()).to.equal(180);
    });

    it("Should allow institution to deactivate itself", async function () {
      await userAccount.connect(user1).deactivateInstitution();
      
      const institution = await userAccount.getInstitution();
      expect(institution.isActive).to.be.false;
    });

    it("Should allow institution to activate itself", async function () {
      await userAccount.connect(user1).deactivateInstitution();
      await userAccount.connect(user1).activateInstitution();
      
      const institution = await userAccount.getInstitution();
      expect(institution.isActive).to.be.true;
    });

    it("Should allow ownership transfer", async function () {
      await userAccount.connect(user1).transferOwnership(user2.address);
      
      expect(await userAccount.owner()).to.equal(user2.address);
      
      const institution = await userAccount.getInstitution();
      expect(institution.proprietor).to.equal(user2.address);
    });

    it("Should not allow transfer to zero address", async function () {
      await expect(
        userAccount.connect(user1).transferOwnership(ethers.constants.AddressZero)
      ).to.be.revertedWith("Invalid new owner");
    });

    it("Should not allow transfer to same owner", async function () {
      await expect(
        userAccount.connect(user1).transferOwnership(user1.address)
      ).to.be.revertedWith("Same owner");
    });
  });
}); 