import { ethers } from 'ethers';
import JobRegistryABI from './abis/JobRegistry.json';
import EscrowVaultABI from './abis/EscrowVault.json';

const JOB_REGISTRY_ADDRESS = process.env.NEXT_PUBLIC_JOB_REGISTRY_ADDRESS;
const ESCROW_VAULT_ADDRESS = process.env.NEXT_PUBLIC_ESCROW_VAULT_ADDRESS;
const AMOY_RPC_URL = process.env.NEXT_PUBLIC_AMOY_RPC_URL;

export interface Job {
  id: bigint;
  employer: string;
  title: string;
  description: string;
  budget: bigint;
  deadline: bigint;
  assignedFreelancer: string;
  isActive: boolean;
  createdAt: bigint;
}

export interface Escrow {
  id: bigint;
  employer: string;
  freelancer: string; 
  jobId: bigint;
  amount: bigint;
  status: number;
  createdAt: bigint;
  releasedAt: bigint;
}

class EthersClient {
  private provider: ethers.JsonRpcProvider;
  private signer: ethers.Signer | any;
  private jobRegistry: ethers.Contract;
  private escrowVault: ethers.Contract;

  constructor() {
    if (!AMOY_RPC_URL || !JOB_REGISTRY_ADDRESS || !ESCROW_VAULT_ADDRESS) {
      throw new Error('Missing required environment variables for Ethers client');
    }

    this.provider = new ethers.JsonRpcProvider(AMOY_RPC_URL);
    this.signer = this.provider.getSigner();
    this.jobRegistry = new ethers.Contract(JOB_REGISTRY_ADDRESS, JobRegistryABI, this.signer);
    this.escrowVault = new ethers.Contract(ESCROW_VAULT_ADDRESS, EscrowVaultABI, this.signer);
  }

  async getActiveJobs(): Promise<Job[]> {
    try {
      return await this.jobRegistry.getActiveJobs();
    } catch (error) {
      console.error('Error fetching active jobs:', error);
      return [];
    }
  }

  async getJob(jobId: number): Promise<Job | null> {
    try {
      return await this.jobRegistry.getJob(jobId);
    } catch (error) {
      console.error('Error fetching job:', error);
      return null;
    }
  }

  async createJob(
    signer: ethers.Signer,
    title: string,
    description: string,
    budget: string,
    deadline: number
  ): Promise<ethers.ContractTransaction> {
    const budgetWei = ethers.parseEther(budget);
    return await this.jobRegistry.createJob(title, description, budgetWei, deadline);
  }

  async assignFreelancer(
    signer: ethers.Signer,
    jobId: number,
    freelancerAddress: string
  ): Promise<ethers.ContractTransaction> {
    return await this.jobRegistry.assignFreelancer(jobId, freelancerAddress);
  }
  

  async createEscrow(
    signer: ethers.Signer,
    jobId: number,
    freelancerAddress: string,
    amount: string
  ): Promise<ethers.ContractTransaction> {
    const amountWei = ethers.parseEther(amount);
    return await this.escrowVault.createEscrow(jobId, freelancerAddress, { value: amountWei });
  }

  async releaseMilestone(
    signer: ethers.Signer,
    escrowId: number
  ): Promise<ethers.ContractTransaction> {
    return await this.escrowVault.releaseMilestone(escrowId);
  }

  async refundEscrow(
    signer: ethers.Signer,
    escrowId: number
  ): Promise<ethers.ContractTransaction> {
    return await this.escrowVault.refund(escrowId);
  }

  async getEscrowByJob(jobId: number): Promise<Escrow | null> {
    try {
      return await this.escrowVault.getEscrowByJob(jobId);
    } catch (error) {
      console.error('Error fetching escrow:', error);
      return null;
    }
  }
}

export const ethersClient = new EthersClient();