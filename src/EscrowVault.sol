// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract EscrowVault {
    enum EscrowStatus { Created, Funded, Released, Refunded, Cancelled }

    struct Escrow {
        uint256 id;
        address employer;
        address freelancer;
        uint256 jobId;
        uint256 amount;
        EscrowStatus status;
        uint256 createdAt;
        uint256 releasedAt;
    }

    mapping(uint256 => Escrow) public escrows;
    mapping(uint256 => uint256) public jobToEscrow;
    uint256 public escrowCount;

    event EscrowCreated(uint256 indexed escrowId, uint256 indexed jobId, address employer);
    event EscrowFunded(uint256 indexed escrowId, uint256 amount);
    event EscrowReleased(uint256 indexed escrowId, address freelancer, uint256 amount);
    event EscrowRefunded(uint256 indexed escrowId, address employer, uint256 amount);
    event EscrowCancelled(uint256 indexed escrowId);

    function createEscrow(uint256 _jobId, address _freelancer) external returns (uint256) {
        require(jobToEscrow[_jobId] == 0, "Escrow already exists for job");

        escrowCount++;
        escrows[escrowCount] = Escrow({
            id: escrowCount,
            employer: msg.sender,
            freelancer: _freelancer,
            jobId: _jobId,
            amount: 0,
            status: EscrowStatus.Created,
            createdAt: block.timestamp,
            releasedAt: 0
        });

        jobToEscrow[_jobId] = escrowCount;

        emit EscrowCreated(escrowCount, _jobId, msg.sender);
        
        return escrowCount;
    }

    function fundEscrow(uint256 _escrowId) external payable {
        Escrow storage escrow = escrows[_escrowId];
        require(msg.sender == escrow.employer, "Only employer can fund");
        require(escrow.status == EscrowStatus.Created, "Escrow not in Created state");
        require(msg.value > 0, "Must send ETH to fund escrow");

        escrow.amount = msg.value;
        escrow.status = EscrowStatus.Funded;

        emit EscrowFunded(_escrowId, msg.value);
    }

    function releaseMilestone(uint256 _escrowId) external {
        Escrow storage escrow = escrows[_escrowId];
        require(msg.sender == escrow.employer, "Only employer can release");
        require(escrow.status == EscrowStatus.Funded, "Escrow not funded");
        require(escrow.amount > 0, "No funds to release");

        escrow.status = EscrowStatus.Released;
        escrow.releasedAt = block.timestamp;

        (bool success, ) = escrow.freelancer.call{value: escrow.amount}("");
        require(success, "Transfer failed");

        emit EscrowReleased(_escrowId, escrow.freelancer, escrow.amount);
    }

    function refundEscrow(uint256 _escrowId) external {
        Escrow storage escrow = escrows[_escrowId];
        require(msg.sender == escrow.employer, "Only employer can refund");
        require(escrow.status == EscrowStatus.Funded, "Escrow not funded");
        require(escrow.amount > 0, "No funds to refund");

        escrow.status = EscrowStatus.Refunded;

        (bool success, ) = escrow.employer.call{value: escrow.amount}("");
        require(success, "Transfer failed");

        emit EscrowRefunded(_escrowId, escrow.employer, escrow.amount);
    }

    function cancelEscrow(uint256 _escrowId) external {
        Escrow storage escrow = escrows[_escrowId];
        require(msg.sender == escrow.employer, "Only employer can cancel");
        require(escrow.status == EscrowStatus.Created, "Cannot cancel in current state");

        escrow.status = EscrowStatus.Cancelled;
        emit EscrowCancelled(_escrowId);
    }

    function getEscrowByJob(uint256 _jobId) external view returns (Escrow memory) {
        return escrows[jobToEscrow[_jobId]];
    }

     receive() external payable{}
}