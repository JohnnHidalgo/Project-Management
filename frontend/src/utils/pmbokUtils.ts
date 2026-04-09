import { Project, Milestone, Task, Expense, Risk } from '../types';

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
  highlights: string,
  risks: Risk[]
) => {
  const evm = calculateEVM(project, milestones, tasks, expenses);
  const milestonesProgress = (milestones || []).reduce((acc, m) => {
    if (m && m.id) acc[m.id] = m.progress || 0;
    return acc;
  }, {} as Record<string, number>);

  const projectRisks = (risks || []).filter(r => r.projectId === project.id);
  const riskSummary: Array<{
    id: string;
    description: string;
    severity: 'Low' | 'Medium' | 'High' | 'Critical';
    status: string;
    category: string;
  }> = projectRisks.map(r => ({
    id: r.id,
    description: r.description,
    severity: calculateRiskScore(r.probability, r.impact),
    status: r.status,
    category: r.category
  }));

  const totalWeight = (milestones || []).reduce((sum, m) => sum + (m.weight || 0), 0);
  const projectProgress = totalWeight > 0
    ? Math.round((milestones || []).reduce((sum, m) => sum + ((m.progress || 0) * (m.weight || 0) / 100), 0))
    : 0;

  const overviewBudgetLines = (project.budgetLines || []).map(bl => {
    const executedAmount = (expenses || [])
      .filter(e => e.budgetLineId === bl.id && (e.status === 'Paid' || e.status === 'Approved'))
      .reduce((sum, e) => sum + (e.amount || 0), 0);
    const variance = bl.plannedAmount - executedAmount;
    return {
      id: bl.id,
      description: bl.description,
      category: bl.category,
      plannedAmount: bl.plannedAmount,
      executedAmount,
      variance,
      executionPct: bl.plannedAmount > 0 ? (executedAmount / bl.plannedAmount) * 100 : 0,
      status: bl.status || 'Pending'
    };
  });

  const objectives = (project.specificObjectives || []).map(so => ({
    description: so.description,
    kpi: so.kpi,
    successCriteria: so.successCriteria
  }));

  return {
    id: `snap-${Date.now()}`,
    projectId: project?.id || '',
    date: new Date().toISOString().split('T')[0],
    highlights: highlights || '',
    risksIds: projectRisks.map(r => r.id),
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
    status: 'Open' as 'Open' | 'Closed',
    overviewData: {
      status: project.status,
      budget: project.budget,
      progressPercent: projectProgress,
      businessCase: project.businessCase || '',
      generalObjective: project.generalObjective || '',
      strategicAlignment: project.strategicAlignment || '',
      assumptions: project.assumptions || '',
      constraints: project.constraints || '',
      objectives,
      budgetLines: overviewBudgetLines,
      milestones: (milestones || []).map(m => ({
        id: m.id,
        name: m.name,
        status: m.status,
        progress: m.progress || 0,
        weight: m.weight || 0,
        startDate: m.startDate,
        endDate: m.endDate
      }))
    },
    reportData: {
      evm: {
        bac: evm.bac,
        pv: evm.pv,
        ev: evm.ev,
        ac: evm.ac,
        cpi: evm.cpi,
        spi: evm.spi,
        cv: evm.cv,
        sv: evm.sv,
        eac: evm.cpi > 0 ? evm.bac / evm.cpi : evm.bac,
        status: evm.status
      },
      milestonesProgress: milestonesProgress,
      risks: riskSummary,
      highlights: highlights || '',
      projectProgress
    },
    savedBudgetLines: project.budgetLines ? project.budgetLines.map(bl => ({ ...bl })) : [],
    savedExpenses: expenses ? expenses.map(e => ({ ...e })) : []
  };
};

/**
 * PMBOK Utility: Risk Severity Matrix
 */
export const calculateRiskScore = (probability: number, impact: number): 'Critical' | 'High' | 'Medium' | 'Low' => {
  const score = (probability || 0) * (impact || 0);
  if (score > 0.6) return 'Critical';
  if (score > 0.4) return 'High';
  if (score > 0.2) return 'Medium';
  return 'Low';
};
