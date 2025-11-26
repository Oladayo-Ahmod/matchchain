'use client';

import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

interface JobDetailsProps {
  job: {
    id: string;
    title: string;
    description: string;
    budget: number;
    deadline: string;
    employer: {
      name: string;
      walletAddress: string;
    };
    skills: string[];
    createdAt: string;
  };
}

export function JobDetails({ job }: JobDetailsProps) {
  return (
    <div className="space-y-6">
      <Card variant="elevated">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {job.title}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Posted by {job.employer?.name}
              </p>
            </div>
            <Badge variant="primary" size="lg">
              ${job.budget}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {job.description}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card variant="elevated">
        <CardHeader>
          <h2 className="text-xl font-semibold">Job Details</h2>
        </CardHeader>
        
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                Skills Required
              </h3>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill) => (
                  <Badge key={skill} variant="outline">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                Timeline
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Posted:</span>
                  <span className="text-gray-900 dark:text-white">
                    {new Date(job.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Deadline:</span>
                  <span className="text-gray-900 dark:text-white">
                    {new Date(job.deadline).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}