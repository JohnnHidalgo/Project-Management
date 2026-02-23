Especificaciones del Sistema: Project Management Hub (Ops & Tech)
Este documento detalla los requerimientos para el desarrollo de una aplicación interna de gestión de proyectos utilizando Django (Python) y PostgreSQL.

1. Arquitectura General
Base de Datos: PostgreSQL (Producción).
Backend: Node
Frontend: React se busca una interfaz limpia y corporativa.

2. Roles y Permisos
Rol	Descripción	Permisos Clave
2.1 PM (Project Manager):Dueño del proyecto. Crear proyectos, hitos, tareas y solicitar reprogramaciones. Generar SPPM mensual.
2.2 PMO (Oficina de Proyectos):	Administrador del flujo. Aprobar anteproyectos, aprobar solicitudes de cambio de fechas y activar proyectos.
2.3 Sponsor	Interesado de alto nivel. Revisar y aprobar el Project Charter.
2.4 Team Member	Ejecutor. Actualizar el estado y avance de las tareas asignadas.

3. Ciclo de Vida del Proyecto (Workflow)
El sistema debe gestionar el estado del proyecto rigurosamente:

Draft: Definición de alcance, objetivos y presupuesto inicial (PM).

Pending Initial Approval: Revisión de viabilidad por el PMO.

Planning: Definición de Milestones, Pesos, Tareas y Asignaciones.

Charter Approval: El Sponsor debe dar el visto bueno final al documento maestro.

Active: El proyecto está en ejecución. Se habilitan reportes y control de cambios.

Completed / Cancelled: Cierre del proyecto.

4. Lógica de Negocio Especializada
A. Ponderación por Hitos (Weights)

Cada hito tiene un peso relativo al éxito del proyecto.

Regla: La suma de los pesos de todos los hitos vinculados a un proyecto debe ser exactamente 100.

Cálculo de Avance:

Progreso Proyecto= i=1∑n(Progreso Hito i×Peso i)

B. Gestión de Cambios (Change Requests)

Si un proyecto está Active, el PM no puede editar directamente las fechas de las tareas.

El PM crea una ChangeRequest indicando: Tarea, Fecha Inicio/Fin original vs. Propuesta y Justificación.

La tarea permanece con las fechas originales hasta que el PMO apruebe la solicitud.

Al aprobar, el sistema actualiza automáticamente la tarea y guarda un registro histórico del cambio.

C. Snapshots Mensuales (SPPM)

El Single Page Project Management es un reporte mensual que:

Registra: Avance por hito, Riesgos actuales, Highlights del mes.

Al guardar, crea un Snapshot (copia de solo lectura) que captura el estado del presupuesto y cronograma en ese instante exacto para reportes históricos.

En cada snapshot debe completarse un resumen de Avances (relaciodado con los hitos), Awarness (listado de preocupaciones), Riesgos (en base a los riesgos identifiados, asi como los issues) En el reporte se debe escojer que riesgo, issues, avances y warnings se debe reportar. El sistea debe generar un dashboard de Tiempo, Costo, Alcance

5. Plan de Desarrollo (Fases MVP)
Fase 1: Estructura Base y Anteproyecto

Configuración de entorno y modelos de Usuario/Roles.

Módulo de creación de proyectos (Alcance, Objetivos, Costos).

Dashboard de aprobación para el PMO.

Entregable: Capacidad de crear un proyecto y que sea aprobado inicialmente.

Fase 2: Planificación y Cronograma

Creación de Milestones con validación de pesos (100%).

Gestión de Tareas (CRUD) y asignación a miembros del equipo.

Generación automática del Project Charter (Vista de impresión).

Workflow de aprobación del Sponsor.

Fase 3: Ejecución y Control de Cambios

Panel de tareas para colaboradores (Actualización de % de avance).

Módulo de Change Requests para reprogramación de fechas.

Validación de aprobación por PMO antes de impactar el cronograma.

Fase 4: Finanzas y Reportabilidad (SPPM)

Módulo de Gastos categorizados por tipo (Hardware, Software, etc.).

Cálculo de desviación presupuestaria.

Módulo de SPPM con funcionalidad de Snapshots mensuales.

Dashboards visuales de avance (Semáforos).

6. Especificaciones de Base de Datos (Modelos Principales)
Nota para la IA: Se deben implementar modelos para Project, Milestone, Task, ExpenseType, Expense, ChangeRequest y ProjectSnapshot. Es imperativo el uso de signals en Django para actualizar el progreso del proyecto automáticamente cuando una tarea cambie.