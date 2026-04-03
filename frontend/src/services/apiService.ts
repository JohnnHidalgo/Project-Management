// API service for communicating with the backend
const API_BASE_URL = 'http://localhost:3001/api';

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Projects
  async getProjects(): Promise<any[]> {
    return this.request('/projects');
  }

  async getProject(id: string): Promise<any> {
    return this.request(`/projects/${id}`);
  }

  async createProject(data: any): Promise<any> {
    return this.request('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProject(id: string, data: any): Promise<any> {
    return this.request(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProject(id: string): Promise<void> {
    return this.request(`/projects/${id}`, {
      method: 'DELETE',
    });
  }

  // Users
  async getUsers(): Promise<any[]> {
    return this.request('/users');
  }

  async getUser(id: string): Promise<any> {
    return this.request(`/users/${id}`);
  }

  async createUser(data: any): Promise<any> {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateUser(id: string, data: any): Promise<any> {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteUser(id: string): Promise<void> {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  // Tasks
  async getTasks(): Promise<any[]> {
    return this.request('/tasks');
  }

  async getTask(id: string): Promise<any> {
    return this.request(`/tasks/${id}`);
  }

  async getTasksByMilestone(milestoneId: string): Promise<any[]> {
    return this.request(`/tasks/milestone/${milestoneId}`);
  }

  async createTask(data: any): Promise<any> {
    return this.request('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTask(id: string, data: any): Promise<any> {
    return this.request(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTask(id: string): Promise<void> {
    return this.request(`/tasks/${id}`, {
      method: 'DELETE',
    });
  }

  // Risks
  async getRisks(): Promise<any[]> {
    return this.request('/risks');
  }

  async getRisk(id: string): Promise<any> {
    return this.request(`/risks/${id}`);
  }

  async getRisksByProject(projectId: string): Promise<any[]> {
    return this.request(`/risks/project/${projectId}`);
  }

  async createRisk(data: any): Promise<any> {
    return this.request('/risks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateRisk(id: string, data: any): Promise<any> {
    return this.request(`/risks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Risk Actions
  async getRiskActions(): Promise<any[]> {
    return this.request('/riskActions');
  }

  async getRiskAction(id: string): Promise<any> {
    return this.request(`/riskActions/${id}`);
  }

  async getRiskActionsByRisk(riskId: string): Promise<any[]> {
    return this.request(`/riskActions/risk/${riskId}`);
  }

  async createRiskAction(data: any): Promise<any> {
    return this.request('/riskActions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateRiskAction(id: string, data: any): Promise<any> {
    return this.request(`/riskActions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteRiskAction(id: string): Promise<void> {
    return this.request(`/riskActions/${id}`, {
      method: 'DELETE'
    });
  }

  // Milestones
  async getMilestones(): Promise<any[]> {
    return this.request('/milestones');
  }

  async getMilestone(id: string): Promise<any> {
    return this.request(`/milestones/${id}`);
  }

  async getMilestonesByProject(projectId: string): Promise<any[]> {
    return this.request(`/milestones/project/${projectId}`);
  }

  async createMilestone(data: any): Promise<any> {
    return this.request('/milestones', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateMilestone(id: string, data: any): Promise<any> {
    return this.request(`/milestones/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteMilestone(id: string): Promise<void> {
    return this.request(`/milestones/${id}`, {
      method: 'DELETE',
    });
  }

  // Issues
  async getIssues(): Promise<any[]> {
    return this.request('/issues');
  }

  async getIssue(id: string): Promise<any> {
    return this.request(`/issues/${id}`);
  }

  async getIssuesByProject(projectId: string): Promise<any[]> {
    return this.request(`/issues/project/${projectId}`);
  }

  async createIssue(data: any): Promise<any> {
    return this.request('/issues', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateIssue(id: string, data: any): Promise<any> {
    return this.request(`/issues/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteIssue(id: string): Promise<void> {
    return this.request(`/issues/${id}`, {
      method: 'DELETE',
    });
  }

  // Expenses
  async getExpenses(): Promise<any[]> {
    return this.request('/expenses');
  }

  async getExpense(id: string): Promise<any> {
    return this.request(`/expenses/${id}`);
  }

  async getExpensesByProject(projectId: string): Promise<any[]> {
    return this.request(`/expenses/project/${projectId}`);
  }

  async createExpense(data: any): Promise<any> {
    return this.request('/expenses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateExpense(id: string, data: any): Promise<any> {
    return this.request(`/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteExpense(id: string): Promise<void> {
    return this.request(`/expenses/${id}`, {
      method: 'DELETE',
    });
  }

  // Stakeholders
  async getStakeholders(): Promise<any[]> {
    return this.request('/stakeholders');
  }

  async getStakeholder(id: string): Promise<any> {
    return this.request(`/stakeholders/${id}`);
  }

  async getStakeholdersByProject(projectId: string): Promise<any[]> {
    return this.request(`/stakeholders/project/${projectId}`);
  }

  async createStakeholder(data: any): Promise<any> {
    return this.request('/stakeholders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateStakeholder(id: string, data: any): Promise<any> {
    return this.request(`/stakeholders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteStakeholder(id: string): Promise<void> {
    return this.request(`/stakeholders/${id}`, {
      method: 'DELETE',
    });
  }

  // Task Logs
  async getTaskLogs(): Promise<any[]> {
    return this.request('/taskLogs');
  }

  async getProjectHistory(): Promise<any[]> {
    return this.request('/projectHistory');
  }

  async getProjectHistoryByProject(projectId: string): Promise<any[]> {
    return this.request(`/projectHistory/project/${projectId}`);
  }

  async getTaskLog(id: string): Promise<any> {
    return this.request(`/taskLogs/${id}`);
  }

  async getTaskLogsByTask(taskId: string): Promise<any[]> {
    return this.request(`/taskLogs/task/${taskId}`);
  }

  async createTaskLog(data: any): Promise<any> {
    return this.request('/taskLogs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTaskLog(id: string, data: any): Promise<any> {
    return this.request(`/taskLogs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTaskLog(id: string): Promise<void> {
    return this.request(`/taskLogs/${id}`, {
      method: 'DELETE',
    });
  }

  // Change Requests
  async getChangeRequests(): Promise<any[]> {
    return this.request('/changeRequests');
  }

  async getChangeRequest(id: string): Promise<any> {
    return this.request(`/changeRequests/${id}`);
  }

  async getChangeRequestsByTask(taskId: string): Promise<any[]> {
    return this.request(`/changeRequests/task/${taskId}`);
  }

  async createChangeRequest(data: any): Promise<any> {
    return this.request('/changeRequests', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateChangeRequest(id: string, data: any): Promise<any> {
    return this.request(`/changeRequests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async processChangeRequest(id: string, status: 'Approved' | 'Rejected'): Promise<any> {
    return this.request(`/changeRequests/${id}/process`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async deleteChangeRequest(id: string): Promise<void> {
    return this.request(`/changeRequests/${id}`, {
      method: 'DELETE',
    });
  }

  // Budget Lines
  async getBudgetLines(): Promise<any[]> {
    return this.request('/budgetLines');
  }

  async getBudgetLineById(id: string): Promise<any> {
    return this.request(`/budgetLines/${id}`);
  }

  async getBudgetLinesByProject(projectId: string): Promise<any[]> {
    return this.request(`/budgetLines/project/${projectId}`);
  }

  async createBudgetLine(data: any): Promise<any> {
    return this.request('/budgetLines', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBudgetLine(id: string, data: any): Promise<any> {
    return this.request(`/budgetLines/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteBudgetLine(id: string): Promise<void> {
    return this.request(`/budgetLines/${id}`, {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService();