import React, { useState, useMemo, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PlusSquare, 
  Briefcase, 
  CheckSquare, 
  PieChart, 
  AlertTriangle,
  ChevronRight,
  Target,
  FileText,
  UserCircle
} from 'lucide-react';
import { mockUsers, mockProjects, mockExpenses } from './mockData';
import { User, Project, UserRole, ProjectStatus, Milestone, Task, Expense, BudgetLine } from './types';
import './globals.css';

// --- Sub-components (Layout) ---

const Sidebar = ({ currentUser, onRoleChange }: { currentUser: User, onRoleChange: (role: UserRole) => void }) => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <Briefcase className="icon-primary" />
        <h2>PM Hub</h2>
      </div>
      
      <nav className="sidebar-nav">
        <Link to="/" className="nav-item">
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </Link>
        <Link to="/projects" className="nav-item">
          <Briefcase size={20} />
          <span>Mis Proyectos</span>
        </Link>
        {(currentUser.role === 'PMO' || currentUser.role === 'Admin' || currentUser.role === 'PM') && (
          <Link to="/new-project" className="nav-item">
            <PlusSquare size={20} />
            <span>Nuevo Proyecto</span>
          </Link>
        )}
        <Link to="/tasks" className="nav-item">
          <CheckSquare size={20} />
          <span>Mis Tareas</span>
        </Link>
      </nav>

      <div className="sidebar-footer">
        <div className="role-switcher">
          <p className="label">Actuando como:</p>
          <select 
            value={currentUser.role} 
            onChange={(e) => onRoleChange(e.target.value as UserRole)}
            className="role-select"
          >
            <option value="PM">Project Manager</option>
            <option value="PMO">PMO</option>
            <option value="Sponsor">Sponsor</option>
            <option value="Team Member">Team Member</option>
            <option value="Admin">Admin</option>
          </select>
        </div>
        <div className="user-profile">
          <UserCircle size={24} />
          <div className="user-info">
            <p className="user-name">{currentUser.name}</p>
            <p className="user-role">{currentUser.role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

// --- Page Components ---

const ProjectForm = ({ onSave }: { onSave: (p: Partial<Project>) => void }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    budget: 0,
    startDate: '',
    endDate: '',
    objectives: '',
    strategicAlignment: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    navigate('/');
  };

  return (
    <div className="page">
      <header className="page-header">
        <h1>Nuevo Anteproyecto</h1>
        <p className="text-muted">Complete la información inicial para la aprobación del PMO</p>
      </header>
      
      <form className="card form-container" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nombre del Proyecto</label>
          <input 
            type="text" 
            required 
            value={formData.name} 
            onChange={e => setFormData({...formData, name: e.target.value})}
            placeholder="Ej: Migración ERP Cloud" 
          />
        </div>
        
        <div className="form-group">
          <label>Descripción General</label>
          <textarea 
            required 
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
            placeholder="Breve descripción del alcance..." 
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Presupuesto Estimado ($)</label>
            <input 
              type="number" 
              required 
              value={formData.budget}
              onChange={e => setFormData({...formData, budget: Number(e.target.value)})}
            />
          </div>
          <div className="form-group">
            <label>Fecha Inicio</label>
            <input 
              type="date" 
              required 
              value={formData.startDate}
              onChange={e => setFormData({...formData, startDate: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>Fecha Fin</label>
            <input 
              type="date" 
              required 
              value={formData.endDate}
              onChange={e => setFormData({...formData, endDate: e.target.value})}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Objetivos del Proyecto</label>
          <textarea 
            value={formData.objectives}
            onChange={e => setFormData({...formData, objectives: e.target.value})}
            placeholder="¿Qué se espera lograr?" 
          />
        </div>

        <div className="form-group">
          <label>Relación con Objetivos Estratégicos</label>
          <textarea 
            value={formData.strategicAlignment}
            onChange={e => setFormData({...formData, strategicAlignment: e.target.value})}
            placeholder="¿Cómo contribuye a la estrategia de la empresa?" 
          />
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/')}>Cancelar</button>
          <button type="submit" className="btn btn-primary">Enviar a Aprobación</button>
        </div>
      </form>
    </div>
  );
};

const Dashboard = ({ projects, currentUser }: { projects: Project[], currentUser: User }) => {
  const stats = useMemo(() => {
    return {
      total: projects.length,
      active: projects.filter(p => p.status === 'Active').length,
      planning: projects.filter(p => p.status === 'Planning').length,
      pending: projects.filter(p => p.status === 'Pending Initial Approval').length,
    };
  }, [projects]);

  return (
    <div className="page">
      <header className="page-header">
        <h1>Dashboard Global</h1>
        <p className="text-muted">Vista general del portafolio de proyectos</p>
      </header>

      <div className="stats-grid">
        <div className="card stat-card">
          <p className="label">Total Proyectos</p>
          <p className="value">{stats.total}</p>
        </div>
        <div className="card stat-card border-active">
          <p className="label">En Ejecución</p>
          <p className="value text-success">{stats.active}</p>
        </div>
        <div className="card stat-card border-planning">
          <p className="label">En Planificación</p>
          <p className="value text-accent">{stats.planning}</p>
        </div>
        <div className="card stat-card border-pending">
          <p className="label">Pendientes Aprobación</p>
          <p className="value text-warning">{stats.pending}</p>
        </div>
      </div>

      <section className="dashboard-section">
        <div className="section-header">
          <h2>Proyectos Recientes</h2>
          <Link to="/projects" className="link-primary">Ver todos <ChevronRight size={16} /></Link>
        </div>
        <div className="project-grid">
          {projects.map(project => (
            <Link key={project.id} to={`/projects/${project.id}`} className="card project-card">
              <div className="project-header">
                <span className={`badge badge-${project.status.toLowerCase().replace(/ /g, '-')}`}>
                  {project.status}
                </span>
                <span className="project-progress">{project.progress}%</span>
              </div>
              <h3 className="project-title">{project.name}</h3>
              <p className="project-desc">{project.description}</p>
              <div className="project-footer">
                <div className="footer-item">
                  <Target size={14} />
                  <span>{new Date(project.endDate).toLocaleDateString()}</span>
                </div>
                <div className="footer-item">
                  <PieChart size={14} />
                  <span>${project.budget.toLocaleString()}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

const SPPMReport = ({ project, expenses }: { project: Project, expenses: Expense[] }) => {
  const projectExpenses = expenses.filter(e => e.projectId === project.id);
  const totalSpent = projectExpenses.reduce((sum, e) => sum + e.amount, 0);
  const variance = project.budget > 0 ? ((totalSpent - project.budget) / project.budget) * 100 : 0;
  
  return (
    <div className="sppm-container">
      <div className="sppm-header card">
        <div className="sppm-title">
          <PieChart size={24} className="icon-primary" />
          <h2>Single Page Project Management (SPPM)</h2>
        </div>
        <button className="btn btn-primary btn-sm">Generar Snapshot Mensual</button>
      </div>

      <div className="sppm-grid">
        <div className="card sppm-card status-indicators">
          <h3>Estado de Salud</h3>
          <div className="indicator-row">
            <div className="indicator">
              <div className={`dot dot-${project.progress > 0 ? 'success' : 'warning'}`}></div>
              <span>Tiempo</span>
            </div>
            <div className="indicator">
              <div className={`dot dot-${totalSpent > project.budget ? 'error' : (totalSpent > project.budget * 0.8 ? 'warning' : 'success')}`}></div>
              <span>Costo</span>
            </div>
            <div className="indicator">
              <div className="dot dot-success"></div>
              <span>Alcance</span>
            </div>
          </div>
        </div>

        <div className="card sppm-card financials">
          <h3>Finanzas</h3>
          <div className="financial-stats">
            <div className="stat">
              <span className="label">Presupuesto</span>
              <span className="value">${project.budget.toLocaleString()}</span>
            </div>
            <div className="stat">
              <span className="label">Gastado (Actual)</span>
              <span className="value ${totalSpent > project.budget ? 'text-error' : 'text-warning'}">${totalSpent.toLocaleString()}</span>
            </div>
            <div className="stat">
              <span className="label">Desviación</span>
              <span className={`value ${variance > 0 ? 'text-error' : 'text-success'}`}>
                {variance > 0 ? '+' : ''}{variance.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        <div className="card sppm-card risks-issues">
          <h3>Riesgos e Issues Críticos</h3>
          <ul className="sppm-list">
            <li>
              <AlertTriangle size={14} className="text-warning" />
              <span>[Riesgo] Latencia en migración de base de datos</span>
            </li>
            <li>
              <AlertTriangle size={14} className="text-error" />
              <span>[Issue] Falta de acceso a servidores de producción</span>
            </li>
          </ul>
        </div>

        <div className="card sppm-card highlights">
          <h3>Highlights del Mes</h3>
          <textarea 
            placeholder="Escriba los logros principales de este periodo..."
            defaultValue="Se completó el diseño de la red VPC. RDS configurado en ambiente de pruebas."
          />
        </div>
      </div>
    </div>
  );
};

const ProjectDetail = ({ 
  projects, currentUser, milestones, tasks, expenses,
  onUpdateProject, onAddMilestone, onDeleteMilestone, onAddTask, onUpdateTask,
  onAddExpense, onUpdateExpense, onAddBudgetLine
}: { 
  projects: Project[], 
  currentUser: User,
  milestones: Milestone[],
  tasks: Task[],
  expenses: Expense[],
  onUpdateProject: (id: string, updates: Partial<Project>) => void,
  onAddMilestone: (projectId: string, name: string, weight: number) => void,
  onDeleteMilestone: (id: string) => void,
  onAddTask: (milestoneId: string, taskData: Partial<Task>) => void,
  onUpdateTask: (id: string, updates: Partial<Task>) => void,
  onAddExpense: (projectId: string, expense: Partial<Expense>) => void,
  onUpdateExpense: (id: string, updates: Partial<Expense>) => void,
  onAddBudgetLine: (projectId: string, line: Partial<BudgetLine>) => void
}) => {
  const { id } = useParams();
  const project = projects.find(p => p.id === id);
  const [activeTab, setActiveTab] = useState<'overview' | 'planning' | 'execution' | 'sppm' | 'costs'>('overview');
  
  const projectMilestones = milestones.filter(m => m.projectId === id);
  const totalWeight = projectMilestones.reduce((sum, m) => sum + m.weight, 0);
  
  const projectTasks = tasks.filter(t => projectMilestones.some(m => m.id === t.milestoneId));
  const projectExpenses = expenses.filter(e => e.projectId === id);

  const totalActualSpent = useMemo(() => 
    projectExpenses.reduce((sum, e) => sum + e.amount, 0), 
  [projectExpenses]);

  const budgetProgress = project ? (totalActualSpent / project.budget) * 100 : 0;

  if (!project) return <div>Proyecto no encontrado</div>;

  const handleApproveProject = () => {
    let nextStatus: ProjectStatus = project.status;
    if (project.status === 'Pending Initial Approval') nextStatus = 'Planning';
    if (project.status === 'Charter Approval') nextStatus = 'Active';
    
    onUpdateProject(project.id, { status: nextStatus });
    alert(`Proyecto movido a estado: ${nextStatus}`);
  };

  const handleSendToCharter = () => {
    if (totalWeight !== 100) {
      alert("La suma de pesos debe ser exactamente 100%");
      return;
    }
    onUpdateProject(project.id, { status: 'Charter Approval' });
    alert("Project Charter generado y enviado al Sponsor para aprobación final.");
  };

  const promptNewMilestone = () => {
    const name = prompt("Nombre del nuevo hito:");
    const weightStr = prompt("Peso relativo (0-100):");
    const weight = parseInt(weightStr || "0", 10);
    if (name && !isNaN(weight)) {
      onAddMilestone(project.id, name, weight);
    }
  };

  const promptNewTask = () => {
    if (projectMilestones.length === 0) {
      alert("Primero debe crear al menos un hito.");
      return;
    }
    
    const milestoneId = prompt(`Seleccione el ID del hito:\n${projectMilestones.map(m => `${m.id}: ${m.name}`).join('\n')}`);
    const name = prompt("Nombre de la tarea:");
    const assignedTo = prompt(`Asignar a (ID):\n${mockUsers.map(u => `${u.id}: ${u.name} (${u.role})`).join('\n')}`);
    
    if (milestoneId && name && assignedTo) {
      onAddTask(milestoneId, { name, assignedTo, priority: 'Medium' });
    }
  };

  return (
    <div className="page">
      <header className="page-header-row">
        <div>
          <div className="breadcrumb">Proyectos / {project.name}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h1>{project.name}</h1>
            <span className={`badge badge-${project.status.toLowerCase().replace(/ /g, '-')}`}>{project.status}</span>
          </div>
        </div>
        <div className="actions">
          {currentUser.role === 'PMO' && project.status === 'Pending Initial Approval' && (
            <button className="btn btn-primary" onClick={handleApproveProject}>Aprobar Anteproyecto</button>
          )}
          {currentUser.role === 'Sponsor' && project.status === 'Charter Approval' && (
            <button className="btn btn-primary" onClick={handleApproveProject}>Aprobar Project Charter</button>
          )}
          <button className="btn btn-secondary">
            <FileText size={18} />
            Exportar PDF
          </button>
        </div>
      </header>

      <div className="tabs">
        <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Vista General</button>
        <button className={`tab-btn ${activeTab === 'planning' ? 'active' : ''}`} onClick={() => setActiveTab('planning')}>Planificación</button>
        <button className={`tab-btn ${activeTab === 'costs' ? 'active' : ''}`} onClick={() => setActiveTab('costs')}>Costos</button>
        <button className={`tab-btn ${activeTab === 'execution' ? 'active' : ''}`} onClick={() => setActiveTab('execution')}>Ejecución y Cambios</button>
        <button className={`tab-btn ${activeTab === 'sppm' ? 'active' : ''}`} onClick={() => setActiveTab('sppm')}>Reporte SPPM</button>
      </div>

      {activeTab === 'costs' && (
        <div className="costs-view">
          <div className="stats-grid" style={{ marginBottom: '2rem' }}>
            <div className="card stat-card">
              <p className="label">Presupuesto Total</p>
              <p className="value">${project.budget.toLocaleString()}</p>
            </div>
            <div className="card stat-card">
              <p className="label">Gastado Real</p>
              <p className="value text-warning">${totalActualSpent.toLocaleString()}</p>
              <div className="progress-bar-container" style={{ marginTop: '0.5rem', height: '8px' }}>
                <div 
                  className={`progress-bar ${budgetProgress > 100 ? 'bg-error' : 'bg-warning'}`} 
                  style={{ width: `${Math.min(budgetProgress, 100)}%` }}
                ></div>
              </div>
            </div>
            <div className="card stat-card">
              <p className="label">Remanente</p>
              <p className={`value ${project.budget - totalActualSpent < 0 ? 'text-error' : 'text-success'}`}>
                ${(project.budget - totalActualSpent).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="cost-tables-grid">
            <div className="card">
              <div className="section-header">
                <h3>Planificación (Budget Lines)</h3>
                {(currentUser.role === 'PM' || currentUser.role === 'PMO') && (
                  <button className="btn btn-secondary btn-sm" onClick={() => {
                    const desc = prompt("Descripción:");
                    const amount = prompt("Monto planeado:");
                    const cat = prompt("Categoría (Hardware, Software, Services, Labor, Others):");
                    if (desc && amount) onAddBudgetLine(project.id, { description: desc, plannedAmount: Number(amount), category: cat as any });
                  }}>+ Línea de Presupuesto</button>
                )}
              </div>
              <table className="data-table">
                <thead>
                  <tr><th>Categoría</th><th>Descripción</th><th>Monto Planeado</th></tr>
                </thead>
                <tbody>
                  {project.budgetLines?.map(bl => (
                    <tr key={bl.id}>
                      <td><span className="badge badge-secondary">{bl.category}</span></td>
                      <td>{bl.description}</td>
                      <td>${bl.plannedAmount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="card">
              <div className="section-header">
                <h3>Ejecución (Gastos Reales)</h3>
                <button className="btn btn-secondary btn-sm" onClick={() => {
                   const desc = prompt("Descripción:");
                   const amount = prompt("Monto gastado:");
                   const cat = prompt("Categoría:");
                   if (desc && amount) onAddExpense(project.id, { description: desc, amount: Number(amount), category: cat as any });
                }}>+ Registrar Gasto</button>
              </div>
              <table className="data-table">
                <thead>
                  <tr><th>Fecha</th><th>Categoría</th><th>Descripción</th><th>Monto</th><th>Estado</th></tr>
                </thead>
                <tbody>
                  {projectExpenses.map(e => (
                    <tr key={e.id}>
                      <td>{e.date}</td>
                      <td><span className="badge badge-secondary">{e.category}</span></td>
                      <td>{e.description}</td>
                      <td>${e.amount.toLocaleString()}</td>
                      <td><span className={`badge badge-${e.status.toLowerCase()}`}>{e.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'overview' && (
        <div className="project-detail-grid">
          <div className="main-content">
            <div className="card info-card">
              <h3>Detalles del Project Charter</h3>
              <div className="info-grid">
                <div className="info-item"><span className="label">Presupuesto</span><span>${project.budget.toLocaleString()}</span></div>
                <div className="info-item"><span className="label">PM Responsable</span><span>Juan PM</span></div>
                <div className="info-item"><span className="label">Fecha Inicio</span><span>{project.startDate}</span></div>
                <div className="info-item"><span className="label">Fecha Fin</span><span>{project.endDate}</span></div>
              </div>
            </div>
            <div className="card">
              <h3>Objetivos</h3><p>{project.objectives || 'No definidos'}</p>
              <h3 style={{ marginTop: '1.5rem' }}>Alineación Estratégica</h3><p>{project.strategicAlignment || 'No definida'}</p>
            </div>
          </div>
          <aside className="side-content">
            <div className="card progress-card">
              <h3>Avance Global</h3>
              <div className="progress-bar-container"><div className="progress-bar" style={{ width: `${project.progress}%` }}></div></div>
              <p className="progress-text">{project.progress}% Completado</p>
            </div>
          </aside>
        </div>
      )}

      {activeTab === 'planning' && (
        <div className="planning-view card">
          <div className="section-header">
            <h3>Hitos del Cronograma</h3>
            <button className="btn btn-secondary btn-sm" onClick={promptNewMilestone}>+ Nuevo Hito</button>
          </div>
          <table className="data-table">
            <thead>
              <tr><th>Hito</th><th>Fecha</th><th>Peso (%)</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {projectMilestones.map(m => (
                <tr key={m.id}>
                  <td>{m.name}</td><td>{m.targetDate}</td><td>{m.weight}%</td>
                  <td><button className="btn-icon" onClick={() => onDeleteMilestone(m.id)}>×</button></td>
                </tr>
              ))}
              <tr className="table-footer">
                <td colSpan={2}><strong>Total Peso</strong></td>
                <td className={totalWeight === 100 ? 'text-success' : 'text-error'}><strong>{totalWeight}%</strong></td>
                <td>{totalWeight !== 100 && <span className="text-error" style={{ fontSize: '0.7rem' }}>Debe ser 100%</span>}</td>
              </tr>
            </tbody>
          </table>
          {project.status === 'Planning' && (
            <div className="form-actions" style={{ marginTop: '2rem' }}>
              <button className="btn btn-primary" disabled={totalWeight !== 100} onClick={handleSendToCharter}>Enviar a Aprobación de Charter</button>
            </div>
          )}
        </div>
      )}
      
      {activeTab === 'execution' && (
        <div className="execution-view">
          <div className="card">
            <div className="section-header">
              <h3>Control de Tareas y Responsables</h3>
              <button className="btn btn-secondary btn-sm" onClick={promptNewTask}>+ Nueva Tarea</button>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tarea</th>
                  <th>Hito Relacionado</th>
                  <th>Responsable</th>
                  <th>Avance</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {projectTasks.length > 0 ? projectTasks.map(t => {
                  const milestone = milestones.find(m => m.id === t.milestoneId);
                  const user = mockUsers.find(u => u.id === t.assignedTo);
                  return (
                    <tr key={t.id}>
                      <td>{t.name}</td>
                      <td>{milestone?.name || 'N/A'}</td>
                      <td>{user?.name || 'No asignado'}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <input 
                            type="range" 
                            min="0" max="100" 
                            value={t.progress} 
                            onChange={(e) => onUpdateTask(t.id, { progress: parseInt(e.target.value) })}
                          />
                          <span>{t.progress}%</span>
                        </div>
                      </td>
                      <td>
                        <button className="btn btn-secondary btn-sm" onClick={() => alert('Change Request enviada al PMO')}>Reprogramar</button>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr><td colSpan={5} className="text-muted" style={{ textAlign: 'center' }}>No hay tareas registradas.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'sppm' && <SPPMReport project={project} expenses={expenses} />}
    </div>
  );
};

// --- Main App Implementation ---

export default function App() {
  const [currentUser, setCurrentUser] = useState<User>(mockUsers[2]); // Default Juan PM
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>(mockExpenses);

  useEffect(() => {
    setMilestones([
      { id: 'm1', projectId: 'p1', name: 'Infraestructura Cloud', description: '', targetDate: '2026-03-15', weight: 30, status: 'In Progress', progress: 80 },
      { id: 'm2', projectId: 'p1', name: 'Migración de Datos', description: '', targetDate: '2026-06-30', weight: 40, status: 'Pending', progress: 0 },
    ]);
    
    setTasks([
      { id: 't1', milestoneId: 'm1', name: 'Configuración VPC', description: '', startDate: '2026-01-10', endDate: '2026-01-25', assignedTo: '4', progress: 100, status: 'Completed', priority: 'High' },
      { id: 't2', milestoneId: 'm1', name: 'Provisioning RDS', description: '', startDate: '2026-02-01', endDate: '2026-02-28', assignedTo: '4', progress: 60, status: 'In Progress', priority: 'Medium' },
    ]);
  }, []);

  const handleRoleChange = (role: UserRole) => {
    const user = mockUsers.find(u => u.role === role) || mockUsers[0];
    setCurrentUser(user);
  };

  const handleSaveProject = (projectData: Partial<Project>) => {
    const newProject: Project = {
      id: `p${projects.length + 1}`,
      name: projectData.name || 'Sin nombre',
      description: projectData.description || '',
      status: 'Pending Initial Approval',
      budget: projectData.budget || 0,
      startDate: projectData.startDate || '',
      endDate: projectData.endDate || '',
      pmId: currentUser.id,
      sponsorIds: [],
      teamMemberIds: [],
      objectives: projectData.objectives,
      strategicAlignment: projectData.strategicAlignment,
      progress: 0,
    };
    setProjects([newProject, ...projects]);
  };

  const handleUpdateProject = (id: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const handleAddMilestone = (projectId: string, name: string, weight: number) => {
    const newMilestone: Milestone = {
      id: `m${Date.now()}`,
      projectId,
      name,
      description: '',
      targetDate: '2026-12-31',
      weight,
      status: 'Pending',
      progress: 0
    };
    setMilestones([...milestones, newMilestone]);
  };

  const handleDeleteMilestone = (id: string) => {
    setMilestones(milestones.filter(m => m.id !== id));
  };

  const handleAddTask = (milestoneId: string, taskData: Partial<Task>) => {
    const newTask: Task = {
      id: `t${Date.now()}`,
      milestoneId,
      name: taskData.name || 'Nueva Tarea',
      description: taskData.description || '',
      startDate: taskData.startDate || '',
      endDate: taskData.endDate || '',
      assignedTo: taskData.assignedTo || '',
      progress: 0,
      status: 'Pending',
      priority: taskData.priority || 'Medium',
    };
    setTasks([...tasks, newTask]);
  };

  const handleUpdateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const handleAddExpense = (projectId: string, expenseData: Partial<Expense>) => {
    const newExpense: Expense = {
      id: `e${Date.now()}`,
      projectId,
      amount: expenseData.amount || 0,
      date: expenseData.date || new Date().toISOString().split('T')[0],
      description: expenseData.description || '',
      category: expenseData.category || 'Others',
      status: 'Estimated'
    };
    setExpenses([...expenses, newExpense]);
  };

  const handleUpdateExpense = (id: string, updates: Partial<Expense>) => {
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  const handleAddBudgetLine = (projectId: string, line: Partial<BudgetLine>) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        const newLine: BudgetLine = {
          id: `bl${Date.now()}`,
          category: line.category || 'Others',
          description: line.description || '',
          plannedAmount: line.plannedAmount || 0,
        };
        return { ...p, budgetLines: [...(p.budgetLines || []), newLine] };
      }
      return p;
    }));
  };

  return (
    <Router>
      <div className="app-container">
        <Sidebar currentUser={currentUser} onRoleChange={handleRoleChange} />
        <main className="main-layout">
          <Routes>
            <Route path="/" element={<Dashboard projects={projects} currentUser={currentUser} />} />
            <Route path="/projects" element={<Dashboard projects={projects} currentUser={currentUser} />} />
            <Route path="/projects/:id" element={
              <ProjectDetail 
                projects={projects} 
                currentUser={currentUser} 
                milestones={milestones}
                tasks={tasks}
                expenses={expenses}
                onUpdateProject={handleUpdateProject}
                onAddMilestone={handleAddMilestone}
                onDeleteMilestone={handleDeleteMilestone}
                onAddTask={handleAddTask}
                onUpdateTask={handleUpdateTask}
                onAddExpense={handleAddExpense}
                onUpdateExpense={handleUpdateExpense}
                onAddBudgetLine={handleAddBudgetLine}
              />
            } />
            <Route path="/new-project" element={<ProjectForm onSave={handleSaveProject} />} />
            <Route path="/tasks" element={
              <div className="page">
                <h1>Mis Tareas (Fase 3)</h1>
                <p>Aquí se listarán las tareas asignadas al usuario actual.</p>
              </div>
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
