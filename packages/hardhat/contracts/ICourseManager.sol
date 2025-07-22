// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

interface ICourseManager {
    struct Course {
        uint256 courseId;
        address creator;
        string name;
        string description;
        string courseUri;
        uint256 price;
        uint256 duration;
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
    }

    // Creator Management
    function authorizeCreator(address creator, string memory name) external;
    function deauthorizeCreator(address creator) external;

    // Course Management
    function createCourse(
        string memory name,
        string memory description,
        string memory courseUri,
        uint256 price,
        uint256 duration,
        bool requiresAssessment
    ) external returns (uint256);

    function updateCourse(
        uint256 courseId,
        string memory name,
        string memory description,
        string memory courseUri,
        uint256 price,
        uint256 duration
    ) external;

    function deactivateCourse(uint256 courseId) external;
    function activateCourse(uint256 courseId) external;

    // Enrollment Functions
    function enrollInCourse(uint256 courseId) external;
    function completeCourse(uint256 courseId) external;
    function issueCertificate(uint256 courseId, address student) external;

    // Read Functions
    function getCourse(uint256 courseId) external view returns (Course memory);
    function getCreator(address creator) external view returns (Creator memory);
    function getEnrollment(address student, uint256 courseId) external view returns (Enrollment memory);
    function getStudentCourses(address student) external view returns (uint256[] memory);
    function getCreatorCourses(address creator) external view returns (uint256[] memory);
    function getCourseStudents(uint256 courseId) external view returns (address[] memory);
    function isEnrolled(address student, uint256 courseId) external view returns (bool);
    function hasCompleted(address student, uint256 courseId) external view returns (bool);
    function hasCertificate(address student, uint256 courseId) external view returns (bool);
    function getTotalCourses() external view returns (uint256);
    function getTotalCertificates() external view returns (uint256);
    function getAllCourses() external view returns (Course[] memory);
    function getActiveCourses() external view returns (Course[] memory);

    // Admin Functions
    function setFactoryAddress(address _factoryAddress) external;
    function setCertificateContract(address _certificateContract) external;
} 