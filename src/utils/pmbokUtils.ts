import { Project, Milestone, Task, Expense } from '../types';

/**
 * PMBOK Utility: Earned Value Management (EVM) Calculations
 */

export const calculateEVM = (
  project: Project,
  milestones: Milestone[],
  tasks: Task[],
  expenses: Expense[]
) => {
  // 1. BAC (Budget at Completion)
  const bac = project?.budget || 0;

  // 2. EV (Earned Value) = % Complete * BAC
  const progressFactor = (project?.progress || 0) / 100;
  const ev = progressFactor * bac;

  // 3. AC (Actual Cost) = Sum of all paid/approved expenses
  const ac = (expenses || [])
    .filter(e => e && (e.status === 'Paid' || e.status === 'Approved'))
    .reduce((sum, e) => sum + (e.amount || 0), 0);

  // 4. PV (Planned Value) 
  const startDateStr = project?.startDate;
  const endDateStr = project?.endDate;
  
  let pv = 0;
  if (startDateStr && endDateStr) {
    const start = new Date(startDateStr).getTime();
    const end = new Date(endDateStr).getTime();
    const now = new Date().getTime();
    
    const totalDuration = end - start;
    if (totalDuration > 0) {
      const elapsed = Math.min(Math.max(now - start, 0), totalDuration);
      const timeFactor = elapsed / totalDuration;
      pv = timeFactor * bac;
    }
  }

  // 5. Performance Indices
  const cpi = ac > 0 ? ev / ac : (ev > 0 ? Infinity : 1);
  const spi = pv > 0 ? ev / pv : (ev > 0 ? Infinity : 1);

  // 6. Variances
  const cv = ev - ac; // Cost Variance
  const sv = ev - pv; // Schedule Variance

  return {
    bac,
    pv,
    ev,
    ac,
    cpi: isFinite(cpi) ? cpi : 1,
    spi: isFinite(spi) ? spi : 1,
    cv,
    sv,
    status: {
      cost: cpi >= 1 ? 'Under Budget' : 'Over Budget',
      schedule: spi >= 1 ? 'On Schedule' : 'Behind Schedule'
    }
  };
};

/**
 * PMBOK Utility: Generate Project Snapshot
 */
export const generateSnapshot = (
  project: Project,
  milestones: Milestone[],
  tasks: Task[],
  expenses: Expense[],
  highlights: string
) => {
  const evm = calculateEVM(project, milestones, tasks, expenses);
  const milestonesProgress = (milestones || []).reduce((acc, m) => {
    if (m && m.id) acc[m.id] = m.progress || 0;
    return acc;
  }, {} as Record<string, number>);

  return {
    id: `snap-${Date.now()}`,
    projectId: project?.id || '',
    date: new Date().toISOString().split('T')[0],
    highlights: highlights || '',
    risksIds: [],
    issuesIds: [],
    milestonesProgress,
    totalBudget: evm.bac,
    actualSpent: evm.ac,
    earnedValue: evm.ev,
    plannedValue: evm.pv,
    cpi: evm.cpi,
    spi: evm.spi,
    cv: evm.cv,
    sv: evm.sv,
    eac: evm.cpi > 0 ? evm.bac / evm.cpi : evm.bac,
    status: 'Open' as 'Open' | 'Closed'
  };
};

/**
 * PMBOK Utility: Risk Severity Matrix
 */
export const calculateRiskScore = (probability: number, impact: number) => {
  const score = (probability || 0) * (impact || 0);
  if (score > 0.6) return 'Critical';
  if (score > 0.4) return 'High';
  if (score > 0.2) return 'Medium';
  return 'Low';
};
