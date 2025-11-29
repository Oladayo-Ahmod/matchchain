"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { ethers } from "ethers";
import { Card, CardContent, CardHeader } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Alert } from "../components/ui/Alert";
import { useRouter } from "next/navigation";
import { Textarea } from "../components/ui/Textarea";
import { ConnectWalletPrompt } from "../jobs/components/ConnectWalletPrompt";
import { ethersClient } from "../lib/ethersClient";

interface FormData {
  title: string;
  description: string;
  budget: string;
  deadline: string;
  skills: string;
}

export default function PostJobPage() {
  const { isConnected, address } = useAccount();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [alert, setAlert] = useState<{
    show: boolean;
    type: "success" | "destructive" | "warning";
    title: string;
    message: string;
  }>({
    show: false,
    type: "success",
    title: "",
    message: "",
  });

  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    budget: "",
    deadline: "",
    skills: "",
  });

  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isConnected || !address) return;

    setIsSubmitting(true);
    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();

      // Calculate deadline in seconds from now
      const deadlineDate = new Date(formData.deadline);
      const deadlineSeconds = Math.floor(deadlineDate.getTime() / 1000);

      // Create job on blockchain
      const tx = await ethersClient.createJob(
        signer,
        formData.title,
        formData.description,
        formData.budget,
        deadlineSeconds
      );

      // Create job in database
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          employerWallet: address,
        }),
      });

      if (response.ok) {
        // Reset form
        setFormData({
          title: "",
          description: "",
          budget: "",
          deadline: "",
          skills: "",
        });

        setAlert({
          show: true,
          type: "success",
          title: "Success!",
          message: "Job posted successfully! Redirecting to jobs page...",
        });

        setTimeout(() => {
          router.push("/jobs");
        }, 2000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save job to database");
      }
    } catch (error) {
      console.error("Error posting job:", error);

      setAlert({
        show: true,
        type: "destructive",
        title: "Error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to post job. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isConnected) {
    return <ConnectWalletPrompt />;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Alert Notification */}
      {alert.show && (
        <div className="fixed top-4 right-4 z-50 max-w-md animate-in slide-in-from-right duration-300">
          <Alert
            variant={alert.type}
            title={alert.title}
            className="shadow-lg border-l-4"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-sm">{alert.message}</p>
              </div>
              <button
                onClick={() => setAlert({ ...alert, show: false })}
                className="ml-4 hover:opacity-70 transition-opacity"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </Alert>
        </div>
      )}
      <Card variant="elevated">
        <CardHeader>
          <h1 className="text-3xl font-bold text-center">Post a New Job</h1>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Job Title *
              </label>
              <Input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="e.g., Senior Solidity Developer"
                required
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Job Description *
              </label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Describe the job requirements, responsibilities, and expectations..."
                rows={6}
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="budget"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Budget (MATIC) *
                </label>
                <Input
                  id="budget"
                  type="number"
                  step="0.001"
                  min="0"
                  value={formData.budget}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, budget: e.target.value })
                  }
                  placeholder="e.g., 1.5"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="deadline"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Application Deadline *
                </label>
                <Input
                  id="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, deadline: e.target.value })
                  }
                  min={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="skills"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Required Skills (comma-separated)
              </label>
              <Input
                id="skills"
                type="text"
                value={formData.skills}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, skills: e.target.value })
                }
                placeholder="e.g., Solidity, React, TypeScript, Web3"
              />
            </div>

            <Button
              type="submit"
              disabled={
                isSubmitting ||
                !formData.title ||
                !formData.description ||
                !formData.budget ||
                !formData.deadline
              }
              className="w-full"
            >
              {isSubmitting ? "Posting..." : "Post Job"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
