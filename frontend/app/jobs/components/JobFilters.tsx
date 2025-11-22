'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export function JobFilters() {
  const [filters, setFilters] = useState({
    search: '',
    minBudget: '',
    maxBudget: '',
    skills: '',
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setFilters({
      search: '',
      minBudget: '',
      maxBudget: '',
      skills: '',
    });
  };

  return (
    <Card variant="elevated">
      <CardHeader>
        <h3 className="text-lg font-semibold">Filters</h3>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Search Jobs
          </label>
          <Input
            id="search"
            type="text"
            placeholder="Job title or description..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>

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
        <div>
          <label htmlFor="skills" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Skills
          </label>
          <Input
            id="skills"
            type="text"
            placeholder="e.g., Solidity, React, TypeScript"
            value={filters.skills}
            onChange={(e) => handleFilterChange('skills', e.target.value)}
          />
        </div>

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