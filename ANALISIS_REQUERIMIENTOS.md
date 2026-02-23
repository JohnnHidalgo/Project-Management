# Análisis de Requerimientos - Project Management Hub

## 📋 Aspectos que Requieren Definición o Clarificación

### 1. **Modelos de Datos - Detalles Faltantes**

#### Modelos mencionados pero sin estructura:
- **User/Profile**: ¿Qué campos adicionales necesita el perfil? (departamento, teléfono, etc.)
R. Departamento, Telefono, Cargo.
- **Project**: 
  - Campos específicos: nombre, descripción, presupuesto inicial, fecha inicio/fin estimada
  R. OK
  - ¿Relación con Sponsor? (¿un proyecto tiene un Sponsor asignado o puede tener varios?)
  R.Varios, al menos uno.
  - ¿Quién puede ser PM de un proyecto? (¿cualquier usuario con rol PM?)
  R. Un usuario puede tener diferentes rolen en los proyectos (Rafael es Sponsor en Proyeto1, PM en Proyecto 2, Ejecutor en Proyecto 3.) 
  El PMO es el responsable de la creación del proyecto. Al crear un proyecto le asignara el rol de PM a cualquier usuario. 
- **Milestone**: 
  - Campos: nombre, descripción, fecha objetivo, peso
  - ¿Estado del hito? (pendiente, en progreso, completado)
  R. OK
- **Task**: 
  - Campos: nombre, descripción, fecha inicio/fin, % avance, asignado a
  - ¿Estado de la tarea? (pendiente, en progreso, bloqueada, completada)
  - ¿Prioridad?
  R. OK.
- **Risk**: Mencionado en SPPM pero no en modelos principales
  - Campos: descripción, probabilidad, impacto, estado (abierto/cerrado)
  R. Perfecto las probabilidades e impactos deben ser parametrizables en el sistema.
- **Issue**: Mencionado en SPPM pero no en modelos principales
  - Campos: descripción, severidad, estado, fecha resolución
  R. OK
- **ExpenseType**: ¿Valores predefinidos? (Hardware, Software, Servicios, Otros)
R. OK. Parametrizable en el sistema.
- **Expense**: 
  - Campos: monto, fecha, descripción, categoría
  - ¿Aprobación de gastos?
  R. El PM asignado registra los gastos (ejecución) el PMO planfica los gastos (Plan) 
- **ChangeRequest**: 
  - Campos: tarea, fecha inicio original/nueva, fecha fin original/nueva, justificación, estado
  - ¿Historial de cambios?
  R. OK todos los cambios se loguean asi como todos los registros del proyecto. Debe haber un log unico para registrar los "eventos"que ocurren en el proyecto.
- **ProjectSnapshot**: 
  - ¿Qué datos exactos captura? (presupuesto, cronograma, avances por hito)
  R. El Snapshot es un status report. El PM debe seleccionar los "itemes" que va a reportar en cuanto a los riesgos, issues, awareness a manera de bitácora. Los otros datos (avance de hitos, costos) son automáticos.
  - ¿Formato de almacenamiento? (JSON, campos individuales). 
  R. Json

### 2. **Roles y Permisos - Clarificaciones Necesarias**

- ¿Un usuario puede tener múltiples roles simultáneamente?
R. Un usuario puede tener en un proyecto diferentes roles. Podria existir en un extremo un usuario con rol de sponsor, PM en el mismo proyeto.
- ¿Cómo se asignan los roles? (¿por proyecto o globalmente?) 
R. Por proyecto
- ¿Existe un superusuario/admin que pueda gestionar todo?
R. Si
- ¿Un PM puede ser Team Member en otro proyecto?
R. Si
- ¿Quién puede asignar roles a usuarios?
R. Solamente el PMO
- ¿El Sponsor es un usuario del sistema o solo un rol asignado a un proyecto específico?
R. Es usuario 

### 3. **Workflow de Estados - Transiciones y Validaciones**

**Estados definidos:**
- Draft → Pending Initial Approval → Planning → Charter Approval → Active → Completed/Cancelled

**Faltante:**
- ¿Quién puede cambiar el estado y en qué condiciones?
R. Solo el PMO, 
- ¿Se puede retroceder estados? (ej: de Planning a Draft)
R. Solo el rol de Admin podria corrregir el estado.
- ¿Qué validaciones se requieren para cada transición?
  - Draft → Pending Initial Approval: ¿campos mínimos requeridos? 
  R. Deben estar completados los datos basicos del proyecto (project charter)
  - Planning → Charter Approval: ¿todos los hitos deben sumar 100%?
  R. Si todo validado 
  - Charter Approval → Active: ¿solo el Sponsor puede aprobar?
  R. Si
- ¿Qué pasa con las tareas si un proyecto se cancela después de estar Active?
R. Se deben cacelar en cascada todas aquellas qeu estan pendientes. Se debe registrar en el log estos cambios.
- ¿Se puede reactivar un proyecto Cancelled o Completed?
R. Aun no en esta versión MVP

### 4. **Lógica de Negocio - Detalles Adicionales**

#### A. Cálculo de Avance
- ¿Cómo se calcula el progreso de un hito? (¿promedio de tareas, suma ponderada?)
R. suma ponderada.
- ¿Qué pasa si un hito no tiene tareas asignadas?
R. No debiera ocurrir, es parte de la validación antes de aprbar el "inicio" del proyecto
- ¿El avance se actualiza en tiempo real o por batch?
R. En el momento que se ve el status

#### B. Change Requests
- ¿Cuántas solicitudes de cambio puede tener una tarea simultáneamente?
R. Definidas en un parámetro del sistema ParMaxChange=5

- ¿Se puede rechazar una Change Request? ¿Qué pasa entonces?
R. Se mantienen las fechs originales

- ¿Hay límite de cambios por proyecto/período?
R. No
- ¿Se notifica al PMO cuando hay una solicitud pendiente?
R. Si en sus "Notificaciones" 

#### C. SPPM y Snapshots
- ¿Con qué frecuencia se puede generar un SPPM? (¿una vez por mes, libre?)
R. Libre
- ¿Quién puede generar SPPM? (¿solo PM?)
R. Solo el PM
- ¿Los snapshots son editables después de creados?
R. No
- Dashboard de Tiempo, Costo, Alcance:
  - **Tiempo**: ¿comparación fecha planificada vs real?
  - **Costo**: ¿presupuesto vs gastos reales?
  - **Alcance**: ¿qué métricas específicas? (hitos completados, tareas completadas)
  R. Los alcances del proyecto deben estar definidos en el project charter. En el momento del reporte debemos reportar si los alcances se cumplirán (Full, Parcial, Imposible) puede ser un peso ej 100%
- ¿Qué son los "warnings" mencionados? ¿Cómo se generan?
R. Los warnings son una tabla de warnings parecido a los issues, ej: "WID:10, El PM dijo qeu no trabajraá mas es el proyecto durante el mes de junio por vacaciones. Status : (Open, Closed)"

### 5. **Riesgos e Issues - Modelo Completo**

- ¿Cómo se crean y gestionan los riesgos?
R. Se gestionan en un registro de riesgos (risk Register)
- ¿Los riesgos son por proyecto o globales?
R. Son por proyecto
- ¿Quién puede crear/editar/cerrar riesgos e issues?
R. solamente el PM.
- ¿Hay categorización de riesgos? (técnico, financiero, de recursos, etc.)
R. Tiempo, Alcance, Costo.
- ¿Los issues están vinculados a tareas específicas?
R. Puede estasr relacionado a tareas o a temas generales del proyecto. El PM y el PMO crean issues relacionados a proyecto. Para las tareas el PM puede crear los issues.

### 6. **Gastos y Presupuesto**

- ¿Cómo se aprueban los gastos? (¿workflow de aprobación?)
R. No se eprueban solo el PM los registra. 
- ¿Hay límites por categoría de gasto?
R. No solo warning de que se ha excedido el limite por tipo de gasto.
- ¿Se puede ajustar el presupuesto inicial después de aprobado?
R. Si, solamente el PMO.
- ¿Cómo se calcula la desviación presupuestaria? (¿porcentaje, monto absoluto?)
R. porcentaje

### 7. **Project Charter**

- ¿Qué información debe contener el Charter?
R. Objetivo, Beneficios, RElacion con objetivos estratégicos o táctivos. 
- ¿Es un documento generado automáticamente o editable?
R. Automáticamente en base a la informacion introducida (preupuesto, hitos, team, etc.)
- ¿Se puede descargar en PDF?
R. Si
- ¿Qué pasa si el Sponsor rechaza el Charter? (¿vuelve a Planning?)
R. Si

### 8. **Interfaz y UX - Requerimientos Adicionales**

- ¿Hay notificaciones por email cuando hay acciones pendientes?
R. Si 
- ¿Dashboard principal: ¿qué información muestra?
R. Abierto a sugerenciasl
- ¿Búsqueda y filtros: ¿por qué criterios?
R. En las actividades por diferentes citerioes (vencidas, proximas a vencer, por prioridad, por usuario responsable)
- ¿Exportación de datos: ¿qué formatos? (Excel, PDF, CSV)
R. Todos

### 9. **Seguridad y Auditoría**

- ¿Se registran logs de acciones importantes? (creación, aprobaciones, cambios)
R. Tod cambio
- ¿Quién puede ver qué proyectos? (¿todos los usuarios o solo asignados?)
R. Solo los asignados
- ¿Hay restricciones de acceso por departamento/área?
R. No, solo por su rol en el proyecto.

### 10. **Validaciones y Reglas de Negocio Adicionales**

- ¿Las fechas de tareas deben estar dentro del rango del proyecto?
R. Si
- ¿Las fechas de hitos deben estar dentro del rango del proyecto?
R. Si
- ¿Se puede eliminar un proyecto? ¿En qué estados?
R. No se puede eliminar solo se cancela.
- ¿Se pueden eliminar hitos/tareas? ¿Qué pasa con el progreso?
R. No solamente se cancelan.

---

## 🔄 Revisión y Mejoras Sugeridas para las Fases

### **Fase 1: Estructura Base y Anteproyecto** ✅
**Bien estructurada**, pero sugerencias:
- Agregar: Modelo de Usuario/Profile con roles
- Agregar: Sistema de autenticación básico
- Agregar: Modelo de Project con estados básicos
- Clarificar: ¿Qué campos mínimos requiere un proyecto en Draft?

### **Fase 2: Planificación y Cronograma** ✅
**Bien estructurada**, pero sugerencias:
- Agregar: Validación de fechas (tareas dentro del rango del proyecto)
- Agregar: Vista previa del Charter antes de enviar a aprobación
- Clarificar: ¿Se puede editar el proyecto después de Charter Approval?

### **Fase 3: Ejecución y Control de Cambios** ✅
**Bien estructurada**, pero sugerencias:
- Agregar: Notificaciones cuando hay Change Requests pendientes
- Agregar: Historial de cambios aprobados
- Agregar: Vista de cronograma (Gantt chart o similar)

### **Fase 4: Finanzas y Reportabilidad (SPPM)** ⚠️
**Necesita más detalle:**
- Agregar: Modelos de Risk e Issue (mencionados pero no en fases anteriores)
- Agregar: Dashboard de métricas (Tiempo, Costo, Alcance)
- Agregar: Generación de reportes exportables
- Clarificar: ¿Los riesgos e issues se crean antes de esta fase?

---

## 📝 Recomendaciones para Comenzar el Desarrollo

### **Fase 0: Setup Inicial (Agregar antes de Fase 1)**
1. Configuración del proyecto Django
2. Configuración de base de datos (SQLite para desarrollo)
3. Configuración de Tailwind CSS o Bootstrap
4. Estructura de carpetas y apps Django
5. Modelos base: User, Profile (con roles)

### **Orden Sugerido de Implementación dentro de cada Fase:**

**Fase 1:**
1. Setup del proyecto
2. Modelos User/Profile con roles
3. Autenticación básica
4. Modelo Project con estados
5. CRUD básico de proyectos
6. Dashboard PMO para aprobaciones

**Fase 2:**
1. Modelo Milestone con validación de pesos
2. Modelo Task
3. CRUD de Milestones y Tasks
4. Asignación de tareas a usuarios
5. Generación de Project Charter
6. Workflow de aprobación Sponsor

**Fase 3:**
1. Panel de tareas para Team Members
2. Actualización de avance de tareas
3. Signals para cálculo automático de progreso
4. Modelo ChangeRequest
5. CRUD de Change Requests
6. Aprobación de cambios por PMO

**Fase 4:**
1. Modelos Risk e Issue
2. CRUD de Riesgos e Issues
3. Modelos ExpenseType y Expense
4. Registro de gastos
5. Cálculo de desviación presupuestaria
6. Modelo ProjectSnapshot
7. Módulo SPPM
8. Dashboards visuales

---

## ✅ Resumen: ¿Qué Falta Definir Antes de Comenzar?

### **Crítico (debe definirse antes de empezar):**
1. Estructura completa de modelos de datos (campos, relaciones, validaciones)
2. Reglas de transición de estados del proyecto
3. Asignación de roles (¿por proyecto o global?)
4. Cálculo específico del progreso de hitos

### **Importante (debe definirse en Fase 1-2):**
5. Modelos Risk e Issue (estructura completa)
6. Campos y formato del Project Charter
7. Reglas de aprobación de gastos
8. Métricas específicas del dashboard (Tiempo, Costo, Alcance)

### **Deseable (puede definirse durante desarrollo):**
9. Notificaciones y alertas
10. Exportación de reportes
11. Búsqueda y filtros avanzados
12. Logs de auditoría

---

## 🎯 Siguiente Paso Recomendado

**Opción 1:** Comenzar con Fase 0 y Fase 1 usando supuestos razonables para los puntos no definidos, y luego ajustar.

**Opción 2:** Completar primero la especificación con los detalles faltantes antes de comenzar el desarrollo.

¿Prefieres que comience con la implementación usando supuestos razonables, o quieres primero completar la especificación?
