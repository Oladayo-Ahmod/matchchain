"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { ethers } from "ethers";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
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

  // Auto-hide alert after 5 seconds
  useEffect(() => {
    if (alert.show) {
      const timer = setTimeout(() => {
        setAlert({ ...alert, show: false });
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [alert]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isConnected || !address) return;

    setIsSubmitting(true);
    setAlert({ show: false, type: "success", title: "", message: "" });
    
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
          title: "🎉 Success!",
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
        title: "❌ Error",
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
    return (
      <div className="container mx-auto px-4 py-8">
        <ConnectWalletPrompt />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Page Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          <span className="gradient-text">Post a New Job</span>
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Hire the best Web3 talent with AI-powered matching and secure escrow
        </p>
      </div>

      {/* Alert Notification */}
      {alert.show && (
        <div className="fixed top-4 right-4 z-50 max-w-md animate-in slide-in-from-right duration-300">
          <Alert
            variant={alert.type}
            title={alert.title}
            className="shadow-2xl border-l-4 rounded-xl backdrop-blur-md"
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

      {/* Main Form Card */}
      <Card variant="glass" className="relative overflow-hidden">
        {/* Gradient accent line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
        
        {/* Floating blockchain icon */}
        <div className="absolute -top-6 -right-6 w-24 h-24 opacity-10">
          <div className="w-full h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 blur-xl" />
        </div>

        <CardHeader className="pb-2">
          <div className="flex items-center justify-center mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center mr-3">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <CardTitle className="text-2xl font-bold gradient-text">
              Job Details
            </CardTitle>
          </div>
          <p className="text-center text-gray-600 dark:text-gray-400">
            Fill in the details below to post your job on the blockchain
          </p>
        </CardHeader>

        <CardContent className="pt-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Job Title */}
            <div className="group">
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 flex items-center justify-center mr-2">
                  <span className="text-blue-600 dark:text-blue-400 font-semibold">1</span>
                </div>
                <span>Job Title *</span>
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
                className="glass-card border-2 border-transparent focus:border-blue-500/50 transition-all"
              />
            </div>

            {/* Job Description */}
            <div className="group">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 flex items-center justify-center mr-2">
                  <span className="text-blue-600 dark:text-blue-400 font-semibold">2</span>
                </div>
                <span>Job Description *</span>
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
                className="glass-card border-2 border-transparent focus:border-blue-500/50 transition-all resize-none"
              />
            </div>

            {/* Budget & Deadline */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="group">
                <label
                  htmlFor="budget"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 flex items-center justify-center mr-2">
                    <span className="text-green-600 dark:text-green-400 font-semibold">3</span>
                  </div>
                  <span>Budget (MATIC) *</span>
                </label>
                <div className="relative">
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
                    className="glass-card border-2 border-transparent focus:border-blue-500/50 pl-12 transition-all"
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                      <span className="text-green-600 dark:text-green-400 font-bold">$</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="group">
                <label
                  htmlFor="deadline"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-orange-500/10 to-yellow-500/10 flex items-center justify-center mr-2">
                    <span className="text-orange-600 dark:text-orange-400 font-semibold">4</span>
                  </div>
                  <span>Application Deadline *</span>
                </label>
                <div className="relative">
                  <Input
                    id="deadline"
                    type="date"
                    value={formData.deadline}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, deadline: e.target.value })
                    }
                    min={new Date().toISOString().split("T")[0]}
                    required
                    className="glass-card border-2 border-transparent focus:border-blue-500/50 pl-12 transition-all"
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-orange-500/20 to-yellow-500/20 flex items-center justify-center">
                      <svg className="w-4 h-4 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="group">
              <label
                htmlFor="skills"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-pink-500/10 to-rose-500/10 flex items-center justify-center mr-2">
                  <span className="text-pink-600 dark:text-pink-400 font-semibold">5</span>
                </div>
                <span>Required Skills (comma-separated)</span>
              </label>
              <Input
                id="skills"
                type="text"
                value={formData.skills}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, skills: e.target.value })
                }
                placeholder="e.g., Solidity, React, TypeScript, Web3, Smart Contracts"
                className="glass-card border-2 border-transparent focus:border-blue-500/50 transition-all"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Add relevant skills to help AI match the right candidates
              </p>
            </div>

            {/* Wallet Info */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 border border-blue-500/20">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">Wallet Connected</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Posting as: <span className="font-mono text-blue-600 dark:text-blue-400">{address?.slice(0, 8)}...{address?.slice(-6)}</span>
              </p>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                !formData.title ||
                !formData.description ||
                !formData.budget ||
                !formData.deadline
              }
              variant="gradient"
              size="lg"
              className="w-full group relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center space-x-2">
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Posting to Blockchain...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>Post Job on Polygon</span>
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-white/10 to-purple-600/0 group-hover:animate-shimmer" />
            </Button>

            {/* Helper Text */}
            <p className="text-center text-xs text-gray-500 dark:text-gray-400">
              Your job will be posted on the Polygon blockchain and visible to all Web3 developers worldwide
            </p>
          </form>
        </CardContent>
      </Card>

      {/* Info Cards */}
      <div className="grid md:grid-cols-3 gap-6 mt-8">
        <Card variant="glass" className="p-4 text-center">
          <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h4 className="font-semibold mb-1">Secure Escrow</h4>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Funds protected by smart contracts
          </p>
        </Card>

        <Card variant="glass" className="p-4 text-center">
          <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h4 className="font-semibold mb-1">Blockchain Powered</h4>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Immutable job records on Polygon
          </p>
        </Card>

        <Card variant="glass" className="p-4 text-center">
          <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h4 className="font-semibold mb-1">AI Matching</h4>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Intelligent candidate recommendations
          </p>
        </Card>
      </div>
    </div>
  );
}