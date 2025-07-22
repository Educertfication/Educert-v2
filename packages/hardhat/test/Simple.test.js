const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Simple Contract Tests", function () {
  let certificate, factory, courseManager, owner, user1, user2;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

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
    await courseManager.setFactoryAddress(factory.address);
    await factory.setCourseManager(courseManager.address);
  });

  describe("Basic Deployment", function () {
    it("Should deploy all contracts successfully", async function () {
      expect(certificate.address).to.not.equal(ethers.constants.AddressZero);
      expect(factory.address).to.not.equal(ethers.constants.AddressZero);
      expect(courseManager.address).to.not.equal(ethers.constants.AddressZero);
    });

    it("Should set correct owners", async function () {
      expect(await factory.owner()).to.equal(owner.address);
      expect(await courseManager.owner()).to.equal(owner.address);
    });

    it("Should set correct addresses", async function () {
      expect(await factory.nftAddress()).to.equal(certificate.address);
      expect(await factory.courseManagerAddress()).to.equal(courseManager.address);
      expect(await courseManager.factoryAddress()).to.equal(factory.address);
      expect(await courseManager.certificateContract()).to.equal(certificate.address);
    });
  });

  describe("Account Creation", function () {
    it("Should create account successfully", async function () {
      const tx = await factory.connect(user1).createAccount("Test Institution", 365);
      const receipt = await tx.wait();
      
      const event = receipt.events.find(e => e.event === "AccountCreated");
      expect(event).to.not.be.undefined;
      expect(event.args.name).to.equal("Test Institution");
      expect(event.args.userAddress).to.equal(user1.address);

      expect(await factory.hasUserAccount(user1.address)).to.be.true;
      expect((await factory.getTotalAccounts()).toNumber()).to.equal(1);
    });

    it("Should create UserAccount with correct parameters", async function () {
      await factory.connect(user1).createAccount("Test Institution", 365);
      
      const accountAddress = await factory.getUserAccount(user1.address);
      const UserAccount = await ethers.getContractFactory("UserAccount");
      const userAccount = UserAccount.attach(accountAddress);
      
      const institution = await userAccount.getInstitution();
      expect(institution.name).to.equal("Test Institution");
      expect(institution.proprietor).to.equal(user1.address);
      expect(institution.courseDuration.toNumber()).to.equal(365);
      expect(institution.isActive).to.be.true;
    });

    it("Should not allow double account creation", async function () {
      await factory.connect(user1).createAccount("Test Institution", 365);
      
      try {
        await factory.connect(user1).createAccount("Another Institution", 180);
        expect.fail("Should have reverted");
      } catch (error) {
        expect(error.message).to.include("Account already exists");
      }
    });
  });

  describe("Course Management", function () {
    let userAccount, institutionAccountAddress;

    beforeEach(async function () {
      await factory.connect(user1).createAccount("Test University", 365);
      institutionAccountAddress = await factory.getUserAccount(user1.address);
      
      const UserAccount = await ethers.getContractFactory("UserAccount");
      userAccount = UserAccount.attach(institutionAccountAddress);
      
      await userAccount.connect(user1).setCourseManager(courseManager.address);
      await courseManager.authorizeCreator(institutionAccountAddress, "Test University");
    });

    it("Should create course successfully", async function () {
      const tx = await userAccount.connect(user1).createCourse(
        "Blockchain Fundamentals",
        "Learn the basics of blockchain technology",
        "https://ipfs.io/course/blockchain-fundamentals",
        ethers.utils.parseEther("0.01"),
        30,
        true
      );

      const receipt = await tx.wait();
      const event = receipt.events.find(e => e.event === "CourseCreated");
      expect(event).to.not.be.undefined;
      
      const courseId = event.args.courseId;
      const course = await courseManager.getCourse(courseId);
      expect(course.name).to.equal("Blockchain Fundamentals");
      expect(course.creator).to.equal(institutionAccountAddress);
    });

    it("Should enroll student in course", async function () {
      const tx = await userAccount.connect(user1).createCourse(
        "Test Course",
        "Test Description",
        "https://ipfs.io/course/test",
        ethers.utils.parseEther("0.01"),
        30,
        false
      );
      const receipt = await tx.wait();
      const event = receipt.events.find(e => e.event === "CourseCreated");
      const courseId = event.args.courseId;

      await courseManager.connect(user2).enrollInCourse(courseId);
      
      const enrollment = await courseManager.getEnrollment(user2.address, courseId);
      expect(enrollment.student).to.equal(user2.address);
      expect(enrollment.courseId.toString()).to.equal(courseId.toString());
      expect(enrollment.isCompleted).to.be.false;
    });

    it("Should complete course", async function () {
      const tx = await userAccount.connect(user1).createCourse(
        "Test Course",
        "Test Description",
        "https://ipfs.io/course/test",
        ethers.utils.parseEther("0.01"),
        30,
        false
      );
      const receipt = await tx.wait();
      const event = receipt.events.find(e => e.event === "CourseCreated");
      const courseId = event.args.courseId;

      await courseManager.connect(user2).enrollInCourse(courseId);
      await courseManager.connect(user2).completeCourse(courseId);
      
      const enrollment = await courseManager.getEnrollment(user2.address, courseId);
      expect(enrollment.isCompleted).to.be.true;
    });
  });

  describe("Factory Management", function () {
    it("Should pause and unpause factory", async function () {
      await factory.pause();
      expect(await factory.paused()).to.be.true;
      
      await factory.unpause();
      expect(await factory.paused()).to.be.false;
    });

    it("Should not allow non-owner to pause", async function () {
      try {
        await factory.connect(user1).pause();
        expect.fail("Should have reverted");
      } catch (error) {
        expect(error.message).to.include("Not authorized");
      }
    });
  });

  describe("Read Functions", function () {
    beforeEach(async function () {
      await factory.connect(user1).createAccount("Institution 1", 365);
      await factory.connect(user2).createAccount("Institution 2", 180);
    });

    it("Should get all accounts", async function () {
      const accounts = await factory.getAllAccounts();
      expect(accounts.length).to.equal(2);
      expect(accounts[0].name).to.equal("Institution 1");
      expect(accounts[1].name).to.equal("Institution 2");
    });

    it("Should get total accounts count", async function () {
      expect((await factory.getTotalAccounts()).toNumber()).to.equal(2);
    });

    it("Should check account authorization", async function () {
      const account1Address = await factory.getUserAccount(user1.address);
      const account2Address = await factory.getUserAccount(user2.address);
      
      expect(await factory.isAccountAuthorized(account1Address)).to.be.true;
      expect(await factory.isAccountAuthorized(account2Address)).to.be.true;
      expect(await factory.isAccountAuthorized(user1.address)).to.be.false;
    });
  });
}); 