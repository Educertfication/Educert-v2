const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Course Management System", function () {
  let certificate, courseManager, factory, owner, institution, student1, student2;
  let courseId;
  let institutionAccountAddress;
  let userAccount;

  beforeEach(async function () {
    [owner, institution, student1, student2] = await ethers.getSigners();

    // Deploy Certificate contract
    const Certificate = await ethers.getContractFactory("Certificate");
    certificate = await Certificate.deploy("https://educert.com/api/metadata/", owner.address);
    await certificate.deployed();

    // Deploy CourseManager contract
    const CourseManager = await ethers.getContractFactory("CourseManager");
    courseManager = await CourseManager.deploy(
      ethers.constants.AddressZero, // Will be set after factory deployment
      certificate.address,
      owner.address
    );
    await courseManager.deployed();

    // Deploy AccountFactory contract
    const AccountFactory = await ethers.getContractFactory("AccountFactory");
    factory = await AccountFactory.deploy(certificate.address);
    await factory.deployed();

    // Set up contract integrations
    await courseManager.setFactoryAddress(factory.address);
    await factory.setCourseManager(courseManager.address);
    
    // Initialize factory address in Certificate contract
    await certificate.initializeFactory(factory.address);

    // Create institution account
    await factory.connect(institution).createAccount("Test University", 365);
    institutionAccountAddress = await factory.getUserAccount(institution.address);
    
    // Get UserAccount contract instance
    const UserAccount = await ethers.getContractFactory("UserAccount");
    userAccount = UserAccount.attach(institutionAccountAddress);
    
    // Set CourseManager in the UserAccount manually
    await userAccount.connect(institution).setCourseManager(courseManager.address);
    
    // Authorize the institution as a creator
    await courseManager.authorizeCreator(institutionAccountAddress, "Test University");
  });

  describe("Creator Management", function () {
    it("Should authorize a creator", async function () {
      const [newCreator] = await ethers.getSigners();
      await courseManager.authorizeCreator(newCreator.address, "New Institution");
      
      const creator = await courseManager.getCreator(newCreator.address);
      expect(creator.creatorAddress).to.equal(newCreator.address);
      expect(creator.name).to.equal("New Institution");
      expect(creator.isActive).to.be.true;
      expect(creator.totalCourses.toNumber()).to.equal(0);
    });

    it("Should deauthorize a creator", async function () {
      const [newCreator] = await ethers.getSigners();
      await courseManager.authorizeCreator(newCreator.address, "New Institution");
      await courseManager.deauthorizeCreator(newCreator.address);
      
      const creator = await courseManager.getCreator(newCreator.address);
      expect(creator.isActive).to.be.false;
    });

    it("Should update creator name", async function () {
      const [newCreator] = await ethers.getSigners();
      await courseManager.authorizeCreator(newCreator.address, "Old Name");
      await courseManager.updateCreatorName(newCreator.address, "New Name");
      
      const creator = await courseManager.getCreator(newCreator.address);
      expect(creator.name).to.equal("New Name");
    });

    it("Should not allow non-owner to authorize creators", async function () {
      const [newCreator, nonOwner] = await ethers.getSigners();
      await expect(
        courseManager.connect(nonOwner).authorizeCreator(newCreator.address, "New Institution")
      ).to.be.revertedWithCustomError(courseManager, "OwnableUnauthorizedAccount");
    });

    it("Should not allow empty creator name", async function () {
      const [newCreator] = await ethers.getSigners();
      await expect(
        courseManager.authorizeCreator(newCreator.address, "")
      ).to.be.revertedWith("Name cannot be empty");
    });
  });

  describe("Course Creation", function () {
    it("Should create a course successfully", async function () {
      const tx = await userAccount.connect(institution).createCourse(
        "Blockchain Fundamentals",
        "Learn the basics of blockchain technology",
        "https://ipfs.io/course/blockchain-fundamentals",
        ethers.utils.parseEther("0.01"), // price in ETH
        30, // duration in days
        true // requires assessment
      );

      const receipt = await tx.wait();
      const event = receipt.events.find(e => e.event === "CourseCreated");
      courseId = event.args.courseId;

      const course = await courseManager.getCourse(courseId);
      expect(course.name).to.equal("Blockchain Fundamentals");
      expect(course.creator).to.equal(institutionAccountAddress);
      expect(course.price).to.equal(ethers.utils.parseEther("0.01"));
      expect(course.duration.toNumber()).to.equal(30);
      expect(course.requiresAssessment).to.be.true;
      expect(course.isActive).to.be.true;
      expect(course.totalEnrollments.toNumber()).to.equal(0);
      expect(course.totalCompletions.toNumber()).to.equal(0);
    });

    it("Should not allow non-authorized creators to create courses", async function () {
      const [unauthorizedCreator] = await ethers.getSigners();
      
      await expect(
        courseManager.connect(unauthorizedCreator).createCourse(
          "Unauthorized Course",
          "This should fail",
          "https://ipfs.io/course/unauthorized",
          ethers.utils.parseEther("0.01"),
          30,
          false
        )
      ).to.be.revertedWith("Not authorized creator");
    });

    it("Should not allow empty course name", async function () {
      await expect(
        userAccount.connect(institution).createCourse(
          "",
          "Description",
          "https://ipfs.io/course/test",
          ethers.utils.parseEther("0.01"),
          30,
          false
        )
      ).to.be.revertedWith("Name cannot be empty");
    });

    it("Should not allow zero duration", async function () {
      await expect(
        userAccount.connect(institution).createCourse(
          "Test Course",
          "Description",
          "https://ipfs.io/course/test",
          ethers.utils.parseEther("0.01"),
          0,
          false
        )
      ).to.be.revertedWith("Duration must be greater than 0");
    });

    it("Should not allow inactive institution to create courses", async function () {
      await userAccount.connect(institution).deactivateInstitution();
      
      await expect(
        userAccount.connect(institution).createCourse(
          "Test Course",
          "Description",
          "https://ipfs.io/course/test",
          ethers.utils.parseEther("0.01"),
          30,
          false
        )
      ).to.be.revertedWith("Institution not active");
    });
  });

  describe("Course Management", function () {
    beforeEach(async function () {
      const tx = await userAccount.connect(institution).createCourse(
        "Test Course",
        "Test Description",
        "https://ipfs.io/course/test",
        ethers.utils.parseEther("0.01"),
        30,
        false
      );
      const receipt = await tx.wait();
      const event = receipt.events.find(e => e.event === "CourseCreated");
      courseId = event.args.courseId;
    });

    it("Should update course details", async function () {
      await userAccount.connect(institution).updateCourse(
        courseId,
        "Updated Course Name",
        "Updated Description",
        "https://ipfs.io/course/updated",
        ethers.utils.parseEther("0.02"),
        60
      );

      const course = await courseManager.getCourse(courseId);
      expect(course.name).to.equal("Updated Course Name");
      expect(course.description).to.equal("Updated Description");
      expect(course.price).to.equal(ethers.utils.parseEther("0.02"));
      expect(course.duration.toNumber()).to.equal(60);
    });

    it("Should deactivate and activate course", async function () {
      await userAccount.connect(institution).deactivateCourse(courseId);
      let course = await courseManager.getCourse(courseId);
      expect(course.isActive).to.be.false;

      await userAccount.connect(institution).activateCourse(courseId);
      course = await courseManager.getCourse(courseId);
      expect(course.isActive).to.be.true;
    });

    it("Should not allow non-creator to update course", async function () {
      const [nonCreator] = await ethers.getSigners();
      
      await expect(
        courseManager.connect(nonCreator).updateCourse(
          courseId,
          "Unauthorized Update",
          "Description",
          "https://ipfs.io/course/unauthorized",
          ethers.utils.parseEther("0.01"),
          30
        )
      ).to.be.revertedWith("Not course creator");
    });

    it("Should not allow updates to non-existent course", async function () {
      await expect(
        userAccount.connect(institution).updateCourse(
          999,
          "Non-existent Course",
          "Description",
          "https://ipfs.io/course/non-existent",
          ethers.utils.parseEther("0.01"),
          30
        )
      ).to.be.revertedWith("Course does not exist");
    });
  });

  describe("Student Enrollment", function () {
    beforeEach(async function () {
      const tx = await userAccount.connect(institution).createCourse(
        "Test Course",
        "Test Description",
        "https://ipfs.io/course/test",
        ethers.utils.parseEther("0.01"),
        30,
        false
      );
      const receipt = await tx.wait();
      const event = receipt.events.find(e => e.event === "CourseCreated");
      courseId = event.args.courseId;
    });

    it("Should enroll student in course", async function () {
      await courseManager.connect(student1).enrollInCourse(courseId);
      
      const enrollment = await courseManager.getEnrollment(student1.address, courseId);
      expect(enrollment.student).to.equal(student1.address);
      expect(enrollment.courseId.toString()).to.equal(courseId.toString());
      expect(enrollment.isCompleted).to.be.false;
      expect(enrollment.certificateIssued).to.be.false;
      
      const course = await courseManager.getCourse(courseId);
      expect(course.totalEnrollments.toNumber()).to.equal(1);
      
      expect(await courseManager.isEnrolled(student1.address, courseId)).to.be.true;
    });

    it("Should not allow double enrollment", async function () {
      await courseManager.connect(student1).enrollInCourse(courseId);
      
      await expect(
        courseManager.connect(student1).enrollInCourse(courseId)
      ).to.be.revertedWith("Already enrolled");
    });

    it("Should not allow enrollment in non-existent course", async function () {
      await expect(
        courseManager.connect(student1).enrollInCourse(999)
      ).to.be.revertedWith("Course does not exist");
    });

    it("Should not allow enrollment in inactive course", async function () {
      await userAccount.connect(institution).deactivateCourse(courseId);
      
      await expect(
        courseManager.connect(student1).enrollInCourse(courseId)
      ).to.be.revertedWith("Course is not active");
    });

    it("Should track student courses", async function () {
      await courseManager.connect(student1).enrollInCourse(courseId);
      
      const studentCourses = await courseManager.getStudentCourses(student1.address);
      expect(studentCourses.length).to.equal(1);
      expect(studentCourses[0].toString()).to.equal(courseId.toString());
    });

    it("Should track course students", async function () {
      await courseManager.connect(student1).enrollInCourse(courseId);
      await courseManager.connect(student2).enrollInCourse(courseId);
      
      const courseStudents = await courseManager.getCourseStudents(courseId);
      expect(courseStudents.length).to.equal(2);
      expect(courseStudents).to.include(student1.address);
      expect(courseStudents).to.include(student2.address);
    });
  });

  describe("Course Completion", function () {
    beforeEach(async function () {
      const tx = await userAccount.connect(institution).createCourse(
        "Test Course",
        "Test Description",
        "https://ipfs.io/course/test",
        ethers.utils.parseEther("0.01"),
        30,
        false
      );
      const receipt = await tx.wait();
      const event = receipt.events.find(e => e.event === "CourseCreated");
      courseId = event.args.courseId;
      
      await courseManager.connect(student1).enrollInCourse(courseId);
    });

    it("Should complete course successfully", async function () {
      await courseManager.connect(student1).completeCourse(courseId);
      
      const enrollment = await courseManager.getEnrollment(student1.address, courseId);
      expect(enrollment.isCompleted).to.be.true;
      expect(enrollment.completedAt.toNumber()).to.be.gt(0);
      
      const course = await courseManager.getCourse(courseId);
      expect(course.totalCompletions.toNumber()).to.equal(1);
      
      expect(await courseManager.hasCompleted(student1.address, courseId)).to.be.true;
    });

    it("Should not allow completion without enrollment", async function () {
      await expect(
        courseManager.connect(student2).completeCourse(courseId)
      ).to.be.revertedWith("Not enrolled");
    });

    it("Should not allow double completion", async function () {
      await courseManager.connect(student1).completeCourse(courseId);
      
      await expect(
        courseManager.connect(student1).completeCourse(courseId)
      ).to.be.revertedWith("Already completed");
    });
  });

  describe("Certificate Issuance", function () {
    beforeEach(async function () {
      const tx = await userAccount.connect(institution).createCourse(
        "Test Course",
        "Test Description",
        "https://ipfs.io/course/test",
        ethers.utils.parseEther("0.01"),
        30,
        false
      );
      const receipt = await tx.wait();
      const event = receipt.events.find(e => e.event === "CourseCreated");
      courseId = event.args.courseId;
      
      await courseManager.connect(student1).enrollInCourse(courseId);
      await courseManager.connect(student1).completeCourse(courseId);
    });

    it("Should issue certificate successfully", async function () {
      const course = await courseManager.getCourse(courseId);
      const certificateId = course.certificateId;
      
      // First, ensure the certificate contract is properly set up
      await userAccount.connect(institution).issueCertificateForCourse(courseId, student1.address);
      
      const enrollment = await courseManager.getEnrollment(student1.address, courseId);
      expect(enrollment.certificateIssued).to.be.true;
      
      expect(await courseManager.hasCertificate(student1.address, courseId)).to.be.true;
      expect((await certificate.balanceOf(student1.address, certificateId)).toNumber()).to.equal(1);
      
      const institutionStats = await userAccount.getInstitutionStats();
      expect(institutionStats.totalCertificates.toNumber()).to.equal(1);
    });

    it("Should not allow certificate issuance for incomplete course", async function () {
      await courseManager.connect(student2).enrollInCourse(courseId);
      
      await expect(
        userAccount.connect(institution).issueCertificateForCourse(courseId, student2.address)
      ).to.be.revertedWith("Course not completed");
    });

    it("Should not allow double certificate issuance", async function () {
      // First issuance should work
      await userAccount.connect(institution).issueCertificateForCourse(courseId, student1.address);
      
      // Second issuance should fail
      await expect(
        userAccount.connect(institution).issueCertificateForCourse(courseId, student1.address)
      ).to.be.revertedWith("Certificate already issued");
    });

    it("Should not allow non-creator to issue certificate", async function () {
      const [nonCreator] = await ethers.getSigners();
      
      await expect(
        courseManager.connect(nonCreator).issueCertificate(courseId, student1.address)
      ).to.be.revertedWith("Not course creator");
    });

    it("Should revoke certificate successfully", async function () {
      const course = await courseManager.getCourse(courseId);
      const certificateId = course.certificateId;
      
      // First issue the certificate
      await userAccount.connect(institution).issueCertificateForCourse(courseId, student1.address);
      
      // Then revoke it
      await userAccount.connect(institution).revokeCertificate(courseId, student1.address);
      
      expect((await certificate.balanceOf(student1.address, certificateId)).toNumber()).to.equal(0);
      
      const institutionStats = await userAccount.getInstitutionStats();
      expect(institutionStats.totalCertificates.toNumber()).to.equal(0);
    });
  });

  describe("Account Management", function () {
    it("Should create account successfully", async function () {
      const [newUser] = await ethers.getSigners();
      
      await factory.connect(newUser).createAccount("New Institution", 180);
      
      const accountAddress = await factory.getUserAccount(newUser.address);
      expect(accountAddress).to.not.equal(ethers.constants.AddressZero);
      
      expect(await factory.hasUserAccount(newUser.address)).to.be.true;
      expect(await factory.isAccountAuthorized(accountAddress)).to.be.true;
    });

    it("Should not allow double account creation", async function () {
      await expect(
        factory.connect(institution).createAccount("Another Account", 180)
      ).to.be.revertedWith("Account already exists");
    });

    it("Should not allow empty account name", async function () {
      const [newUser] = await ethers.getSigners();
      
      await expect(
        factory.connect(newUser).createAccount("", 180)
      ).to.be.revertedWith("Name cannot be empty");
    });

    it("Should not allow zero duration", async function () {
      const [newUser] = await ethers.getSigners();
      
      await expect(
        factory.connect(newUser).createAccount("Test Institution", 0)
      ).to.be.revertedWith("Duration must be greater than 0");
    });

    it("Should deactivate and activate account", async function () {
      await factory.deactivateAccount(institution.address);
      
      let account = await factory.getAccount(institution.address);
      expect(account.isActive).to.be.false;
      
      await factory.activateAccount(institution.address);
      account = await factory.getAccount(institution.address);
      expect(account.isActive).to.be.true;
    });

    it("Should pause and unpause factory", async function () {
      await factory.pause();
      expect(await factory.paused()).to.be.true;
      
      const [newUser] = await ethers.getSigners();
      await expect(
        factory.connect(newUser).createAccount("Test Institution", 180)
      ).to.be.revertedWith("Factory is paused");
      
      await factory.unpause();
      expect(await factory.paused()).to.be.false;
    });
  });

  describe("Read Functions", function () {
    beforeEach(async function () {
      const tx = await userAccount.connect(institution).createCourse(
        "Test Course",
        "Test Description",
        "https://ipfs.io/course/test",
        ethers.utils.parseEther("0.01"),
        30,
        false
      );
      const receipt = await tx.wait();
      const event = receipt.events.find(e => e.event === "CourseCreated");
      courseId = event.args.courseId;
    });

    it("Should get all courses", async function () {
      const allCourses = await courseManager.getAllCourses();
      expect(allCourses.length).to.equal(1);
      expect(allCourses[0].name).to.equal("Test Course");
    });

    it("Should get active courses", async function () {
      const activeCourses = await courseManager.getActiveCourses();
      expect(activeCourses.length).to.equal(1);
      expect(activeCourses[0].name).to.equal("Test Course");
    });

    it("Should get courses by creator", async function () {
      const creatorCourses = await courseManager.getCoursesByCreator(institutionAccountAddress);
      expect(creatorCourses.length).to.equal(1);
      expect(creatorCourses[0].name).to.equal("Test Course");
    });

    it("Should get active courses by creator", async function () {
      const activeCreatorCourses = await courseManager.getActiveCoursesByCreator(institutionAccountAddress);
      expect(activeCreatorCourses.length).to.equal(1);
      expect(activeCreatorCourses[0].name).to.equal("Test Course");
    });

    it("Should get institution stats", async function () {
      const stats = await userAccount.getInstitutionStats();
      expect(stats.totalCourses.toNumber()).to.equal(1); // 1 course from beforeEach
      expect(stats.totalCertificates.toNumber()).to.equal(0);
    });

    it("Should get institution details", async function () {
      const institutionDetails = await userAccount.getInstitution();
      expect(institutionDetails.name).to.equal("Test University");
      expect(institutionDetails.proprietor).to.equal(institution.address);
      expect(institutionDetails.courseDuration.toNumber()).to.equal(365);
      expect(institutionDetails.isActive).to.be.true;
    });
  });
}); 