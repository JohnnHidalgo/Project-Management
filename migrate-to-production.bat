REM Script para migrar la base de datos a producción
REM Asegúrate de tener configurado el DATABASE_URL en el archivo .env apuntando a la base de datos de producción

cd /d "c:\Users\johnn.hidalgo\OneDrive - DROGUERIA INTI S.A\Documentos\INTI\TI\Project Management\backend"

echo Creando la base de datos project_management...
npm run create-db

echo Ejecutando migraciones de Prisma...
npx prisma migrate deploy

echo Generando cliente de Prisma...
npx prisma generate

echo Migración completada.
echo Si deseas poblar datos iniciales, ejecuta: npx prisma db seed