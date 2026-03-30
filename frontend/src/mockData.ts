import { Project, User, Milestone, Task, Risk, Issue, Expense, Stakeholder, BudgetLine, TaskLog, ChangeRequest, RiskAction } from './types';

export const mockUsers: User[] = [
  { id: '1', name: 'Rafael Sponsor', role: 'Sponsor', department: 'Executive', phone: '123456', position: 'Director General' },
  { id: '2', name: 'Ana PMO', role: 'PMO', department: 'PMO Office', phone: '789012', position: 'Gerente de Portafolio' },
  { id: '3', name: 'Juan PM', role: 'PM', department: 'TI', phone: '345678', position: 'Project Manager Senior' },
  { id: '4', name: 'Elena Dev', role: 'Team Member', department: 'Desarrollo', phone: '901234', position: 'Lead Engineer' },
  { id: '5', name: 'Carlos Tech', role: 'Team Member', department: 'Sistemas', phone: '567890', position: 'SysAdmin' },
  { id: '6', name: 'Maria Marketing', role: 'Stakeholder', department: 'Marketing', position: 'Directora de Marca' }
];

export const mockProjects: Project[] = [
  {
    id: 'p1',
    name: 'Migración ERP a Cloud AWS',
    description: 'Migración de toda la infraestructura local de SAP a la nube de AWS para mejorar disponibilidad.',
    status: 'Active',
    budget: 150000,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    pmId: '3',
    pmoId: '2',
    sponsorIds: ['1'],
    teamMemberIds: ['4', '5'],
    generalObjective: 'Lograr una disponibilidad del 99.9% y reducir costos operativos en un 20%.',
    specificObjectives: [
      { id: 'so1', description: 'Migrar BD productiva sin pérdida de datos', successCriteria: '0 registros perdidos', kpi: '% Integridad de datos' },
      { id: 'so2', description: 'Reducir latencia de acceso externo', successCriteria: 'Latencia < 100ms', kpi: 'Tiempo de respuesta (ms)' }
    ],
    strategicAlignment: 'Transformación Digital 2026',
    businessCase: 'La infraestructura actual tiene 5 años y falla frecuentemente. El costo de mantenimiento local supera al costo de suscripción cloud.',
    assumptions: 'AWS mantiene precios competitivos; El equipo interno tiene tiempo para capacitación.',
    constraints: 'Debe terminarse antes del vencimiento del contrato del datacenter actual.',
    progress: 45,
    budgetLines: [
      { id: 'bl1', category: 'Services', budgetType: 'OPEX', description: 'Suscripción AWS Anual', plannedAmount: 50000, status: 'Approved' },
      { id: 'bl2', category: 'Labor', budgetType: 'OPEX', description: 'Consultoría Migración', plannedAmount: 30000, status: 'Approved' },
      { id: 'bl3', category: 'Hardware', budgetType: 'CAPEX', description: 'Servidores de Respaldo Local', plannedAmount: 20000, status: 'Approved' }
    ]
  },
  {
    id: 'p2',
    name: 'Implementación CRM Salesforce',
    description: 'Implementación de Salesforce para el equipo de ventas y atención al cliente.',
    status: 'Draft',
    budget: 85000,
    startDate: '2026-03-01',
    endDate: '2026-09-30',
    pmId: '3',
    pmoId: '2',
    sponsorIds: ['1'],
    teamMemberIds: ['6'],
    generalObjective: 'Centralizar la información de clientes para aumentar la tasa de conversión en un 15%.',
    specificObjectives: [
      { id: 'so2_1', description: 'Integrar con el ERP actual', successCriteria: 'Sincronización en tiempo real', kpi: 'Tasa de error de sincronización' },
      { id: 'so2_2', description: 'Capacitar al 100% del equipo comercial', successCriteria: 'Examen de certificación interna aprobado', kpi: '% Personal capacitado' }
    ],
    strategicAlignment: 'Excelencia en el Cliente',
    businessCase: 'Actualmente perdemos el 30% de leads por falta de seguimiento centralizado.',
    progress: 10,
    budgetLines: [
      { id: 'bl2_1', category: 'Software', budgetType: 'OPEX', description: 'Licencias Salesforce 1er año', plannedAmount: 45000, status: 'Pending' },
      { id: 'bl2_2', category: 'Services', budgetType: 'OPEX', description: 'Partners de Implementación', plannedAmount: 40000, status: 'Pending' }
    ]
  },
  {
    id: 'p3',
    name: 'Expansión Almacén Logístico',
    description: 'Ampliación física y automatización del almacén central en El Alto.',
    status: 'Draft',
    budget: 500000,
    startDate: '2026-06-01',
    endDate: '2027-06-01',
    pmId: '3',
    pmoId: '2',
    sponsorIds: ['1'],
    teamMemberIds: ['5'],
    generalObjective: 'Aumentar la capacidad de almacenamiento en un 50% y reducir tiempos de despacho.',
    specificObjectives: [
      { id: 'so3_1', description: 'Construcción de Nave C', successCriteria: 'Entrega de obra civil sin observaciones', kpi: 'm2 construidos' },
      { id: 'so3_2', description: 'Instalar sistema de racks automáticos', successCriteria: '1000 picks por hora alcanzados', kpi: 'Picks por hora' }
    ],
    strategicAlignment: 'Crecimiento Logístico',
    progress: 0
  },
  {
    id: 'p4',
    name: 'Automatización Planta Manufactura',
    description: 'Instalación de brazos robóticos y software de control de procesos en la planta de producción.',
    status: 'Active',
    budget: 850000,
    startDate: '2026-02-01',
    endDate: '2026-11-30',
    pmId: '3',
    pmoId: '2',
    sponsorIds: ['1'],
    teamMemberIds: ['5'],
    generalObjective: 'Aumentar la eficiencia de producción en un 25% y reducir el desperdicio de materia prima.',
    specificObjectives: [
      { id: 'so4_1', description: 'Instalar 4 celdas robóticas', successCriteria: 'Operación continua 24/7', kpi: 'OEE (Eficiencia General)' },
      { id: 'so4_2', description: 'Integrar con sistema de control SCADA', successCriteria: 'Monitoreo en tiempo real', kpi: 'Latencia de datos de sensores' }
    ],
    strategicAlignment: 'Excelencia Operacional',
    businessCase: 'La competencia ha reducido costos en un 15% mediante automatización. Necesitamos igualar la eficiencia para mantener margen.',
    progress: 25,
    budgetLines: [
      { id: 'bl4_1', category: 'Hardware', budgetType: 'CAPEX', description: 'Brazos Robóticos Kuka', plannedAmount: 600000, status: 'Approved' },
      { id: 'bl4_2', category: 'Services', budgetType: 'OPEX', description: 'Consultoría Integración SCADA', plannedAmount: 150000, status: 'Approved' }
    ]
  },
  {
    id: 'p5',
    name: 'Portal de Autoservicio Clientes',
    description: 'Desarrollo de plataforma web y móvil para que los clientes gestionen sus pedidos de forma autónoma.',
    status: 'Draft',
    budget: 120000,
    startDate: '2026-05-01',
    endDate: '2026-10-31',
    pmId: '3',
    pmoId: '2',
    sponsorIds: ['1'],
    teamMemberIds: ['4', '6'],
    generalObjective: 'Reducir el volumen de llamadas a soporte en un 40% proporcionando herramientas digitales.',
    specificObjectives: [
      { id: 'so5_1', description: 'Lanzar MVP en 3 meses', successCriteria: 'Funcionalidades básicas de pedido activas', kpi: 'Días para lanzamiento' },
      { id: 'so5_2', description: 'Lograr 10,000 usuarios activos', successCriteria: 'Descargas y registros únicos', kpi: 'Usuarios Activos Mensuales' }
    ],
    strategicAlignment: 'Digitalización del Cliente',
    progress: 5
  },
  {
    id: 'p6',
    name: 'Auditoría ISO 27001 - Seguridad',
    description: 'Certificación de la norma internacional de seguridad de la información para toda la organización.',
    status: 'Active',
    budget: 45000,
    startDate: '2026-01-15',
    endDate: '2026-07-15',
    pmId: '3',
    pmoId: '2',
    sponsorIds: ['1'],
    teamMemberIds: ['5'],
    generalObjective: 'Obtener la certificación ISO 27001 para mitigar riesgos de ciberseguridad y cumplir con regulaciones.',
    specificObjectives: [
      { id: 'so6_1', description: 'Mapear 100% de activos críticos', successCriteria: 'Inventario validado por auditoría externa', kpi: '% Activos Inventariados' },
      { id: 'so6_2', description: 'Implementar controles de acceso biométricos', successCriteria: 'Instalación en site principal', kpi: 'Puntos de acceso asegurados' }
    ],
    strategicAlignment: 'Gestión de Riesgos Corporativos',
    progress: 60,
    budgetLines: [
      { id: 'bl6_1', category: 'Services', budgetType: 'OPEX', description: 'Entidad Certificadora (BSI)', plannedAmount: 20000, status: 'Approved' },
      { id: 'bl6_2', category: 'Labor', budgetType: 'OPEX', description: 'Capacitación en Ciberseguridad', plannedAmount: 15000, status: 'Approved' }
    ]
  },
  {
    id: 'p7',
    name: 'Renovación de Infraestructura Red Core',
    description: 'Actualización de switches y routers principales en el Datacenter Central.',
    status: 'Completed',
    budget: 250000,
    startDate: '2025-06-01',
    endDate: '2025-12-31',
    pmId: '3',
    pmoId: '2',
    sponsorIds: ['1'],
    teamMemberIds: ['5'],
    generalObjective: 'Modernizar la red core para soportar tráfico de 10Gbps en toda la planta.',
    specificObjectives: [
      { id: 'so7_1', description: 'Migración de fibra óptica', successCriteria: 'Backbone de 40Gbps operativo', kpi: 'Ancho de banda disponible (Gbps)' }
    ],
    strategicAlignment: 'Infraestructura Tecnológica',
    progress: 100
  }
];

export const mockMilestones: Milestone[] = [
  { id: 'm1', projectId: 'p1', name: 'Arquitectura y Redes', description: '', startDate: '2026-01-01', endDate: '2026-02-15', weight: 20, status: 'Completed', progress: 100 },
  { id: 'm2', projectId: 'p1', name: 'Migración Base Datos', description: '', startDate: '2026-02-16', endDate: '2026-05-30', weight: 40, status: 'In Progress', progress: 50 },
  { id: 'm3', projectId: 'p1', name: 'Pruebas de Aceptación', description: '', startDate: '2026-06-01', endDate: '2026-08-30', weight: 40, status: 'Pending', progress: 0 },
  { id: 'm4', projectId: 'p2', name: 'Diseño de Procesos', description: '', startDate: '2026-03-01', endDate: '2026-04-15', weight: 30, status: 'In Progress', progress: 20 },
  { id: 'm5', projectId: 'p2', name: 'Configuración CRM', description: '', startDate: '2026-04-16', endDate: '2026-07-30', weight: 70, status: 'Pending', progress: 0 }
];

export const mockTasks: Task[] = [
  { id: 't1', milestoneId: 'm1', name: 'Diseño de VPC', description: 'Definir subredes y seguridad', startDate: '2026-01-05', endDate: '2026-01-15', assignedTo: '4', progress: 100, status: 'Completed', priority: 'High' },
  { id: 't2', milestoneId: 'm1', name: 'Túnel VPN con Local', description: 'Conectividad segura', startDate: '2026-01-16', endDate: '2026-01-30', assignedTo: '5', progress: 100, status: 'Completed', priority: 'High' },
  { id: 't3', milestoneId: 'm2', name: 'Limpieza de Datos', description: 'Eliminar registros obsoletos', startDate: '2026-02-20', endDate: '2026-03-30', assignedTo: '4', progress: 80, status: 'In Progress', priority: 'Medium' },
  { id: 't4', milestoneId: 'm2', name: 'Script de Migración', description: 'Desarrollo de ETL', startDate: '2026-04-01', endDate: '2026-05-15', assignedTo: '5', progress: 10, status: 'Pending', priority: 'High' },
  { id: 't5', milestoneId: 'm4', name: 'Levantamiento Requerimientos', description: 'Entrevistas con ventas', startDate: '2026-03-05', endDate: '2026-03-25', assignedTo: '6', progress: 40, status: 'In Progress', priority: 'High' }
];

export const mockExpenses: Expense[] = [
  { id: 'e1', projectId: 'p1', budgetLineId: 'bl1', amount: 12000, date: '2026-01-10', description: 'Suscripción AWS Q1', category: 'Services', status: 'Paid' },
  { id: 'e2', projectId: 'p1', budgetLineId: 'bl2', amount: 8000, date: '2026-02-05', description: 'Consultoría inicial', category: 'Services', status: 'Paid' }
];

export const mockRisks: Risk[] = [
  // Proyecto 1: ERP
  { id: 'r1', projectId: 'p1', description: 'Latencia excesiva en sincronización de datos', probability: 0.3, impact: 0.8, status: 'Open', category: 'Time', strategy: 'Mitigate', ownerId: '4' },
  { id: 'r2', projectId: 'p1', description: 'Sobrecosto en consumo de storage AWS', probability: 0.5, impact: 0.6, status: 'Open', category: 'Cost', strategy: 'Mitigate', ownerId: '3' },
  { id: 'r4', projectId: 'p1', description: 'Indisponibilidad de consultores clave SAP', probability: 0.2, impact: 0.9, status: 'Open', category: 'Resources', strategy: 'Avoid', ownerId: '2' },
  { id: 'r5', projectId: 'p1', description: 'Incompatibilidad de versiones de API legacy', probability: 0.6, impact: 0.7, status: 'Open', category: 'Scope', strategy: 'Mitigate', ownerId: '4' },
  
  // Proyecto 4: Automatización
  { id: 'r4_1', projectId: 'p4', description: 'Retraso en importación de brazos robóticos', probability: 0.4, impact: 0.9, status: 'Open', category: 'Time', strategy: 'Transfer', ownerId: '3' },
  { id: 'r4_2', projectId: 'p4', description: 'Fallas en la integración SCADA-ERP', probability: 0.7, impact: 0.8, status: 'Open', category: 'Scope', strategy: 'Mitigate', ownerId: '5' },
  { id: 'r4_3', projectId: 'p4', description: 'Accidentes durante la instalación mecánica', probability: 0.1, impact: 1.0, status: 'Open', category: 'Resources', strategy: 'Mitigate', ownerId: '1' },
  
  // Proyecto 6: ISO 27001
  { id: 'r6_1', projectId: 'p6', description: 'Falta de compromiso de los jefes de área', probability: 0.8, impact: 0.7, status: 'Open', category: 'Scope', strategy: 'Mitigate', ownerId: '2' },
  { id: 'r6_2', projectId: 'p6', description: 'Hallazgos críticos en pre-auditoría', probability: 0.5, impact: 0.8, status: 'Open', category: 'Time', strategy: 'Avoid', ownerId: '3' },
  { id: 'r6_3', projectId: 'p6', description: 'Fuga de información durante el proceso', probability: 0.2, impact: 0.9, status: 'Open', category: 'Resources', strategy: 'Mitigate', ownerId: '5' },
  
  // Generales
  { id: 'r_gen1', projectId: 'p2', description: 'Resistencia al cambio del equipo comercial', probability: 0.7, impact: 0.9, status: 'Open', category: 'Scope', strategy: 'Mitigate', ownerId: '6' },
  
  // Mas Críticos (H/H)
  { id: 'r_crit1', projectId: 'p1', description: 'Intento de ciberataque masivo (Ransomware)', probability: 0.8, impact: 1.0, status: 'Open', category: 'Resources', strategy: 'Mitigate', ownerId: '5' },
  { id: 'r_crit2', projectId: 'p4', description: 'Huelga nacional de transporte (Afecta logística)', probability: 0.7, impact: 0.8, status: 'Open', category: 'Time', strategy: 'Avoid', ownerId: '1' },
  { id: 'r_crit3', projectId: 'p6', description: 'Pérdida de backups históricos durante auditoría', probability: 0.65, impact: 0.9, status: 'Open', category: 'Resources', strategy: 'Mitigate', ownerId: '3' },
  
  // Mas Bajos (L/L o M/L)
  { id: 'r_low1', projectId: 'p1', description: 'Retraso en entrega de papelería administrativa', probability: 0.2, impact: 0.1, status: 'Open', category: 'Cost', strategy: 'Accept', ownerId: '3' },
  { id: 'r_low2', projectId: 'p5', description: 'Desajuste menor en paleta de colores del portal', probability: 0.4, impact: 0.2, status: 'Open', category: 'Scope', strategy: 'Accept', ownerId: '4' },
  { id: 'r_low3', projectId: 'p2', description: 'Indisponibilidad breve de sala de juntas para capacitación', probability: 0.3, impact: 0.2, status: 'Open', category: 'Time', strategy: 'Accept', ownerId: '2' },
  { id: 'r_low4', projectId: 'p4', description: 'Cambio de marca en herramientas de mano secundarias', probability: 0.1, impact: 0.1, status: 'Open', category: 'Cost', strategy: 'Accept', ownerId: '5' }
];

export const mockStakeholders: Stakeholder[] = [
  { id: 's1', projectId: 'p1', userId: '1', power: 'High', interest: 'High', influenceStrategy: 'Reuniones mensuales de avance' },
  { id: 's2', projectId: 'p1', userId: '6', power: 'Low', interest: 'High', influenceStrategy: 'Reportes de impacto en marketing' }
];

export const mockTaskLogs: TaskLog[] = [
  { id: 'log1', taskId: 't1', userId: '4', date: '2026-01-10', comment: 'Configuración de subredes terminada según mejores prácticas.', previousProgress: 0, newProgress: 100 },
  { id: 'log2', taskId: 't3', userId: '4', date: '2026-03-01', comment: 'Limpieza de tablas de auditoría completada.', previousProgress: 20, newProgress: 80 }
];

export const mockChangeRequests: ChangeRequest[] = [
  {
    id: 'cr1',
    taskId: 't3',
    originalStartDate: '2026-02-20',
    originalEndDate: '2026-03-20',
    newStartDate: '2026-02-20',
    newEndDate: '2026-03-30',
    justification: 'Se detectaron más tablas de las previstas inicialmente en el sistema legacy.',
    status: 'Approved',
    requestedBy: '3',
    requestedDate: '2026-02-15'
  }
];

export const mockRiskActions: RiskAction[] = [
  { id: 'ra1', riskId: 'r1', description: 'Implementar compresión de datos en el túnel VPN', ownerId: '5', dueDate: '2026-02-28', status: 'In Progress' },
  { id: 'ra2', riskId: 'r4_2', description: 'Contratar soporte premium del fabricante SCADA', ownerId: '3', dueDate: '2026-03-15', status: 'Pending' },
  { id: 'ra3', riskId: 'r6_1', description: 'Talleres de sensibilización con gerencia media', ownerId: '2', dueDate: '2026-02-10', status: 'Completed' },
  { id: 'ra4', riskId: 'r4_1', description: 'Seguro de transporte internacional con cobertura total', ownerId: '1', dueDate: '2026-02-01', status: 'Completed' },
  { id: 'ra5', riskId: 'r5', description: 'Desarrollo de middleware de compatibilidad', ownerId: '4', dueDate: '2026-04-30', status: 'In Progress' }
];

export const mockIssues: Issue[] = [
  {
    id: 'i1',
    projectId: 'p1',
    description: 'Latencia de red intermitente en el enlace dedicado',
    severity: 'High',
    status: 'Open',
    ownerId: '3'
  }
];
