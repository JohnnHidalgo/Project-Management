import { Project, User, Milestone, Task, Risk, Issue, Expense } from './types';

export const mockUsers: User[] = [
  { id: '1', name: 'Rafael Sponsor', role: 'Sponsor', department: 'Executive', phone: '123456', position: 'Director' },
  { id: '2', name: 'Maria PMO', role: 'PMO', department: 'PMO Office', phone: '654321', position: 'PMO Manager' },
  { id: '3', name: 'Juan PM', role: 'PM', department: 'IT', phone: '456789', position: 'Project Manager' },
  { id: '4', name: 'Carlos Team', role: 'Team Member', department: 'IT', phone: '987654', position: 'Developer' },
  { id: '5', name: 'Admin User', role: 'Admin', department: 'IT', phone: '000000', position: 'IT Admin' },
];

export const mockProjects: Project[] = [
  {
    id: 'p1',
    name: 'ERP Cloud Migration',
    description: 'Migrating on-premise ERP to AWS Cloud for better scalability.',
    status: 'Active',
    budget: 150000,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    pmId: '3',
    pmoId: '2',
    sponsorIds: ['1'],
    teamMemberIds: ['4'],
    objectives: 'Improve system availability to 99.9% and reduce maintenance costs.',
    benefits: 'Scalability, Disaster Recovery, Cost efficiency.',
    strategicAlignment: 'Digital Transformation 2026.',
    progress: 35,
    budgetLines: [
      { id: 'bl1', category: 'Software', description: 'AWS Subscription', plannedAmount: 40000 },
      { id: 'bl2', category: 'Services', description: 'Migration Consulting', plannedAmount: 60000 },
      { id: 'bl3', category: 'Labor', description: 'Internal IT Staff', plannedAmount: 50000 },
    ]
  },
  {
    id: 'p2',
    name: 'HR Mobile App',
    description: 'Internal app for employees to manage leaves and payroll.',
    status: 'Planning',
    budget: 50000,
    startDate: '2026-03-01',
    endDate: '2026-08-30',
    pmId: '3',
    pmoId: '2',
    sponsorIds: ['1'],
    teamMemberIds: ['4'],
    progress: 0,
    budgetLines: [
      { id: 'bl4', category: 'Labor', description: 'Developer Time', plannedAmount: 35000 },
      { id: 'bl5', category: 'Software', description: 'Cloud Platform Fees', plannedAmount: 15000 },
    ]
  }
];

export const mockMilestones: Milestone[] = [
  {
    id: 'm1',
    projectId: 'p1',
    name: 'Cloud Infrastructure Setup',
    description: 'Provisioning VPC, EC2, and RDS instances.',
    targetDate: '2026-03-15',
    weight: 30,
    status: 'In Progress',
    progress: 80,
  },
  {
    id: 'm2',
    projectId: 'p1',
    name: 'Data Migration',
    description: 'Migrating legacy SQL data to RDS.',
    targetDate: '2026-06-30',
    weight: 40,
    status: 'Pending',
    progress: 0,
  }
];

export const mockTasks: Task[] = [
  {
    id: 't1',
    milestoneId: 'm1',
    name: 'VPC Design',
    description: 'Design network topology and security groups.',
    startDate: '2026-01-10',
    endDate: '2026-01-25',
    assignedTo: '4',
    progress: 100,
    status: 'Completed',
    priority: 'High',
  },
  {
    id: 't2',
    milestoneId: 'm1',
    name: 'RDS Provisioning',
    description: 'Setup Multi-AZ RDS Postgres.',
    startDate: '2026-02-01',
    endDate: '2026-02-28',
    assignedTo: '4',
    progress: 60,
    status: 'In Progress',
    priority: 'Medium',
  }
];

export const mockRisks: Risk[] = [
  {
    id: 'r1',
    projectId: 'p1',
    description: 'Latency issues between on-prem and cloud during migration.',
    probability: 0.3,
    impact: 0.8,
    status: 'Open',
    category: 'Time',
  }
];

export const mockIssues: Issue[] = [
  {
    id: 'i1',
    projectId: 'p1',
    description: 'Security group misconfiguration delaying dev access.',
    severity: 'Medium',
    status: 'Open',
  }
];
export const mockExpenses: Expense[] = [
  {
    id: 'e1',
    projectId: 'p1',
    amount: 12000,
    date: '2026-01-20',
    description: 'AWS Advance Payment (Software)',
    category: 'Software',
    status: 'Paid'
  },
  {
    id: 'e2',
    projectId: 'p1',
    amount: 25000,
    date: '2026-02-15',
    description: 'Initial Consulting Fee',
    category: 'Services',
    status: 'Approved'
  },
  {
    id: 'e3',
    projectId: 'p1',
    amount: 8000,
    date: '2026-02-20',
    description: 'Labor Month Jan-Feb',
    category: 'Labor',
    status: 'Paid'
  }
];
