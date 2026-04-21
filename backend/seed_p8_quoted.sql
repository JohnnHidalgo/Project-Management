BEGIN;

-- Usuarios (IDs 8..11)
INSERT INTO "User"("id", "name", "email", "password", "role", "department", "phone", "position")
VALUES
  ('8','Luis Civil','luis.civil@inti.com','password_placeholder','PM','Construcción','222333','Project Manager Construcción'),
  ('9','Pedro Jefe Obra','pedro.jefeobra@inti.com','password_placeholder','Team_Member','Obra','222444','Jefe de Obra'),
  ('10','Clara Arquitecta','clara.arquitecta@inti.com','password_placeholder','Team_Member','Arquitectura','222555','Arquitecta Líder'),
  ('11','Sofia Seguridad','sofia.seguridad@inti.com','password_placeholder','Stakeholder','Seguridad','222666','Oficial de Seguridad')
ON CONFLICT ("id") DO NOTHING;

-- Proyecto p8
INSERT INTO "Project"(
  "id", "name", "description", "status", "budget", "startDate", "endDate", "pmId", "pmoId", "businessCase", "strategicAlignment", "generalObjective", "assumptions", "constraints", "progress", "pmCanEdit"
)
VALUES
('p8',
 'Construcción Edificio Corporativo',
 'Construcción de un edificio de 8 pisos para oficinas centrales, con áreas comunes, estacionamientos y certificación sísmica.',
 'Active',
 3200000,
 '2026-04-01'::timestamp,
 '2027-10-31'::timestamp,
 '8', -- pmId
 '2', -- pmoId (asume existe)
 'Necesidad de centralizar operaciones y reducir costos de alquiler; la propiedad mejora activos y flujo de caja.',
 'Expansión y consolidación de oficinas corporativas',
 'Entregar el edificio en plazo y dentro del presupuesto, cumpliendo normas de seguridad y calidad.',
 'Permisos municipales otorgados dentro de 3 meses; condiciones climáticas razonables.',
 'Zonificación y límites de altura; debería finalizar antes de Octubre 2027.',
 5,
 true
)
ON CONFLICT ("id") DO NOTHING;

-- Sponsors y team members para p8
INSERT INTO "ProjectSponsor"("projectId","sponsorId") VALUES ('p8','1') ON CONFLICT DO NOTHING;
INSERT INTO "ProjectTeamMember"("projectId","teamMemberId") VALUES ('p8','9') ON CONFLICT DO NOTHING;
INSERT INTO "ProjectTeamMember"("projectId","teamMemberId") VALUES ('p8','10') ON CONFLICT DO NOTHING;

-- Objetivos específicos
INSERT INTO "ProjectSpecificObjective"("id","projectId","description","successCriteria","kpi")
VALUES
 ('so8_1','p8','Finalizar cimentación y estructura hasta 3er piso','Estructura aprobada por control interno','Porcentaje avance estructural'),
 ('so8_2','p8','Completar instalaciones eléctricas y mecánicas','Certificación de instalaciones','Inspecciones aprobadas'),
 ('so8_3','p8','Obtener certificación sísmica','Informe de laboratorio aprobado','Cumplimiento normativa sísmica')
ON CONFLICT ("id") DO NOTHING;

-- Budget lines (mapear categorías al enum: Hardware|Software|Services|Labor|Others)
INSERT INTO "BudgetLine"(
  "id", "projectId", "category", "budgetType", "description", "plannedAmount", "executionDate", "status"
)
VALUES
 ('bl8_1','p8','Hardware','CAPEX','Obra civil - cimentación y estructura',1500000,'2026-05-01'::timestamp,'Pending'),
 ('bl8_2','p8','Hardware','CAPEX','Ascensores y equipos MEP',600000,'2026-10-01'::timestamp,'Pending'),
 ('bl8_3','p8','Services','OPEX','Supervisión y control de calidad',200000,'2026-06-01'::timestamp,'Pending'),
 ('bl8_4','p8','Labor','OPEX','Contratos de mano de obra especializada',400000,'2026-04-15'::timestamp,'Pending')
ON CONFLICT ("id") DO NOTHING;

-- Milestones
INSERT INTO "Milestone"(
  "id", "projectId", "name", "description", "startDate", "endDate", "weight", "status", "progress"
)
VALUES
 ('m8_1','p8','Permisos y Estudios Previos','Obtención de permisos municipales y estudios geotécnicos','2026-04-01'::timestamp,'2026-06-30'::timestamp,10,'In_Progress',30),
 ('m8_2','p8','Cimentación y Estructura','Cimentación, pilotes y estructura hasta 4° piso','2026-07-01'::timestamp,'2026-12-31'::timestamp,30,'Pending',0),
 ('m8_3','p8','Instalaciones MEP','Instalaciones eléctricas, HVAC y sanitarias','2027-01-01'::timestamp,'2027-05-31'::timestamp,25,'Pending',0),
 ('m8_4','p8','Acabados y Entrega','Acabados, pruebas y entrega final','2027-06-01'::timestamp,'2027-10-31'::timestamp,35,'Pending',0)
ON CONFLICT ("id") DO NOTHING;

-- Tasks (estatus/enums: TaskStatus -> Pending|In_Progress|Blocked|Completed ; TaskPriority -> Low|Medium|High)
INSERT INTO "Task"(
  "id", "milestoneId", "name", "description", "startDate", "endDate", "assignedTo", "progress", "status", "priority", "weight"
)
VALUES
 ('t8_1','m8_1','Estudio Geotécnico','Contratar laboratorio y realizar sondeos','2026-04-05'::timestamp,'2026-05-15'::timestamp,'10',50,'In_Progress','High',20),
 ('t8_2','m8_1','Trámite de permisos','Presentación de planos y documentos','2026-04-01'::timestamp,'2026-06-30'::timestamp,'8',20,'In_Progress','High',10),
 ('t8_3','m8_2','Cimentación','Excavación y movimiento de tierras','2026-07-01'::timestamp,'2026-08-31'::timestamp,'9',0,'Pending','High',40),
 ('t8_4','m8_2','Montaje estructura metálica','Levantamiento de columnas y vigas','2026-09-01'::timestamp,'2026-12-31'::timestamp,'9',0,'Pending','High',60),
 ('t8_5','m8_3','Instalación eléctrica - Planta baja','Tendido y canalización','2027-01-05'::timestamp,'2027-02-28'::timestamp,'5',0,'Pending','Medium',30),
 ('t8_6','m8_4','Recepción y pruebas','Pruebas funcionales y entrega','2027-09-01'::timestamp,'2027-10-15'::timestamp,'8',0,'Pending','High',50)
ON CONFLICT ("id") DO NOTHING;

-- Expenses
INSERT INTO "Expense"("id","projectId","budgetLineId","amount","date","description","category","status")
VALUES
 ('e8_1','p8','bl8_4',50000,'2026-04-20'::timestamp,'Adelanto a contratista principal','Labor','Estimated'),
 ('e8_2','p8','bl8_1',120000,'2026-05-10'::timestamp,'Materiales para cimentación','Hardware','Estimated')
ON CONFLICT ("id") DO NOTHING;

-- Risks (usar categorías y estrategias válidas)
INSERT INTO "Risk"("id","projectId","description","probability","impact","status","category","strategy","ownerId")
VALUES
 ('r8_1','p8','Condiciones geotécnicas adversas',0.35,0.8,'Open','Time','Mitigate','10'),
 ('r8_2','p8','Retraso en entrega de materiales críticos',0.4,0.7,'Open','Resources','Transfer','9'),
 ('r8_3','p8','Accidente laboral en obra',0.15,1.0,'Open','Resources','Mitigate','11')
ON CONFLICT ("id") DO NOTHING;

-- Risk actions (status -> ApprovalStatus: Pending|Approved|Rejected)
INSERT INTO "RiskAction"("id","riskId","description","ownerId","dueDate","status")
VALUES
 ('ra8_1','r8_1','Contratar refuerzo de cimentación y rediseño de pilotes','10','2026-06-15'::timestamp,'Pending'),
 ('ra8_2','r8_3','Implementar plan de seguridad y EPP reforzado','11','2026-05-01'::timestamp,'Pending')
ON CONFLICT ("id") DO NOTHING;

-- Stakeholders
INSERT INTO "Stakeholder"("id","projectId","userId","power","interest","influenceStrategy")
VALUES
 ('s8_1','p8','1','High','High','Informes trimestrales al directorio'),
 ('s8_2','p8','11','Low','High','Inspecciones de seguridad semanales')
ON CONFLICT ("id") DO NOTHING;

-- Task log ejemplo
INSERT INTO "TaskLog"("id","taskId","userId","date","comment","previousProgress","newProgress")
VALUES
 ('log8_1','t8_1','10','2026-04-28'::timestamp,'Sondeos geotécnicos: presencia de capa de arcilla profunda.',20,50)
ON CONFLICT ("id") DO NOTHING;

-- Change request ejemplo
INSERT INTO "ChangeRequest"("id","taskId","originalStartDate","originalEndDate","newStartDate","newEndDate","justification","status","requestedBy","requestedDate")
VALUES
 ('cr8_1','t8_3','2026-07-01'::timestamp,'2026-08-31'::timestamp,'2026-07-15'::timestamp,'2026-09-15'::timestamp,'Se requirió ampliar excavación por condiciones del suelo.','Pending','8','2026-06-20'::timestamp)
ON CONFLICT ("id") DO NOTHING;

-- Issue ejemplo
INSERT INTO "Issue"("id","projectId","description","severity","status","ownerId")
VALUES
 ('i8_1','p8','Demora en permiso de alcantarillado','Medium','Open','8')
ON CONFLICT ("id") DO NOTHING;

COMMIT;
