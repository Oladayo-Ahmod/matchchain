// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract JobRegistry {
    struct Job {
        uint256 id;
        address employer;
        string title;
        string description;
        uint256 budget;
        uint256 deadline;
        address assignedFreelancer;
        bool isActive;
        uint256 createdAt;
    }

    mapping(uint256 => Job) public jobs;
    uint256 public jobCount;
    
    event JobCreated(
        uint256 indexed jobId,
        address indexed employer,
        string title,
        uint256 budget
    );
    
    event FreelancerAssigned(
        uint256 indexed jobId,
        address indexed freelancer
    );

    function createJob(
        string memory _title,
        string memory _description,
        uint256 _budget,
        uint256 _deadline
    ) external returns (uint256) {
        jobCount++;
        jobs[jobCount] = Job({
            id: jobCount,
            employer: msg.sender,
            title: _title,
            description: _description,
            budget: _budget,
            deadline: _deadline,
            assignedFreelancer: address(0),
            isActive: true,
            createdAt: block.timestamp
        });
        
        emit JobCreated(jobCount, msg.sender, _title, _budget);
        return jobCount;
    }

    function assignFreelancer(uint256 _jobId, address _freelancer) external {
        require(jobs[_jobId].employer == msg.sender, "Only employer can assign");
        require(jobs[_jobId].isActive, "Job not active");
        require(jobs[_jobId].assignedFreelancer == address(0), "Freelancer already assigned");
        
        jobs[_jobId].assignedFreelancer = _freelancer;
        emit FreelancerAssigned(_jobId, _freelancer);
    }

    function getJob(uint256 _jobId) external view returns (Job memory) {
        return jobs[_jobId];
    }

    function getActiveJobs() external view returns (Job[] memory) {
        uint256 activeCount = 0;
        for (uint256 i = 1; i <= jobCount; i++) {
            if (jobs[i].isActive) {
                activeCount++;
            }
        }
        
        Job[] memory activeJobs = new Job[](activeCount);
        uint256 currentIndex = 0;
        for (uint256 i = 1; i <= jobCount; i++) {
            if (jobs[i].isActive) {
                activeJobs[currentIndex] = jobs[i];
                currentIndex++;
            }
        }
        return activeJobs;
    }
}