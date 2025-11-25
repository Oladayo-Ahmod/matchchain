import { ethers } from "ethers";
import JobRegistryABI from "./abis/JobRegistry.json";
import EscrowVaultABI from "./abis/EscrowVault.json";

const JOB_REGISTRY_ADDRESS = process.env.NEXT_PUBLIC_JOB_REGISTRY_ADDRESS;
const ESCROW_VAULT_ADDRESS = process.env.NEXT_PUBLIC_ESCROW_VAULT_ADDRESS;
const AMOY_RPC_URL =
  process.env.NEXT_PUBLIC_AMOY_RPC_URL || "https://rpc-amoy.polygon.technology";

console.log("RPC:", process.env.NEXT_PUBLIC_AMOY_RPC_URL);

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
  private jobRegistryABI: any;
  private escrowVaultABI: any;

  constructor() {
    if (!AMOY_RPC_URL || !JOB_REGISTRY_ADDRESS || !ESCROW_VAULT_ADDRESS) {
      throw new Error(
        "Missing required environment variables for Ethers client"
      );
    }

    this.provider = new ethers.JsonRpcProvider(AMOY_RPC_URL);
    this.jobRegistryABI = JobRegistryABI;
    this.escrowVaultABI = EscrowVaultABI;
  }

  async getActiveJobs(): Promise<Job[]> {
    try {
      const contract = new ethers.Contract(
        JOB_REGISTRY_ADDRESS!,
        this.jobRegistryABI,
        this.provider
      );
      return await contract.getActiveJobs();
    } catch (error) {
      console.error("Error fetching active jobs:", error);
      return [];
    }
  }

  async getJob(jobId: number): Promise<Job | null> {
    try {
      const contract = new ethers.Contract(
        JOB_REGISTRY_ADDRESS!,
        this.jobRegistryABI,
        this.provider
      );
      return await contract.getJob(jobId);
    } catch (error) {
      console.error("Error fetching job:", error);
      return null;
    }
  }

  private async getSigner() {
    if (typeof window === "undefined") {
      throw new Error("Signer is only available in the browser");
    }

    const provider = new ethers.BrowserProvider((window as any).ethereum);
    return provider.getSigner();
  }

  async createJob(
     signer: ethers.Signer,
    title: string,
    description: string,
    budget: string,
    deadline: number
  ): Promise<ethers.ContractTransaction> {
    const contract = new ethers.Contract(
      JOB_REGISTRY_ADDRESS!,
      this.jobRegistryABI,
      signer
    );
    const budgetWei = ethers.parseEther(budget);
    return await contract.createJob(title, description, budgetWei, deadline);
  }

  async assignFreelancer(
    jobId: number,
    freelancerAddress: string
  ): Promise<ethers.ContractTransaction> {
    const signer = await this.getSigner();
    const contract = new ethers.Contract(
      JOB_REGISTRY_ADDRESS!,
      this.jobRegistryABI,
      signer
    );
    return await contract.assignFreelancer(jobId, freelancerAddress);
  }

  async createEscrow(
    jobId: number,
    freelancerAddress: string,
    amount: string
  ): Promise<ethers.ContractTransaction> {
    const signer = await this.getSigner();
    const contract = new ethers.Contract(
      ESCROW_VAULT_ADDRESS!,
      this.escrowVaultABI,
      signer
    );
    const amountWei = ethers.parseEther(amount);
    return await contract.createEscrow(jobId, freelancerAddress, {
      value: amountWei,
    });
  }

  async releaseMilestone(
    escrowId: number
  ): Promise<ethers.ContractTransaction> {
    const signer = await this.getSigner();
    const contract = new ethers.Contract(
      ESCROW_VAULT_ADDRESS!,
      this.escrowVaultABI,
      signer
    );
    return await contract.releaseMilestone(escrowId);
  }

  async refundEscrow(escrowId: number): Promise<ethers.ContractTransaction> {
    const signer = await this.getSigner();
    const contract = new ethers.Contract(
      ESCROW_VAULT_ADDRESS!,
      this.escrowVaultABI,
      signer
    );
    return await contract.refund(escrowId);
  }

  async getEscrowByJob(jobId: number): Promise<Escrow | null> {
    try {
      const contract = new ethers.Contract(
        ESCROW_VAULT_ADDRESS!,
        this.escrowVaultABI,
        this.provider
      );
      return await contract.getEscrowByJob(jobId);
    } catch (error) {
      console.error("Error fetching escrow:", error);
      return null;
    }
  }
}

export const ethersClient = new EthersClient();
