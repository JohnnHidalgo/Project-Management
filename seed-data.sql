-- Script SQL para insertar datos de prueba en la base de datos de Project Management
-- Ejecutar este script en PostgreSQL después de crear las tablas con Prisma

-- Usuarios
INSERT INTO "User" (id, name, email, password, role, department, phone, position) VALUES
('1', 'Rafael Sponsor', 'rafael.sponsor@inti.com', '$2a$10$example.hash.here', 'Sponsor', 'Executive', '123456', 'Director General'),
('2', 'Ana PMO', 'ana.pmo@inti.com', '$2a$10$example.hash.here', 'PMO', 'PMO Office', '789012', 'Gerente de Portafolio'),
('3', 'Juan PM', 'juan.pm@inti.com', '$2a$10$example.hash.here', 'PM', 'TI', '345678', 'Project Manager Senior'),
('4', 'Elena Dev', 'elena.dev@inti.com', '$2a$10$example.hash.here', 'Team_Member', 'Desarrollo', '901234', 'Lead Engineer'),
('5', 'Carlos Tech', 'carlos.tech@inti.com', '$2a$10$example.hash.here', 'Team_Member', 'Sistemas', '567890', 'SysAdmin'),
('6', 'Maria Marketing', 'maria.marketing@inti.com', '$2a$10$example.hash.here', 'Stakeholder', 'Marketing', NULL, 'Directora de Marca')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  password = EXCLUDED.password,
  role = EXCLUDED.role,
  department = EXCLUDED.department,
  phone = EXCLUDED.phone,
  position = EXCLUDED.position;

-- Proyectos
INSERT INTO "Project" (id, name, description, status, budget, "startDate", "endDate", "pmId", "pmoId", "businessCase", "strategicAlignment", "generalObjective", assumptions, constraints, progress, "pmCanEdit") VALUES
('p1', 'Migración ERP a Cloud AWS', 'Migración de toda la infraestructura local de SAP a la nube de AWS para mejorar disponibilidad.', 'Active', 150000, '2026-01-01', '2026-12-31', '3', '2', 'La infraestructura actual tiene 5 años y falla frecuentemente. El costo de mantenimiento local supera al costo de suscripción cloud.', 'Transformación Digital 2026', 'Lograr una disponibilidad del 99.9% y reducir costos operativos en un 20%.', 'AWS mantiene precios competitivos; El equipo interno tiene tiempo para capacitación.', 'Debe terminarse antes del vencimiento del contrato del datacenter actual.', 45, true),
('p2', 'Implementación CRM Salesforce', 'Implementación de Salesforce para el equipo de ventas y atención al cliente.', 'Draft', 85000, '2026-03-01', '2026-09-30', '3', '2', 'Actualmente perdemos el 30% de leads por falta de seguimiento centralizado.', 'Excelencia en el Cliente', 'Centralizar la información de clientes para aumentar la tasa de conversión en un 15%.', NULL, NULL, 10, false),
('p3', 'Expansión Almacén Logístico', 'Ampliación física y automatización del almacén central en El Alto.', 'Draft', 500000, '2026-06-01', '2027-06-01', '3', '2', NULL, 'Crecimiento Logístico', 'Aumentar la capacidad de almacenamiento en un 50% y reducir tiempos de despacho.', NULL, NULL, 0, false),
('p4', 'Automatización Planta Manufactura', 'Instalación de brazos robóticos y software de control de procesos en la planta de producción.', 'Active', 850000, '2026-02-01', '2026-11-30', '3', '2', 'La competencia ha reducido costos en un 15% mediante automatización. Necesitamos igualar la eficiencia para mantener margen.', 'Excelencia Operacional', 'Aumentar la eficiencia de producción en un 25% y reducir el desperdicio de materia prima.', NULL, NULL, 25, true),
('p5', 'Portal de Autoservicio Clientes', 'Desarrollo de plataforma web y móvil para que los clientes gestionen sus pedidos de forma autónoma.', 'Draft', 120000, '2026-05-01', '2026-10-31', '3', '2', NULL, 'Digitalización del Cliente', 'Reducir el volumen de llamadas a soporte en un 40% proporcionando herramientas digitales.', NULL, NULL, 5, false),
('p6', 'Auditoría ISO 27001 - Seguridad', 'Certificación de la norma internacional de seguridad de la información para toda la organización.', 'Active', 45000, '2026-01-15', '2026-07-15', '3', '2', NULL, 'Gestión de Riesgos Corporativos', 'Obtener la certificación ISO 27001 para mitigar riesgos de ciberseguridad y cumplir con regulaciones.', NULL, NULL, 60, false),
('p7', 'Renovación de Infraestructura Red Core', 'Actualización de switches y routers principales en el Datacenter Central.', 'Completed', 250000, '2025-06-01', '2025-12-31', '3', '2', NULL, 'Infraestructura Tecnológica', 'Modernizar la red core para soportar tráfico de 10Gbps en toda la planta.', NULL, NULL, 100, false)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  status = EXCLUDED.status,
  budget = EXCLUDED.budget,
  "startDate" = EXCLUDED."startDate",
  "endDate" = EXCLUDED."endDate",
  "pmId" = EXCLUDED."pmId",
  "pmoId" = EXCLUDED."pmoId",
  "businessCase" = EXCLUDED."businessCase",
  "strategicAlignment" = EXCLUDED."strategicAlignment",
  "generalObjective" = EXCLUDED."generalObjective",
  assumptions = EXCLUDED.assumptions,
  constraints = EXCLUDED.constraints,
  progress = EXCLUDED.progress,
  "pmCanEdit" = EXCLUDED."pmCanEdit";

-- Project Sponsors
INSERT INTO "ProjectSponsor" ("projectId", "sponsorId") VALUES
('p1', '1'), ('p2', '1'), ('p3', '1'), ('p4', '1'), ('p5', '1'), ('p6', '1'), ('p7', '1')
ON CONFLICT ("projectId", "sponsorId") DO NOTHING;

-- Project Team Members
INSERT INTO "ProjectTeamMember" ("projectId", "teamMemberId") VALUES
('p1', '4'), ('p1', '5'), ('p2', '6'), ('p3', '5'), ('p4', '5'), ('p5', '4'), ('p5', '6'), ('p6', '5'), ('p7', '5')
ON CONFLICT ("projectId", "teamMemberId") DO NOTHING;

-- Project Specific Objectives
INSERT INTO "ProjectSpecificObjective" (id, "projectId", description, "successCriteria", kpi) VALUES
('so1', 'p1', 'Migrar BD productiva sin pérdida de datos', '0 registros perdidos', '% Integridad de datos'),
('so2', 'p1', 'Reducir latencia de acceso externo', 'Latencia < 100ms', 'Tiempo de respuesta (ms)'),
('so2_1', 'p2', 'Integrar con el ERP actual', 'Sincronización en tiempo real', 'Tasa de error de sincronización'),
('so2_2', 'p2', 'Capacitar al 100% del equipo comercial', 'Examen de certificación interna aprobado', '% Personal capacitado'),
('so3_1', 'p3', 'Construcción de Nave C', 'Entrega de obra civil sin observaciones', 'm2 construidos'),
('so3_2', 'p3', 'Instalar sistema de racks automáticos', '1000 picks por hora alcanzados', 'Picks por hora'),
('so4_1', 'p4', 'Instalar 4 celdas robóticas', 'Operación continua 24/7', 'OEE (Eficiencia General)'),
('so4_2', 'p4', 'Integrar con sistema de control SCADA', 'Monitoreo en tiempo real', 'Latencia de datos de sensores'),
('so5_1', 'p5', 'Lanzar MVP en 3 meses', 'Funcionalidades básicas de pedido activas', 'Días para lanzamiento'),
('so5_2', 'p5', 'Lograr 10,000 usuarios activos', 'Descargas y registros únicos', 'Usuarios Activos Mensuales'),
('so6_1', 'p6', 'Mapear 100% de activos críticos', 'Inventario validado por auditoría externa', '% Activos Inventariados'),
('so6_2', 'p6', 'Implementar controles de acceso biométricos', 'Instalación en site principal', 'Puntos de acceso asegurados'),
('so7_1', 'p7', 'Migración de fibra óptica', 'Backbone de 40Gbps operativo', 'Ancho de banda disponible (Gbps)')
ON CONFLICT (id) DO UPDATE SET
  "projectId" = EXCLUDED."projectId",
  description = EXCLUDED.description,
  "successCriteria" = EXCLUDED."successCriteria",
  kpi = EXCLUDED.kpi;

-- Budget Lines
INSERT INTO "BudgetLine" (id, "projectId", category, "budgetType", description, "plannedAmount", "executionDate", status) VALUES
('bl1', 'p1', 'Services', 'OPEX', 'Suscripción AWS Anual', 50000, '2026-01-05', 'Approved'),
('bl2', 'p1', 'Labor', 'OPEX', 'Consultoría Migración', 30000, '2026-02-01', 'Approved'),
('bl3', 'p1', 'Hardware', 'CAPEX', 'Servidores de Respaldo Local', 20000, '2026-03-15', 'Approved'),
('bl2_1', 'p2', 'Software', 'OPEX', 'Licencias Salesforce 1er año', 45000, '2026-03-05', 'Pending'),
('bl2_2', 'p2', 'Services', 'OPEX', 'Partners de Implementación', 40000, '2026-04-01', 'Pending'),
('bl4_1', 'p4', 'Hardware', 'CAPEX', 'Brazos Robóticos Kuka', 600000, '2026-02-20', 'Approved'),
('bl4_2', 'p4', 'Services', 'OPEX', 'Consultoría Integración SCADA', 150000, '2026-03-10', 'Approved'),
('bl6_1', 'p6', 'Services', 'OPEX', 'Entidad Certificadora (BSI)', 20000, '2026-02-10', 'Approved'),
('bl6_2', 'p6', 'Labor', 'OPEX', 'Capacitación en Ciberseguridad', 15000, '2026-03-01', 'Approved')
ON CONFLICT (id) DO UPDATE SET
  "projectId" = EXCLUDED."projectId",
  category = EXCLUDED.category,
  "budgetType" = EXCLUDED."budgetType",
  description = EXCLUDED.description,
  "plannedAmount" = EXCLUDED."plannedAmount",
  "executionDate" = EXCLUDED."executionDate",
  status = EXCLUDED.status;

-- Milestones
INSERT INTO "Milestone" (id, "projectId", name, description, "startDate", "endDate", weight, status, progress) VALUES
('m1', 'p1', 'Arquitectura y Redes', '', '2026-01-01', '2026-02-15', 20, 'Completed', 100),
('m2', 'p1', 'Migración Base Datos', '', '2026-02-16', '2026-05-30', 40, 'In_Progress', 50),
('m3', 'p1', 'Pruebas de Aceptación', '', '2026-06-01', '2026-08-30', 40, 'Pending', 0),
('m4', 'p2', 'Diseño de Procesos', '', '2026-03-01', '2026-04-15', 30, 'In_Progress', 20),
('m5', 'p2', 'Configuración CRM', '', '2026-04-16', '2026-07-30', 70, 'Pending', 0)
ON CONFLICT (id) DO UPDATE SET
  "projectId" = EXCLUDED."projectId",
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  "startDate" = EXCLUDED."startDate",
  "endDate" = EXCLUDED."endDate",
  weight = EXCLUDED.weight,
  status = EXCLUDED.status,
  progress = EXCLUDED.progress;

-- Tasks
INSERT INTO "Task" (id, "milestoneId", name, description, "startDate", "endDate", "assignedTo", progress, status, priority, "predecessorId") VALUES
('t1', 'm1', 'Diseño de VPC', 'Definir subredes y seguridad', '2026-01-05', '2026-01-15', '4', 100, 'Completed', 'High', NULL),
('t2', 'm1', 'Túnel VPN con Local', 'Conectividad segura', '2026-01-16', '2026-01-30', '5', 100, 'Completed', 'High', 't1'),
('t3', 'm2', 'Limpieza de Datos', 'Eliminar registros obsoletos', '2026-02-20', '2026-03-30', '4', 80, 'In_Progress', 'Medium', NULL),
('t4', 'm2', 'Script de Migración', 'Desarrollo de ETL', '2026-04-01', '2026-05-15', '5', 10, 'Pending', 'High', 't3'),
('t5', 'm4', 'Levantamiento Requerimientos', 'Entrevistas con ventas', '2026-03-05', '2026-03-25', '6', 40, 'In_Progress', 'High', NULL)
ON CONFLICT (id) DO UPDATE SET
  "milestoneId" = EXCLUDED."milestoneId",
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  "startDate" = EXCLUDED."startDate",
  "endDate" = EXCLUDED."endDate",
  "assignedTo" = EXCLUDED."assignedTo",
  progress = EXCLUDED.progress,
  status = EXCLUDED.status,
  priority = EXCLUDED.priority,
  "predecessorId" = EXCLUDED."predecessorId";

-- Expenses
INSERT INTO "Expense" (id, "projectId", "budgetLineId", amount, date, description, category, status) VALUES
('e1', 'p1', 'bl1', 12000, '2026-01-10', 'Suscripción AWS Q1', 'Services', 'Paid'),
('e2', 'p1', 'bl2', 8000, '2026-02-05', 'Consultoría inicial', 'Services', 'Paid')
ON CONFLICT (id) DO UPDATE SET
  "projectId" = EXCLUDED."projectId",
  "budgetLineId" = EXCLUDED."budgetLineId",
  amount = EXCLUDED.amount,
  date = EXCLUDED.date,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  status = EXCLUDED.status;

-- Risks
INSERT INTO "Risk" (id, "projectId", description, probability, impact, status, category, strategy, "ownerId") VALUES
('r1', 'p1', 'Latencia excesiva en sincronización de datos', 0.3, 0.8, 'Open', 'Time', 'Mitigate', '4'),
('r2', 'p1', 'Sobrecosto en consumo de storage AWS', 0.5, 0.6, 'Open', 'Cost', 'Mitigate', '3'),
('r4', 'p1', 'Indisponibilidad de consultores clave SAP', 0.2, 0.9, 'Open', 'Resources', 'Avoid', '2'),
('r5', 'p1', 'Incompatibilidad de versiones de API legacy', 0.6, 0.7, 'Open', 'Scope', 'Mitigate', '4'),
('r4_1', 'p4', 'Retraso en importación de brazos robóticos', 0.4, 0.9, 'Open', 'Time', 'Transfer', '3'),
('r4_2', 'p4', 'Fallas en la integración SCADA-ERP', 0.7, 0.8, 'Open', 'Scope', 'Mitigate', '5'),
('r4_3', 'p4', 'Accidentes durante la instalación mecánica', 0.1, 1.0, 'Open', 'Resources', 'Mitigate', '1'),
('r6_1', 'p6', 'Falta de compromiso de los jefes de área', 0.8, 0.7, 'Open', 'Scope', 'Mitigate', '2'),
('r6_2', 'p6', 'Hallazgos críticos en pre-auditoría', 0.5, 0.8, 'Open', 'Time', 'Avoid', '3'),
('r6_3', 'p6', 'Fuga de información durante el proceso', 0.2, 0.9, 'Open', 'Resources', 'Mitigate', '5'),
('r_gen1', 'p2', 'Resistencia al cambio del equipo comercial', 0.7, 0.9, 'Open', 'Scope', 'Mitigate', '6'),
('r_crit1', 'p1', 'Intento de ciberataque masivo (Ransomware)', 0.8, 1.0, 'Open', 'Resources', 'Mitigate', '5'),
('r_crit2', 'p4', 'Huelga nacional de transporte (Afecta logística)', 0.7, 0.8, 'Open', 'Time', 'Avoid', '1'),
('r_crit3', 'p6', 'Pérdida de backups históricos durante auditoría', 0.65, 0.9, 'Open', 'Resources', 'Mitigate', '3'),
('r_low1', 'p1', 'Retraso en entrega de papelería administrativa', 0.2, 0.1, 'Open', 'Cost', 'Accept', '3'),
('r_low2', 'p5', 'Desajuste menor en paleta de colores del portal', 0.4, 0.2, 'Open', 'Scope', 'Accept', '4'),
('r_low3', 'p2', 'Indisponibilidad breve de sala de juntas para capacitación', 0.3, 0.2, 'Open', 'Time', 'Accept', '2'),
('r_low4', 'p4', 'Cambio de marca en herramientas de mano secundarias', 0.1, 0.1, 'Open', 'Cost', 'Accept', '5')
ON CONFLICT (id) DO UPDATE SET
  "projectId" = EXCLUDED."projectId",
  description = EXCLUDED.description,
  probability = EXCLUDED.probability,
  impact = EXCLUDED.impact,
  status = EXCLUDED.status,
  category = EXCLUDED.category,
  strategy = EXCLUDED.strategy,
  "ownerId" = EXCLUDED."ownerId";

-- Risk Actions
INSERT INTO "RiskAction" (id, "riskId", description, "ownerId", "dueDate", status) VALUES
('ra1', 'r1', 'Implementar compresión de datos en el túnel VPN', '5', '2026-02-28', 'Pending'),
('ra2', 'r4_2', 'Contratar soporte premium del fabricante SCADA', '3', '2026-03-15', 'Pending'),
('ra3', 'r6_1', 'Talleres de sensibilización con gerencia media', '2', '2026-02-10', 'Pending'),
('ra4', 'r4_1', 'Seguro de transporte internacional con cobertura total', '1', '2026-02-01', 'Pending'),
('ra5', 'r5', 'Desarrollo de middleware de compatibilidad', '4', '2026-04-30', 'Pending')
ON CONFLICT (id) DO UPDATE SET
  "riskId" = EXCLUDED."riskId",
  description = EXCLUDED.description,
  "ownerId" = EXCLUDED."ownerId",
  "dueDate" = EXCLUDED."dueDate",
  status = EXCLUDED.status;

-- Issues
INSERT INTO "Issue" (id, "projectId", description, severity, status, "ownerId") VALUES
('i1', 'p1', 'Latencia de red intermitente en el enlace dedicado', 'High', 'Open', '3')
ON CONFLICT (id) DO UPDATE SET
  "projectId" = EXCLUDED."projectId",
  description = EXCLUDED.description,
  severity = EXCLUDED.severity,
  status = EXCLUDED.status,
  "ownerId" = EXCLUDED."ownerId";

-- Change Requests
INSERT INTO "ChangeRequest" (id, "taskId", "originalStartDate", "originalEndDate", "newStartDate", "newEndDate", justification, status, "requestedBy", "requestedDate") VALUES
('cr1', 't3', '2026-02-20', '2026-03-20', '2026-02-20', '2026-03-30', 'Se detectaron más tablas de las previstas inicialmente en el sistema legacy.', 'Approved', '3', '2026-02-15')
ON CONFLICT (id) DO UPDATE SET
  "taskId" = EXCLUDED."taskId",
  "originalStartDate" = EXCLUDED."originalStartDate",
  "originalEndDate" = EXCLUDED."originalEndDate",
  "newStartDate" = EXCLUDED."newStartDate",
  "newEndDate" = EXCLUDED."newEndDate",
  justification = EXCLUDED.justification,
  status = EXCLUDED.status,
  "requestedBy" = EXCLUDED."requestedBy",
  "requestedDate" = EXCLUDED."requestedDate";

-- Stakeholders
INSERT INTO "Stakeholder" (id, "projectId", "userId", power, interest, "influenceStrategy") VALUES
('s1', 'p1', '1', 'High', 'High', 'Reuniones mensuales de avance'),
('s2', 'p1', '6', 'Low', 'High', 'Reportes de impacto en marketing')
ON CONFLICT (id) DO UPDATE SET
  "projectId" = EXCLUDED."projectId",
  "userId" = EXCLUDED."userId",
  power = EXCLUDED.power,
  interest = EXCLUDED.interest,
  "influenceStrategy" = EXCLUDED."influenceStrategy";

-- Project Snapshots
INSERT INTO "ProjectSnapshot" (id, "projectId", date, highlights, "plannedValue", "earnedValue", "actualSpent", cv, sv, cpi, spi, eac, status) VALUES
('ps1', 'p1', '2026-04-01', 'Primer avance significativo de migración', 45000, 30000, 28000, 2000, 1500, 1.07, 1.20, 140000, 'Open')
ON CONFLICT (id) DO UPDATE SET
  "projectId" = EXCLUDED."projectId",
  date = EXCLUDED.date,
  highlights = EXCLUDED.highlights,
  "plannedValue" = EXCLUDED."plannedValue",
  "earnedValue" = EXCLUDED."earnedValue",
  "actualSpent" = EXCLUDED."actualSpent",
  cv = EXCLUDED.cv,
  sv = EXCLUDED.sv,
  cpi = EXCLUDED.cpi,
  spi = EXCLUDED.spi,
  eac = EXCLUDED.eac,
  status = EXCLUDED.status;

-- Lesson Learned
INSERT INTO "LessonLearned" (id, "projectId", category, description, recommendation, "submittedBy", date) VALUES
('ll1', 'p1', 'Technical', 'La migración de DB debe incluir copia de seguridad incremental diaria antes de cutover.', 'Implementar backup incremental y pruebas de restauración semanales.', '3', '2026-03-20')
ON CONFLICT (id) DO UPDATE SET
  "projectId" = EXCLUDED."projectId",
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  recommendation = EXCLUDED.recommendation,
  "submittedBy" = EXCLUDED."submittedBy",
  date = EXCLUDED.date;