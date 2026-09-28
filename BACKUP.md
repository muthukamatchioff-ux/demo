# PM-SETU Backup Procedure

A complete backup requires backing up BOTH the PostgreSQL database AND the physical file storage.

## 1. Database Backup
Execute the following command to generate a timestamped SQL dump of the production database:

\`\`\`bash
docker exec -t $(docker compose ps -q db) pg_dump -U postgres pmsetu -F c > /path/to/secure/storage/pmsetu_db_$(date +%Y%m%d_%H%M%S).dump
\`\`\`

## 2. File Storage Backup
The uploaded files are mapped to the \`uploads_data\` Docker volume. You must create an archive of this volume's contents.

\`\`\`bash
# Create a tarball of the uploads directory
docker run --rm -v pmsetu_documentation_portal_uploads_data:/volume -v /path/to/secure/storage:/backup alpine tar -czf /backup/pmsetu_uploads_$(date +%Y%m%d_%H%M%S).tar.gz -C /volume .
\`\`\`

## Backup Schedule
- **Database**: Recommended minimum of Daily backups, preferably Hourly for active periods.
- **File Storage**: Recommended minimum of Daily backups.

## Retention Policy
Maintain at least 30 days of rolling backups before executing any destructive cleanup of old archives.
