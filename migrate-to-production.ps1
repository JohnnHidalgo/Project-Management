# Script para migrar la base de datos a producción
# Asegúrate de tener configurado el DATABASE_URL en el archivo .env apuntando a la base de datos de producción

Set-Location "c:\Users\johnn.hidalgo\OneDrive - DROGUERIA INTI S.A\Documentos\INTI\TI\Project Management\backend"

Write-Host "Ejecutando script completo de creación de base de datos..."
# Ejecutar el script SQL completo que incluye creación de BD, tablas y datos
# Nota: Asegúrate de tener psql instalado y en el PATH
psql $env:DATABASE_URL -f "..\create-full-database.sql"

Write-Host "Generando cliente de Prisma..."
npx prisma generate

Write-Host "Migración completada."
Write-Host "La base de datos está lista con esquema y datos iniciales."