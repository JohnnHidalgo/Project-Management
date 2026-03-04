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
import { mockUsers, mockProjects, mockExpenses, mockRisks, mockStakeholders } from './mockData';
import { User, Project, UserRole, ProjectStatus, Milestone, Task, Expense, BudgetLine, ProjectSnapshot, Risk, Stakeholder, TaskLog, ChangeRequest, RiskAction, Issue } from './types';
import { calculateEVM, generateSnapshot, calculateRiskScore } from './utils/pmbokUtils';
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
    objectives: '',
    strategicAlignment: '',
    businessCase: '',
    assumptions: '',
    constraints: '',
    successCriteria: '',
    pmId: '',
    sponsorId: '',
  });

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

        <div className="form-group">
          <label>Criterios de Éxito</label>
          <textarea 
            value={formData.successCriteria}
            onChange={e => setFormData({...formData, successCriteria: e.target.value})}
            placeholder="¿Cómo sabremos que el proyecto fue exitoso?" 
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

const ProjectListView = ({ projects, currentUser, milestones, tasks, expenses }: { projects: Project[], currentUser: User, milestones: Milestone[], tasks: Task[], expenses: Expense[] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const filteredProjects = useMemo(() => {
    let result = projects;
    
    // Security filtering based on role
    if (currentUser.role !== 'PMO' && currentUser.role !== 'Admin') {
      result = result.filter(p => 
        p.pmId === currentUser.id || 
        p.sponsorIds.includes(currentUser.id) || 
        p.teamMemberIds.includes(currentUser.id)
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
              <option value="Planning">Planning</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
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
      p.sponsorIds.includes(currentUser.id) || 
      p.teamMemberIds.includes(currentUser.id)
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
            <p><strong>Objetivos:</strong> {project.objectives || 'N/A'}</p>
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
                <span style={{ fontSize: '0.7rem', fontWeight: 700 }}>PROG: {project.progress}%</span>
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
  return (
    <div className="risk-registry">
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="section-header">
          <h3>Matriz de Riesgos (Heatmap)</h3>
          <button className="btn btn-secondary btn-sm" onClick={onOpenModal}>+ Identificar Riesgo</button>
        </div>
        <div className="risk-matrix-grid">
          {/* Simplified CSS-based Heatmap */}
          <div className="risk-heatmap">
            <div className="heatmap-cell bg-error">H/H</div>
            <div className="heatmap-cell bg-error">H/M</div>
            <div className="heatmap-cell bg-warning">H/L</div>
            <div className="heatmap-cell bg-error">M/H</div>
            <div className="heatmap-cell bg-warning">M/M</div>
            <div className="heatmap-cell bg-success">M/L</div>
            <div className="heatmap-cell bg-warning">L/H</div>
            <div className="heatmap-cell bg-success">L/M</div>
            <div className="heatmap-cell bg-success">L/L</div>
          </div>
          <div className="risk-stats">
            <p className="text-muted" style={{ fontSize: '0.875rem' }}>La matriz clasifica los riesgos por Probabilidad e Impacto según los estándares del PMBOK.</p>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Registro de Riesgos</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Descripción</th>
              <th>Puntaje</th>
              <th>Estrategia</th>
              <th>Dueño</th>
              <th>Tratamiento</th>
            </tr>
          </thead>
          <tbody>
            {risks.map(r => {
              const score = calculateRiskScore(r.probability, r.impact);
              const owner = mockUsers.find(u => u.id === r.ownerId);
              return (
                <tr key={r.id}>
                  <td>{r.description}</td>
                  <td><span className={`badge badge-${score.toLowerCase()}`}>{score}</span></td>
                  <td><span className="badge badge-secondary">{r.strategy}</span></td>
                  <td>{owner?.name}</td>
                  <td>
                    <button 
                      className="btn btn-secondary btn-sm" 
                      onClick={() => {
                        setSelectedRisk(r);
                        onOpenActionModal();
                      }}
                    >
                      Planes de Acción
                    </button>
                  </td>
                </tr>
              );
            })}
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
  currentUser 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  task: Task | null, 
  logs: TaskLog[], 
  onAddLog: (log: Partial<TaskLog>) => void,
  currentUser: User
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
      date: new Date().toISOString().split('T')[0]
    });
    setComment('');
    onClose();
  };

  const taskLogs = logs.filter(l => l.taskId === task.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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
        {taskLogs.length > 0 ? taskLogs.map(log => (
          <div key={log.id} className="card" style={{ padding: '1rem', marginBottom: '0.75rem', backgroundColor: '#f8fafc' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{mockUsers.find(u => u.id === log.userId)?.name}</span>
              <span className="text-muted" style={{ fontSize: '0.75rem' }}>{log.date}</span>
            </div>
            <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>{log.comment}</p>
            <div style={{ fontSize: '0.7rem' }}>
              <span className="badge badge-secondary">Avance: {log.previousProgress}% → {log.newProgress}%</span>
            </div>
          </div>
        )) : <p className="text-muted" style={{ textAlign: 'center', fontSize: '0.875rem' }}>No hay historial registrado.</p>}
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
      newStartDate,
      newEndDate,
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
  onProcessCR 
}: { 
  changeRequests: ChangeRequest[], 
  projects: Project[], 
  tasks: Task[],
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
              const project = projects.find(p => p.id === task?.milestoneId ? '' : ''); // Simplified lookup
              // Better lookup for project
              const realProject = projects.find(p => p.id === cr.id.split('-')[0]); // Dummy logic
              
              return (
                <tr key={cr.id}>
                  <td>Proyecto Activo</td>
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
  onUpdateProject, onAddMilestone, onDeleteMilestone, onAddTask, onUpdateTask,
  onAddExpense, onUpdateExpense, onAddBudgetLine, onApproveBudgetLine,
  snapshots, onAddSnapshot, risks, onAddRisk, stakeholders, onAddStakeholder,
  taskLogs, onAddTaskLog, changeRequests, onChangeRequest,
  riskActions, onAddRiskAction, onUpdateRiskActionStatus
}: { 
  projects: Project[], 
  currentUser: User,
  milestones: Milestone[],
  tasks: Task[],
  expenses: Expense[],
  onUpdateProject: (id: string, updates: Partial<Project>) => void,
  onAddMilestone: (projectId: string, name: string, weight: number, startDate: string, endDate: string) => void,
  onDeleteMilestone: (id: string) => void,
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
  riskActions: RiskAction[],
  onAddRiskAction: (a: Partial<RiskAction>) => void,
  onUpdateRiskActionStatus: (id: string, status: RiskAction['status']) => void,
  taskLogs: TaskLog[],
  onAddTaskLog: (log: Partial<TaskLog>) => void,
  changeRequests: ChangeRequest[],
  onChangeRequest: (cr: Partial<ChangeRequest>) => void
}) => {
  const { id } = useParams();
  const project = projects.find(p => p.id === id);
  const [activeTab, setActiveTab] = useState<'overview' | 'planning' | 'execution' | 'sppm' | 'costs' | 'risks' | 'stakeholders' | 'gantt'>('overview');
  const [scheduleView, setScheduleView] = useState<'gantt' | 'calendar'>('gantt');
  const [activeModal, setActiveModal] = useState<'milestone' | 'task' | 'expense' | 'budgetLine' | 'risk' | 'taskHistory' | 'changeRequest' | 'stakeholder' | 'riskAction' | 'rejection' | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedRisk, setSelectedRisk] = useState<Risk | null>(null);
  const [rejectionComment, setRejectionComment] = useState('');
  
  const projectMilestones = (milestones || []).filter(m => m.projectId === id);
  const totalWeight = projectMilestones.reduce((sum, m) => sum + m.weight, 0);
  
  const projectTasks = (tasks || []).filter(t => projectMilestones.some(m => m.id === t.milestoneId));
  const projectExpenses = (expenses || []).filter(e => e.projectId === id);
  const projectRisks = (risks || []).filter(r => r.projectId === id);
  const projectStakeholders = (stakeholders || []).filter(s => s.projectId === id);
  const projectChangeRequests = (changeRequests || []).filter(cr => projectTasks.some(t => t.id === cr.taskId));

  const totalActualSpent = useMemo(() => 
    projectExpenses.reduce((sum, e) => sum + e.amount, 0), 
  [projectExpenses]);

  const budgetProgress = project ? (totalActualSpent / (project.budget || 1)) * 100 : 0;

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
            <button className="btn btn-primary" onClick={() => onUpdateProject(project.id, { status: 'Pending Initial Approval' })}>Solicitar Revisión de Sponsor</button>
          )}
          {project.sponsorIds.includes(currentUser.id) && project.status === 'Pending Initial Approval' && (
            <button className="btn btn-success" onClick={() => onUpdateProject(project.id, { status: 'Planning' })}>Aprobar Inicio de Planificación</button>
          )}
          {currentUser.id === project.pmId && project.status === 'Planning' && (
            <button className="btn btn-primary" onClick={handleSendToCharter}>Enviar Charter a Sponsor</button>
          )}
          {project.sponsorIds.includes(currentUser.id) && project.status === 'Charter Approval' && (
            <button className="btn btn-success" onClick={() => onUpdateProject(project.id, { status: 'Active' })}>Aprobar Project Charter</button>
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
                  <tr><th>Categoría</th><th>Descripción</th><th>Monto Planeado</th><th>Estado</th><th>Acciones</th></tr>
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
            {project.status === 'Planning' && project.rejectionComments && project.pmId === currentUser.id && (
              <div className="card" style={{ border: '2px solid var(--error)', backgroundColor: '#fef2f2', marginBottom: '2rem' }}>
                <h3 style={{ color: 'var(--error)', margin: 0 }}>⚠️ Ajustes Solicitados por el Sponsor</h3>
                <p style={{ margin: '0.5rem 0', fontWeight: 600 }}>Comentarios: "{project.rejectionComments}"</p>
                <p style={{ margin: 0, fontSize: '0.875rem' }}>Por favor, realice las modificaciones en el cronograma, presupuesto o alcance y vuelva a solicitar la aprobación.</p>
              </div>
            )}

            {/* PANEL DE APROBACIÓN DEL SPONSOR */}
            {project.status === 'Charter Approval' && project.sponsorIds.includes(currentUser.id) && (
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
                  <h4 className="label" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>CRITERIOS DE ÉXITO</h4>
                  <p style={{ fontSize: '0.875rem' }}>{project.successCriteria || 'No definidos'}</p>
                </div>
              </div>
            </div>
            <div className="card">
              <h3>Objetivos</h3><p>{project.objectives || 'No definidos'}</p>
              <h3 style={{ marginTop: '1.5rem' }}>Alineación Estratégica</h3><p>{project.strategicAlignment || 'No definida'}</p>
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
            <button className="btn btn-secondary btn-sm" onClick={() => setActiveModal('milestone')}>+ Nuevo Hito</button>
          </div>
          <table className="data-table">
            <thead>
              <tr><th>Hito</th><th>Inicio</th><th>Fin</th><th>Peso (%)</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {projectMilestones.map(m => (
                <tr key={m.id}>
                  <td>{m.name}</td>
                  <td>{m.startDate}</td>
                  <td>{m.endDate}</td>
                  <td>{m.weight}%</td>
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
              <button className="btn btn-secondary btn-sm" onClick={() => setActiveModal('task')}>+ Nueva Tarea</button>
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
                      <td>
                        <div style={{ fontWeight: 600 }}>{t.name}</div>
                        <div className="text-muted" style={{ fontSize: '0.7rem' }}>{t.startDate} al {t.endDate}</div>
                        {t.predecessorId && (
                          <div className="text-accent" style={{ fontSize: '0.65rem', marginTop: '0.2rem' }}>
                            ⛓️ Predecesora: {projectTasks.find(pt => pt.id === t.predecessorId)?.name}
                          </div>
                        )}
                      </td>
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
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button 
                            className="btn btn-secondary btn-sm" 
                            onClick={() => {
                              setSelectedTask(t);
                              setActiveModal('taskHistory');
                            }}
                          >
                            Seguimiento
                          </button>
                          <button 
                            className="btn btn-secondary btn-sm" 
                            onClick={() => {
                              setSelectedTask(t);
                              setActiveModal('changeRequest');
                            }}
                          >
                            Reprogramar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr><td colSpan={5} className="text-muted" style={{ textAlign: 'center' }}>No hay tareas registradas.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="card" style={{ marginTop: '2rem' }}>
            <div className="section-header">
              <h3>Solicitudes de Cambio (Reprogramación)</h3>
            </div>
            {projectChangeRequests.length > 0 ? (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Tarea</th>
                    <th>Fechas Solicitadas</th>
                    <th>Justificación</th>
                    <th>Solicitado por</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {projectChangeRequests.map(cr => (
                    <tr key={cr.id}>
                      <td>{projectTasks.find(t => t.id === cr.taskId)?.name}</td>
                      <td>
                        <div style={{ fontSize: '0.75rem' }}>
                          <span className="text-muted">De:</span> {cr.originalStartDate} al {cr.originalEndDate}<br/>
                          <span className="text-accent" style={{ fontWeight: 600 }}>A:</span> {cr.newStartDate} al {cr.newEndDate}
                        </div>
                      </td>
                      <td style={{ maxWidth: '200px', fontSize: '0.8125rem' }}>{cr.justification}</td>
                      <td>{mockUsers.find(u => u.id === cr.requestedBy)?.name}</td>
                      <td>
                        <span className={`badge badge-${cr.status.toLowerCase()}`}>{cr.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-state" style={{ padding: '2rem' }}>No hay solicitudes de cambio pendientes.</div>
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
          onAddTask(target.milestoneId.value, { 
            name: target.name.value, 
            assignedTo: target.assignedTo.value, 
            priority: target.priority.value,
            startDate: target.startDate.value,
            endDate: target.endDate.value,
            predecessorId: target.predecessorId.value || undefined
          });
          setActiveModal(null);
        }}>
          <div className="form-group">
            <label>Seleccionar Hito</label>
            <select name="milestoneId" required>
              {projectMilestones.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Nombre de la Tarea</label>
            <input name="name" type="text" required />
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
            category: target.category.value 
          });
          setActiveModal(null);
        }}>
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
                status: 'Planning', 
                rejectionComments: rejectionComment 
              });
              setActiveModal(null);
              setRejectionComment('');
              alert("Proyecto devuelto a planificación con sus comentarios.");
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
  const myTasks = useMemo(() => tasks.filter(t => t.assignedTo === currentUser.id), [tasks, currentUser]);

  return (
    <div className="page" style={{ maxWidth: '1000px' }}>
      <header className="page-header">
        <h1>Mis Tareas Pendientes</h1>
        <p className="text-muted">Lista de actividades asignadas y seguimiento de progreso</p>
      </header>

      <div className="task-list-container" style={{ display: 'grid', gap: '1rem' }}>
        {myTasks.length > 0 ? myTasks.map(task => {
          const milestone = milestones.find(m => m.id === task.milestoneId);
          const project = projects.find(p => p.id === milestone?.projectId);
          
          return (
            <div key={task.id} className="card task-item-card" style={{ padding: '1.25rem', borderLeft: `5px solid ${task.status === 'Completed' ? 'var(--success)' : (task.priority === 'High' ? 'var(--error)' : 'var(--accent)')}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div>
                  <div className="text-muted" style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 700 }}>{project?.name} / {milestone?.name}</div>
                  <h3 style={{ margin: '0.25rem 0', fontSize: '1.1rem' }}>{task.name}</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>{task.description}</p>
                </div>
                <span className={`badge badge-${task.priority.toLowerCase()}`}>{task.priority}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', alignItems: 'center', marginTop: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.4rem' }}>
                    <span>Progreso Actual</span>
                    <span style={{ fontWeight: 700 }}>{task.progress}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" max="100" 
                    value={task.progress} 
                    onChange={(e) => onUpdateTask(task.id, { 
                      progress: parseInt(e.target.value),
                      status: parseInt(e.target.value) === 100 ? 'Completed' : 'In Progress'
                    })}
                    style={{ width: '100%' }}
                  />
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.8rem' }}>
                  <div className="text-muted">Fecha Límite</div>
                  <div style={{ fontWeight: 600 }}>{task.endDate}</div>
                </div>
              </div>
            </div>
          );
        }) : (
          <div className="card empty-state" style={{ padding: '3rem', textAlign: 'center' }}>
            <CheckSquare size={48} style={{ margin: '0 auto 1rem', opacity: 0.2 }} />
            <h3>No tienes tareas pendientes</h3>
            <p className="text-muted">¡Buen trabajo! Estás al día con tus asignaciones.</p>
          </div>
        )}
      </div>
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
  const [snapshots, setSnapshots] = useState<ProjectSnapshot[]>([]);
  const [risks, setRisks] = useState<Risk[]>(mockRisks);
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>(mockStakeholders);
  const [taskLogs, setTaskLogs] = useState<TaskLog[]>([]);
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>([]);
  const [riskActions, setRiskActions] = useState<RiskAction[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);

  useEffect(() => {
    // ... initial data
    setIssues([
      { id: 'i1', projectId: 'p1', description: 'Latencia de red en servidores de pruebas', severity: 'High', status: 'Open', ownerId: '3' }
    ]);

    setMilestones([
      { id: 'm1', projectId: 'p1', name: 'Infraestructura Cloud', description: '', startDate: '2026-01-01', endDate: '2026-03-15', weight: 30, status: 'In Progress', progress: 80 },
      { id: 'm2', projectId: 'p1', name: 'Migración de Datos', description: '', startDate: '2026-03-16', endDate: '2026-06-30', weight: 40, status: 'Pending', progress: 0 },
    ]);
    
    setTasks([
      { id: 't1', milestoneId: 'm1', name: 'Configuración VPC', description: 'Setup de red segura en AWS', startDate: '2026-01-10', endDate: '2026-01-25', assignedTo: '4', progress: 100, status: 'Completed', priority: 'High' },
      { id: 't2', milestoneId: 'm1', name: 'Provisioning RDS', description: 'Base de datos para producción', startDate: '2026-02-01', endDate: '2026-02-28', assignedTo: '4', progress: 60, status: 'In Progress', priority: 'Medium' },
      { id: 't3', milestoneId: 'm1', name: 'Revisión de Arquitectura', description: 'Validación técnica con PMO', startDate: '2026-01-05', endDate: '2026-01-15', assignedTo: '3', progress: 90, status: 'In Progress', priority: 'High' },
      { id: 't4', milestoneId: 'm2', name: 'Mapeo de Datos Legacy', description: 'Definición de ETLs', startDate: '2026-03-20', endDate: '2026-04-10', assignedTo: '4', progress: 10, status: 'Pending', priority: 'Medium' },
      { id: 't5', milestoneId: 'm2', name: 'Plan de Comunicación', description: 'Kickoff con stakeholders', startDate: '2026-03-16', endDate: '2026-03-25', assignedTo: '3', progress: 0, status: 'Pending', priority: 'Low' },
    ]);
  }, []);

  const handleRoleChange = (role: UserRole) => {
    const user = mockUsers.find(u => u.role === role) || mockUsers[0];
    setCurrentUser(user);
  };

  const handleSaveProject = (projectData: Partial<Project> & { sponsorId?: string }) => {
    const newProject: Project = {
      id: `p${projects.length + 1}`,
      name: projectData.name || 'Sin nombre',
      description: projectData.description || '',
      status: 'Draft',
      budget: projectData.budget || 0,
      startDate: projectData.startDate || '',
      endDate: projectData.endDate || '',
      pmId: projectData.pmId || currentUser.id,
      sponsorIds: projectData.sponsorId ? [projectData.sponsorId] : [],
      teamMemberIds: [],
      objectives: projectData.objectives,
      strategicAlignment: projectData.strategicAlignment,
      businessCase: projectData.businessCase,
      assumptions: projectData.assumptions,
      constraints: projectData.constraints,
      successCriteria: projectData.successCriteria,
      progress: 0,
      plannedValue: 0,
      earnedValue: 0,
      actualCost: 0,
      cpi: 1,
      spi: 1
    };
    setProjects([newProject, ...projects]);
  };

  const handleUpdateProject = (id: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const handleAddMilestone = (projectId: string, name: string, weight: number, startDate: string, endDate: string) => {
    const newMilestone: Milestone = {
      id: `m${Date.now()}`,
      projectId,
      name,
      description: '',
      startDate,
      endDate,
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
          status: 'Pending'
        };
        return { ...p, budgetLines: [...(p.budgetLines || []), newLine] };
      }
      return p;
    }));
    alert('Nueva línea de presupuesto registrada. El Sponsor debe aprobarla.');
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

  const handleAddStakeholder = (projectId: string, sData: Partial<Stakeholder>) => {
    const newStakeholder: Stakeholder = {
      id: `s${Date.now()}`,
      projectId,
      userId: sData.userId || '',
      power: (sData.power as 'Low' | 'High') || 'Low',
      interest: (sData.interest as 'Low' | 'High') || 'Low',
      influenceStrategy: sData.influenceStrategy || ''
    };
    setStakeholders([...stakeholders, newStakeholder]);
    alert('Interesado agregado exitosamente a la matriz.');
  };

  const handleAddTaskLog = (logData: Partial<TaskLog>) => {
    const newLog: TaskLog = {
      id: `log${Date.now()}`,
      taskId: logData.taskId || '',
      userId: logData.userId || currentUser.id,
      date: logData.date || new Date().toISOString().split('T')[0],
      comment: logData.comment || '',
      previousProgress: logData.previousProgress || 0,
      newProgress: logData.newProgress || 0,
    };
    setTaskLogs([newLog, ...taskLogs]);
    
    // Update task progress automatically
    if (newLog.taskId) {
      handleUpdateTask(newLog.taskId, { progress: newLog.newProgress });
    }
  };

  const handleChangeRequest = (crData: Partial<ChangeRequest>) => {
    const newCR: ChangeRequest = {
      id: `cr${Date.now()}`,
      taskId: crData.taskId || '',
      originalStartDate: crData.originalStartDate || '',
      originalEndDate: crData.originalEndDate || '',
      newStartDate: crData.newStartDate || '',
      newEndDate: crData.newEndDate || '',
      justification: crData.justification || '',
      status: 'Pending',
      requestedBy: crData.requestedBy || currentUser.id,
      requestedDate: crData.requestedDate || new Date().toISOString().split('T')[0]
    };
    setChangeRequests([newCR, ...changeRequests]);
    alert('Change Request registrada. Debe ser aprobada por el PMO.');
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

  const handleProcessChangeRequest = (id: string, status: 'Approved' | 'Rejected') => {
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
            <Route path="/change-control" element={<ChangeControlBoard changeRequests={changeRequests} projects={projects} tasks={tasks} onProcessCR={handleProcessChangeRequest} />} />
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
