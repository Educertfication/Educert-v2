// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./ICert.sol";
import "./CourseManager.sol";

contract UserAccount {
    struct Institution {
        string name;
        address proprietor;
        uint256 courseDuration;
        uint256 certMinted;
        bool isActive;
    }

    address public owner;
    address public NFTaddress;
    address public courseManagerAddress;
    Institution public institution;

    event CourseCreated(uint256 courseId, string name);
    event CertificateIssuedForCourse(uint256 courseId, address student, uint256 certificateId);
    event InstitutionUpdated(string name, uint256 courseDuration);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyActiveInstitution() {
        require(institution.isActive, "Institution not active");
        _;
    }

    constructor(
        string memory name_,
        address proprietor_,
        uint256 _duration,
        address _nftAddress,
        address _owner
    ) {
        require(proprietor_ != address(0), "Invalid proprietor address");
        require(_nftAddress != address(0), "Invalid NFT address");
        
        owner = _owner;
        NFTaddress = _nftAddress;
        
        institution = Institution({
            name: name_,
            proprietor: proprietor_,
            courseDuration: _duration,
            certMinted: 0,
            isActive: true
        });
    }

    function setCourseManager(address _courseManagerAddress) external onlyOwner {
        require(_courseManagerAddress != address(0), "Invalid address");
        courseManagerAddress = _courseManagerAddress;
    }

    function updateInstitution(string memory name_, uint256 _duration) external onlyOwner {
        require(bytes(name_).length > 0, "Name cannot be empty");
        require(_duration > 0, "Duration must be greater than 0");
        
        institution.name = name_;
        institution.courseDuration = _duration;
        
        emit InstitutionUpdated(name_, _duration);
    }

    function deactivateInstitution() external onlyOwner {
        institution.isActive = false;
    }

    function activateInstitution() external onlyOwner {
        institution.isActive = true;
    }

    // Course Management Functions
    function createCourse(
        string memory name,
        string memory description,
        string memory courseUri,
        uint256 price,
        uint256 duration,
        bool requiresAssessment
    ) external onlyOwner onlyActiveInstitution returns (uint256) {
        require(courseManagerAddress != address(0), "CourseManager not set");
        require(bytes(name).length > 0, "Name cannot be empty");
        require(duration > 0, "Duration must be greater than 0");
        
        uint256 courseId = CourseManager(courseManagerAddress).createCourse(
            name, description, courseUri, price, duration, requiresAssessment
        );
        
        emit CourseCreated(courseId, name);
        return courseId;
    }

    function updateCourse(
        uint256 courseId,
        string memory name,
        string memory description,
        string memory courseUri,
        uint256 price,
        uint256 duration
    ) external onlyOwner onlyActiveInstitution {
        require(courseManagerAddress != address(0), "CourseManager not set");
        require(bytes(name).length > 0, "Name cannot be empty");
        require(duration > 0, "Duration must be greater than 0");
        
        CourseManager(courseManagerAddress).updateCourse(
            courseId, name, description, courseUri, price, duration
        );
    }

    function deactivateCourse(uint256 courseId) external onlyOwner onlyActiveInstitution {
        require(courseManagerAddress != address(0), "CourseManager not set");
        CourseManager(courseManagerAddress).deactivateCourse(courseId);
    }

    function activateCourse(uint256 courseId) external onlyOwner onlyActiveInstitution {
        require(courseManagerAddress != address(0), "CourseManager not set");
        CourseManager(courseManagerAddress).activateCourse(courseId);
    }

    function issueCertificateForCourse(uint256 courseId, address student) external onlyOwner onlyActiveInstitution {
        require(courseManagerAddress != address(0), "CourseManager not set");
        require(student != address(0), "Invalid student address");
        
        // Call CourseManager to update enrollment state and verify course creator
        CourseManager(courseManagerAddress).issueCertificate(courseId, student);
        
        // Get the certificate ID for this course
        CourseManager.Course memory course = CourseManager(courseManagerAddress).getCourse(courseId);
        
        // Mint the certificate NFT
        ICert(NFTaddress).Mintcert(student, course.certificateId, 1);
        
        // Update institution stats
        institution.certMinted++;
        
        emit CertificateIssuedForCourse(courseId, student, course.certificateId);
    }

    function revokeCertificate(uint256 courseId, address student) external onlyOwner onlyActiveInstitution {
        require(courseManagerAddress != address(0), "CourseManager not set");
        require(student != address(0), "Invalid student address");
        
        // Get the certificate ID for this course
        CourseManager.Course memory course = CourseManager(courseManagerAddress).getCourse(courseId);
        
        // Burn the certificate NFT
        ICert(NFTaddress).Burn(student, course.certificateId, 1);
        
        // Update institution stats
        if (institution.certMinted > 0) {
            institution.certMinted--;
        }
    }

    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "Invalid new owner");
        require(_newOwner != owner, "Same owner");
        
        owner = _newOwner;
        institution.proprietor = _newOwner;
    }

    // Read Functions for Course Management
    function getCourse(uint256 courseId) external view returns (CourseManager.Course memory) {
        require(courseManagerAddress != address(0), "CourseManager not set");
        return CourseManager(courseManagerAddress).getCourse(courseId);
    }

    function getInstitutionCourses() external view returns (uint256[] memory) {
        require(courseManagerAddress != address(0), "CourseManager not set");
        return CourseManager(courseManagerAddress).getCreatorCourses(owner);
    }

    function getCourseStudents(uint256 courseId) external view returns (address[] memory) {
        require(courseManagerAddress != address(0), "CourseManager not set");
        return CourseManager(courseManagerAddress).getCourseStudents(courseId);
    }

    function getStudentEnrollment(address student, uint256 courseId) external view returns (CourseManager.Enrollment memory) {
        require(courseManagerAddress != address(0), "CourseManager not set");
        return CourseManager(courseManagerAddress).getEnrollment(student, courseId);
    }

    function isStudentEnrolled(address student, uint256 courseId) external view returns (bool) {
        require(courseManagerAddress != address(0), "CourseManager not set");
        return CourseManager(courseManagerAddress).isEnrolled(student, courseId);
    }

    function hasStudentCompleted(address student, uint256 courseId) external view returns (bool) {
        require(courseManagerAddress != address(0), "CourseManager not set");
        return CourseManager(courseManagerAddress).hasCompleted(student, courseId);
    }

    function hasStudentCertificate(address student, uint256 courseId) external view returns (bool) {
        require(courseManagerAddress != address(0), "CourseManager not set");
        return CourseManager(courseManagerAddress).hasCertificate(student, courseId);
    }

    function getActiveCourses() external view returns (CourseManager.Course[] memory) {
        require(courseManagerAddress != address(0), "CourseManager not set");
        return CourseManager(courseManagerAddress).getActiveCourses();
    }

    // Institution-specific functions
    function getInstitution() external view returns (Institution memory) {
        return institution;
    }

    function getInstitutionStats() external view returns (uint256 totalCourses, uint256 totalCertificates) {
        require(courseManagerAddress != address(0), "CourseManager not set");
        
        uint256[] memory courses = CourseManager(courseManagerAddress).getCreatorCourses(address(this));
        totalCourses = courses.length;
        totalCertificates = institution.certMinted;
        
        return (totalCourses, totalCertificates);
    }
}
