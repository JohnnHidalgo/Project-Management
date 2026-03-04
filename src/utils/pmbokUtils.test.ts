import { describe, it, expect } from 'vitest';
import { calculateEVM, generateSnapshot } from './pmbokUtils';
import { Project, Milestone, Task, Expense } from '../types';

describe('PMBOK EVM Calculations', () => {
  const mockProject: Project = {
    id: 'p1',
    name: 'Test Project',
    description: '',
    status: 'Active',
    budget: 100000, // BAC
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    pmId: '1',
    sponsorIds: [],
    teamMemberIds: [],
    progress: 50, // 50% Complete
  };

  const mockMilestones: Milestone[] = [
    { id: 'm1', projectId: 'p1', name: 'M1', description: '', startDate: '2026-01-01', endDate: '2026-06-30', weight: 50, status: 'Completed', progress: 100 },
    { id: 'm2', projectId: 'p1', name: 'M2', description: '', startDate: '2026-07-01', endDate: '2026-12-31', weight: 50, status: 'Pending', progress: 0 }
  ];

  const mockTasks: Task[] = [];

  const mockExpenses: Expense[] = [
    { id: 'e1', projectId: 'p1', amount: 60000, date: '', description: '', category: 'Services', status: 'Paid' } // AC = 60000
  ];

  it('should calculate EV, AC, and CPI correctly', () => {
    const evm = calculateEVM(mockProject, mockMilestones, mockTasks, mockExpenses);
    
    // EV = 50% * 100,000 = 50,000
    expect(evm.ev).toBe(50000);
    
    // AC = 60,000
    expect(evm.ac).toBe(60000);
    
    // CPI = EV / AC = 50,000 / 60,000 = 0.833...
    expect(evm.cpi).toBeCloseTo(0.833, 3);
    
    // Cost Variance = EV - AC = -10,000
    expect(evm.cv).toBe(-10000);
    
    expect(evm.status.cost).toBe('Over Budget');
  });

  it('should generate a valid snapshot structure', () => {
    const snapshot = generateSnapshot(mockProject, mockMilestones, mockTasks, mockExpenses, 'Monthly Report');
    
    expect(snapshot.projectId).toBe('p1');
    expect(snapshot.highlights).toBe('Monthly Report');
    expect(snapshot.totalBudget).toBe(100000);
    expect(snapshot.earnedValue).toBe(50000);
    expect(snapshot.cpi).toBeCloseTo(0.833, 3);
    expect(snapshot.date).toBeDefined();
  });
});
