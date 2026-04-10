# Script para migrar la base de datos a producción
# Asegúrate de tener configurado el DATABASE_URL en el archivo .env apuntando a la base de datos de producción

Set-Location "c:\Users\johnn.hidalgo\OneDrive - DROGUERIA INTI S.A\Documentos\INTI\TI\Project Management\backend"

Write-Host "Creando la base de datos project_management..."
npm run create-db

Write-Host "Ejecutando migraciones de Prisma..."
npx prisma migrate deploy

Write-Host "Generando cliente de Prisma..."
npx prisma generate

Write-Host "Migración completada."
Write-Host "Si deseas poblar datos iniciales, ejecuta: npx prisma db seed"