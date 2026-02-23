export type UserRole = 'PM' | 'PMO' | 'Sponsor' | 'Team Member' | 'Admin';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  department?: string;
  phone?: string;
  position?: string;
}

export type ProjectStatus = 
  | 'Draft' 
  | 'Pending Initial Approval' 
  | 'Planning' 
  | 'Charter Approval' 
  | 'Active' 
  | 'Completed' 
  | 'Cancelled';

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  budget: number; // Total budget
  startDate: string;
  endDate: string;
  pmId: string;
  pmoId?: string;
  sponsorIds: string[];
  teamMemberIds: string[];
  objectives?: string;
  benefits?: string;
  strategicAlignment?: string;
  progress: number;
  budgetLines?: BudgetLine[]; // New: Detailed planning
}

export interface BudgetLine {
  id: string;
  category: 'Hardware' | 'Software' | 'Services' | 'Labor' | 'Others';
  description: string;
  plannedAmount: number;
}

export interface Milestone {
  id: string;
  projectId: string;
  name: string;
  description: string;
  targetDate: string;
  weight: number; // 0-100
  status: 'Pending' | 'In Progress' | 'Completed';
  progress: number;
}

export interface Task {
  id: string;
  milestoneId: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  assignedTo: string;
  progress: number;
  status: 'Pending' | 'In Progress' | 'Blocked' | 'Completed';
  priority: 'Low' | 'Medium' | 'High';
}

export interface Risk {
  id: string;
  projectId: string;
  description: string;
  probability: number; // 0-1
  impact: number; // 0-1
  status: 'Open' | 'Closed';
  category: 'Time' | 'Scope' | 'Cost';
}

export interface Issue {
  id: string;
  projectId: string;
  taskId?: string;
  description: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'Resolved' | 'Closed';
  resolutionDate?: string;
}

export interface Expense {
  id: string;
  projectId: string;
  amount: number;
  date: string;
  description: string;
  category: 'Hardware' | 'Software' | 'Services' | 'Labor' | 'Others';
  status: 'Estimated' | 'Approved' | 'Paid';
}

export interface ChangeRequest {
  id: string;
  taskId: string;
  originalStartDate: string;
  originalEndDate: string;
  newStartDate: string;
  newEndDate: string;
  justification: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  requestedBy: string;
  requestedDate: string;
}

export interface ProjectSnapshot {
  id: string;
  projectId: string;
  date: string;
  highlights: string;
  risksIds: string[];
  issuesIds: string[];
  milestonesProgress: Record<string, number>;
  totalBudget: number;
  actualSpent: number;
  plannedSpentToDate: number; // For CPI/SPI analysis
  status: 'Open' | 'Closed';
}
