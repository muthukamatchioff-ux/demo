# PM-SETU Restore Procedure

**WARNING**: Restoration is a destructive process that will overwrite current data. Ensure the application is stopped before restoring.

## Prerequisites
1. Locate your \`.dump\` database file.
2. Locate your \`.tar.gz\` uploads archive.

## 1. Stop the Application
Stop the Node.js application container to prevent writes during restoration:
\`\`\`bash
docker compose stop app
\`\`\`

## 2. Database Restoration
Restore the PostgreSQL database using \`pg_restore\`:

\`\`\`bash
# Drop connections and clear the database (DANGEROUS)
docker exec -i $(docker compose ps -q db) psql -U postgres -c "DROP DATABASE IF EXISTS pmsetu;"
docker exec -i $(docker compose ps -q db) psql -U postgres -c "CREATE DATABASE pmsetu;"

# Execute restore
cat /path/to/secure/storage/pmsetu_db_TARGET.dump | docker exec -i $(docker compose ps -q db) pg_restore -U postgres -d pmsetu
\`\`\`

## 3. File Storage Restoration
Extract the uploads archive back into the Docker volume:

\`\`\`bash
docker run --rm -v pmsetu_documentation_portal_uploads_data:/volume -v /path/to/secure/storage:/backup alpine sh -c "cd /volume && rm -rf ./* && tar -xzf /backup/pmsetu_uploads_TARGET.tar.gz"
\`\`\`

## 4. Restart Application
Bring the application back online:
\`\`\`bash
docker compose start app
\`\`\`
