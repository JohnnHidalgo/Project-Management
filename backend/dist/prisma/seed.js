import 'dotenv/config';
import { PrismaClient, BudgetCategory, MilestoneStatus, TaskStatus, TaskPriority, ExpenseStatus, RiskStatus, RiskCategory, RiskStrategy, ApprovalStatus, StakeholderPower, IssueSeverity, IssueStatus, ChangeRequestStatus, SnapshotStatus, LessonCategory, BudgetType, StakeholderInterest } from '../.prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcrypt';
if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set in env');
}
const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
async function hashPassword(password) {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
}
async function main() {
    // Usuarios - Update existing users with email and password
    const hashedPassword = await hashPassword('password123');
    const users = [
        { id: '1', name: 'Rafael Sponsor', email: 'rafael.sponsor@inti.com', password: hashedPassword, role: 'Sponsor', department: 'Executive', phone: '123456', position: 'Director General' },
        { id: '2', name: 'Ana PMO', email: 'ana.pmo@inti.com', password: hashedPassword, role: 'PMO', department: 'PMO Office', phone: '789012', position: 'Gerente de Portafolio' },
        { id: '3', name: 'Juan PM', email: 'juan.pm@inti.com', password: hashedPassword, role: 'PM', department: 'TI', phone: '345678', position: 'Project Manager Senior' },
        { id: '4', name: 'Elena Dev', email: 'elena.dev@inti.com', password: hashedPassword, role: 'Team_Member', department: 'Desarrollo', phone: '901234', position: 'Lead Engineer' },
        { id: '5', name: 'Carlos Tech', email: 'carlos.tech@inti.com', password: hashedPassword, role: 'Team_Member', department: 'Sistemas', phone: '567890', position: 'SysAdmin' },
        { id: '6', name: 'Maria Marketing', email: 'maria.marketing@inti.com', password: hashedPassword, role: 'Stakeholder', department: 'Marketing', position: 'Directora de Marca' }
    ];
    for (const user of users) {
        await prisma.user.upsert({
            where: { id: user.id },
            update: {
                email: user.email,
                password: user.password
            },
            create: user
        });
    }
    // Proyectos - Create all projects with pmCanEdit field
    await prisma.project.createMany({
        data: [
            {
                id: 'p1',
                name: 'Migración ERP a Cloud AWS',
                description: 'Migración de toda la infraestructura local de SAP a la nube de AWS para mejorar disponibilidad.',
                status: 'Active',
                budget: 150000,
                startDate: new Date('2026-01-01'),
                endDate: new Date('2026-12-31'),
                pmId: '3',
                pmoId: '2',
                businessCase: 'La infraestructura actual tiene 5 años y falla frecuentemente. El costo de mantenimiento local supera al costo de suscripción cloud.',
                strategicAlignment: 'Transformación Digital 2026',
                generalObjective: 'Lograr una disponibilidad del 99.9% y reducir costos operativos en un 20%.',
                assumptions: 'AWS mantiene precios competitivos; El equipo interno tiene tiempo para capacitación.',
                constraints: 'Debe terminarse antes del vencimiento del contrato del datacenter actual.',
                progress: 45,
                pmCanEdit: true,
            },
            {
                id: 'p2',
                name: 'Implementación CRM Salesforce',
                description: 'Implementación de Salesforce para el equipo de ventas y atención al cliente.',
                status: 'Draft',
                budget: 85000,
                startDate: new Date('2026-03-01'),
                endDate: new Date('2026-09-30'),
                pmId: '3',
                pmoId: '2',
                businessCase: 'Actualmente perdemos el 30% de leads por falta de seguimiento centralizado.',
                strategicAlignment: 'Excelencia en el Cliente',
                generalObjective: 'Centralizar la información de clientes para aumentar la tasa de conversión en un 15%.',
                progress: 10,
                pmCanEdit: false,
            },
            {
                id: 'p3',
                name: 'Expansión Almacén Logístico',
                description: 'Ampliación física y automatización del almacén central en El Alto.',
                status: 'Draft',
                budget: 500000,
                startDate: new Date('2026-06-01'),
                endDate: new Date('2027-06-01'),
                pmId: '3',
                pmoId: '2',
                strategicAlignment: 'Crecimiento Logístico',
                generalObjective: 'Aumentar la capacidad de almacenamiento en un 50% y reducir tiempos de despacho.',
                progress: 0,
                pmCanEdit: false,
            },
            {
                id: 'p4',
                name: 'Automatización Planta Manufactura',
                description: 'Instalación de brazos robóticos y software de control de procesos en la planta de producción.',
                status: 'Active',
                budget: 850000,
                startDate: new Date('2026-02-01'),
                endDate: new Date('2026-11-30'),
                pmId: '3',
                pmoId: '2',
                businessCase: 'La competencia ha reducido costos en un 15% mediante automatización. Necesitamos igualar la eficiencia para mantener margen.',
                strategicAlignment: 'Excelencia Operacional',
                generalObjective: 'Aumentar la eficiencia de producción en un 25% y reducir el desperdicio de materia prima.',
                progress: 25,
                pmCanEdit: true,
            },
            {
                id: 'p5',
                name: 'Portal de Autoservicio Clientes',
                description: 'Desarrollo de plataforma web y móvil para que los clientes gestionen sus pedidos de forma autónoma.',
                status: 'Draft',
                budget: 120000,
                startDate: new Date('2026-05-01'),
                endDate: new Date('2026-10-31'),
                pmId: '3',
                pmoId: '2',
                strategicAlignment: 'Digitalización del Cliente',
                generalObjective: 'Reducir el volumen de llamadas a soporte en un 40% proporcionando herramientas digitales.',
                progress: 5,
                pmCanEdit: false,
            },
            {
                id: 'p6',
                name: 'Auditoría ISO 27001 - Seguridad',
                description: 'Certificación de la norma internacional de seguridad de la información para toda la organización.',
                status: 'Active',
                budget: 45000,
                startDate: new Date('2026-01-15'),
                endDate: new Date('2026-07-15'),
                pmId: '3',
                pmoId: '2',
                strategicAlignment: 'Gestión de Riesgos Corporativos',
                generalObjective: 'Obtener la certificación ISO 27001 para mitigar riesgos de ciberseguridad y cumplir con regulaciones.',
                progress: 60,
                pmCanEdit: false,
            },
            {
                id: 'p7',
                name: 'Renovación de Infraestructura Red Core',
                description: 'Actualización de switches y routers principales en el Datacenter Central.',
                status: 'Completed',
                budget: 250000,
                startDate: new Date('2025-06-01'),
                endDate: new Date('2025-12-31'),
                pmId: '3',
                pmoId: '2',
                strategicAlignment: 'Infraestructura Tecnológica',
                generalObjective: 'Modernizar la red core para soportar tráfico de 10Gbps en toda la planta.',
                progress: 100,
                pmCanEdit: false,
            }
        ],
        skipDuplicates: true,
    });
    // Project relations: sponsors + team members
    await prisma.projectSponsor.createMany({
        data: [
            { projectId: 'p1', sponsorId: '1' }, { projectId: 'p2', sponsorId: '1' }, { projectId: 'p3', sponsorId: '1' },
            { projectId: 'p4', sponsorId: '1' }, { projectId: 'p5', sponsorId: '1' }, { projectId: 'p6', sponsorId: '1' },
            { projectId: 'p7', sponsorId: '1' }
        ],
        skipDuplicates: true,
    });
    await prisma.projectTeamMember.createMany({
        data: [
            { projectId: 'p1', teamMemberId: '4' }, { projectId: 'p1', teamMemberId: '5' },
            { projectId: 'p2', teamMemberId: '6' }, { projectId: 'p3', teamMemberId: '5' },
            { projectId: 'p4', teamMemberId: '5' }, { projectId: 'p5', teamMemberId: '4' },
            { projectId: 'p5', teamMemberId: '6' }, { projectId: 'p6', teamMemberId: '5' },
            { projectId: 'p7', teamMemberId: '5' }
        ],
        skipDuplicates: true,
    });
    // Specific objectives
    const objectives = [
        { id: 'so1', projectId: 'p1', description: 'Migrar BD productiva sin pérdida de datos', successCriteria: '0 registros perdidos', kpi: '% Integridad de datos' },
        { id: 'so2', projectId: 'p1', description: 'Reducir latencia de acceso externo', successCriteria: 'Latencia < 100ms', kpi: 'Tiempo de respuesta (ms)' },
        { id: 'so2_1', projectId: 'p2', description: 'Integrar con el ERP actual', successCriteria: 'Sincronización en tiempo real', kpi: 'Tasa de error de sincronización' },
        { id: 'so2_2', projectId: 'p2', description: 'Capacitar al 100% del equipo comercial', successCriteria: 'Examen de certificación interna aprobado', kpi: '% Personal capacitado' },
        { id: 'so3_1', projectId: 'p3', description: 'Construcción de Nave C', successCriteria: 'Entrega de obra civil sin observaciones', kpi: 'm2 construidos' },
        { id: 'so3_2', projectId: 'p3', description: 'Instalar sistema de racks automáticos', successCriteria: '1000 picks por hora alcanzados', kpi: 'Picks por hora' },
        { id: 'so4_1', projectId: 'p4', description: 'Instalar 4 celdas robóticas', successCriteria: 'Operación continua 24/7', kpi: 'OEE (Eficiencia General)' },
        { id: 'so4_2', projectId: 'p4', description: 'Integrar con sistema de control SCADA', successCriteria: 'Monitoreo en tiempo real', kpi: 'Latencia de datos de sensores' },
        { id: 'so5_1', projectId: 'p5', description: 'Lanzar MVP en 3 meses', successCriteria: 'Funcionalidades básicas de pedido activas', kpi: 'Días para lanzamiento' },
        { id: 'so5_2', projectId: 'p5', description: 'Lograr 10,000 usuarios activos', successCriteria: 'Descargas y registros únicos', kpi: 'Usuarios Activos Mensuales' },
        { id: 'so6_1', projectId: 'p6', description: 'Mapear 100% de activos críticos', successCriteria: 'Inventario validado por auditoría externa', kpi: '% Activos Inventariados' },
        { id: 'so6_2', projectId: 'p6', description: 'Implementar controles de acceso biométricos', successCriteria: 'Instalación en site principal', kpi: 'Puntos de acceso asegurados' },
        { id: 'so7_1', projectId: 'p7', description: 'Migración de fibra óptica', successCriteria: 'Backbone de 40Gbps operativo', kpi: 'Ancho de banda disponible (Gbps)' }
    ];
    for (const obj of objectives) {
        await prisma.projectSpecificObjective.upsert({
            where: { id: obj.id },
            update: obj,
            create: obj
        });
    }
    // Budget lines
    const budgetLines = [
        { id: 'bl1', projectId: 'p1', category: BudgetCategory.Services, budgetType: BudgetType.OPEX, description: 'Suscripción AWS Anual', plannedAmount: 50000, executionDate: new Date('2026-01-05'), status: ApprovalStatus.Approved },
        { id: 'bl2', projectId: 'p1', category: BudgetCategory.Labor, budgetType: BudgetType.OPEX, description: 'Consultoría Migración', plannedAmount: 30000, executionDate: new Date('2026-02-01'), status: ApprovalStatus.Approved },
        { id: 'bl3', projectId: 'p1', category: BudgetCategory.Hardware, budgetType: BudgetType.CAPEX, description: 'Servidores de Respaldo Local', plannedAmount: 20000, executionDate: new Date('2026-03-15'), status: ApprovalStatus.Approved },
        { id: 'bl2_1', projectId: 'p2', category: BudgetCategory.Software, budgetType: BudgetType.OPEX, description: 'Licencias Salesforce 1er año', plannedAmount: 45000, executionDate: new Date('2026-03-05'), status: ApprovalStatus.Pending },
        { id: 'bl2_2', projectId: 'p2', category: BudgetCategory.Services, budgetType: BudgetType.OPEX, description: 'Partners de Implementación', plannedAmount: 40000, executionDate: new Date('2026-04-01'), status: ApprovalStatus.Pending },
        { id: 'bl4_1', projectId: 'p4', category: BudgetCategory.Hardware, budgetType: BudgetType.CAPEX, description: 'Brazos Robóticos Kuka', plannedAmount: 600000, executionDate: new Date('2026-02-20'), status: ApprovalStatus.Approved },
        { id: 'bl4_2', projectId: 'p4', category: BudgetCategory.Services, budgetType: BudgetType.OPEX, description: 'Consultoría Integración SCADA', plannedAmount: 150000, executionDate: new Date('2026-03-10'), status: ApprovalStatus.Approved },
        { id: 'bl6_1', projectId: 'p6', category: BudgetCategory.Services, budgetType: BudgetType.OPEX, description: 'Entidad Certificadora (BSI)', plannedAmount: 20000, executionDate: new Date('2026-02-10'), status: ApprovalStatus.Approved },
        { id: 'bl6_2', projectId: 'p6', category: BudgetCategory.Labor, budgetType: BudgetType.OPEX, description: 'Capacitación en Ciberseguridad', plannedAmount: 15000, executionDate: new Date('2026-03-01'), status: ApprovalStatus.Approved }
    ];
    for (const bl of budgetLines) {
        await prisma.budgetLine.upsert({
            where: { id: bl.id },
            update: bl,
            create: bl
        });
    }
    // Milestones
    const milestones = [
        { id: 'm1', projectId: 'p1', name: 'Arquitectura y Redes', description: '', startDate: new Date('2026-01-01'), endDate: new Date('2026-02-15'), weight: 20, status: MilestoneStatus.Completed, progress: 100 },
        { id: 'm2', projectId: 'p1', name: 'Migración Base Datos', description: '', startDate: new Date('2026-02-16'), endDate: new Date('2026-05-30'), weight: 40, status: MilestoneStatus.In_Progress, progress: 50 },
        { id: 'm3', projectId: 'p1', name: 'Pruebas de Aceptación', description: '', startDate: new Date('2026-06-01'), endDate: new Date('2026-08-30'), weight: 40, status: MilestoneStatus.Pending, progress: 0 },
        { id: 'm4', projectId: 'p2', name: 'Diseño de Procesos', description: '', startDate: new Date('2026-03-01'), endDate: new Date('2026-04-15'), weight: 30, status: MilestoneStatus.In_Progress, progress: 20 },
        { id: 'm5', projectId: 'p2', name: 'Configuración CRM', description: '', startDate: new Date('2026-04-16'), endDate: new Date('2026-07-30'), weight: 70, status: MilestoneStatus.Pending, progress: 0 }
    ];
    for (const m of milestones) {
        await prisma.milestone.upsert({
            where: { id: m.id },
            update: m,
            create: m
        });
    }
    // Tasks
    const tasks = [
        { id: 't1', milestoneId: 'm1', name: 'Diseño de VPC', description: 'Definir subredes y seguridad', startDate: new Date('2026-01-05'), endDate: new Date('2026-01-15'), assignedTo: '4', progress: 100, status: TaskStatus.Completed, priority: TaskPriority.High },
        { id: 't2', milestoneId: 'm1', name: 'Túnel VPN con Local', description: 'Conectividad segura', startDate: new Date('2026-01-16'), endDate: new Date('2026-01-30'), assignedTo: '5', progress: 100, status: TaskStatus.Completed, priority: TaskPriority.High, predecessorId: 't1' },
        { id: 't3', milestoneId: 'm2', name: 'Limpieza de Datos', description: 'Eliminar registros obsoletos', startDate: new Date('2026-02-20'), endDate: new Date('2026-03-30'), assignedTo: '4', progress: 80, status: TaskStatus.In_Progress, priority: TaskPriority.Medium },
        { id: 't4', milestoneId: 'm2', name: 'Script de Migración', description: 'Desarrollo de ETL', startDate: new Date('2026-04-01'), endDate: new Date('2026-05-15'), assignedTo: '5', progress: 10, status: TaskStatus.Pending, priority: TaskPriority.High, predecessorId: 't3' },
        { id: 't5', milestoneId: 'm4', name: 'Levantamiento Requerimientos', description: 'Entrevistas con ventas', startDate: new Date('2026-03-05'), endDate: new Date('2026-03-25'), assignedTo: '6', progress: 40, status: TaskStatus.In_Progress, priority: TaskPriority.High }
    ];
    for (const t of tasks) {
        await prisma.task.upsert({
            where: { id: t.id },
            update: t,
            create: t
        });
    }
    // Expenses
    const expenses = [
        { id: 'e1', projectId: 'p1', budgetLineId: 'bl1', amount: 12000, date: new Date('2026-01-10'), description: 'Suscripción AWS Q1', category: BudgetCategory.Services, status: ExpenseStatus.Paid },
        { id: 'e2', projectId: 'p1', budgetLineId: 'bl2', amount: 8000, date: new Date('2026-02-05'), description: 'Consultoría inicial', category: BudgetCategory.Services, status: ExpenseStatus.Paid }
    ];
    for (const e of expenses) {
        await prisma.expense.upsert({
            where: { id: e.id },
            update: e,
            create: e
        });
    }
    // Risks
    const risks = [
        { id: 'r1', projectId: 'p1', description: 'Latencia excesiva en sincronización de datos', probability: 0.3, impact: 0.8, status: RiskStatus.Open, category: RiskCategory.Time, strategy: RiskStrategy.Mitigate, ownerId: '4' },
        { id: 'r2', projectId: 'p1', description: 'Sobrecosto en consumo de storage AWS', probability: 0.5, impact: 0.6, status: RiskStatus.Open, category: RiskCategory.Cost, strategy: RiskStrategy.Mitigate, ownerId: '3' },
        { id: 'r4', projectId: 'p1', description: 'Indisponibilidad de consultores clave SAP', probability: 0.2, impact: 0.9, status: RiskStatus.Open, category: RiskCategory.Resources, strategy: RiskStrategy.Avoid, ownerId: '2' },
        { id: 'r5', projectId: 'p1', description: 'Incompatibilidad de versiones de API legacy', probability: 0.6, impact: 0.7, status: RiskStatus.Open, category: RiskCategory.Scope, strategy: RiskStrategy.Mitigate, ownerId: '4' },
        { id: 'r4_1', projectId: 'p4', description: 'Retraso en importación de brazos robóticos', probability: 0.4, impact: 0.9, status: RiskStatus.Open, category: RiskCategory.Time, strategy: RiskStrategy.Transfer, ownerId: '3' },
        { id: 'r4_2', projectId: 'p4', description: 'Fallas en la integración SCADA-ERP', probability: 0.7, impact: 0.8, status: RiskStatus.Open, category: RiskCategory.Scope, strategy: RiskStrategy.Mitigate, ownerId: '5' },
        { id: 'r4_3', projectId: 'p4', description: 'Accidentes durante la instalación mecánica', probability: 0.1, impact: 1.0, status: RiskStatus.Open, category: RiskCategory.Resources, strategy: RiskStrategy.Mitigate, ownerId: '1' },
        { id: 'r6_1', projectId: 'p6', description: 'Falta de compromiso de los jefes de área', probability: 0.8, impact: 0.7, status: RiskStatus.Open, category: RiskCategory.Scope, strategy: RiskStrategy.Mitigate, ownerId: '2' },
        { id: 'r6_2', projectId: 'p6', description: 'Hallazgos críticos en pre-auditoría', probability: 0.5, impact: 0.8, status: RiskStatus.Open, category: RiskCategory.Time, strategy: RiskStrategy.Avoid, ownerId: '3' },
        { id: 'r6_3', projectId: 'p6', description: 'Fuga de información durante el proceso', probability: 0.2, impact: 0.9, status: RiskStatus.Open, category: RiskCategory.Resources, strategy: RiskStrategy.Mitigate, ownerId: '5' },
        { id: 'r_gen1', projectId: 'p2', description: 'Resistencia al cambio del equipo comercial', probability: 0.7, impact: 0.9, status: RiskStatus.Open, category: RiskCategory.Scope, strategy: RiskStrategy.Mitigate, ownerId: '6' },
        { id: 'r_crit1', projectId: 'p1', description: 'Intento de ciberataque masivo (Ransomware)', probability: 0.8, impact: 1.0, status: RiskStatus.Open, category: RiskCategory.Resources, strategy: RiskStrategy.Mitigate, ownerId: '5' },
        { id: 'r_crit2', projectId: 'p4', description: 'Huelga nacional de transporte (Afecta logística)', probability: 0.7, impact: 0.8, status: RiskStatus.Open, category: RiskCategory.Time, strategy: RiskStrategy.Avoid, ownerId: '1' },
        { id: 'r_crit3', projectId: 'p6', description: 'Pérdida de backups históricos durante auditoría', probability: 0.65, impact: 0.9, status: RiskStatus.Open, category: RiskCategory.Resources, strategy: RiskStrategy.Mitigate, ownerId: '3' },
        { id: 'r_low1', projectId: 'p1', description: 'Retraso en entrega de papelería administrativa', probability: 0.2, impact: 0.1, status: RiskStatus.Open, category: RiskCategory.Cost, strategy: RiskStrategy.Accept, ownerId: '3' },
        { id: 'r_low2', projectId: 'p5', description: 'Desajuste menor en paleta de colores del portal', probability: 0.4, impact: 0.2, status: RiskStatus.Open, category: RiskCategory.Scope, strategy: RiskStrategy.Accept, ownerId: '4' },
        { id: 'r_low3', projectId: 'p2', description: 'Indisponibilidad breve de sala de juntas para capacitación', probability: 0.3, impact: 0.2, status: RiskStatus.Open, category: RiskCategory.Time, strategy: RiskStrategy.Accept, ownerId: '2' },
        { id: 'r_low4', projectId: 'p4', description: 'Cambio de marca en herramientas de mano secundarias', probability: 0.1, impact: 0.1, status: RiskStatus.Open, category: RiskCategory.Cost, strategy: RiskStrategy.Accept, ownerId: '5' }
    ];
    for (const r of risks) {
        await prisma.risk.upsert({
            where: { id: r.id },
            update: r,
            create: r
        });
    }
    // Risk actions
    const riskActions = [
        { id: 'ra1', riskId: 'r1', description: 'Implementar compresión de datos en el túnel VPN', ownerId: '5', dueDate: new Date('2026-02-28'), status: ApprovalStatus.Pending },
        { id: 'ra2', riskId: 'r4_2', description: 'Contratar soporte premium del fabricante SCADA', ownerId: '3', dueDate: new Date('2026-03-15'), status: ApprovalStatus.Pending },
        { id: 'ra3', riskId: 'r6_1', description: 'Talleres de sensibilización con gerencia media', ownerId: '2', dueDate: new Date('2026-02-10'), status: ApprovalStatus.Pending },
        { id: 'ra4', riskId: 'r4_1', description: 'Seguro de transporte internacional con cobertura total', ownerId: '1', dueDate: new Date('2026-02-01'), status: ApprovalStatus.Pending },
        { id: 'ra5', riskId: 'r5', description: 'Desarrollo de middleware de compatibilidad', ownerId: '4', dueDate: new Date('2026-04-30'), status: ApprovalStatus.Pending }
    ];
    for (const ra of riskActions) {
        await prisma.riskAction.upsert({
            where: { id: ra.id },
            update: ra,
            create: ra
        });
    }
    // Issues
    await prisma.issue.upsert({
        where: { id: 'i1' },
        update: {
            projectId: 'p1', description: 'Latencia de red intermitente en el enlace dedicado', severity: IssueSeverity.High, status: IssueStatus.Open, ownerId: '3'
        },
        create: {
            id: 'i1', projectId: 'p1', description: 'Latencia de red intermitente en el enlace dedicado', severity: IssueSeverity.High, status: IssueStatus.Open, ownerId: '3'
        }
    });
    // Change request
    await prisma.changeRequest.upsert({
        where: { id: 'cr1' },
        update: {
            taskId: 't3', originalStartDate: new Date('2026-02-20'), originalEndDate: new Date('2026-03-20'),
            newStartDate: new Date('2026-02-20'), newEndDate: new Date('2026-03-30'), justification: 'Se detectaron más tablas de las previstas inicialmente en el sistema legacy.',
            status: ChangeRequestStatus.Approved, requestedBy: '3', requestedDate: new Date('2026-02-15')
        },
        create: {
            id: 'cr1', taskId: 't3', originalStartDate: new Date('2026-02-20'), originalEndDate: new Date('2026-03-20'),
            newStartDate: new Date('2026-02-20'), newEndDate: new Date('2026-03-30'), justification: 'Se detectaron más tablas de las previstas inicialmente en el sistema legacy.',
            status: ChangeRequestStatus.Approved, requestedBy: '3', requestedDate: new Date('2026-02-15')
        }
    });
    // Stakeholders
    const stakeholders = [
        { id: 's1', projectId: 'p1', userId: '1', power: StakeholderPower.High, interest: StakeholderInterest.High, influenceStrategy: 'Reuniones mensuales de avance' },
        { id: 's2', projectId: 'p1', userId: '6', power: StakeholderPower.Low, interest: StakeholderInterest.High, influenceStrategy: 'Reportes de impacto en marketing' }
    ];
    for (const s of stakeholders) {
        await prisma.stakeholder.upsert({
            where: { id: s.id },
            update: s,
            create: s
        });
    }
    // Optional snapshot and lesson learned
    await prisma.projectSnapshot.upsert({
        where: { id: 'ps1' },
        update: {
            projectId: 'p1', date: new Date('2026-04-01'), highlights: 'Primer avance significativo de migración', plannedValue: 45000,
            earnedValue: 30000, actualSpent: 28000, cv: 2000, sv: 1500, cpi: 1.07, spi: 1.20, eac: 140000, status: SnapshotStatus.Open
        },
        create: {
            id: 'ps1', projectId: 'p1', date: new Date('2026-04-01'), highlights: 'Primer avance significativo de migración', plannedValue: 45000,
            earnedValue: 30000, actualSpent: 28000, cv: 2000, sv: 1500, cpi: 1.07, spi: 1.20, eac: 140000, status: SnapshotStatus.Open
        }
    });
    await prisma.lessonLearned.upsert({
        where: { id: 'll1' },
        update: {
            projectId: 'p1', category: LessonCategory.Technical, description: 'La migración de DB debe incluir copia de seguridad incremental diaria antes de cutover.',
            recommendation: 'Implementar backup incremental y pruebas de restauración semanales.', submittedBy: '3', date: new Date('2026-03-20')
        },
        create: {
            id: 'll1', projectId: 'p1', category: LessonCategory.Technical, description: 'La migración de DB debe incluir copia de seguridad incremental diaria antes de cutover.',
            recommendation: 'Implementar backup incremental y pruebas de restauración semanales.', submittedBy: '3', date: new Date('2026-03-20')
        }
    });
    console.log('Seed data inserted successfully.');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
