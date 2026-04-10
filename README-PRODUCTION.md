# Guía de Despliegue en Producción - Project Management System

## Resumen
Esta guía describe cómo desplegar la aplicación completa de gestión de proyectos en un entorno de producción usando Docker.

## Prerrequisitos
- Docker y Docker Compose instalados
- PostgreSQL de producción configurado y accesible
- Credenciales de base de datos de producción

## Configuración de Producción

### 1. Base de Datos
Asegúrate de que la base de datos PostgreSQL esté corriendo y accesible. Las credenciales de producción están configuradas en:
- `backend/.env.production`
- `DATABASE_URL="postgresql://dbaqas1:Dba_qa_JH@192.168.103.15:5432/project_management?schema=public"`

### 2. Variables de Entorno
Copia los archivos de configuración de producción:
```bash
cp backend/.env.production backend/.env
cp frontend/.env.production frontend/.env
```

### 3. Construir y Ejecutar con Docker
```bash
# Desde el directorio raíz del proyecto
docker-compose up --build -d
```

Esto iniciará:
- Backend en puerto 3002
- Frontend en puerto 80 (servido por nginx)

### 4. Inicializar Base de Datos
Si es la primera vez, ejecuta el script de migración:
```powershell
# En PowerShell
.\migrate-to-production.ps1
```

Este script:
- Ejecuta el script SQL completo (`create-full-database.sql`)
- Genera el cliente de Prisma
- Pobla la base de datos con datos de prueba

## Archivos Importantes

### Scripts de Base de Datos
- `create-database-postgres.sql`: Script básico para crear la base de datos
- `create-full-database.sql`: Script completo con esquema y datos
- `seed-data.sql`: Solo datos de prueba (para desarrollo)

### Scripts de Migración
- `migrate-to-production.ps1`: Script de PowerShell para inicializar BD en producción
- `migrate-to-production.bat`: Versión batch del script anterior

### Configuración Docker
- `docker-compose.yml`: Orquestación de servicios
- `backend/Dockerfile`: Construcción del backend
- `frontend/Dockerfile`: Construcción del frontend
- `frontend/nginx.conf`: Configuración de nginx para SPA

## Verificación del Despliegue

### Backend
- URL: http://localhost:3002
- Health check: http://localhost:3002/health
- API docs: http://localhost:3002/api/docs

### Frontend
- URL: http://localhost
- Debe cargar la aplicación React

### Base de Datos
Verificar que las tablas y datos estén creados:
```sql
psql "postgresql://dbaqas1:Dba_qa_JH@192.168.103.15:5432/project_management" -c "\dt"
```

## Usuarios de Prueba
- **Admin**: Rafael Sponsor (rafael.sponsor@inti.com)
- **PMO**: Ana PMO (ana.pmo@inti.com)
- **PM**: Juan PM (juan.pm@inti.com)
- **Team Member**: Elena Dev (elena.dev@inti.com) / Carlos Tech (carlos.tech@inti.com)
- **Stakeholder**: Maria Marketing (maria.marketing@inti.com)

**Contraseña para todos**: `password123` (hasheada en la BD)

## Solución de Problemas

### Error de Conexión a BD
- Verificar que PostgreSQL esté corriendo en 192.168.103.15:5432
- Verificar credenciales en .env
- Verificar firewall y conectividad de red

### Error en Docker Build
- Limpiar cache: `docker system prune -a`
- Verificar que los archivos .dockerignore estén correctos

### Error en Migración
- Verificar que la BD existe y es accesible
- Revisar logs de Docker: `docker-compose logs backend`

## Monitoreo
- Logs de aplicación: `docker-compose logs -f`
- Logs de base de datos: Verificar en el servidor PostgreSQL
- Métricas de rendimiento: Implementar monitoring adicional según necesidades

## Backup y Recuperación
- Realizar backups regulares de la base de datos
- Mantener backups de configuración
- Documentar procedimientos de recuperación

## Próximos Pasos
1. Configurar HTTPS/SSL
2. Implementar monitoreo y alertas
3. Configurar CI/CD pipeline
4. Realizar pruebas de carga
5. Documentar APIs para integraciones