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
  UserCircle,
  RefreshCw
} from 'lucide-react';
import { apiService } from './services/apiService';
import { User, Project, UserRole, ProjectStatus, Milestone, Task, Expense, BudgetLine, ProjectSnapshot, Risk, Stakeholder, TaskLog, ChangeRequest, RiskAction, Issue, ProjectHistory } from './types';
import { calculateEVM, generateSnapshot, calculateRiskScore } from './utils/pmbokUtils';
import { mockUsers, mockProjects, mockMilestones, mockTasks, mockRisks, mockIssues, mockExpenses, mockStakeholders, mockTaskLogs, mockChangeRequests, mockRiskActions } from './mockData';
import './globals.css';

const getProjectSponsorIds = (project: any): string[] => project?.sponsorIds ?? project?.sponsors?.map((s: any) => s.sponsorId) ?? [];
const getProjectTeamMemberIds = (project: any): string[] => project?.teamMemberIds ?? project?.teamMembers?.map((t: any) => t.teamMemberId) ?? [];

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
        <Link to="/tasks" className="nav-item">
          <CheckSquare size={20} />
          <span>Mis Tareas</span>
        </Link>

        {/* MENÚS CONDICIONALES POR ROL */}
        {currentUser.role === 'PMO' && (
          <>
            <div style={{ margin: '1rem 0 0.5rem 1rem', fontSize: '0.7rem', color: '#93c5fd', fontWeight: 700, textTransform: 'uppercase' }}>Gestión de Portafolio</div>
            <Link to="/global-risks" className="nav-item">
              <AlertTriangle size={20} />
              <span>Riesgos Globales</span>
            </Link>
            <Link to="/global-issues" className="nav-item">
              <Target size={20} />
              <span>Gestión de Issues</span>
            </Link>
            <Link to="/change-control" className="nav-item">
              <RefreshCw size={20} />
              <span>Control de Cambios</span>
            </Link>
          </>
        )}
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
    generalObjective: '',
    specificObjectives: [] as { id: string, description: string, successCriteria: string, kpi: string }[],
    strategicAlignment: '',
    businessCase: '',
    assumptions: '',
    constraints: '',
    pmId: '',
    sponsorId: '',
  });

  const addSpecificObjective = () => {
    setFormData({
      ...formData,
      specificObjectives: [
        ...formData.specificObjectives,
        { id: Math.random().toString(36).substr(2, 9), description: '', successCriteria: '', kpi: '' }
      ]
    });
  };

  const updateSpecificObjective = (id: string, field: string, value: string) => {
    setFormData({
      ...formData,
      specificObjectives: formData.specificObjectives.map(so => 
        so.id === id ? { ...so, [field]: value } : so
      )
    });
  };

  const removeSpecificObjective = (id: string) => {
    setFormData({
      ...formData,
      specificObjectives: formData.specificObjectives.filter(so => so.id !== id)
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    navigate('/');
  };

  return (
    <div className="page">
      <header className="page-header">
        <h1>Creación de Proyecto (PMO)</h1>
        <p className="text-muted">Inicie el proyecto en estado DRAFT y asigne los roles clave.</p>
      </header>
      
      <form className="card form-container" onSubmit={handleSubmit} style={{ gap: '1rem' }}>
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

        <div className="form-row">
          <div className="form-group">
            <label>Asignar Project Manager (PM)</label>
            <select 
              required 
              value={formData.pmId} 
              onChange={e => setFormData({...formData, pmId: e.target.value})}
            >
              <option value="">Seleccione un PM...</option>
              {mockUsers.filter(u => u.role === 'PM' || u.role === 'Admin').map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Asignar Sponsor Principal</label>
            <select 
              required 
              value={formData.sponsorId} 
              onChange={e => setFormData({...formData, sponsorId: e.target.value})}
            >
              <option value="">Seleccione un Sponsor...</option>
              {mockUsers.filter(u => u.role === 'Sponsor' || u.role === 'Admin').map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="form-group">
          <label>Descripción General (Scope Statement)</label>
          <textarea 
            required 
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
            placeholder="Breve descripción del alcance..." 
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Presupuesto BAC ($)</label>
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
          <label>Caso de Negocio (Business Case)</label>
          <textarea 
            value={formData.businessCase}
            onChange={e => setFormData({...formData, businessCase: e.target.value})}
            placeholder="Justificación financiera y estratégica..." 
          />
        </div>

        <div className="form-group">
          <label>Objetivo General</label>
          <textarea 
            value={formData.generalObjective}
            onChange={e => setFormData({...formData, generalObjective: e.target.value})}
            placeholder="Objetivo principal del proyecto..." 
          />
        </div>

        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label>Objetivos Específicos</label>
            <button type="button" className="btn btn-secondary btn-xs" onClick={addSpecificObjective}>+ Agregar Objetivo</button>
          </div>
          {formData.specificObjectives.map((so, index) => (
            <div key={so.id} className="card" style={{ padding: '1rem', marginBottom: '1rem', backgroundColor: '#f8fafc' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <strong>Objetivo #{index + 1}</strong>
                <button type="button" className="btn-icon" onClick={() => removeSpecificObjective(so.id)}>×</button>
              </div>
              <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.75rem' }}>Descripción</label>
                <input 
                  type="text" 
                  value={so.description} 
                  onChange={e => updateSpecificObjective(so.id, 'description', e.target.value)}
                  placeholder="Descripción del objetivo específico..."
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label style={{ fontSize: '0.75rem' }}>Criterio de Éxito</label>
                  <input 
                    type="text" 
                    value={so.successCriteria} 
                    onChange={e => updateSpecificObjective(so.id, 'successCriteria', e.target.value)}
                    placeholder="¿Cómo se mide el éxito?"
                  />
                </div>
                <div className="form-group">
                  <label style={{ fontSize: '0.75rem' }}>KPI</label>
                  <input 
                    type="text" 
                    value={so.kpi} 
                    onChange={e => updateSpecificObjective(so.id, 'kpi', e.target.value)}
                    placeholder="Indicador clave de desempeño..."
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Supuestos (Assumptions)</label>
            <textarea 
              value={formData.assumptions}
              onChange={e => setFormData({...formData, assumptions: e.target.value})}
              placeholder="¿Qué damos por hecho?" 
            />
          </div>
          <div className="form-group">
            <label>Restricciones (Constraints)</label>
            <textarea 
              value={formData.constraints}
              onChange={e => setFormData({...formData, constraints: e.target.value})}
              placeholder="Limitaciones de tiempo, costo o recursos..." 
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/')}>Cancelar</button>
          <button type="submit" className="btn btn-primary">Enviar a Aprobación</button>
        </div>
      </form>
    </div>
  );
};

const ProjectListView = ({ projects, currentUser, milestones, tasks, expenses }: { projects: Project[], currentUser: User, milestones: Milestone[], tasks: Task[], expenses: Expense[] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const filteredProjects = useMemo(() => {
    let result = projects;
    
    // Security filtering based on role
    if (currentUser.role !== 'PMO' && currentUser.role !== 'Admin') {
      result = result.filter(p => 
        p.pmId === currentUser.id || 
        getProjectSponsorIds(p).includes(currentUser.id) || 
        getProjectTeamMemberIds(p).includes(currentUser.id)
      );
    }

    // Search filter
    if (searchTerm) {
      result = result.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    // Status filter
    if (statusFilter !== 'All') {
      result = result.filter(p => p.status === statusFilter);
    }

    return result;
  }, [projects, currentUser, searchTerm, statusFilter]);

  return (
    <div className="page" style={{ maxWidth: '1200px' }}>
      <header className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div>
            <h1>Mis Proyectos</h1>
            <p className="text-muted">Gestión operativa y seguimiento de proyectos asignados</p>
          </div>
          {(currentUser.role === 'PMO' || currentUser.role === 'Admin' || currentUser.role === 'PM') && (
            <Link to="/new-project" className="btn btn-primary">+ Nuevo Proyecto</Link>
          )}
        </div>
      </header>

      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '250px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.25rem', display: 'block' }}>Buscar Proyecto</label>
            <input 
              type="text" 
              placeholder="Nombre del proyecto..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: '0.5rem', width: '100%' }}
            />
          </div>
          <div style={{ width: '200px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.25rem', display: 'block' }}>Estado</label>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: '0.5rem', width: '100%' }}
            >
              <option value="All">Todos los Estados</option>
              <option value="Draft">Draft</option>
              <option value="Charter Approval">Charter Approval</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Proyecto</th>
              <th>Estado</th>
              <th>Fecha Fin</th>
              <th>Progreso</th>
              <th>Salud (CPI/SPI)</th>
              <th>Presupuesto</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredProjects.map(project => {
              const pMilestones = milestones.filter(m => m.projectId === project.id);
              const pTasks = tasks.filter(t => pMilestones.some(m => m.id === t.milestoneId));
              const pExpenses = expenses.filter(e => e.projectId === project.id);
              const evm = calculateEVM(project, pMilestones, pTasks, pExpenses);

              return (
                <tr key={project.id}>
                  <td>
                    <div style={{ fontWeight: 700 }}>{project.name}</div>
                    <div className="text-muted" style={{ fontSize: '0.7rem' }}>PM: {mockUsers.find(u => u.id === project.pmId)?.name}</div>
                  </td>
                  <td>
                    <span className={`badge badge-${project.status.toLowerCase().replace(/ /g, '-')}`}>
                      {project.status}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.875rem' }}>{project.endDate}</td>
                  <td style={{ minWidth: '150px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div className="progress-bar-container" style={{ flex: 1, margin: 0, height: '8px' }}>
                        <div className="progress-bar" style={{ width: `${project.progress}%` }}></div>
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{project.progress}%</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <span className={`badge ${evm.cpi >= 1 ? 'badge-success' : 'badge-error'}`} title="CPI">
                        $ {evm.cpi.toFixed(2)}
                      </span>
                      <span className={`badge ${evm.spi >= 1 ? 'badge-success' : 'badge-error'}`} title="SPI">
                        ⏰ {evm.spi.toFixed(2)}
                      </span>
                    </div>
                  </td>
                  <td style={{ fontWeight: 600 }}>${(project.budget / 1000).toFixed(1)}k</td>
                  <td>
                    <Link to={`/projects/${project.id}`} className="btn btn-secondary btn-xs">Detalles</Link>
                  </td>
                </tr>
              );
            })}
            {filteredProjects.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No se encontraron proyectos con los filtros seleccionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Dashboard = ({ projects, currentUser, milestones, tasks, expenses }: { projects: Project[], currentUser: User, milestones: Milestone[], tasks: Task[], expenses: Expense[] }) => {
  const visibleProjects = useMemo(() => {
    if (currentUser.role === 'PMO' || currentUser.role === 'Admin') return projects;
    return projects.filter(p => 
      p.pmId === currentUser.id || 
      getProjectSponsorIds(p).includes(currentUser.id) || 
      getProjectTeamMemberIds(p).includes(currentUser.id)
    );
  }, [projects, currentUser]);

  const stats = useMemo(() => {
    const activeProjects = visibleProjects.filter(p => p.status === 'Active');
    const totalBudget = visibleProjects.reduce((sum, p) => sum + p.budget, 0);
    const avgProgress = visibleProjects.length > 0 
      ? visibleProjects.reduce((sum, p) => sum + p.progress, 0) / visibleProjects.length 
      : 0;

    let totalCPI = 0;
    let totalSPI = 0;
    let evmCount = 0;

    visibleProjects.forEach(p => {
      const pMilestones = milestones.filter(m => m.projectId === p.id);
      const pTasks = tasks.filter(t => pMilestones.some(m => m.id === t.milestoneId));
      const pExpenses = expenses.filter(e => e.projectId === p.id);
      const evm = calculateEVM(p, pMilestones, pTasks, pExpenses);
      
      if (p.status === 'Active' || p.status === 'Completed') {
        totalCPI += evm.cpi;
        totalSPI += evm.spi;
        evmCount++;
      }
    });

    const globalCPI = evmCount > 0 ? totalCPI / evmCount : 1;
    const globalSPI = evmCount > 0 ? totalSPI / evmCount : 1;

    return {
      total: visibleProjects.length,
      active: activeProjects.length,
      avgProgress,
      totalBudget,
      globalCPI,
      globalSPI
    };
  }, [visibleProjects, milestones, tasks, expenses]);

  return (
    <div className="page" style={{ maxWidth: '1200px' }}>
      <header className="page-header">
        <h1>Dashboard Ejecutivo</h1>
        <p className="text-muted">Vista de alto nivel del portafolio al {new Date().toLocaleDateString()}</p>
      </header>
      
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="card stat-card" style={{ borderTop: '4px solid var(--primary)' }}>
          <p className="label">Proyectos Activos</p>
          <p className="value">{stats.active} <span style={{ fontSize: '0.875rem', fontWeight: 400 }}>de {stats.total}</span></p>
        </div>
        <div className="card stat-card" style={{ borderTop: '4px solid var(--accent)' }}>
          <p className="label">Avance Promedio</p>
          <p className="value">{stats.avgProgress.toFixed(1)}%</p>
        </div>
        <div className="card stat-card" style={{ borderTop: `4px solid ${stats.globalCPI >= 1 ? 'var(--success)' : 'var(--error)'}` }}>
          <p className="label">CPI Global</p>
          <p className={`value ${stats.globalCPI >= 1 ? 'text-success' : 'text-error'}`}>{stats.globalCPI.toFixed(2)}</p>
        </div>
        <div className="card stat-card" style={{ borderTop: `4px solid ${stats.globalSPI >= 1 ? 'var(--success)' : 'var(--error)'}` }}>
          <p className="label">SPI Global</p>
          <p className={`value ${stats.globalSPI >= 1 ? 'text-success' : 'text-error'}`}>{stats.globalSPI.toFixed(2)}</p>
        </div>
      </div>

      <div className="project-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
        {visibleProjects.slice(0, 6).map(project => (
          <Link key={project.id} to={`/projects/${project.id}`} className="card project-card">
            <h3 style={{ marginBottom: '0.5rem' }}>{project.name}</h3>
            <div className="progress-bar-container" style={{ height: '8px' }}>
              <div className="progress-bar" style={{ width: `${project.progress}%` }}></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginTop: '0.5rem' }}>
              <span className={`badge badge-${project.status.toLowerCase().replace(/ /g, '-')}`}>{project.status}</span>
              <span style={{ fontWeight: 700 }}>{project.progress}%</span>
            </div>
          </Link>
        ))}
      </div>
      
      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <Link to="/projects" className="btn btn-secondary">Ver Todos los Proyectos</Link>
      </div>
    </div>
  );
};

const SPPMReport = ({ 
  project, 
  milestones, 
  tasks, 
  expenses,
  snapshots,
  onAddSnapshot,
  risks,
  stakeholders
}: { 
  project: Project, 
  milestones: Milestone[], 
  tasks: Task[], 
  expenses: Expense[],
  snapshots: ProjectSnapshot[],
  onAddSnapshot: (s: ProjectSnapshot) => void,
  risks: Risk[],
  stakeholders: Stakeholder[]
}) => {
  const [highlights, setHighlights] = useState('');
  const projectExpenses = (expenses || []).filter(e => e.projectId === project.id);
  const projectMilestones = (milestones || []).filter(m => m.projectId === project.id);
  const projectTasks = (tasks || []).filter(t => projectMilestones.some(m => m.id === t.milestoneId));
  const projectRisks = (risks || []).filter(r => r.projectId === project.id);
  
  const evm = calculateEVM(project, projectMilestones, projectTasks, projectExpenses);
  
  const handleGenerateSnapshot = () => {
    if (!highlights) {
      alert("Por favor ingrese los highlights del mes.");
      return;
    }
    // @ts-ignore
    const snapshot = generateSnapshot(project, projectMilestones, projectTasks, projectExpenses, highlights);
    onAddSnapshot(snapshot);
    alert("Snapshot Mensual generado y archivado exitosamente.");
    setHighlights('');
  };
  
  const projectSnapshots = snapshots.filter(s => s.projectId === project.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Calcular progreso del proyecto basado en hitos ponderados
  const calculatedProjectProgress = useMemo(() => {
    const totalWeight = projectMilestones.reduce((sum, m) => sum + (m.weight || 0), 0);
    if (projectMilestones.length === 0 || totalWeight === 0) return 0;
    const weightedProgress = projectMilestones.reduce((sum, m) => {
      const weight = m.weight || 0;
      const progress = m.progress || 0;
      return sum + (progress * weight / 100);
    }, 0);
    return Math.round(weightedProgress);
  }, [projectMilestones]);

  return (
    <div className="sppm-container">
      <div className="sppm-header card" style={{ background: 'var(--primary)', color: 'white' }}>
        <div className="sppm-title">
          <PieChart size={32} className="icon-primary" />
          <div>
            <h2 style={{ margin: 0 }}>Reporte SPPM Ejecutivo</h2>
            <p style={{ margin: 0, opacity: 0.8, fontSize: '0.875rem' }}>Estado integral del proyecto al {new Date().toLocaleDateString()}</p>
          </div>
        </div>
        <button className="btn btn-secondary" onClick={handleGenerateSnapshot}>📸 Congelar Snapshot</button>
      </div>

      <div className="sppm-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))' }}>
        {/* SECTION 1: ESTRATEGIA Y SALUD */}
        <div className="card sppm-card">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Target size={18} /> Alineación Estratégica
          </h3>
          <div style={{ fontSize: '0.875rem', display: 'grid', gap: '0.75rem' }}>
            <p><strong>Caso de Negocio:</strong> {project.businessCase || 'N/A'}</p>
            <p><strong>Objetivo General:</strong> {project.generalObjective || 'N/A'}</p>
            {project.specificObjectives && project.specificObjectives.length > 0 && (
              <div style={{ marginTop: '0.5rem' }}>
                <strong>Objetivos Específicos:</strong>
                <ul style={{ paddingLeft: '1.2rem', marginTop: '0.25rem', fontSize: '0.8rem' }}>
                  {project.specificObjectives.map(so => (
                    <li key={so.id}>{so.description} <br/><span className="text-muted">KPI: {so.kpi} | Éxito: {so.successCriteria}</span></li>
                  ))}
                </ul>
              </div>
            )}
            <div className="indicator-row" style={{ marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
              <div className="indicator">
                <div className={`dot dot-${evm.spi >= 1 ? 'success' : (evm.spi > 0.8 ? 'warning' : 'error')}`}></div>
                <span style={{ fontSize: '0.7rem', fontWeight: 700 }}>SPI: {evm.spi.toFixed(2)}</span>
              </div>
              <div className="indicator">
                <div className={`dot dot-${evm.cpi >= 1 ? 'success' : (evm.cpi > 0.8 ? 'warning' : 'error')}`}></div>
                <span style={{ fontSize: '0.7rem', fontWeight: 700 }}>CPI: {evm.cpi.toFixed(2)}</span>
              </div>
              <div className="indicator">
                <div className="dot dot-success"></div>
                <span style={{ fontSize: '0.7rem', fontWeight: 700 }}>PROG: {calculatedProjectProgress}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: AVANCE DE HITOS CLAVE */}
        <div className="card sppm-card">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckSquare size={18} /> Cronograma de Hitos
          </h3>
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            {projectMilestones.map(m => (
              <div key={m.id} style={{ fontSize: '0.8125rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                  <span>{m.name}</span>
                  <span style={{ fontWeight: 600 }}>{m.progress}%</span>
                </div>
                <div className="progress-bar-container" style={{ margin: 0, height: '6px' }}>
                  <div className={`progress-bar ${m.status === 'Completed' ? 'bg-success' : 'bg-accent'}`} style={{ width: `${m.progress}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 3: RESUMEN FINANCIERO (BAC vs AC) */}
        <div className="card sppm-card">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PieChart size={18} /> Desempeño de Costos (EVM)
          </h3>
          <div className="financial-stats">
            <div className="stat">
              <span className="label">Presupuesto Base (BAC)</span>
              <span className="value">${evm.bac.toLocaleString()}</span>
            </div>
            <div className="stat">
              <span className="label">Valor Ganado (EV)</span>
              <span className="value text-accent">${evm.ev.toLocaleString()}</span>
            </div>
            <div className="stat">
              <span className="label">Costo Actual (AC)</span>
              <span className={`value ${evm.ac > evm.ev ? 'text-error' : 'text-success'}`}>${evm.ac.toLocaleString()}</span>
            </div>
            <div className="stat" style={{ borderTop: '1px solid var(--border)', paddingTop: '0.5rem' }}>
              <span className="label">Varianza de Costo (CV)</span>
              <span className={`value ${evm.cv < 0 ? 'text-error' : 'text-success'}`}>
                {evm.cv < 0 ? '-' : '+'}${Math.abs(evm.cv).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 4: RIESGOS E ISSUES CRÍTICOS */}
        <div className="card sppm-card">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={18} /> Gestión de Riesgos
          </h3>
          <ul className="sppm-list">
            {projectRisks.filter(r => calculateRiskScore(r.probability, r.impact) === 'Critical' || calculateRiskScore(r.probability, r.impact) === 'High').map(r => (
              <li key={r.id} style={{ fontSize: '0.8125rem' }}>
                <span className={`badge badge-${calculateRiskScore(r.probability, r.impact).toLowerCase()}`} style={{ fontSize: '0.6rem' }}>
                  {calculateRiskScore(r.probability, r.impact)}
                </span>
                <span style={{ fontWeight: 500 }}>{r.description}</span>
              </li>
            ))}
            {projectRisks.length === 0 && <li className="text-muted">No hay riesgos críticos identificados.</li>}
          </ul>
        </div>

        {/* SECTION 5: HIGHLIGHTS Y COMENTARIOS */}
        <div className="card sppm-card highlights" style={{ gridColumn: '1 / -1' }}>
          <h3>Highlights y Logros Mensuales</h3>
          <textarea 
            placeholder="Ingrese los comentarios para el reporte ejecutivo..."
            value={highlights}
            onChange={(e) => setHighlights(e.target.value)}
            style={{ minHeight: '80px' }}
          />
        </div>
      </div>

      {/* SECTION 6: HISTORIAL DE SNAPSHOTS */}
      <div className="card">
        <h3 style={{ marginBottom: '1.5rem' }}>Log de Snapshots Históricos (Auditoría PMBOK)</h3>
        {projectSnapshots.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Comentarios Ejecutivos</th>
                <th>CPI</th>
                <th>SPI</th>
                <th>EV ($)</th>
                <th>AC ($)</th>
              </tr>
            </thead>
            <tbody>
              {projectSnapshots.map(s => (
                <tr key={s.id}>
                  <td><strong>{s.date}</strong></td>
                  <td style={{ fontSize: '0.8125rem' }}>{s.highlights}</td>
                  <td className={s.cpi >= 1 ? 'text-success' : 'text-error'} style={{ fontWeight: 700 }}>{s.cpi.toFixed(2)}</td>
                  <td className={s.spi >= 1 ? 'text-success' : 'text-error'} style={{ fontWeight: 700 }}>{s.spi.toFixed(2)}</td>
                  <td>${s.earnedValue.toLocaleString()}</td>
                  <td>${s.actualSpent.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">No hay snapshots generados aún para este proyecto.</div>
        )}
      </div>
    </div>
  );
};

const PMBOKHealthDashboard = ({ project, milestones, tasks, expenses }: { project: Project, milestones: Milestone[], tasks: Task[], expenses: Expense[] }) => {
  const evm = useMemo(() => {
    try {
      return calculateEVM(project, milestones, tasks, expenses);
    } catch (err) {
      console.error("Error calculating EVM:", err);
      return null;
    }
  }, [project, milestones, tasks, expenses]);

  if (!evm) return <div className="card">Error al calcular indicadores de salud (EVM). Revise las fechas y el presupuesto del proyecto.</div>;

  return (
    <div className="pmbok-health card">
      <div className="section-header">
        <h3>Salud del Proyecto (EVM - PMBOK)</h3>
        <span className={`badge badge-${(evm.cpi || 0) >= 1 && (evm.spi || 0) >= 1 ? 'success' : ((evm.cpi || 0) < 0.9 || (evm.spi || 0) < 0.9 ? 'error' : 'warning')}`}>
          {(evm.cpi || 0) >= 1 && (evm.spi || 0) >= 1 ? 'Saludable' : ((evm.cpi || 0) < 0.9 || (evm.spi || 0) < 0.9 ? 'Crítico' : 'En Riesgo')}
        </span>
      </div>
      
      <div className="evm-grid">
        <div className="evm-item">
          <p className="label">CPI (Costo)</p>
          <p className={`value ${(evm.cpi || 0) < 1 ? 'text-error' : 'text-success'}`}>{(evm.cpi || 0).toFixed(2)}</p>
          <p className="sub-label">{evm.status?.cost}</p>
        </div>
        <div className="evm-item">
          <p className="label">SPI (Tiempo)</p>
          <p className={`value ${(evm.spi || 0) < 1 ? 'text-error' : 'text-success'}`}>{(evm.spi || 0).toFixed(2)}</p>
          <p className="sub-label">{evm.status?.schedule}</p>
        </div>
        <div className="evm-item">
          <p className="label">CV (Var. Costo)</p>
          <p className={`value ${(evm.cv || 0) < 0 ? 'text-error' : 'text-success'}`}>${(evm.cv || 0).toLocaleString()}</p>
        </div>
        <div className="evm-item">
          <p className="label">SV (Var. Tiempo)</p>
          <p className={`value ${(evm.sv || 0) < 0 ? 'text-error' : 'text-success'}`}>${(evm.sv || 0).toLocaleString()}</p>
        </div>
      </div>

      <div className="evm-summary" style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="summary-item">
          <span className="label">Valor Ganado (EV):</span>
          <span className="value">${(evm.ev || 0).toLocaleString()}</span>
        </div>
        <div className="summary-item">
          <span className="label">Valor Planeado (PV):</span>
          <span className="value">${(evm.pv || 0).toLocaleString()}</span>
        </div>
        <div className="summary-item">
          <span className="label">Costo Actual (AC):</span>
          <span className="value">${(evm.ac || 0).toLocaleString()}</span>
        </div>
        <div className="summary-item">
          <span className="label">Presupuesto (BAC):</span>
          <span className="value">${(evm.bac || 0).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

const RiskRegistry = ({ risks, onAddRisk, onOpenModal, onOpenActionModal, setSelectedRisk }: { 
  risks: Risk[], 
  onAddRisk: (r: Partial<Risk>) => void, 
  onOpenModal: () => void,
  onOpenActionModal: () => void,
  setSelectedRisk: (r: Risk) => void
}) => {
  const [filterLevel, setFilterLevel] = useState<string | null>(null);

  const riskCounts = useMemo(() => {
    const counts: Record<string, number> = {
      'Critical': 0,
      'High': 0,
      'Medium': 0,
      'Low': 0
    };
    risks.forEach(r => {
      const score = calculateRiskScore(r.probability, r.impact);
      counts[score]++;
    });
    return counts;
  }, [risks]);

  const filteredRisks = useMemo(() => {
    if (!filterLevel) return risks;
    return risks.filter(r => calculateRiskScore(r.probability, r.impact) === filterLevel);
  }, [risks, filterLevel]);

  const matrixCells = [
    { label: 'H/H', score: 'Critical', bg: 'bg-error' },
    { label: 'H/M', score: 'High', bg: 'bg-error' },
    { label: 'H/L', score: 'Medium', bg: 'bg-warning' },
    { label: 'M/H', score: 'High', bg: 'bg-error' },
    { label: 'M/M', score: 'Medium', bg: 'bg-warning' },
    { label: 'M/L', score: 'Low', bg: 'bg-success' },
    { label: 'L/H', score: 'Medium', bg: 'bg-warning' },
    { label: 'L/M', score: 'Low', bg: 'bg-success' },
    { label: 'L/L', score: 'Low', bg: 'bg-success' },
  ];

  return (
    <div className="risk-registry">
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="section-header">
          <div>
            <h3>Matriz de Probabilidad e Impacto (PMBOK)</h3>
            <p className="text-muted" style={{ fontSize: '0.8rem', margin: 0 }}>Haga clic en una celda para filtrar el registro inferior</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {filterLevel && (
              <button className="btn btn-secondary btn-sm" onClick={() => setFilterLevel(null)}>Ver Todos</button>
            )}
            <button className="btn btn-primary btn-sm" onClick={onOpenModal}>+ Identificar Riesgo</button>
          </div>
        </div>
        
        <div className="risk-matrix-layout" style={{ display: 'flex', gap: '3rem', alignItems: 'center', marginTop: '1.5rem', padding: '1rem' }}>
          <div className="matrix-wrapper" style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: '-50px', top: '50%', transform: 'rotate(-90deg) translateY(-50%)', fontWeight: 700, fontSize: '0.75rem', color: 'var(--text-muted)' }}>PROBABILIDAD</div>
            <div style={{ position: 'absolute', bottom: '-30px', left: '50%', transform: 'translateX(-50%)', fontWeight: 700, fontSize: '0.75rem', color: 'var(--text-muted)' }}>IMPACTO</div>
            
            <div className="risk-heatmap-interactive" style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(3, 80px)', 
              gridTemplateRows: 'repeat(3, 80px)', 
              gap: '4px',
              backgroundColor: '#f1f5f9',
              padding: '4px',
              borderRadius: '8px'
            }}>
              {matrixCells.map((cell, idx) => {
                const risksInCell = risks.filter(r => {
                  const score = calculateRiskScore(r.probability, r.impact);
                  // Simplified cell matching: This is a 3x3 matrix. 
                  // Probabilities: H(>0.6), M(0.4-0.6), L(<0.4)
                  // Impacts: H(>0.6), M(0.4-0.6), L(<0.4)
                  const p = r.probability;
                  const i = r.impact;
                  const row = p > 0.6 ? 0 : (p >= 0.4 ? 1 : 2);
                  const col = i > 0.6 ? 0 : (i >= 0.4 ? 1 : 2);
                  return (row * 3 + col) === idx;
                });

                return (
                  <div 
                    key={idx} 
                    className={`heatmap-cell ${cell.bg} ${filterLevel === cell.score ? 'active' : ''}`}
                    onClick={() => setFilterLevel(cell.score)}
                    style={{ 
                      cursor: 'pointer', 
                      display: 'flex', 
                      flexDirection: 'column',
                      alignItems: 'center', 
                      justifyContent: 'center',
                      borderRadius: '4px',
                      position: 'relative',
                      transition: 'transform 0.2s',
                      opacity: filterLevel && filterLevel !== cell.score ? 0.4 : 1,
                      border: filterLevel === cell.score ? '3px solid var(--primary)' : 'none'
                    }}
                    title={`${cell.label} - Severidad: ${cell.score}`}
                  >
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, opacity: 0.6, position: 'absolute', top: '4px', left: '4px' }}>{cell.label}</span>
                    {risksInCell.length > 0 && (
                      <div style={{ 
                        background: 'white', 
                        color: 'black', 
                        borderRadius: '50%', 
                        width: '24px', 
                        height: '24px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}>
                        {risksInCell.length}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="risk-summary-legend" style={{ flex: 1 }}>
            <h4 style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>Resumen por Severidad</h4>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {Object.entries(riskCounts).map(([level, count]) => (
                <div 
                  key={level} 
                  onClick={() => setFilterLevel(level === filterLevel ? null : level)}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    padding: '0.5rem 1rem', 
                    borderRadius: '6px', 
                    backgroundColor: filterLevel === level ? 'var(--primary-light)' : '#f8fafc',
                    cursor: 'pointer',
                    border: filterLevel === level ? '1px solid var(--primary)' : '1px solid transparent'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div className={`dot dot-${level.toLowerCase()}`} style={{ width: '12px', height: '12px' }}></div>
                    <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{level}</span>
                  </div>
                  <span style={{ fontWeight: 700 }}>{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3>Registro de Riesgos {filterLevel ? `(${filterLevel})` : ''}</h3>
          <p className="text-muted" style={{ fontSize: '0.8rem' }}>Mostrando {filteredRisks.length} riesgos</p>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Descripción</th>
              <th>Prob / Imp</th>
              <th>Puntaje</th>
              <th>Estrategia</th>
              <th>Dueño</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredRisks.map(r => {
              const score = calculateRiskScore(r.probability, r.impact);
              const owner = mockUsers.find(u => u.id === r.ownerId);
              return (
                <tr key={r.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{r.description}</div>
                    <div className="text-muted" style={{ fontSize: '0.7rem' }}>Cat: {r.category} | Estado: {r.status}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.8rem' }}>
                      P: {r.probability.toFixed(1)} <br/> I: {r.impact.toFixed(1)}
                    </div>
                  </td>
                  <td><span className={`badge badge-${score.toLowerCase()}`}>{score}</span></td>
                  <td><span className="badge badge-secondary">{r.strategy}</span></td>
                  <td>{owner?.name}</td>
                  <td>
                    <button 
                      className="btn btn-secondary btn-xs" 
                      onClick={() => {
                        setSelectedRisk(r);
                        onOpenActionModal();
                      }}
                    >
                      Plan de Acción
                    </button>
                  </td>
                </tr>
              );
            })}
            {filteredRisks.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No hay riesgos para este nivel de severidad.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const RiskActionModal = ({ 
  isOpen, 
  onClose, 
  risk, 
  actions, 
  onAddAction,
  onUpdateActionStatus 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  risk: Risk | null, 
  actions: RiskAction[], 
  onAddAction: (a: Partial<RiskAction>) => void,
  onUpdateActionStatus: (id: string, status: RiskAction['status']) => void
}) => {
  if (!risk) return null;

  const riskActions = actions.filter(a => a.riskId === risk.id);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Plan de Acción: ${risk.description.substring(0, 30)}...`}>
      <form onSubmit={(e) => {
        e.preventDefault();
        const target = e.target as any;
        onAddAction({
          riskId: risk.id,
          description: target.description.value,
          ownerId: target.ownerId.value,
          dueDate: target.dueDate.value,
          status: 'Pending'
        });
        target.reset();
      }} style={{ marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
        <div className="form-group">
          <label>Nueva Acción de Tratamiento</label>
          <input name="description" type="text" required placeholder="Ej: Realizar pruebas de carga previas..." />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Responsable</label>
            <select name="ownerId" required>
              {mockUsers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Fecha Límite</label>
            <input name="dueDate" type="date" required />
          </div>
        </div>
        <button type="submit" className="btn btn-primary btn-block">Agregar al Plan</button>
      </form>

      <div className="action-list">
        <h4 style={{ marginBottom: '1rem', fontSize: '0.875rem' }}>Acciones Registradas</h4>
        {riskActions.length > 0 ? riskActions.map(action => (
          <div key={action.id} className="card" style={{ padding: '1rem', marginBottom: '0.75rem', borderLeft: `4px solid ${action.status === 'Completed' ? 'var(--success)' : (action.status === 'In Progress' ? 'var(--accent)' : 'var(--warning)')}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ fontWeight: 600, fontSize: '0.875rem', margin: 0 }}>{action.description}</p>
                <p className="text-muted" style={{ fontSize: '0.75rem', margin: '0.25rem 0' }}>
                  Resp: {mockUsers.find(u => u.id === action.ownerId)?.name} | Vence: {action.dueDate}
                </p>
              </div>
              <select 
                value={action.status} 
                onChange={(e) => onUpdateActionStatus(action.id, e.target.value as any)}
                style={{ fontSize: '0.7rem', padding: '2px' }}
              >
                <option value="Pending">Pendiente</option>
                <option value="In Progress">En Curso</option>
                <option value="Completed">Listo</option>
              </select>
            </div>
          </div>
        )) : <p className="text-muted" style={{ textAlign: 'center', fontSize: '0.875rem' }}>No hay acciones definidas.</p>}
      </div>
    </Modal>
  );
};

const StakeholderMatrix = ({ stakeholders, onOpenModal }: { stakeholders: Stakeholder[], onOpenModal: () => void }) => {
  return (
    <div className="stakeholder-view">
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="section-header">
          <h3>Matriz de Poder / Interés</h3>
          <button className="btn btn-secondary btn-sm" onClick={onOpenModal}>+ Agregar Interesado</button>
        </div>
        <div className="stakeholder-matrix">
          <div className="matrix-quadrant">
            <p className="quadrant-title">Gestionar Atentamente</p>
            <div className="stakeholder-list">
              {stakeholders.filter(s => s.power === 'High' && s.interest === 'High').map(s => (
                <span key={s.id} className="stakeholder-tag">{mockUsers.find(u => u.id === s.userId)?.name}</span>
              ))}
            </div>
          </div>
          <div className="matrix-quadrant">
            <p className="quadrant-title">Mantener Satisfecho</p>
            <div className="stakeholder-list">
              {stakeholders.filter(s => s.power === 'High' && s.interest === 'Low').map(s => (
                <span key={s.id} className="stakeholder-tag">{mockUsers.find(u => u.id === s.userId)?.name}</span>
              ))}
            </div>
          </div>
          <div className="matrix-quadrant">
            <p className="quadrant-title">Mantener Informado</p>
            <div className="stakeholder-list">
              {stakeholders.filter(s => s.power === 'Low' && s.interest === 'High').map(s => (
                <span key={s.id} className="stakeholder-tag">{mockUsers.find(u => u.id === s.userId)?.name}</span>
              ))}
            </div>
          </div>
          <div className="matrix-quadrant">
            <p className="quadrant-title">Monitorear</p>
            <div className="stakeholder-list">
              {stakeholders.filter(s => s.power === 'Low' && s.interest === 'Low').map(s => (
                <span key={s.id} className="stakeholder-tag">{mockUsers.find(u => u.id === s.userId)?.name}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Plan de Gestión de Interesados</h3>
        <table className="data-table">
          <thead>
            <tr><th>Interesado</th><th>Poder</th><th>Interés</th><th>Estrategia de Influencia</th></tr>
          </thead>
          <tbody>
            {stakeholders.map(s => (
              <tr key={s.id}>
                <td>{mockUsers.find(u => u.id === s.userId)?.name}</td>
                <td>{s.power}</td>
                <td>{s.interest}</td>
                <td>{s.influenceStrategy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- Sub-components (UX Helpers) ---

const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) => {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        {children}
      </div>
    </div>
  );
};

const GanttChart = ({ milestones, tasks }: { milestones: Milestone[], tasks: Task[] }) => {
  const sortedMilestones = [...milestones].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  
  if (milestones.length === 0) return <div className="empty-state">No hay datos de cronograma para visualizar.</div>;

  const projectStart = new Date(Math.min(...milestones.map(m => new Date(m.startDate).getTime()))).getTime();
  const projectEnd = new Date(Math.max(...milestones.map(m => new Date(m.endDate).getTime()))).getTime();
  const today = new Date().toISOString().split('T')[0];
  
  const getPosition = (dateStr: string) => {
    const date = new Date(dateStr).getTime();
    const pos = ((date - projectStart) / (projectEnd - projectStart)) * 100;
    return Math.max(0, Math.min(100, pos));
  };

  const todayPos = getPosition(today);

  return (
    <div className="gantt-container card" style={{ position: 'relative', overflowX: 'visible' }}>
      <div className="gantt-header">
        <div className="gantt-label-col">EDT (Estructura de Desglose de Trabajo)</div>
        <div className="gantt-timeline-col">
          <span>{new Date(projectStart).toLocaleDateString()}</span>
          <span style={{ fontWeight: 800, color: 'var(--primary)', letterSpacing: '1px' }}>CRONOGRAMA MAESTRO (GANTT)</span>
          <span>{new Date(projectEnd).toLocaleDateString()}</span>
        </div>
      </div>
      
      <div className="gantt-body" style={{ position: 'relative' }}>
        {/* Today Indicator */}
        {todayPos > 0 && todayPos < 100 && (
          <div className="gantt-today-line" style={{ left: `${todayPos}%` }}></div>
        )}

        <div className="gantt-timeline-grid">
          {Array.from({ length: 10 }).map((_, i) => <div key={i} className="grid-line"></div>)}
        </div>

        {sortedMilestones.map(m => (
          <React.Fragment key={m.id}>
            <div className="gantt-row milestone-row">
              <div className="gantt-label" style={{ fontWeight: 700 }}>{m.name}</div>
              <div className="gantt-bar-container">
                <div 
                  className="gantt-bar milestone-bar" 
                  style={{ 
                    left: `${getPosition(m.startDate)}%`, 
                    width: `${Math.max(getPosition(m.endDate) - getPosition(m.startDate), 2)}%` 
                  }}
                >
                  <div className="gantt-bar-progress" style={{ width: `${m.progress}%`, opacity: 0.8 }}></div>
                  <div className="bar-label">
                    <span style={{ fontWeight: 700 }}>{m.progress}%</span>
                    <span className="text-muted">({m.startDate} al {m.endDate})</span>
                  </div>
                </div>
              </div>
            </div>
            {tasks.filter(t => t.milestoneId === m.id).map(t => {
              const assignee = mockUsers.find(u => u.id === t.assignedTo);
              return (
                <div key={t.id} className="gantt-row task-row">
                  <div className="gantt-label">
                    <span style={{ marginLeft: '1rem', color: 'var(--text-muted)' }}>↳</span> {t.name}
                    {t.predecessorId && <span title="Dependencia crítica" style={{ marginLeft: '0.5rem', fontSize: '0.7rem' }}>⚠️</span>}
                  </div>
                  <div className="gantt-bar-container">
                    <div 
                      className="gantt-bar task-bar" 
                      style={{ 
                        left: `${getPosition(t.startDate)}%`, 
                        width: `${Math.max(getPosition(t.endDate) - getPosition(t.startDate), 1)}%`,
                        backgroundColor: t.status === 'Completed' ? 'var(--success)' : (t.status === 'Blocked' ? 'var(--error)' : '#94a3b8')
                      }}
                    >
                      <div className="gantt-bar-progress" style={{ width: `${t.progress}%` }}></div>
                      <div className="bar-label">
                        <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{assignee?.name.split(' ')[0]}</span>
                        <span>{t.progress}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

const CalendarView = ({ milestones, tasks }: { milestones: Milestone[], tasks: Task[] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const days = [];
  
  // Adjusted for Monday start (PMBOK style often uses ISO week)
  const prefixDays = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  for (let i = 0; i < prefixDays; i++) days.push({ day: null, type: 'other' });
  for (let i = 1; i <= daysInMonth; i++) days.push({ day: i, type: 'current' });

  const getEventsForDay = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateStr = date.toISOString().split('T')[0];
    const dayMilestones = milestones.filter(m => m.startDate <= dateStr && m.endDate >= dateStr);
    const dayTasks = tasks.filter(t => t.startDate <= dateStr && t.endDate >= dateStr);
    return { dayMilestones, dayTasks };
  };

  return (
    <div className="calendar-container card">
      <div className="calendar-header">
        <button className="btn btn-secondary btn-sm" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}>Anterior</button>
        <h3 style={{ margin: 0, textTransform: 'capitalize' }}>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
        <button className="btn btn-secondary btn-sm" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}>Siguiente</button>
      </div>
      <div className="calendar-grid">
        {["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"].map(d => <div key={d} className="calendar-day-head">{d}</div>)}
        {days.map((d, i) => {
          const { dayMilestones, dayTasks } = d.day ? getEventsForDay(d.day) : { dayMilestones: [], dayTasks: [] };
          return (
            <div key={i} className={`calendar-day ${d.type === 'other' ? 'other-month' : ''}`}>
              {d.day && <span className="day-number">{d.day}</span>}
              <div className="calendar-events">
                {dayMilestones.map(m => <div key={m.id} className="event-tag event-milestone" title={`Hito: ${m.name}`}>{m.name}</div>)}
                {dayTasks.map(t => <div key={t.id} className="event-tag event-task" title={`Tarea: ${t.name}`}>{t.name}</div>)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const TaskHistoryModal = ({ 
  isOpen, 
  onClose, 
  task, 
  logs, 
  onAddLog,
  currentUser,
  changeRequests
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  task: Task | null, 
  logs: TaskLog[], 
  onAddLog: (log: Partial<TaskLog>) => void,
  currentUser: User,
  changeRequests: ChangeRequest[]
}) => {
  const [comment, setComment] = useState('');
  const [newProgress, setNewProgress] = useState(task?.progress || 0);

  useEffect(() => {
    if (task) setNewProgress(task.progress);
  }, [task]);

  if (!task) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddLog({
      taskId: task.id,
      userId: currentUser.id,
      comment,
      previousProgress: task.progress,
      newProgress,
      date: new Date().toISOString()
    });
    setComment('');
    onClose();
  };

  const taskLogs = logs.filter(l => l.taskId == task?.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const taskChangeRequests = changeRequests.filter(cr => cr.taskId === task?.id);

  // Combinar logs y solicitudes de cambio en un historial unificado
  const combinedHistory = [
    ...taskLogs.map(log => ({
      id: log.id,
      date: log.date,
      type: 'log' as const,
      data: log
    })),
    ...taskChangeRequests.map(cr => ({
      id: cr.id,
      date: cr.requestedDate,
      type: 'changeRequest' as const,
      data: cr
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Seguimiento: ${task.name}`}>
      <form onSubmit={handleSubmit} style={{ marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
        <div className="form-group">
          <label>Actualizar Avance (%)</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <input 
              type="range" min="0" max="100" 
              value={newProgress} 
              onChange={(e) => setNewProgress(Number(e.target.value))} 
              style={{ flex: 1 }}
            />
            <span style={{ fontWeight: 700, minWidth: '3rem' }}>{newProgress}%</span>
          </div>
        </div>
        <div className="form-group">
          <label>Comentario / Bitácora</label>
          <textarea 
            required 
            value={comment} 
            onChange={(e) => setComment(e.target.value)}
            placeholder="Describa el avance o novedades de la tarea..."
          />
        </div>
        <button type="submit" className="btn btn-primary btn-block">Guardar Seguimiento</button>
      </form>

      <div className="history-list">
        <h4 style={{ marginBottom: '1rem', fontSize: '0.875rem', textTransform: 'uppercase', color: '#64748b' }}>Historial de Cambios</h4>
        {combinedHistory.length > 0 ? combinedHistory.map(item => {
          if (item.type === 'log') {
            const log = item.data as TaskLog;
            return (
              <div key={log.id} className="card" style={{ padding: '1rem', marginBottom: '0.75rem', backgroundColor: '#f8fafc' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>📝 {mockUsers.find(u => u.id === log.userId)?.name}</span>
                  <span className="text-muted" style={{ fontSize: '0.75rem' }}>{log.date}</span>
                </div>
                <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>{log.comment}</p>
                <div style={{ fontSize: '0.7rem' }}>
                  <span className="badge badge-secondary">Avance: {log.previousProgress}% → {log.newProgress}%</span>
                </div>
              </div>
            );
          } else {
            const cr = item.data as ChangeRequest;
            return (
              <div key={cr.id} className="card" style={{ padding: '1rem', marginBottom: '0.75rem', backgroundColor: '#fef3c7', borderLeft: '3px solid #f59e0b' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>🔄 Solicitud de Cambio por {mockUsers.find(u => u.id === cr.requestedBy)?.name}</span>
                  <span className={`badge badge-${cr.status.toLowerCase()}`}>{cr.status}</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#7c3aed', marginBottom: '0.5rem', fontWeight: 500 }}>
                  Solicitado: {cr.requestedDate?.split('T')[0] || 'N/A'}
                </div>
                <div style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                  <div className="text-muted">Justificación: {cr.justification}</div>
                </div>
                <div style={{ fontSize: '0.7rem', display: 'grid', gap: '0.5rem' }}>
                  <span className="badge badge-secondary">Reprogramación: {cr.originalStartDate?.split('T')[0]} → {cr.newStartDate?.split('T')[0]}</span>
                  {cr.status !== 'Pending' && (
                    <span className={`badge badge-${cr.status.toLowerCase()}`}>
                      {cr.status === 'Approved' ? '✓ Aprobado' : '✗ Rechazado'}
                    </span>
                  )}
                </div>
              </div>
            );
          }
        }) : <p className="text-muted" style={{ textAlign: 'center', fontSize: '0.875rem' }}>No hay historial registrado.</p>}
      </div>
    </Modal>
  );
};

const ChangeRequestModal = ({ 
  isOpen, 
  onClose, 
  task, 
  onAddCR,
  currentUser 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  task: Task | null, 
  onAddCR: (cr: Partial<ChangeRequest>) => void,
  currentUser: User
}) => {
  const [newStartDate, setNewStartDate] = useState('');
  const [newEndDate, setNewEndDate] = useState('');
  const [justification, setJustification] = useState('');

  useEffect(() => {
    if (task) {
      setNewStartDate(task.startDate);
      setNewEndDate(task.endDate);
    }
  }, [task]);

  if (!task) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddCR({
      taskId: task.id,
      originalStartDate: task.startDate,
      originalEndDate: task.endDate,
      newStartDate: new Date(newStartDate + 'T00:00:00.000Z').toISOString(),
      newEndDate: new Date(newEndDate + 'T00:00:00.000Z').toISOString(),
      justification,
      requestedBy: currentUser.id,
      requestedDate: new Date().toISOString().split('T')[0],
      status: 'Pending'
    });
    setJustification('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Solicitud de Cambio (Reprogramación)">
      <form onSubmit={handleSubmit}>
        <div className="card" style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#f1f5f9' }}>
          <p style={{ fontSize: '0.875rem' }}><strong>Tarea:</strong> {task.name}</p>
          <p style={{ fontSize: '0.875rem' }}><strong>Fechas Actuales:</strong> {task.startDate} al {task.endDate}</p>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Nueva Fecha Inicio</label>
            <input type="date" required value={newStartDate} onChange={e => setNewStartDate(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Nueva Fecha Fin</label>
            <input type="date" required value={newEndDate} onChange={e => setNewEndDate(e.target.value)} />
          </div>
        </div>

        <div className="form-group">
          <label>Justificación del Cambio (PMBOK Control de Cambios)</label>
          <textarea 
            required 
            value={justification} 
            onChange={e => setJustification(e.target.value)}
            placeholder="Explique el impacto y la razón de la reprogramación..."
          />
        </div>

        <button type="submit" className="btn btn-primary btn-block">Enviar Solicitud al PMO</button>
      </form>
    </Modal>
  );
};

const GlobalRisks = ({ risks, projects }: { risks: Risk[], projects: Project[] }) => {
  return (
    <div className="page">
      <header className="page-header">
        <h1>Portafolio de Riesgos</h1>
        <p className="text-muted">Vista agregada de amenazas críticas en todos los proyectos</p>
      </header>
      
      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Proyecto</th>
              <th>Riesgo</th>
              <th>Severidad</th>
              <th>Estrategia</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {risks.map(r => {
              const project = projects.find(p => p.id === r.projectId);
              const score = calculateRiskScore(r.probability, r.impact);
              return (
                <tr key={r.id}>
                  <td><strong>{project?.name}</strong></td>
                  <td>{r.description}</td>
                  <td><span className={`badge badge-${score.toLowerCase()}`}>{score}</span></td>
                  <td>{r.strategy}</td>
                  <td><span className="badge badge-secondary">{r.status}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const GlobalIssues = ({ issues, projects, onResolveIssue }: { issues: Issue[], projects: Project[], onResolveIssue: (id: string) => void }) => {
  return (
    <div className="page">
      <header className="page-header">
        <h1>Gestión de Issues (Problemas)</h1>
        <p className="text-muted">Registro de impedimentos que requieren resolución inmediata</p>
      </header>

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Proyecto</th>
              <th>Descripción</th>
              <th>Severidad</th>
              <th>Estado</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {issues.map(i => {
              const project = projects.find(p => p.id === i.projectId);
              return (
                <tr key={i.id}>
                  <td><strong>{project?.name}</strong></td>
                  <td>{i.description}</td>
                  <td><span className={`badge badge-${i.severity.toLowerCase()}`}>{i.severity}</span></td>
                  <td><span className={`badge badge-${i.status.toLowerCase()}`}>{i.status}</span></td>
                  <td>
                    {i.status !== 'Closed' && (
                      <button className="btn btn-primary btn-sm" onClick={() => onResolveIssue(i.id)}>Resolver</button>
                    )}
                  </td>
                </tr>
              );
            })}
            {issues.length === 0 && <tr><td colSpan={5} className="text-muted" style={{ textAlign: 'center' }}>No hay issues registrados.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ChangeControlBoard = ({ 
  changeRequests, 
  projects, 
  tasks,
  milestones,
  onProcessCR 
}: { 
  changeRequests: ChangeRequest[], 
  projects: Project[], 
  tasks: Task[],
  milestones: Milestone[],
  onProcessCR: (id: string, status: 'Approved' | 'Rejected') => void 
}) => {
  return (
    <div className="page">
      <header className="page-header">
        <h1>Control de Cambios (CCB)</h1>
        <p className="text-muted">Aprobación o rechazo formal de reprogramaciones según el PMBOK</p>
      </header>

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Proyecto</th>
              <th>Tarea</th>
              <th>Cambio Solicitado</th>
              <th>Justificación</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {changeRequests.map(cr => {
              const task = tasks.find(t => t.id === cr.taskId);
              const milestone = milestones.find(m => m.id === task?.milestoneId);
              const project = projects.find(p => p.id === milestone?.projectId);
              
              return (
                <tr key={cr.id}>
                  <td>{project?.name || 'Proyecto no encontrado'}</td>
                  <td>{task?.name}</td>
                  <td style={{ fontSize: '0.75rem' }}>
                    <div className="text-muted">Del: {cr.originalStartDate}</div>
                    <div className="text-accent" style={{ fontWeight: 700 }}>Al: {cr.newStartDate}</div>
                  </td>
                  <td style={{ maxWidth: '250px', fontSize: '0.8rem' }}>{cr.justification}</td>
                  <td><span className={`badge badge-${cr.status.toLowerCase()}`}>{cr.status}</span></td>
                  <td>
                    {cr.status === 'Pending' && (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-success btn-sm" onClick={() => onProcessCR(cr.id, 'Approved')}>Aprobar</button>
                        <button className="btn btn-error btn-sm" onClick={() => onProcessCR(cr.id, 'Rejected')}>Rechazar</button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
            {changeRequests.length === 0 && <tr><td colSpan={6} className="text-muted" style={{ textAlign: 'center' }}>No hay solicitudes de cambio pendientes.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ProjectDetail = ({ 
  projects, currentUser, milestones, tasks, expenses,
  onUpdateProject, onAddMilestone, onDeleteMilestone, onUpdateMilestone, onAddTask, onUpdateTask,
  onAddExpense, onUpdateExpense, onAddBudgetLine, onApproveBudgetLine,
  snapshots, onAddSnapshot, risks, onAddRisk, stakeholders, onAddStakeholder,
  taskLogs, onAddTaskLog, changeRequests, onChangeRequest,
  projectHistory,
  riskActions, onAddRiskAction, onUpdateRiskActionStatus, onProcessCR
}: { 
  projects: Project[], 
  currentUser: User,
  milestones: Milestone[],
  tasks: Task[],
  expenses: Expense[],
  onUpdateProject: (id: string, updates: Partial<Project>) => void,
  onAddMilestone: (projectId: string, name: string, weight: number, startDate: string, endDate: string) => void,
  onDeleteMilestone: (id: string) => void,
  onUpdateMilestone: (id: string, updates: Partial<Milestone>) => void,
  onAddTask: (milestoneId: string, taskData: Partial<Task>) => void,
  onUpdateTask: (id: string, updates: Partial<Task>) => void,
  onAddExpense: (projectId: string, expense: Partial<Expense>) => void,
  onUpdateExpense: (id: string, updates: Partial<Expense>) => void,
  onAddBudgetLine: (projectId: string, line: Partial<BudgetLine>) => void,
  onApproveBudgetLine: (projectId: string, projectIdLine: string, approved: boolean) => void,
  snapshots: ProjectSnapshot[],
  onAddSnapshot: (s: ProjectSnapshot) => void,
  risks: Risk[],
  onAddRisk: (projectId: string, risk: Partial<Risk>) => void,
  stakeholders: Stakeholder[],
  onAddStakeholder: (projectId: string, s: Partial<Stakeholder>) => void,
  projectHistory: ProjectHistory[],
  riskActions: RiskAction[],
  onAddRiskAction: (a: Partial<RiskAction>) => void,
  onUpdateRiskActionStatus: (id: string, status: RiskAction['status']) => void,
  taskLogs: TaskLog[],
  onAddTaskLog: (log: Partial<TaskLog>) => void,
  changeRequests: ChangeRequest[],
  onChangeRequest: (cr: Partial<ChangeRequest>) => void,
  onProcessCR: (id: string, status: 'Approved' | 'Rejected') => void
}) => {
  const { id } = useParams();
  const project = projects.find(p => p.id === id);
  const [activeTab, setActiveTab] = useState<'overview' | 'schedule' | 'sppm' | 'costs' | 'risks' | 'stakeholders' | 'gantt'>('overview');
  const [scheduleView, setScheduleView] = useState<'gantt' | 'calendar'>('gantt');
  const [activeModal, setActiveModal] = useState<'milestone' | 'task' | 'expense' | 'budgetLine' | 'risk' | 'taskHistory' | 'changeRequest' | 'stakeholder' | 'riskAction' | 'rejection' | 'editWeights' | 'editTaskWeights' | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedRisk, setSelectedRisk] = useState<Risk | null>(null);
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | null>(null);
  const [editTaskWeightsMilestoneId, setEditTaskWeightsMilestoneId] = useState<string | null>(null);
  const [taskWeightsDraft, setTaskWeightsDraft] = useState<Record<string, number>>({});
  const [rejectionComment, setRejectionComment] = useState('');
  
  const projectMilestones = (milestones || []).filter(m => m.projectId === id);
  const totalWeight = projectMilestones.reduce((sum, m) => sum + m.weight, 0);
  
  const projectTasks = (tasks || []).filter(t => projectMilestones.some(m => m.id === t.milestoneId));
  const editTaskWeightsMilestone = projectMilestones.find(m => m.id === editTaskWeightsMilestoneId);
  const editTaskWeightsTasks = projectTasks.filter(t => t.milestoneId === editTaskWeightsMilestoneId);
  const editTaskWeightTotal = editTaskWeightsTasks.reduce((sum, t) => sum + (taskWeightsDraft[t.id] ?? t.weight), 0);
  const projectExpenses = (expenses || []).filter(e => e.projectId === id);
  const projectRisks = (risks || []).filter(r => r.projectId === id);
  const projectStakeholders = (stakeholders || []).filter(s => s.projectId === id);
  const projectChangeRequests = (changeRequests || []).filter(cr => projectTasks.some(t => t.id === cr.taskId));

  const totalActualSpent = useMemo(() => 
    projectExpenses.reduce((sum, e) => sum + e.amount, 0), 
  [projectExpenses]);

  const budgetProgress = project ? (totalActualSpent / (project.budget || 1)) * 100 : 0;

  // Calcular progreso del proyecto basado en hitos ponderados
  const calculatedProjectProgress = useMemo(() => {
    if (projectMilestones.length === 0 || totalWeight === 0) return 0;
    const weightedProgress = projectMilestones.reduce((sum, m) => {
      const weight = m.weight || 0;
      const progress = m.progress || 0;
      return sum + (progress * weight / 100);
    }, 0);
    return Math.round(weightedProgress);
  }, [projectMilestones, totalWeight]);

  const handleSaveTaskWeights = async () => {
    if (!editTaskWeightsMilestoneId) return;

    if (editTaskWeightTotal !== 100) {
      alert('La suma de pesos debe ser exactamente 100% antes de guardar.');
      return;
    }

    const taskUpdates = editTaskWeightsTasks
      .map(task => {
        const newWeight = taskWeightsDraft[task.id] ?? task.weight;
        if (newWeight !== task.weight) return { id: task.id, weight: newWeight };
        return null;
      })
      .filter((x): x is { id: string; weight: number } => x !== null);

    if (taskUpdates.length === 0) {
      setActiveModal(null);
      setEditTaskWeightsMilestoneId(null);
      setTaskWeightsDraft({});
      alert('No se detectaron cambios en los pesos de las tareas.');
      return;
    }

    try {
      for (const update of taskUpdates) {
        await onUpdateTask(update.id, { weight: update.weight });
      }
      setActiveModal(null);
      setEditTaskWeightsMilestoneId(null);
      setTaskWeightsDraft({});
      alert('Pesos de tareas guardados correctamente.');
    } catch (error) {
      console.error('Error al guardar los pesos de tareas:', error);
      alert('No se pudo guardar los pesos de tareas. Intente de nuevo.');
    }
  };

  const projectActivities = useMemo(() => {
    const activities: any[] = [];
    
    // Task Logs
    taskLogs.filter(log => projectTasks.some(t => t.id === log.taskId)).forEach(log => {
      const task = projectTasks.find(t => t.id === log.taskId);
      activities.push({
        id: log.id,
        date: log.date,
        type: 'Tarea',
        description: `Actualización en "${task?.name}": ${log.comment} (${log.previousProgress}% -> ${log.newProgress}%)`,
        user: mockUsers.find(u => u.id === log.userId)?.name,
        icon: '📝'
      });
    });

    // Change Requests
    projectChangeRequests.forEach(cr => {
      const task = projectTasks.find(t => t.id === cr.taskId);
      activities.push({
        id: cr.id,
        date: cr.requestedDate,
        type: 'Control de Cambios',
        description: `Solicitud de reprogramación para "${task?.name}": ${cr.justification} [${cr.status}]`,
        user: mockUsers.find(u => u.id === cr.requestedBy)?.name,
        icon: '🔄'
      });
    });

    // Expenses
    projectExpenses.forEach(exp => {
      activities.push({
        id: exp.id,
        date: exp.date,
        type: 'Gasto',
        description: `Registro de gasto: ${exp.description} ($${exp.amount.toLocaleString()})`,
        user: 'Sistema',
        icon: '💰'
      });
    });

    const formatHistoryDetails = (h: any) => {
      if (!h.details) return '';
      const d = h.details;

      const simple = (obj: any) => Object.entries(obj)
        .map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`)
        .join(' | ');

      switch (h.entity) {
        case 'Project':
          return `Proyecto: ${d.project?.name ?? d.name ?? 'N/A'} | Estado: ${d.project?.status ?? d.status ?? 'N/A'}`;
        case 'Task':
          return `Tarea: ${d.task?.name ?? d.name ?? h.entityId} | Estado: ${d.task?.status ?? d.status ?? 'N/A'} | Progreso: ${d.task?.progress ?? d.progress ?? 'N/A'}%`;
        case 'Milestone':
          return `Hito: ${d.milestone?.name ?? d.name ?? h.entityId} | Estado: ${d.milestone?.status ?? d.status ?? 'N/A'}`;
        case 'Expense':
          return `Gasto: ${d.expense?.description ?? d.description ?? 'N/A'} | Monto: $${d.expense?.amount ?? d.amount ?? 'N/A'}`;
        case 'Risk':
          return `Riesgo: ${d.risk?.description ?? d.description ?? 'N/A'} | Probabilidad: ${d.risk?.probability ?? d.probability ?? 'N/A'}`;
        case 'Stakeholder':
          return `Stakeholder: ${d.stakeholder?.name ?? d.name ?? 'N/A'} | Rol: ${d.stakeholder?.role ?? d.role ?? 'N/A'}`;
        case 'ChangeRequest':
          return `Cambio: ${d.changeRequest?.justification ?? d.justification ?? 'N/A'} | Estado: ${d.changeRequest?.status ?? d.status ?? 'N/A'}`;
        case 'TaskLog':
          return `Log de tarea: ${d.taskLog?.comment ?? d.comment ?? 'N/A'} | Progreso: ${d.taskLog?.newProgress ?? d.newProgress ?? 'N/A'}%`;
        default:
          return simple(d);
      }
    };

    // Project History events (audit log)
    projectHistory.filter(h => h.projectId === id).forEach(h => {
      activities.push({
        id: h.id,
        date: h.createdAt,
        type: `${h.entity} ${h.action}`,
        description: `${h.action} ${h.entity} ${h.details ? ' - ' + formatHistoryDetails(h) : ''}`,
        user: h.userId || 'Sistema',
        icon: '📘'
      });
    });

    return activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [taskLogs, projectChangeRequests, projectExpenses, projectTasks, projectHistory]);

  if (!project) return (
    <div className="page">
      <div className="card empty-state">
        <h3>Proyecto no encontrado</h3>
        <p className="text-muted">El ID del proyecto no existe o no tiene permisos para verlo.</p>
        <Link to="/projects" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>Volver a Proyectos</Link>
      </div>
    </div>
  );

  const handleApproveProject = () => {
    let nextStatus: ProjectStatus = project.status;
    if (project.status === 'Pending Initial Approval') nextStatus = 'Planning';
    if (project.status === 'Charter Approval') nextStatus = 'Active';
    
    onUpdateProject(project.id, { status: nextStatus });
  };

  const handleSendToCharter = () => {
    if (totalWeight !== 100) {
      alert("La suma de pesos debe ser exactamente 100%");
      return;
    }
    onUpdateProject(project.id, { status: 'Charter Approval' });
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
          {currentUser.role === 'PMO' && project.status === 'Draft' && (
            <button
              className="btn btn-primary"
              onClick={() => alert('Solicitud enviada: por favor, el Project Manager debe completar la información y enviar el charter al sponsor.')}
            >
              Solicitar al PM registro de información
            </button>
          )}
          {currentUser.id === project.pmId && (project.status === 'Draft' || project.status === 'Planning') && (
            <button className="btn btn-primary" onClick={handleSendToCharter}>Enviar Charter a Sponsor</button>
          )}
          {getProjectSponsorIds(project).includes(currentUser.id) && project.status === 'Charter Approval' && (
            <button className="btn btn-success" onClick={() => onUpdateProject(project.id, { status: 'Active', rejectionComments: '' })}>Aprobar Project Charter</button>
          )}
          <button className="btn btn-secondary">
            <FileText size={18} />
            Exportar PDF
          </button>
        </div>
      </header>

      <div className="tabs">
        <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Vista General</button>
        <button className={`tab-btn ${activeTab === 'schedule' ? 'active' : ''}`} onClick={() => setActiveTab('schedule')}>Gestión del Cronograma</button>
        <button className={`tab-btn ${activeTab === 'costs' ? 'active' : ''}`} onClick={() => setActiveTab('costs')}>Costos</button>
        <button className={`tab-btn ${activeTab === 'gantt' ? 'active' : ''}`} onClick={() => setActiveTab('gantt')}>Cronograma (Gantt)</button>
        <button className={`tab-btn ${activeTab === 'risks' ? 'active' : ''}`} onClick={() => setActiveTab('risks')}>Riesgos</button>
        <button className={`tab-btn ${activeTab === 'stakeholders' ? 'active' : ''}`} onClick={() => setActiveTab('stakeholders')}>Interesados</button>
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
                <h3>Planificación</h3>
                {(currentUser.role === 'PM' || currentUser.role === 'PMO') && (
                  <button className="btn btn-secondary btn-sm" onClick={() => setActiveModal('budgetLine')}>+ Línea de Presupuesto</button>
                )}
              </div>
              <table className="data-table">
                <thead>
                  <tr><th>Tipo</th><th>Categoría</th><th>Descripción</th><th>Monto Planeado</th><th>Estado</th></tr>
                </thead>
                <tbody>
                  {project.budgetLines?.map(bl => (
                    <tr key={bl.id}>
                      <td><span className={`badge ${bl.budgetType === 'CAPEX' ? 'badge-primary' : 'badge-secondary'}`}>{bl.budgetType}</span></td>
                      <td><span className="badge badge-secondary">{bl.category}</span></td>
                      <td>{bl.description}</td>
                      <td>${bl.plannedAmount.toLocaleString()}</td>
                      <td><span className={`badge badge-${bl.status.toLowerCase()}`}>{bl.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="card">
              <div className="section-header">
                <h3>Ejecución (Gastos Reales)</h3>
                <button className="btn btn-secondary btn-sm" onClick={() => setActiveModal('expense')}>+ Registrar Gasto</button>
              </div>
              <table className="data-table">
                <thead>
                  <tr><th>Fecha</th><th>Línea Presup.</th><th>Descripción</th><th>Monto</th><th>Estado</th></tr>
                </thead>
                <tbody>
                  {projectExpenses.map(e => {
                    const budgetLine = project.budgetLines?.find(bl => bl.id === e.budgetLineId);
                    return (
                      <tr key={e.id}>
                        <td>{e.date}</td>
                        <td><span className="text-muted" style={{ fontSize: '0.75rem' }}>{budgetLine?.description || 'N/A'}</span></td>
                        <td>{e.description}</td>
                        <td>${e.amount.toLocaleString()}</td>
                        <td><span className={`badge badge-${e.status.toLowerCase()}`}>{e.status}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'overview' && (
        <div className="project-detail-grid">
          <div className="main-content">
            {/* PANEL DE FEEDBACK DE RECHAZO PARA EL PM */}
            {project.status === 'Draft' && project.rejectionComments && project.pmId === currentUser.id && (
              <div className="card" style={{ border: '2px solid var(--error)', backgroundColor: '#fef2f2', marginBottom: '2rem' }}>
                <h3 style={{ color: 'var(--error)', margin: 0 }}>⚠️ Ajustes Solicitados por el Sponsor</h3>
                <p style={{ margin: '0.5rem 0', fontWeight: 600 }}>Comentarios: "{project.rejectionComments}"</p>
                <p style={{ margin: 0, fontSize: '0.875rem' }}>Por favor, realice las modificaciones y vuelva a enviar el Charter.</p>
              </div>
            )}

            {/* PANEL DE APROBACIÓN DEL SPONSOR */}
            {project.status === 'Charter Approval' && getProjectSponsorIds(project).includes(currentUser.id) && (
              <div className="card" style={{ border: '2px solid var(--accent)', backgroundColor: '#eff6ff', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ color: 'var(--primary)', margin: 0 }}>📋 Decisión del Project Charter</h3>
                    <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem' }}>Como Sponsor, debe validar si el alcance, presupuesto y cronograma propuestos son correctos para iniciar la ejecución.</p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button 
                      className="btn btn-error" 
                      onClick={() => setActiveModal('rejection')}
                    >
                      Rechazar / Solicitar Ajustes
                    </button>
                    <button 
                      className="btn btn-success" 
                      onClick={() => {
                        onUpdateProject(project.id, { status: 'Active', rejectionComments: '' });
                        alert("¡Project Charter Aprobado! El proyecto ahora está en fase de ejecución.");
                      }}
                    >
                      Aprobar e Iniciar Proyecto
                    </button>
                  </div>
                </div>
              </div>
            )}

            <PMBOKHealthDashboard project={project} milestones={projectMilestones} tasks={projectTasks} expenses={projectExpenses} />
            
            <div className="card" style={{ marginBottom: '2rem' }}>
              <div className="section-header">
                <h3>Dashboard de Hitos</h3>
                <span className="badge badge-active">
                  {projectMilestones.filter(m => m.status === 'Completed').length} / {projectMilestones.length} Completados
                </span>
              </div>
              <div className="milestone-dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                {projectMilestones.map(m => (
                  <div key={m.id} className="card" style={{ padding: '1.25rem', borderLeft: `4px solid ${m.status === 'Completed' ? 'var(--success)' : (m.status === 'In Progress' ? 'var(--accent)' : 'var(--border)')}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{m.name}</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Peso: {m.weight}%</span>
                    </div>
                    <div className="progress-bar-container" style={{ margin: '0.5rem 0', height: '10px' }}>
                      <div 
                        className={`progress-bar ${m.status === 'Completed' ? 'bg-success' : 'bg-accent'}`} 
                        style={{ width: `${m.progress}%` }}
                      ></div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.75rem' }}>
                      <span className="text-muted">{m.startDate} - {m.endDate}</span>
                      <span style={{ fontWeight: 700 }}>{m.progress}%</span>
                    </div>
                  </div>
                ))}
                {projectMilestones.length === 0 && (
                  <div className="empty-state" style={{ gridColumn: '1 / -1', padding: '2rem' }}>
                    No hay hitos definidos para este proyecto.
                  </div>
                )}
              </div>
            </div>

            <div className="card info-card">
              <h3>Project Charter </h3>
              <div className="info-grid">
                <div className="info-item"><span className="label">Presupuesto (BAC)</span><span>${project.budget.toLocaleString()}</span></div>
                <div className="info-item"><span className="label">PM Responsable</span><span>Juan PM</span></div>
                <div className="info-item"><span className="label">Fecha Inicio</span><span>{project.startDate}</span></div>
                <div className="info-item"><span className="label">Fecha Fin</span><span>{project.endDate}</span></div>
              </div>
              
              <div className="charter-details" style={{ marginTop: '1.5rem', display: 'grid', gap: '1rem' }}>
                <div>
                  <h4 className="label" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>CASO DE NEGOCIO</h4>
                  <p style={{ fontSize: '0.875rem' }}>{project.businessCase || 'No definido'}</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <h4 className="label" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>SUPUESTOS</h4>
                    <p style={{ fontSize: '0.875rem' }}>{project.assumptions || 'Ninguno'}</p>
                  </div>
                  <div>
                    <h4 className="label" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>RESTRICCIONES</h4>
                    <p style={{ fontSize: '0.875rem' }}>{project.constraints || 'Ninguna'}</p>
                  </div>
                </div>
                <div>
                  <h4 className="label" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>OBJETIVO GENERAL</h4>
                  <p style={{ fontSize: '0.875rem' }}>{project.generalObjective || 'No definido'}</p>
                </div>
                {project.specificObjectives && project.specificObjectives.length > 0 && (
                  <div>
                    <h4 className="label" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>OBJETIVOS ESPECÍFICOS</h4>
                    <ul style={{ paddingLeft: '1.2rem', marginTop: '0.5rem' }}>
                      {project.specificObjectives.map(so => (
                        <li key={so.id} style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                          <strong>{so.description}</strong>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            KPI: {so.kpi} | Éxito: {so.successCriteria}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            <div className="card">
              <h3>Alineación Estratégica</h3><p>{project.strategicAlignment || 'No definida'}</p>
            </div>

            <div className="card" style={{ marginTop: '2rem' }}>
              <div className="section-header">
                <h3>Ejecución Presupuestaria por Línea</h3>
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Línea de Presupuesto</th>
                    <th>Planeado</th>
                    <th>Ejecutado</th>
                    <th>Varianza</th>
                    <th>% Ejecución</th>
                  </tr>
                </thead>
                <tbody>
                  {project.budgetLines?.map(bl => {
                    const lineSpent = projectExpenses
                      .filter(e => e.budgetLineId === bl.id && (e.status === 'Paid' || e.status === 'Approved'))
                      .reduce((sum, e) => sum + e.amount, 0);
                    const lineVariance = bl.plannedAmount - lineSpent;
                    const executionPct = (lineSpent / bl.plannedAmount) * 100;
                    
                    return (
                      <tr key={bl.id}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{bl.description}</div>
                          <div className="text-muted" style={{ fontSize: '0.7rem' }}>{bl.category}</div>
                        </td>
                        <td>${bl.plannedAmount.toLocaleString()}</td>
                        <td className={lineSpent > bl.plannedAmount ? 'text-error' : ''}>
                          ${lineSpent.toLocaleString()}
                        </td>
                        <td className={lineVariance < 0 ? 'text-error' : 'text-success'}>
                          {lineVariance < 0 ? '-' : '+'}${Math.abs(lineVariance).toLocaleString()}
                        </td>
                        <td style={{ minWidth: '120px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div className="progress-bar-container" style={{ flex: 1, margin: 0, height: '6px' }}>
                              <div 
                                className={`progress-bar ${executionPct > 100 ? 'bg-error' : 'bg-success'}`} 
                                style={{ width: `${Math.min(executionPct, 100)}%` }}
                              ></div>
                            </div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{executionPct.toFixed(0)}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {(!project.budgetLines || project.budgetLines.length === 0) && (
                    <tr><td colSpan={5} className="text-muted" style={{ textAlign: 'center' }}>No hay líneas de presupuesto definidas.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <aside className="side-content">
            <div className="card progress-card">
              <h3>Avance Global</h3>
              <div className="progress-bar-container"><div className="progress-bar" style={{ width: `${calculatedProjectProgress}%` }}></div></div>
              <p className="progress-text">{calculatedProjectProgress}% Completado</p>
            </div>

            <div className="card" style={{ marginTop: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={18} /> Historial de Actividades
              </h3>
              <div className="activity-timeline" style={{ display: 'grid', gap: '1rem', maxHeight: '520px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                {projectActivities.length > 0 ? projectActivities.map(activity => {
                  const entity = activity.type.split(' ')[0];
                  const colorMap: Record<string, string> = {
                    Project: '#1366d6',
                    Task: '#1f7a36',
                    Milestone: '#b45309',
                    Expense: '#9d174d',
                    Risk: '#7c3aed',
                    Stakeholder: '#0f766e',
                    ChangeRequest: '#d97706',
                    TaskLog: '#0f4a96',
                    Issue: '#991b1b'
                  };
                  const tagColor = colorMap[entity] || '#6b7280';

                  return (
                    <div key={activity.id} style={{ border: '1px solid #e5e7eb', borderRadius: '10px', backgroundColor: '#fff', padding: '0.85rem', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', display: 'flex', gap: '0.8rem', alignItems: 'flex-start', position: 'relative' }}>
                      <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', backgroundColor: tagColor, color: '#fff', display: 'grid', placeItems: 'center', fontSize: '0.85rem', fontWeight: 700, boxShadow: '0 1px 2px rgba(0,0,0,0.15)' }} aria-label={activity.type}>{activity.icon}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <span style={{ fontWeight: 700, color: '#111827', fontSize: '0.88rem' }}>{activity.type}</span>
                          <span style={{ fontSize: '0.72rem', color: '#6b7280', minWidth: '80px', textAlign: 'right' }}>{activity.date}</span>
                        </div>
                        <p style={{ margin: 0, lineHeight: 1.5, color: '#374151', fontSize: '0.83rem' }}>{activity.description}</p>
                        <span style={{ marginTop: '0.45rem', display: 'inline-block', fontSize: '0.72rem', color: '#6b7280', fontStyle: 'italic' }}>Por: {activity.user}</span>
                      </div>
                    </div>
                  );
                }) : (
                  <p className="text-muted" style={{ textAlign: 'center' }}>No hay actividades registradas.</p>
                )}
              </div>
            </div>
          </aside>
        </div>
      )}

      {activeTab === 'schedule' && (
        <div className="schedule-management-view">
          <div className="card" style={{ marginBottom: '2rem' }}>
            <div className="section-header">
              <div style={{ flex: 1 }}>
                <h3>Gestión del Cronograma (Hitos y Tareas)</h3>
                {totalWeight !== 100 && (
                  <div style={{ backgroundColor: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '4px', padding: '0.75rem', marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#991b1b' }}>⚠️ La suma de pesos es {totalWeight}%. Debe ser exactamente 100% para enviar a aprobación.</span>
                    <button className="btn btn-sm" style={{ backgroundColor: '#dc2626', color: 'white', marginLeft: '1rem' }} onClick={() => setActiveModal('editWeights')}>Editar Pesos</button>
                  </div>
                )}
                {totalWeight === 100 && (
                  <p className="text-muted" style={{ fontSize: '0.8rem' }}>Suma de pesos: <span className='text-success' style={{ fontWeight: 700 }}>✓ {totalWeight}%</span></p>
                )}
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {(currentUser.role === 'PM' || currentUser.role === 'PMO') && (
                  <button className="btn btn-primary btn-sm" onClick={() => setActiveModal('milestone')}>+ Nuevo Hito</button>
                )}
              </div>
            </div>

            <div className="milestone-task-hierarchy" style={{ marginTop: '1.5rem', display: 'grid', gap: '1.5rem' }}>
              {projectMilestones.sort((a,b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()).map(m => {
                const mTasks = projectTasks.filter(t => t.milestoneId === m.id);
                const mTasksWeight = mTasks.reduce((sum, t) => sum + t.weight, 0);
                return (
                  <div key={m.id} className="milestone-group card" style={{ padding: 0, border: '1px solid var(--border)', overflow: 'hidden' }}>
                    <div className="milestone-header" style={{ backgroundColor: '#f8fafc', padding: '1rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div className={`dot dot-${m.status === 'Completed' ? 'success' : 'accent'}`}></div>
                          <div>
                            <h4 style={{ margin: 0, fontSize: '1rem' }}>{m.name} <span className="text-muted" style={{ fontWeight: 400, fontSize: '0.8rem' }}>({m.weight}%)</span></h4>
                            <p className="text-muted" style={{ margin: '0.25rem 0 0', fontSize: '0.75rem' }}>{m.startDate} al {m.endDate}</p>
                            <p className={mTasksWeight === 100 ? 'text-success' : 'text-error'} style={{ margin: '0.2rem 0 0', fontSize: '0.75rem' }}>Peso de tareas: {mTasksWeight}%</p>
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <div style={{ textAlign: 'right', marginRight: '1rem' }}>
                          <div style={{ fontSize: '0.75rem', fontWeight: 700 }}>{m.progress}%</div>
                          <div className="progress-bar-container" style={{ width: '80px', height: '6px', margin: 0 }}>
                            <div className="progress-bar" style={{ width: `${m.progress}%` }}></div>
                          </div>
                        </div>
                        {mTasksWeight !== 100 && (
                          <button className="btn btn-error btn-xs" onClick={() => {
                            const draft: Record<string, number> = {};
                            mTasks.forEach(t => { draft[t.id] = t.weight; });
                            setTaskWeightsDraft(draft);
                            setEditTaskWeightsMilestoneId(m.id);
                            setActiveModal('editTaskWeights');
                          }}>Ajustar pesos</button>
                        )}
                        <button className="btn btn-secondary btn-xs" onClick={() => { setSelectedMilestoneId(m.id); setActiveModal('task'); }}>+ Tarea</button>
                        <button className="btn-icon" onClick={() => onDeleteMilestone(m.id)}>×</button>
                      </div>
                    </div>
                    
                    <div className="milestone-content" style={{ padding: '0.5rem' }}>
                      <table className="data-table" style={{ fontSize: '0.875rem' }}>
                        <thead>
                          <tr>
                            <th>Tarea</th>
                            <th>Responsable</th>
                            <th>Peso</th>
                            <th>Fechas</th>
                            <th style={{ width: '150px' }}>Avance</th>
                            <th>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {mTasks.map(t => {
                            const user = mockUsers.find(u => u.id === t.assignedTo);
                            return (
                              <tr key={t.id}>
                                <td>
                                  <div style={{ fontWeight: 600 }}>{t.name}</div>
                                  <span className={`badge badge-${t.priority.toLowerCase()}`} style={{ fontSize: '0.6rem', padding: '1px 4px' }}>{t.priority}</span>
                                </td>
                                <td>{user?.name || '---'}</td>
                                <td style={{ fontWeight: 600, textAlign: 'center' }}>{t.weight}%</td>
                                <td style={{ fontSize: '0.75rem' }}>{t.startDate} <br/> {t.endDate}</td>
                                <td>
                                  <div className="progress-bar-container" style={{ margin: '0.35rem 0', height: '8px' }}>
                                    <div className="progress-bar" style={{ width: `${t.progress}%` }}></div>
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.3rem' }}>
                                    <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{t.progress}%</span>
                                  </div>
                                </td>
                                <td>
                                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                                    <button className="btn btn-secondary btn-xs" onClick={() => { setSelectedTask(t); setActiveModal('taskHistory'); }}>Log</button>
                                    <button className="btn btn-secondary btn-xs" onClick={() => { setSelectedTask(t); setActiveModal('changeRequest'); }}>📅</button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                          {mTasks.length === 0 && (
                            <tr><td colSpan={6} style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>Sin tareas asignadas.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

          <div className="card">
            <h3 style={{ marginBottom: '1.5rem' }}>Solicitudes de Cambio y Reprogramaciones</h3>
            {projectChangeRequests.length > 0 ? (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Tarea</th>
                    <th>Cambio de Fechas</th>
                    <th>Justificación</th>
                    <th>Solicitado por</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {projectChangeRequests.map(cr => (
                    <tr key={cr.id}>
                      <td>{projectTasks.find(t => t.id === cr.taskId)?.name}</td>
                      <td>
                        <div style={{ fontSize: '0.75rem' }}>
                          <span className="text-muted">Actual:</span> {cr.originalEndDate}<br/>
                          <span className="text-accent" style={{ fontWeight: 600 }}>Nueva:</span> {cr.newEndDate}
                        </div>
                      </td>
                      <td style={{ maxWidth: '300px', fontSize: '0.8rem' }}>{cr.justification}</td>
                      <td>{mockUsers.find(u => u.id === cr.requestedBy)?.name}</td>
                      <td><span className={`badge badge-${cr.status.toLowerCase()}`}>{cr.status}</span></td>
                      <td>
                        {cr.status === 'Pending' && (
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className="btn btn-success btn-sm" onClick={() => onProcessCR(cr.id, 'Approved')}>Aprobar</button>
                            <button className="btn btn-error btn-sm" onClick={() => onProcessCR(cr.id, 'Rejected')}>Rechazar</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-muted" style={{ textAlign: 'center', padding: '1rem' }}>No hay solicitudes de cambio en este proyecto.</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'gantt' && (
        <div className="schedule-module">
          <div className="card" style={{ marginBottom: '1rem', padding: '1rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <button 
              className={`btn ${scheduleView === 'gantt' ? 'btn-primary' : 'btn-secondary'}`} 
              onClick={() => setScheduleView('gantt')}
            >
              📊 Vista Gantt
            </button>
            <button 
              className={`btn ${scheduleView === 'calendar' ? 'btn-primary' : 'btn-secondary'}`} 
              onClick={() => setScheduleView('calendar')}
            >
              📅 Vista Calendario
            </button>
          </div>
          
          {scheduleView === 'gantt' ? (
            <GanttChart milestones={projectMilestones} tasks={projectTasks} />
          ) : (
            <CalendarView milestones={projectMilestones} tasks={projectTasks} />
          )}
        </div>
      )}

      {activeTab === 'risks' && (
        <RiskRegistry 
          risks={projectRisks} 
          onAddRisk={(r) => onAddRisk(project.id, r)} 
          onOpenModal={() => setActiveModal('risk')} 
          onOpenActionModal={() => setActiveModal('riskAction')}
          setSelectedRisk={setSelectedRisk}
        />
      )}
      
      {activeTab === 'stakeholders' && <StakeholderMatrix stakeholders={projectStakeholders} onOpenModal={() => setActiveModal('stakeholder')} />}

      {activeTab === 'sppm' && (
        <SPPMReport 
          project={project} 
          expenses={expenses} 
          milestones={milestones}
          tasks={tasks}
          snapshots={snapshots}
          onAddSnapshot={onAddSnapshot}
          risks={risks}
          stakeholders={stakeholders}
        />
      )}

      {/* MODALES DE FORMULARIOS */}
      <Modal 
        isOpen={activeModal === 'milestone'} 
        onClose={() => setActiveModal(null)}
        title="Nuevo Hito"
      >
        <form onSubmit={(e) => {
          e.preventDefault();
          const target = e.target as any;
          onAddMilestone(
            project.id, 
            target.name.value, 
            Number(target.weight.value),
            target.startDate.value,
            target.endDate.value
          );
          setActiveModal(null);
        }}>
          <div className="form-group">
            <label>Nombre del Hito</label>
            <input name="name" type="text" required placeholder="Ej: Fase de Diseño" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Fecha Inicio</label>
              <input name="startDate" type="date" required />
            </div>
            <div className="form-group">
              <label>Fecha Fin</label>
              <input name="endDate" type="date" required />
            </div>
          </div>
          <div className="form-group">
            <label>Peso (%)</label>
            <input name="weight" type="number" required min="1" max="100" />
          </div>
          <button type="submit" className="btn btn-primary btn-block">Añadir Hito</button>
        </form>
      </Modal>

      <Modal 
        isOpen={activeModal === 'task'} 
        onClose={() => setActiveModal(null)}
        title="Nueva Tarea"
      >
        <form onSubmit={(e) => {
          e.preventDefault();
          const target = e.target as any;
          const milestoneId = selectedMilestoneId || projectMilestones[0]?.id;
          if (!milestoneId) {
            alert('No se encontró un hito válido para asociar la tarea.');
            return;
          }
          onAddTask(milestoneId, { 
            name: target.name.value, 
            assignedTo: target.assignedTo.value, 
            priority: target.priority.value,
            startDate: target.startDate.value,
            endDate: target.endDate.value,
            weight: parseInt(target.weight.value) || 0,
            predecessorId: target.predecessorId.value || undefined
          });
          setActiveModal(null);
          setSelectedMilestoneId(null);
        }}>
          <input type="hidden" name="milestoneId" value={selectedMilestoneId || projectMilestones[0]?.id || ''} />
          <div className="form-group">
            <label>Hito</label>
            <input type="text" value={projectMilestones.find(m => m.id === (selectedMilestoneId || projectMilestones[0]?.id))?.name || 'Sin hito'} readOnly />
          </div>
          <div className="form-group">
            <label>Nombre de la Tarea</label>
            <input name="name" type="text" required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Peso en Hito (%)</label>
              <input name="weight" type="number" min="1" max="100" required placeholder="Ej: 20" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Fecha Inicio</label>
              <input name="startDate" type="date" required />
            </div>
            <div className="form-group">
              <label>Fecha Fin</label>
              <input name="endDate" type="date" required />
            </div>
          </div>
          <div className="form-group">
            <label>Asignado a</label>
            <select name="assignedTo" required>
              {mockUsers.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Prioridad</label>
            <select name="priority">
              <option value="Low">Baja</option>
              <option value="Medium">Media</option>
              <option value="High">Alta</option>
            </select>
          </div>
          <div className="form-group">
            <label>Tarea Predecesora (Opcional)</label>
            <select name="predecessorId">
              <option value="">Ninguna</option>
              {projectTasks.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <button type="submit" className="btn btn-primary btn-block">Añadir Tarea</button>
        </form>
      </Modal>

      <Modal 
        isOpen={activeModal === 'expense'} 
        onClose={() => setActiveModal(null)}
        title="Registrar Gasto Real"
      >
        <form onSubmit={(e) => {
          e.preventDefault();
          const target = e.target as any;
          const selectedBudgetLine = project.budgetLines?.find(bl => bl.id === target.budgetLineId.value);
          onAddExpense(project.id, { 
            description: target.description.value, 
            amount: Number(target.amount.value), 
            category: selectedBudgetLine?.category || 'Others',
            budgetLineId: target.budgetLineId.value
          });
          setActiveModal(null);
        }}>
          <div className="form-group">
            <label>Relacionar a Línea de Presupuesto</label>
            <select name="budgetLineId" required>
              <option value="">Seleccione una línea...</option>
              {project.budgetLines?.map(bl => (
                <option key={bl.id} value={bl.id}>
                  {bl.description} (${bl.plannedAmount.toLocaleString()})
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Descripción del Gasto</label>
            <input name="description" type="text" required placeholder="Ej: Pago factura AWS Enero" />
          </div>
          <div className="form-group">
            <label>Monto Ejecutado ($)</label>
            <input name="amount" type="number" required />
          </div>
          <button type="submit" className="btn btn-primary btn-block">Registrar Gasto</button>
        </form>
      </Modal>

      <Modal 
        isOpen={activeModal === 'budgetLine'} 
        onClose={() => setActiveModal(null)}
        title="Nueva Línea de Presupuesto"
      >
        <form onSubmit={(e) => {
          e.preventDefault();
          const target = e.target as any;
          onAddBudgetLine(project.id, { 
            description: target.description.value, 
            plannedAmount: Number(target.amount.value), 
            category: target.category.value,
            budgetType: target.budgetType.value
          });
          setActiveModal(null);
        }}>
          <div className="form-row">
            <div className="form-group">
              <label>Categoría</label>
              <select name="category" required>
                <option value="Hardware">Hardware</option>
                <option value="Software">Software</option>
                <option value="Services">Servicios</option>
                <option value="Labor">Mano de Obra</option>
                <option value="Others">Otros</option>
              </select>
            </div>
            <div className="form-group">
              <label>Tipo de Presupuesto</label>
              <select name="budgetType" required>
                <option value="CAPEX">CAPEX (Inversión)</option>
                <option value="OPEX">OPEX (Gasto Operativo)</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Descripción</label>
            <input name="description" type="text" required />
          </div>
          <div className="form-group">
            <label>Monto Planeado ($)</label>
            <input name="amount" type="number" required />
          </div>
          <button type="submit" className="btn btn-primary btn-block">Guardar Línea</button>
        </form>
      </Modal>

      <TaskHistoryModal 
        isOpen={activeModal === 'taskHistory'} 
        onClose={() => setActiveModal(null)} 
        task={selectedTask} 
        logs={taskLogs} 
        onAddLog={onAddTaskLog}
        currentUser={currentUser}
        changeRequests={changeRequests}
      />

      <ChangeRequestModal 
        isOpen={activeModal === 'changeRequest'} 
        onClose={() => setActiveModal(null)} 
        task={selectedTask} 
        onAddCR={onChangeRequest}
        currentUser={currentUser}
      />

      <Modal 
        isOpen={activeModal === 'risk'} 
        onClose={() => setActiveModal(null)}
        title="Identificar Nuevo Riesgo"
      >
        <form onSubmit={(e) => {
          e.preventDefault();
          const target = e.target as any;
          onAddRisk(project.id, {
            description: target.description.value,
            probability: Number(target.probability.value),
            impact: Number(target.impact.value),
            category: target.category.value,
            strategy: target.strategy.value,
          });
          setActiveModal(null);
        }}>
          <div className="form-group">
            <label>Descripción del Riesgo</label>
            <textarea name="description" required placeholder="Ej: Retraso en entrega de hardware crítico..." />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Probabilidad (0.1 a 1.0)</label>
              <input name="probability" type="number" step="0.1" min="0.1" max="1" required defaultValue="0.5" />
            </div>
            <div className="form-group">
              <label>Impacto (0.1 a 1.0)</label>
              <input name="impact" type="number" step="0.1" min="0.1" max="1" required defaultValue="0.5" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Categoría</label>
              <select name="category" required>
                <option value="Time">Tiempo</option>
                <option value="Cost">Costo</option>
                <option value="Scope">Alcance</option>
                <option value="Resources">Recursos</option>
              </select>
            </div>
            <div className="form-group">
              <label>Estrategia PMBOK</label>
              <select name="strategy" required>
                <option value="Mitigate">Mitigar</option>
                <option value="Avoid">Evitar</option>
                <option value="Transfer">Transferir</option>
                <option value="Accept">Aceptar</option>
              </select>
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-block">Registrar en Risk Register</button>
        </form>
      </Modal>

      <Modal 
        isOpen={activeModal === 'stakeholder'} 
        onClose={() => setActiveModal(null)}
        title="Agregar Nuevo Interesado"
      >
        <form onSubmit={(e) => {
          e.preventDefault();
          const target = e.target as any;
          onAddStakeholder(project.id, {
            userId: target.userId.value,
            power: target.power.value,
            interest: target.interest.value,
            influenceStrategy: target.influenceStrategy.value,
          });
          setActiveModal(null);
        }}>
          <div className="form-group">
            <label>Seleccionar Usuario</label>
            <select name="userId" required>
              <option value="">Seleccione...</option>
              {mockUsers.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Poder (Power)</label>
              <select name="power" required>
                <option value="Low">Bajo</option>
                <option value="High">Alto</option>
              </select>
            </div>
            <div className="form-group">
              <label>Interés (Interest)</label>
              <select name="interest" required>
                <option value="Low">Bajo</option>
                <option value="High">Alto</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Estrategia de Influencia</label>
            <textarea name="influenceStrategy" required placeholder="Ej: Mantener informado vía reportes semanales..." />
          </div>
          <button type="submit" className="btn btn-primary btn-block">Guardar en Matriz</button>
        </form>
      </Modal>

      <RiskActionModal 
        isOpen={activeModal === 'riskAction'} 
        onClose={() => setActiveModal(null)} 
        risk={selectedRisk} 
        actions={riskActions} 
        onAddAction={onAddRiskAction} 
        onUpdateActionStatus={onUpdateRiskActionStatus} 
      />

      <Modal
        isOpen={activeModal === 'editWeights'}
        onClose={() => setActiveModal(null)}
        title="Editar Pesos de Hitos"
      >
        <div style={{ marginBottom: '1rem' }}>
          <p style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>Ajuste los pesos de los hitos para que la suma sea exactamente 100%.</p>
          <div style={{ display: 'grid', gap: '0.75rem', maxHeight: '400px', overflowY: 'auto' }}>
            {projectMilestones.map(m => (
              <div key={m.id} style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: '0.5rem', alignItems: 'center', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <label style={{ fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>{m.name}</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="100" 
                    value={m.weight}
                    onChange={(e) => onUpdateMilestone(m.id, { weight: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)' }}
                  />
                </div>
                <div style={{ textAlign: 'right', paddingTop: '1.5rem' }}>
                  <span style={{ fontWeight: 700 }}>{m.weight}%</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#f0fdf4', borderRadius: '4px', border: '1px solid #86efac' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: totalWeight === 100 ? '#22c55e' : '#ef4444' }}>Total: {totalWeight}%</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
          <button className="btn btn-secondary" onClick={() => setActiveModal(null)}>Cancelar</button>
          <button className="btn btn-primary" disabled={totalWeight !== 100} onClick={() => {
            alert('Pesos guardados correctamente.');
            setActiveModal(null);
          }}>Guardar Cambios</button>
        </div>
      </Modal>

      <Modal
        isOpen={activeModal === 'editTaskWeights'}
        onClose={() => { setActiveModal(null); setEditTaskWeightsMilestoneId(null); }}
        title={`Editar Pesos de Tareas - ${editTaskWeightsMilestone?.name || ''}`}
      >
        <div style={{ marginBottom: '1rem' }}>
          <p style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>Ajuste los pesos de las tareas para que la suma sea exactamente 100%.</p>
          <div style={{ display: 'grid', gap: '0.75rem', maxHeight: '400px', overflowY: 'auto' }}>
            {editTaskWeightsTasks.map(task => (
              <div key={task.id} style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: '0.5rem', alignItems: 'center', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <label style={{ fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>{task.name}</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={taskWeightsDraft[task.id] ?? task.weight}
                    onChange={(e) => setTaskWeightsDraft(prev => ({ ...prev, [task.id]: Number(e.target.value) }))}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)' }}
                  />
                </div>
                <div style={{ textAlign: 'right', paddingTop: '1.5rem' }}>
                  <span style={{ fontWeight: 700 }}>{taskWeightsDraft[task.id] ?? task.weight}%</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#f0fdf4', borderRadius: '4px', border: '1px solid #86efac' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: editTaskWeightTotal === 100 ? '#22c55e' : '#ef4444' }}>Total: {editTaskWeightTotal}%</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
          <button className="btn btn-secondary" onClick={() => { setActiveModal(null); setEditTaskWeightsMilestoneId(null); }}>Cancelar</button>
          <button className="btn btn-primary" disabled={editTaskWeightTotal !== 100} onClick={handleSaveTaskWeights}>Guardar Cambios</button>
        </div>
      </Modal>

      <Modal
        isOpen={activeModal === 'rejection'}
        onClose={() => setActiveModal(null)}
        title="Solicitar Ajustes al Proyecto"
      >
        <div className="form-group">
          <label>Motivos del Rechazo / Ajustes Solicitados</label>
          <textarea 
            required 
            value={rejectionComment}
            onChange={(e) => setRejectionComment(e.target.value)}
            placeholder="Escriba aquí las razones por las cuales no se aprueba el Charter..."
            style={{ minHeight: '120px' }}
          />
        </div>
        <div className="form-actions" style={{ marginTop: '1rem' }}>
          <button className="btn btn-secondary" onClick={() => setActiveModal(null)}>Cancelar</button>
          <button 
            className="btn btn-error" 
            disabled={!rejectionComment.trim()}
            onClick={() => {
              onUpdateProject(project.id, { 
                status: 'Draft', 
                rejectionComments: rejectionComment 
              });
              setActiveModal(null);
              setRejectionComment('');
              alert("Proyecto devuelto a draft con los comentarios de ajuste.");
            }}
          >
            Confirmar Rechazo
          </button>
        </div>
      </Modal>
    </div>
  );
};

const MyTasksView = ({ tasks, milestones, projects, currentUser, onUpdateTask }: { 
  tasks: Task[], 
  milestones: Milestone[], 
  projects: Project[], 
  currentUser: User,
  onUpdateTask: (id: string, updates: Partial<Task>) => void
}) => {
  const [projectFilter, setProjectFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('Active');

  const myTasks = useMemo(() => {
    let filtered = tasks.filter(t => t.assignedTo === currentUser.id);
    
    if (projectFilter !== 'All') {
      filtered = filtered.filter(t => {
        const m = milestones.find(ms => ms.id === t.milestoneId);
        return m?.projectId === projectFilter;
      });
    }

    if (statusFilter === 'Active') {
      filtered = filtered.filter(t => t.status !== 'Completed');
    } else if (statusFilter === 'Completed') {
      filtered = filtered.filter(t => t.status === 'Completed');
    }

    return filtered.sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());
  }, [tasks, milestones, currentUser, projectFilter, statusFilter]);

  const tasksByProject = useMemo(() => {
    const groups: Record<string, Task[]> = {};
    myTasks.forEach(task => {
      const m = milestones.find(ms => ms.id === task.milestoneId);
      const pId = m?.projectId || 'unknown';
      if (!groups[pId]) groups[pId] = [];
      groups[pId].push(task);
    });
    return groups;
  }, [myTasks, milestones]);

  const getDaysLeft = (endDate: string) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const end = new Date(endDate);
    const diff = end.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="page" style={{ maxWidth: '1100px' }}>
      <header className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1>Mis Tareas Pendientes</h1>
          <p className="text-muted">Gestione sus asignaciones y reporte avances diarios</p>
        </div>
      </header>

      <div className="card" style={{ marginBottom: '2rem', padding: '1rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>Filtrar por Proyecto</label>
          <select value={projectFilter} onChange={e => setProjectFilter(e.target.value)} style={{ width: '100%' }}>
            <option value="All">Todos los proyectos</option>
            {projects.filter(p => p.teamMemberIds.includes(currentUser.id) || p.pmId === currentUser.id).map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <div style={{ width: '180px' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>Estado</label>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ width: '100%' }}>
            <option value="Active">Pendientes / En Curso</option>
            <option value="Completed">Completadas</option>
            <option value="All">Todas</option>
          </select>
        </div>
        <div className="stat" style={{ marginLeft: 'auto', textAlign: 'right' }}>
          <span className="text-muted" style={{ fontSize: '0.8rem' }}>Total tareas: </span>
          <span style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--primary)' }}>{myTasks.length}</span>
        </div>
      </div>

      <div className="task-groups">
        {Object.keys(tasksByProject).length > 0 ? Object.entries(tasksByProject).map(([pId, pTasks]) => {
          const project = projects.find(p => p.id === pId);
          return (
            <div key={pId} className="project-task-group" style={{ marginBottom: '2.5rem' }}>
              <h2 style={{ fontSize: '1rem', borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Briefcase size={18} /> {project?.name || 'Proyecto no especificado'}
              </h2>
              <div style={{ display: 'grid', gap: '1rem' }}>
                {pTasks.map(task => {
                  const daysLeft = getDaysLeft(task.endDate);
                  const isOverdue = daysLeft < 0 && task.status !== 'Completed';
                  const isCritical = daysLeft <= 3 && daysLeft >= 0 && task.status !== 'Completed';

                  return (
                    <div key={task.id} className="card" style={{ padding: '1rem', borderLeft: `5px solid ${task.status === 'Completed' ? 'var(--success)' : (isOverdue ? 'var(--error)' : (isCritical ? 'var(--warning)' : 'var(--accent)'))}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                            <span className={`badge badge-${task.priority.toLowerCase()}`} style={{ fontSize: '0.6rem' }}>{task.priority}</span>
                            <span className="text-muted" style={{ fontSize: '0.75rem' }}>Hito: {milestones.find(m => m.id === task.milestoneId)?.name}</span>
                          </div>
                          <h3 style={{ fontSize: '1.05rem', margin: '0 0 0.5rem 0' }}>{task.name}</h3>
                          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '0 0 1rem 0', maxWidth: '600px' }}>{task.description}</p>
                        </div>
                        
                        <div style={{ textAlign: 'right', minWidth: '120px' }}>
                          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: isOverdue ? 'var(--error)' : (isCritical ? 'var(--warning)' : 'var(--text-muted)') }}>
                            {task.status === 'Completed' ? '✅ Finalizada' : (isOverdue ? `🔴 ATRASADA (${Math.abs(daysLeft)}d)` : `⏳ Faltan ${daysLeft} días`)}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Vence: {task.endDate}</div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginTop: '0.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.4rem' }}>
                            <span>Avance reportado</span>
                            <span style={{ fontWeight: 700 }}>{task.progress}%</span>
                          </div>
                          <div className="progress-bar-container" style={{ margin: 0, height: '8px' }}>
                            <div className="progress-bar" style={{ width: `${task.progress}%` }}></div>
                          </div>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <input 
                            type="number" 
                            min="0" max="100" 
                            value={task.progress} 
                            disabled
                            style={{ width: '60px', padding: '0.25rem', textAlign: 'center', opacity: 0.45, cursor: 'not-allowed' }}
                          />
                          <button 
                            className="btn btn-secondary btn-xs"
                            disabled
                            title="Use el modal de Tareas para registrar seguimiento"
                          >
                            Registrar seguimiento
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        }) : (
          <div className="card empty-state" style={{ padding: '4rem', textAlign: 'center' }}>
            <CheckSquare size={64} style={{ margin: '0 auto 1.5rem', opacity: 0.1, color: 'var(--primary)' }} />
            <h3>No se encontraron tareas</h3>
            <p className="text-muted">Ajuste los filtros o celebre, ¡está al día con sus asignaciones!</p>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Main App Implementation ---

export default function App() {
  const [currentUser, setCurrentUser] = useState<User>(mockUsers[1]); // Default Ana PMO
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [milestones, setMilestones] = useState<Milestone[]>(mockMilestones);
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [expenses, setExpenses] = useState<Expense[]>(mockExpenses);
  const [snapshots, setSnapshots] = useState<ProjectSnapshot[]>([]);
  const [risks, setRisks] = useState<Risk[]>(mockRisks);
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>(mockStakeholders);
  const [taskLogs, setTaskLogs] = useState<TaskLog[]>(mockTaskLogs);
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>(mockChangeRequests);
  const [riskActions, setRiskActions] = useState<RiskAction[]>(mockRiskActions);
  const [issues, setIssues] = useState<Issue[]>(mockIssues);
  const [projectHistory, setProjectHistory] = useState<ProjectHistory[]>([]);

  // Load data from APIs on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [
          projectsData,
          usersData,
          milestonesData,
          tasksData,
          risksData,
          issuesData,
          expensesData,
          stakeholdersData,
          taskLogsData,
          changeRequestsData,
          projectHistoryData
        ] = await Promise.all([
          apiService.getProjects().catch(() => mockProjects),
          apiService.getUsers().catch(() => mockUsers),
          apiService.getMilestones().catch(() => mockMilestones),
          apiService.getTasks().catch(() => mockTasks),
          apiService.getRisks().catch(() => mockRisks),
          apiService.getIssues().catch(() => mockIssues),
          apiService.getExpenses().catch(() => mockExpenses),
          apiService.getStakeholders().catch(() => mockStakeholders),
          apiService.getTaskLogs().catch(() => mockTaskLogs),
          apiService.getChangeRequests().catch(() => mockChangeRequests),
          apiService.getProjectHistory().catch(() => [])
        ]);

        const normalizeProject = (project: any): Project => ({
          ...project,
          sponsorIds: project.sponsorIds ?? project.sponsors?.map((s: any) => s.sponsorId) ?? [],
          teamMemberIds: project.teamMemberIds ?? project.teamMembers?.map((t: any) => t.teamMemberId) ?? [],
          specificObjectives: project.specificObjectives ?? [],
          budgetLines: project.budgetLines ?? [],
          progress: project.progress ?? 0,
          status: project.status?.replace('_', ' ') as Project['status'] ?? 'Draft',
          startDate: project.startDate?.split?.('T')[0] ?? project.startDate ?? '',
          endDate: project.endDate?.split?.('T')[0] ?? project.endDate ?? ''
        });

        setProjects(Array.isArray(projectsData) ? projectsData.map(normalizeProject) : mockProjects);
        setMilestones(Array.isArray(milestonesData) ? milestonesData.map((m: any) => ({ ...m, startDate: m.startDate?.split?.('T')[0] ?? m.startDate ?? '', endDate: m.endDate?.split?.('T')[0] ?? m.endDate ?? '' })) : mockMilestones);
        setTasks(Array.isArray(tasksData) ? tasksData.map((t: any) => ({ ...t, startDate: t.startDate?.split?.('T')[0] ?? t.startDate ?? '', endDate: t.endDate?.split?.('T')[0] ?? t.endDate ?? '' })) : mockTasks);
        setRisks(Array.isArray(risksData) ? risksData : mockRisks);
        setIssues(Array.isArray(issuesData) ? issuesData : mockIssues);
        setExpenses(Array.isArray(expensesData) ? expensesData.map((e: any) => ({ ...e, date: e.date?.split?.('T')[0] ?? e.date ?? '' })) : mockExpenses);
        setStakeholders(Array.isArray(stakeholdersData) ? stakeholdersData : mockStakeholders);
        setTaskLogs(Array.isArray(taskLogsData) ? taskLogsData.map((log: any) => ({ ...log, date: log.date?.split?.('T')[0] ?? log.date ?? '' })) : mockTaskLogs);
        setChangeRequests(Array.isArray(changeRequestsData) ? changeRequestsData : mockChangeRequests);
        setProjectHistory(Array.isArray(projectHistoryData) ? projectHistoryData.map((h: any) => ({ ...h, createdAt: h.createdAt?.split?.('T')[0] ?? h.createdAt ?? '' })) : []);

        console.log('Loaded taskLogsData:', taskLogsData);
        console.log('Final taskLogs state:', Array.isArray(taskLogsData) ? taskLogsData.map((log: any) => ({ ...log, date: log.date?.split?.('T')[0] ?? log.date ?? '' })) : mockTaskLogs);
      } catch (error) {
        console.warn('Failed to load data from API, using mock data:', error);
        // Mock data is already set as initial state
      }
    };

    loadData();
  }, []);

  // Function to refresh project data after task log creation
  const refreshProjectData = async () => {
    try {
      const [milestonesData, tasksData, taskLogsData] = await Promise.all([
        apiService.getMilestones().catch(() => milestones),
        apiService.getTasks().catch(() => tasks),
        apiService.getTaskLogs().catch(() => taskLogs)
      ]);

      setMilestones(Array.isArray(milestonesData) ? milestonesData.map((m: any) => ({ ...m, startDate: m.startDate?.split?.('T')[0] ?? m.startDate ?? '', endDate: m.endDate?.split?.('T')[0] ?? m.endDate ?? '' })) : milestones);
      setTasks(Array.isArray(tasksData) ? tasksData.map((t: any) => ({ ...t, startDate: t.startDate?.split?.('T')[0] ?? t.startDate ?? '', endDate: t.endDate?.split?.('T')[0] ?? t.endDate ?? '' })) : tasks);
      setTaskLogs(Array.isArray(taskLogsData) ? taskLogsData.map((log: any) => ({ ...log, date: log.date?.split?.('T')[0] ?? log.date ?? '' })) : taskLogs);
    } catch (error) {
      console.error('Error refreshing project data:', error);
    }
  };

  const handleRoleChange = (role: UserRole) => {
    const user = mockUsers.find(u => u.role === role) || mockUsers[0];
    setCurrentUser(user);
  };

  const handleSaveProject = async (projectData: Partial<Project> & { sponsorId?: string }) => {
    try {
      const toSave: any = {
        name: projectData.name || 'Sin nombre',
        description: projectData.description || undefined,
        status: 'Draft',
        budget: projectData.budget ?? 0,
        startDate: projectData.startDate ? projectData.startDate : undefined,
        endDate: projectData.endDate ? projectData.endDate : undefined,
        pmId: projectData.pmId || currentUser.id,
        pmoId: projectData.pmoId || (currentUser.role === 'PMO' ? currentUser.id : undefined),
        sponsorIds: projectData.sponsorId ? [projectData.sponsorId] : undefined,
        teamMemberIds: projectData.teamMemberIds && projectData.teamMemberIds.length ? projectData.teamMemberIds : undefined,
        generalObjective: projectData.generalObjective || undefined,
        specificObjectives: projectData.specificObjectives && projectData.specificObjectives.length ? projectData.specificObjectives : undefined,
        strategicAlignment: projectData.strategicAlignment || undefined,
        businessCase: projectData.businessCase || undefined,
        assumptions: projectData.assumptions || undefined,
        constraints: projectData.constraints || undefined,
      };

      // Explicitly clear empty optional fields to avoid Prisma type errors
      Object.keys(toSave).forEach((key) => {
        if (toSave[key] === undefined) {
          delete toSave[key];
        }
      });

      const saved = await apiService.createProject(toSave);
      const normalizedSaved: Project = {
        ...saved,
        sponsorIds: saved.sponsors?.map((s: any) => s.sponsorId) || (saved.sponsorIds || []),
        teamMemberIds: saved.teamMembers?.map((tm: any) => tm.teamMemberId) || (saved.teamMemberIds || []),
        startDate: saved.startDate ? saved.startDate.split('T')[0] : '',
        endDate: saved.endDate ? saved.endDate.split('T')[0] : '',
        progress: saved.progress ?? 0,
        plannedValue: saved.plannedValue ?? 0,
        earnedValue: saved.earnedValue ?? 0,
        actualCost: saved.actualCost ?? 0,
        cpi: saved.cpi ?? 1,
        spi: saved.spi ?? 1,
      };

      setProjects(prev => [normalizedSaved, ...prev]);
      alert('Proyecto creado correctamente.');
    } catch (error) {
      console.error('Error creating project', error);
      const message = error instanceof Error ? error.message : 'Error desconocido';
      alert(`No se pudo crear el proyecto, revisa consola para detalle: ${message}`);
    }
  };

  const handleUpdateProject = (id: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const handleAddMilestone = async (projectId: string, name: string, weight: number, startDate: string, endDate: string) => {
    try {
      const payload = {
        projectId,
        name,
        description: '',
        startDate,
        endDate,
        weight,
        status: 'Pending',
        progress: 0
      };

      const createdMilestone = await apiService.createMilestone(payload);
      const normalizedMilestone: Milestone = {
        ...createdMilestone,
        startDate: createdMilestone.startDate?.split?.('T')[0] || createdMilestone.startDate || '',
        endDate: createdMilestone.endDate?.split?.('T')[0] || createdMilestone.endDate || '',
      };

      setMilestones([...milestones, normalizedMilestone]);
      alert('Hito creado y guardado en la base de datos.');
    } catch (error) {
      console.error('Error al crear hito:', error);
      alert('No se pudo guardar el hito. Intente de nuevo.');
    }
  };

  const handleDeleteMilestone = (id: string) => {
    setMilestones(milestones.filter(m => m.id !== id));
  };

  const handleUpdateMilestone = async (id: string, updates: Partial<Milestone>) => {
    const prevMilestones = [...milestones];
    setMilestones(milestones.map(m => m.id === id ? { ...m, ...updates } : m));

    try {
      const updated = await apiService.updateMilestone(id, updates);
      setMilestones(prev => prev.map(m => m.id === id ? {
        ...m,
        ...updated,
        startDate: updated.startDate?.split('T')[0] ?? updated.startDate ?? m.startDate,
        endDate: updated.endDate?.split('T')[0] ?? updated.endDate ?? m.endDate
      } : m));
    } catch (error) {
      console.error('Error updating milestone in DB:', error);
      setMilestones(prevMilestones);
      alert('No se pudo guardar el peso del hito en la base de datos. Intente de nuevo.');
    }
  };

  const handleAddTask = async (milestoneId: string, taskData: Partial<Task>) => {
    try {
      const payload = {
        milestoneId,
        name: taskData.name || 'Nueva Tarea',
        description: taskData.description || '',
        startDate: taskData.startDate || '',
        endDate: taskData.endDate || '',
        assignedTo: taskData.assignedTo || '',
        progress: 0,
        status: 'Pending',
        priority: taskData.priority || 'Medium',
        weight: taskData.weight || 0,
        predecessorId: taskData.predecessorId || undefined,
      };

      const createdTask = await apiService.createTask(payload);
      const normalizedTask: Task = {
        ...createdTask,
        startDate: createdTask.startDate?.split?.('T')[0] || createdTask.startDate || '',
        endDate: createdTask.endDate?.split?.('T')[0] || createdTask.endDate || '',
      };

      setTasks([...tasks, normalizedTask]);
      alert('Tarea creada y guardada en la base de datos.');
    } catch (error) {
      console.error('Error al crear tarea:', error);
      alert('No se pudo guardar la tarea. Intente de nuevo.');
    }
  };

  const handleUpdateTask = async (id: string, updates: Partial<Task>, fromLog: boolean = false) => {
    const taskBefore = tasks.find(t => t.id === id);
    const safeUpdates = { ...updates };
    if (!fromLog) {
      // El avance (progress) solo se modifica con TaskLog.
      delete safeUpdates.progress;
    }

    // Update local state first for instant UI response
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...safeUpdates } : t));

    // Persist update in backend whenever task changes
    try {
      await apiService.updateTask(id, safeUpdates);

      // Si hubo cambio de peso, crear registro en taskLog
      if (taskBefore && updates.weight !== undefined && updates.weight !== taskBefore.weight) {
        await handleAddTaskLog({
          taskId: id,
          userId: currentUser.id,
          comment: `Cambio de peso de tarea: ${taskBefore.weight}% → ${updates.weight}%`,
          previousProgress: taskBefore.progress,
          newProgress: taskBefore.progress,
          date: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error actualizando tarea en la API:', error);
      // Revertir a estado anterior podría implementarse si se requiere
      if (taskBefore) {
        setTasks(prev => prev.map(t => t.id === id ? taskBefore : t));
      }
    }
  };

  const handleAddExpense = async (projectId: string, expenseData: Partial<Expense>) => {
    try {
      const payload: any = {
        projectId,
        amount: expenseData.amount || 0,
        date: expenseData.date || new Date().toISOString().split('T')[0],
        description: expenseData.description || '',
        category: expenseData.category || 'Others',
        status: 'Estimated'
      };

      // Include budgetLineId if provided
      if (expenseData.budgetLineId) {
        payload.budgetLineId = expenseData.budgetLineId;
      }

      const createdExpense = await apiService.createExpense(payload);
      setExpenses([...expenses, createdExpense]);
      alert('Gasto registrado exitosamente.');
    } catch (error) {
      console.error('Error al crear gasto:', error);
      alert('No se pudo crear el gasto. Intente de nuevo.');
    }
  };

  const handleUpdateExpense = (id: string, updates: Partial<Expense>) => {
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  const handleAddBudgetLine = async (projectId: string, line: Partial<BudgetLine>) => {
    try {
      const payload = {
        projectId,
        category: line.category || 'Others',
        budgetType: (line.budgetType as 'CAPEX' | 'OPEX') || 'OPEX',
        description: line.description || '',
        plannedAmount: line.plannedAmount || 0,
        status: 'Pending'
      };

      const createdBudgetLine = await apiService.createBudgetLine(payload);
      setProjects(prev => prev.map(p => {
        if (p.id === projectId) {
          return { ...p, budgetLines: [...(p.budgetLines || []), createdBudgetLine] };
        }
        return p;
      }));
      alert('Nueva línea de presupuesto registrada. El Sponsor debe aprobarla.');
    } catch (error) {
      console.error('Error al crear línea de presupuesto:', error);
      alert('No se pudo crear la línea de presupuesto. Intente de nuevo.');
    }
  };

  const handleApproveBudgetLine = (projectId: string, lineId: string, approved: boolean) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          budgetLines: (p.budgetLines || []).map(bl => 
            bl.id === lineId 
              ? { 
                  ...bl, 
                  status: approved ? 'Approved' : 'Rejected', 
                  approvedBy: currentUser.id, 
                  approvalDate: new Date().toISOString().split('T')[0] 
                } 
              : bl
          )
        };
      }
      return p;
    }));
    alert(`Línea de presupuesto ${approved ? 'Aprobada' : 'Rechazada'}.`);
  };

  const handleAddSnapshot = (snapshot: ProjectSnapshot) => {
    setSnapshots([snapshot, ...snapshots]);
  };

  const handleAddRisk = (projectId: string, riskData: Partial<Risk>) => {
    const newRisk: Risk = {
      id: `r${Date.now()}`,
      projectId,
      description: riskData.description || 'Nuevo Riesgo',
      probability: riskData.probability || 0.5,
      impact: riskData.impact || 0.5,
      status: 'Open',
      category: riskData.category || 'Scope',
      strategy: riskData.strategy || 'Mitigate',
      ownerId: currentUser.id
    };
    setRisks([...risks, newRisk]);
  };

  const handleAddStakeholder = async (projectId: string, sData: Partial<Stakeholder>) => {
    try {
      const payload = {
        projectId,
        userId: sData.userId || '',
        power: (sData.power as 'Low' | 'High') || 'Low',
        interest: (sData.interest as 'Low' | 'High') || 'Low',
        influenceStrategy: sData.influenceStrategy || ''
      };

      const createdStakeholder = await apiService.createStakeholder(payload);
      setStakeholders([...stakeholders, createdStakeholder]);
      alert('Interesado agregado exitosamente a la matriz y a la base de datos.');
    } catch (error) {
      console.error('Error al crear interesado:', error);
      alert('No se pudo guardar el interesado en la base de datos. Intente de nuevo.');
    }
  };

  const handleAddTaskLog = async (logData: Partial<TaskLog>) => {
    try {
      const payload = {
        taskId: logData.taskId || '',
        userId: logData.userId || currentUser.id,
        comment: logData.comment || '',
        previousProgress: logData.previousProgress || 0,
        newProgress: logData.newProgress || 0,
        statusChange: logData.statusChange,
      };

      const createdLog = await apiService.createTaskLog(payload);
      const normalizedLog: TaskLog = {
        ...createdLog,
        date: createdLog.date?.split?.('T')[0] || createdLog.date || '',
      };

      setTaskLogs([normalizedLog, ...taskLogs]);

      // Actualización del progreso solo a través de seguimiento (tasklog)
      if (normalizedLog.taskId) {
        // Aseguramos persistencia en DB y estado local
        await handleUpdateTask(normalizedLog.taskId, {
          progress: normalizedLog.newProgress,
          status: normalizedLog.newProgress >= 100 ? 'Completed' : 'In Progress'
        }, true);
      }

      // Refresh project data to update milestone progress
      await refreshProjectData();

      alert('Log de tarea guardado y progreso persistido exitosamente.');
    } catch (error) {
      console.error('Error al crear log de tarea:', error);
      alert('No se pudo guardar el log de tarea. Intente de nuevo.');
    }
  };

  const handleChangeRequest = async (crData: Partial<ChangeRequest>) => {
    try {
      const newCR = await apiService.createChangeRequest({
        taskId: crData.taskId,
        newStartDate: crData.newStartDate,
        newEndDate: crData.newEndDate,
        justification: crData.justification,
        requestedBy: currentUser.id,
        status: crData.status || 'Pending'
      });
      setChangeRequests([newCR, ...changeRequests]);
      alert('Change Request registrada. Debe ser aprobada por el PMO.');
    } catch (error) {
      console.error('Error creating change request:', error);
      alert('Error al registrar la solicitud de cambio. Intente nuevamente.');
    }
  };

  const handleAddRiskAction = (actionData: Partial<RiskAction>) => {
    const newAction: RiskAction = {
      id: `ra${Date.now()}`,
      riskId: actionData.riskId || '',
      description: actionData.description || '',
      ownerId: actionData.ownerId || '',
      dueDate: actionData.dueDate || '',
      status: 'Pending'
    };
    setRiskActions([...riskActions, newAction]);
  };

  const handleUpdateRiskActionStatus = (id: string, status: RiskAction['status']) => {
    setRiskActions(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  };

  const handleResolveIssue = (id: string) => {
    setIssues(prev => prev.map(i => i.id === id ? { ...i, status: 'Resolved' } : i));
    alert('Issue marcado como Resuelto.');
  };

  const handleProcessChangeRequest = async (id: string, status: 'Approved' | 'Rejected') => {
    try {
      await apiService.processChangeRequest(id, status);

      // Update local state
      setChangeRequests(prev => prev.map(cr => {
        if (cr.id === id) {
          if (status === 'Approved') {
            // Actualizar las fechas de la tarea real
            setTasks(prevTasks => prevTasks.map(t =>
              t.id === cr.taskId ? { ...t, startDate: cr.newStartDate, endDate: cr.newEndDate } : t
            ));
          }
          return { ...cr, status };
        }
        return cr;
      }));

      alert(`Solicitud de cambio ${status === 'Approved' ? 'Aprobada' : 'Rechazada'}. El cronograma ha sido actualizado.`);
    } catch (error) {
      console.error('Error processing change request:', error);
      alert('Error al procesar la solicitud de cambio. Intente nuevamente.');
    }
  };

  return (
    <Router>
      <div className="app-container">
        <Sidebar currentUser={currentUser} onRoleChange={handleRoleChange} />
        <main className="main-layout">
          <Routes>
            <Route path="/" element={<Dashboard projects={projects} currentUser={currentUser} milestones={milestones} tasks={tasks} expenses={expenses} />} />
            <Route path="/projects" element={<ProjectListView projects={projects} currentUser={currentUser} milestones={milestones} tasks={tasks} expenses={expenses} />} />
            <Route path="/global-risks" element={<GlobalRisks risks={risks} projects={projects} />} />
            <Route path="/global-issues" element={<GlobalIssues issues={issues} projects={projects} onResolveIssue={handleResolveIssue} />} />
            <Route path="/change-control" element={<ChangeControlBoard changeRequests={changeRequests} projects={projects} tasks={tasks} milestones={milestones} onProcessCR={handleProcessChangeRequest} />} />
            <Route path="/projects/:id" element={
              <ProjectDetail 
                projects={projects} 
                currentUser={currentUser} 
                milestones={milestones}
                tasks={tasks}
                expenses={expenses}
                snapshots={snapshots}
                onUpdateProject={handleUpdateProject}
                onAddMilestone={handleAddMilestone}
                onDeleteMilestone={handleDeleteMilestone}
                onUpdateMilestone={handleUpdateMilestone}
                onAddTask={handleAddTask}
                onUpdateTask={handleUpdateTask}
                onAddExpense={handleAddExpense}
                onUpdateExpense={handleUpdateExpense}
                onAddBudgetLine={handleAddBudgetLine}
                onApproveBudgetLine={handleApproveBudgetLine}
                onAddSnapshot={handleAddSnapshot}
                risks={risks}
                onAddRisk={handleAddRisk}
                stakeholders={stakeholders}
                onAddStakeholder={handleAddStakeholder}
                taskLogs={taskLogs}
                onAddTaskLog={handleAddTaskLog}
                changeRequests={changeRequests}
                onChangeRequest={handleChangeRequest}
                riskActions={riskActions}
                onAddRiskAction={handleAddRiskAction}
                onUpdateRiskActionStatus={handleUpdateRiskActionStatus}
                onProcessCR={handleProcessChangeRequest}
                projectHistory={projectHistory}
              />
            } />
            <Route path="/new-project" element={<ProjectForm onSave={handleSaveProject} />} />
            <Route path="/tasks" element={<MyTasksView tasks={tasks} milestones={milestones} projects={projects} currentUser={currentUser} onUpdateTask={handleUpdateTask} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
