'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';

export function JobFilters() {
  const [filters, setFilters] = useState({
    search: '',
    minBudget: '',
    maxBudget: '',
    skills: '',
    experienceLevel: '',
    jobType: '',
  });

  const experienceLevels = [
    { value: '', label: 'Any experience' },
    { value: 'entry', label: 'Entry Level' },
    { value: 'mid', label: 'Mid Level' },
    { value: 'senior', label: 'Senior Level' },
  ];

  const jobTypes = [
    { value: '', label: 'Any type' },
    { value: 'full-time', label: 'Full Time' },
    { value: 'part-time', label: 'Part Time' },
    { value: 'contract', label: 'Contract' },
    { value: 'freelance', label: 'Freelance' },
  ];

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setFilters({
      search: '',
      minBudget: '',
      maxBudget: '',
      skills: '',
      experienceLevel: '',
      jobType: '',
    });
  };

  return (
    <Card variant="elevated">
      <CardHeader>
        <h3 className="text-lg font-semibold">Filters</h3>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <Input
          label="Search Jobs"
          placeholder="Job title or description..."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
        />

        {/* Experience Level */}
        <Select
          label="Experience Level"
          options={experienceLevels}
          value={filters.experienceLevel}
          onChange={(e) => handleFilterChange('experienceLevel', e.target.value)}
        />

        {/* Job Type */}
        <Select
          label="Job Type"
          options={jobTypes}
          value={filters.jobType}
          onChange={(e) => handleFilterChange('jobType', e.target.value)}
        />

        {/* Budget Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Budget Range (MATIC)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={filters.minBudget}
              onChange={(e) => handleFilterChange('minBudget', e.target.value)}
            />
            <Input
              type="number"
              placeholder="Max"
              value={filters.maxBudget}
              onChange={(e) => handleFilterChange('maxBudget', e.target.value)}
            />
          </div>
        </div>

        {/* Skills */}
        <Input
          label="Skills"
          placeholder="e.g., Solidity, React, TypeScript"
          value={filters.skills}
          onChange={(e) => handleFilterChange('skills', e.target.value)}
          helperText="Separate skills with commas"
        />

        {/* Filter Actions */}
        <div className="flex space-x-2 pt-2">
          <Button 
            variant="outline" 
            onClick={handleReset}
            className="flex-1"
          >
            Reset
          </Button>
          <Button 
            className="flex-1"
          >
            Apply Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}