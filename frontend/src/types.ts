export type UserRole = 'PM' | 'PMO' | 'Sponsor' | 'Team Member' | 'Admin' | 'Stakeholder';

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
  | 'Charter_Approval' 
  | 'Active' 
  | 'Completed' 
  | 'Cancelled';

export interface SpecificObjective {
  id: string;
  description: string;
  successCriteria: string;
  kpi: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  budget: number; // BAC: Budget at Completion
  startDate: string;
  endDate: string;
  pmId: string;
  pmoId?: string;
  sponsorIds: string[];
  teamMemberIds: string[];
  
  // PMBOK Charter Fields
  businessCase?: string;
  strategicAlignment?: string;
  generalObjective?: string;
  specificObjectives?: SpecificObjective[];
  benefits?: string;
  assumptions?: string;
  constraints?: string;
  rejectionComments?: string;
  
  progress: number;
  pmCanEdit: boolean; // Controla si el PM puede editar la información del proyecto
  
  // PMBOK EVM Metrics (Current Status)
  plannedValue?: number;  // PV
  earnedValue?: number;   // EV
  actualCost?: number;    // AC
  cpi?: number;           // Cost Performance Index
  spi?: number;           // Schedule Performance Index
  
  budgetLines?: BudgetLine[];
}

export interface BudgetLine {
  id: string;
  category: 'Hardware' | 'Software' | 'Services' | 'Labor' | 'Others';
  budgetType: 'CAPEX' | 'OPEX';
  description: string;
  plannedAmount: number;
  executionDate: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  approvedBy?: string;
  approvalDate?: string;
}

export interface Milestone {
  id: string;
  projectId: string;
  name: string;
  description: string;
  startDate: string; // PMBOK: Phase start
  endDate: string;   // PMBOK: Phase end / Target
  weight: number; // 0-100
  status: 'Pending' | 'In Progress' | 'Completed';
  progress: number;
  acceptanceCriteria?: string; // PMBOK Scope Management
}

export interface Task {
  id: string;
  milestoneId?: string;
  riskActionId?: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  assignedTo: string;
  progress: number;
  weight: number;
  status: 'Pending' | 'In_Progress' | 'Blocked' | 'Completed';
  priority: 'Low' | 'Medium' | 'High';
  predecessorId?: string; // PMBOK: Sequence Activities (Dependencies)
}

export interface TaskWithTiming extends Task {
  earliestStart: number;
  earliestFinish: number;
  latestStart: number;
  latestFinish: number;
  isCritical: boolean;
  duration: number;
}

export interface CriticalPathResult {
  criticalPath: Task[];
  totalDuration: number;
  tasks: TaskWithTiming[];
}

export interface TaskLog {
  id: string;
  taskId: string;
  userId: string;
  date: string;
  comment: string;
  previousProgress: number;
  newProgress: number;
  statusChange?: string;
}

export type RiskStrategy = 'Avoid' | 'Mitigate' | 'Transfer' | 'Accept' | 'Escalate';

export interface Risk {
  id: string;
  projectId: string;
  description: string;
  probability: number; // 0-1
  impact: number; // 0-1
  status: 'Open' | 'Closed';
  category: 'Time' | 'Scope' | 'Cost' | 'Quality' | 'Resources';
  strategy: RiskStrategy; // PMBOK Risk Management
  ownerId: string;
  mitigationPlan?: string;
}

export interface RiskAction {
  id: string;
  riskId: string;
  description: string;
  ownerId: string;
  dueDate: string;
  status: 'Pending' | 'In Progress' | 'Completed';
}

export interface Issue {
  id: string;
  projectId: string;
  taskId?: string;
  description: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'Resolved' | 'Closed';
  resolutionDate?: string;
  ownerId?: string;
}

export interface Expense {
  id: string;
  projectId: string;
  budgetLineId?: string; // Link to planning
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

export interface SnapshotOverviewData {
  status: Project['status'] | string;
  budget: number;
  progressPercent: number;
  businessCase: string;
  generalObjective: string;
  strategicAlignment: string;
  assumptions: string;
  constraints: string;
  objectives: Array<{ description: string; kpi: string; successCriteria: string }>;
  budgetLines: Array<{
    id: string;
    description: string;
    category: string;
    plannedAmount: number;
    executedAmount: number;
    variance: number;
    executionPct: number;
    status: string;
  }>;
  milestones: Array<{
    id: string;
    name: string;
    status: string;
    progress: number;
    weight: number;
    startDate: string;
    endDate: string;
  }>;
}

export interface SnapshotReportData {
  evm: {
    bac: number;
    pv: number;
    ev: number;
    ac: number;
    cpi: number;
    spi: number;
    cv: number;
    sv: number;
    eac: number;
    status: {
      cost: string;
      schedule: string;
    };
  };
  milestonesProgress: Record<string, number>;
  risks: Array<{ id: string; description: string; severity: 'Low' | 'Medium' | 'High' | 'Critical'; status: string; category: string }>;
  highlights: string;
  projectProgress: number;
}

export interface ProjectSnapshot {
  id: string;
  projectId: string;
  date: string;
  highlights: string;
  risksIds: string[];
  issuesIds: string[];
  milestonesProgress: Record<string, number>;
  
  // PMBOK EVM Metrics
  plannedValue: number;  // PV: What we should have spent
  earnedValue: number;   // EV: Progress * Budget
  actualSpent: number;    // AC: What we actually spent
  cv: number;            // Cost Variance (EV - AC)
  sv: number;            // Schedule Variance (EV - PV)
  cpi: number;           // Cost Performance Index (EV / AC)
  spi: number;           // Schedule Performance Index (EV / PV)
  eac: number;           // Estimate At Completion (BAC / CPI)
  
  status: 'Open' | 'Closed';
  overviewData?: SnapshotOverviewData;
  reportData?: SnapshotReportData;
  savedBudgetLines?: BudgetLine[];
  savedExpenses?: Expense[];
}

export interface LessonLearned {
  id: string;
  projectId: string;
  category: 'Technical' | 'Management' | 'Communication' | 'Procurement';
  description: string;
  recommendation: string;
  submittedBy: string;
  date: string;
}

export interface Stakeholder {
  id: string;
  projectId: string;
  userId: string;
  power: 'Low' | 'High';
  interest: 'Low' | 'High';
  influenceStrategy: string;
}

export interface ProjectHistory {
  id: string;
  projectId?: string;
  entity: string;
  entityId?: string;
  action: string;
  details?: any;
  userId?: string;
  createdAt: string;
}
