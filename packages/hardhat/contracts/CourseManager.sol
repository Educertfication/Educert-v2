// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "./Ifactory.sol";
import "./ICert.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CourseManager is Ownable {
    struct Course {
        uint256 courseId;
        address creator;
        string name;
        string description;
        string courseUri;
        uint256 price;
        uint256 duration; // in days
        bool isActive;
        bool requiresAssessment;
        uint256 certificateId;
        uint256 totalEnrollments;
        uint256 totalCompletions;
        uint256 createdAt;
    }

    struct Enrollment {
        address student;
        uint256 courseId;
        uint256 enrolledAt;
        bool isCompleted;
        bool certificateIssued;
        uint256 completedAt;
    }

    struct Creator {
        address creatorAddress;
        string name;
        uint256 totalCourses;
        uint256 totalRevenue;
        bool isActive;
        uint256 createdAt;
    }

    // State variables
    uint256 private _courseIds;
    uint256 private _certificateIds;
    
    address public factoryAddress;
    address public certificateContract;
    
    // Mappings
    mapping(uint256 => Course) public courses;
    mapping(address => mapping(uint256 => Enrollment)) public enrollments; // student => courseId => enrollment
    mapping(address => uint256[]) public studentCourses; // student => courseIds[]
    mapping(address => Creator) public creators;
    mapping(address => uint256[]) public creatorCourses; // creator => courseIds[]
    mapping(uint256 => address[]) public courseStudents; // courseId => students[]
    mapping(address => bool) public authorizedCreators; // Only authorized creators can create courses

    // Events
    event CourseCreated(uint256 indexed courseId, address indexed creator, string name, uint256 price);
    event CourseUpdated(uint256 indexed courseId, string name, uint256 price);
    event CourseDeactivated(uint256 indexed courseId);
    event CourseActivated(uint256 indexed courseId);
    event StudentEnrolled(uint256 indexed courseId, address indexed student);
    event CourseCompleted(uint256 indexed courseId, address indexed student);
    event CertificateIssued(uint256 indexed courseId, address indexed student, uint256 certificateId);
    event CreatorAuthorized(address indexed creator, string name);
    event CreatorDeauthorized(address indexed creator);

    modifier onlyAuthorizedCreator() {
        require(authorizedCreators[msg.sender], "Not authorized creator");
        _;
    }

    modifier onlyCourseCreator(uint256 courseId) {
        require(courses[courseId].creator == msg.sender, "Not course creator");
        _;
    }

    modifier courseExists(uint256 courseId) {
        require(courses[courseId].courseId != 0, "Course does not exist");
        _;
    }

    modifier courseActive(uint256 courseId) {
        require(courses[courseId].isActive, "Course is not active");
        _;
    }

    modifier onlyAuthorizedAccount() {
        require(factoryAddress != address(0), "Factory not set");
        bool result = Ifactory(factoryAddress).AccountcontractState(msg.sender);
        require(result == true, "Not authorized account");
        _;
    }

    constructor(address _factoryAddress, address _certificateContract, address initialOwner) Ownable(initialOwner) {
        require(_certificateContract != address(0), "Invalid certificate contract");
        factoryAddress = _factoryAddress;
        certificateContract = _certificateContract;
        _courseIds = 0;
        _certificateIds = 0;
    }

    // Creator Management Functions
    function authorizeCreator(address creator, string memory name) external onlyOwner {
        require(creator != address(0), "Invalid creator address");
        require(!authorizedCreators[creator], "Creator already authorized");
        require(bytes(name).length > 0, "Name cannot be empty");
        
        authorizedCreators[creator] = true;
        creators[creator] = Creator({
            creatorAddress: creator,
            name: name,
            totalCourses: 0,
            totalRevenue: 0,
            isActive: true,
            createdAt: block.timestamp
        });
        
        emit CreatorAuthorized(creator, name);
    }

    function deauthorizeCreator(address creator) external onlyOwner {
        require(authorizedCreators[creator], "Creator not authorized");
        authorizedCreators[creator] = false;
        creators[creator].isActive = false;
        
        emit CreatorDeauthorized(creator);
    }

    function updateCreatorName(address creator, string memory name) external onlyOwner {
        require(authorizedCreators[creator], "Creator not authorized");
        require(bytes(name).length > 0, "Name cannot be empty");
        
        creators[creator].name = name;
    }

    // Course Management Functions
    function createCourse(
        string memory name,
        string memory description,
        string memory courseUri,
        uint256 price,
        uint256 duration,
        bool requiresAssessment
    ) external onlyAuthorizedCreator returns (uint256) {
        require(bytes(name).length > 0, "Name cannot be empty");
        require(duration > 0, "Duration must be greater than 0");
        
        _courseIds++;
        _certificateIds++;
        
        uint256 courseId = _courseIds;
        uint256 certificateId = _certificateIds;
        
        courses[courseId] = Course({
            courseId: courseId,
            creator: msg.sender,
            name: name,
            description: description,
            courseUri: courseUri,
            price: price,
            duration: duration,
            isActive: true,
            requiresAssessment: requiresAssessment,
            certificateId: certificateId,
            totalEnrollments: 0,
            totalCompletions: 0,
            createdAt: block.timestamp
        });
        
        creatorCourses[msg.sender].push(courseId);
        creators[msg.sender].totalCourses++;
        
        emit CourseCreated(courseId, msg.sender, name, price);
        return courseId;
    }

    function updateCourse(
        uint256 courseId,
        string memory name,
        string memory description,
        string memory courseUri,
        uint256 price,
        uint256 duration
    ) external courseExists(courseId) onlyCourseCreator(courseId) courseActive(courseId) {
        require(bytes(name).length > 0, "Name cannot be empty");
        require(duration > 0, "Duration must be greater than 0");
        
        Course storage course = courses[courseId];
        course.name = name;
        course.description = description;
        course.courseUri = courseUri;
        course.price = price;
        course.duration = duration;
        
        emit CourseUpdated(courseId, name, price);
    }

    function deactivateCourse(uint256 courseId) external courseExists(courseId) onlyCourseCreator(courseId) {
        courses[courseId].isActive = false;
        emit CourseDeactivated(courseId);
    }

    function activateCourse(uint256 courseId) external courseExists(courseId) onlyCourseCreator(courseId) {
        courses[courseId].isActive = true;
        emit CourseActivated(courseId);
    }

    // Enrollment Functions
    function enrollInCourse(uint256 courseId) external courseExists(courseId) courseActive(courseId) {
        require(enrollments[msg.sender][courseId].enrolledAt == 0, "Already enrolled");
        
        enrollments[msg.sender][courseId] = Enrollment({
            student: msg.sender,
            courseId: courseId,
            enrolledAt: block.timestamp,
            isCompleted: false,
            certificateIssued: false,
            completedAt: 0
        });
        
        studentCourses[msg.sender].push(courseId);
        courseStudents[courseId].push(msg.sender);
        courses[courseId].totalEnrollments++;
        
        emit StudentEnrolled(courseId, msg.sender);
    }

    function completeCourse(uint256 courseId) external courseExists(courseId) {
        require(enrollments[msg.sender][courseId].enrolledAt != 0, "Not enrolled");
        require(!enrollments[msg.sender][courseId].isCompleted, "Already completed");
        
        enrollments[msg.sender][courseId].isCompleted = true;
        enrollments[msg.sender][courseId].completedAt = block.timestamp;
        courses[courseId].totalCompletions++;
        
        emit CourseCompleted(courseId, msg.sender);
    }

    function issueCertificate(uint256 courseId, address student) external courseExists(courseId) onlyCourseCreator(courseId) onlyAuthorizedAccount {
        require(enrollments[student][courseId].isCompleted, "Course not completed");
        require(!enrollments[student][courseId].certificateIssued, "Certificate already issued");
        require(student != address(0), "Invalid student address");
        
        uint256 certificateId = courses[courseId].certificateId;
        
        // Update enrollment state
        enrollments[student][courseId].certificateIssued = true;
        
        emit CertificateIssued(courseId, student, certificateId);
    }

    // Read Functions
    function getCourse(uint256 courseId) external view courseExists(courseId) returns (Course memory) {
        return courses[courseId];
    }

    function getCreator(address creator) external view returns (Creator memory) {
        return creators[creator];
    }

    function getEnrollment(address student, uint256 courseId) external view returns (Enrollment memory) {
        return enrollments[student][courseId];
    }

    function getStudentCourses(address student) external view returns (uint256[] memory) {
        return studentCourses[student];
    }

    function getCreatorCourses(address creator) external view returns (uint256[] memory) {
        return creatorCourses[creator];
    }

    function getCourseStudents(uint256 courseId) external view courseExists(courseId) returns (address[] memory) {
        return courseStudents[courseId];
    }

    function isEnrolled(address student, uint256 courseId) external view returns (bool) {
        return enrollments[student][courseId].enrolledAt != 0;
    }

    function hasCompleted(address student, uint256 courseId) external view returns (bool) {
        return enrollments[student][courseId].isCompleted;
    }

    function hasCertificate(address student, uint256 courseId) external view returns (bool) {
        return enrollments[student][courseId].certificateIssued;
    }

    function getTotalCourses() external view returns (uint256) {
        return _courseIds;
    }

    function getTotalCertificates() external view returns (uint256) {
        return _certificateIds;
    }

    function getAllCourses() external view returns (Course[] memory) {
        uint256 total = _courseIds;
        Course[] memory allCourses = new Course[](total);
        
        for (uint256 i = 1; i <= total; i++) {
            allCourses[i - 1] = courses[i];
        }
        
        return allCourses;
    }

    function getActiveCourses() external view returns (Course[] memory) {
        uint256 total = _courseIds;
        uint256 activeCount = 0;
        
        // Count active courses
        for (uint256 i = 1; i <= total; i++) {
            if (courses[i].isActive) {
                activeCount++;
            }
        }
        
        Course[] memory activeCourses = new Course[](activeCount);
        uint256 index = 0;
        
        for (uint256 i = 1; i <= total; i++) {
            if (courses[i].isActive) {
                activeCourses[index] = courses[i];
                index++;
            }
        }
        
        return activeCourses;
    }

    function getCoursesByCreator(address creator) external view returns (Course[] memory) {
        uint256[] memory courseIds = creatorCourses[creator];
        Course[] memory creatorCoursesList = new Course[](courseIds.length);
        
        for (uint256 i = 0; i < courseIds.length; i++) {
            creatorCoursesList[i] = courses[courseIds[i]];
        }
        
        return creatorCoursesList;
    }

    function getActiveCoursesByCreator(address creator) external view returns (Course[] memory) {
        uint256[] memory courseIds = creatorCourses[creator];
        uint256 activeCount = 0;
        
        // Count active courses
        for (uint256 i = 0; i < courseIds.length; i++) {
            if (courses[courseIds[i]].isActive) {
                activeCount++;
            }
        }
        
        Course[] memory activeCourses = new Course[](activeCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < courseIds.length; i++) {
            if (courses[courseIds[i]].isActive) {
                activeCourses[index] = courses[courseIds[i]];
                index++;
            }
        }
        
        return activeCourses;
    }

    // Admin Functions
    function setFactoryAddress(address _factoryAddress) external onlyOwner {
        factoryAddress = _factoryAddress;
    }

    function setCertificateContract(address _certificateContract) external onlyOwner {
        require(_certificateContract != address(0), "Invalid certificate contract");
        certificateContract = _certificateContract;
    }
} 