# Setup Guide - ParkHub Parking Management System

## Prerequisites

Before setting up ParkHub, ensure you have the following installed:

- **Node.js**: Version 22 or higher
- **pnpm**: Package manager (install with `npm install -g pnpm`)
- **MySQL/TiDB**: Database server running and accessible
- **Git**: For version control

## Initial Setup

### 1. Database Setup

Create a new database for the parking management system:

```sql
CREATE DATABASE parking_management;
```

### 2. Environment Configuration

The application uses environment variables for configuration. Create a `.env` file in the project root:

```env
# Database Connection
DATABASE_URL=mysql://user:password@localhost:3306/parking_management

# OAuth Configuration (provided by Manus)
VITE_APP_ID=your_app_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im

# Session Management
JWT_SECRET=your_secure_random_secret_key

# Owner Information
OWNER_NAME=Your Name
OWNER_OPEN_ID=your_open_id

# Manus API Integration
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=your_api_key
VITE_FRONTEND_FORGE_API_KEY=your_frontend_key
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im
```

### 3. Install Dependencies

```bash
pnpm install
```

### 4. Database Migration

Apply the database schema:

```bash
pnpm db:push
```

This command will:
- Generate migration files from `drizzle/schema.ts`
- Apply all pending migrations to your database
- Create all necessary tables

### 5. Start Development Server

```bash
pnpm dev
```

The application will start on `http://localhost:3000`

## User Roles & Initial Setup

### Creating an Admin User

By default, the user with `OWNER_OPEN_ID` is automatically assigned the admin role. To promote another user to admin:

1. User logs in with their account
2. Access the database directly:

```sql
UPDATE users SET role = 'admin' WHERE openId = 'user_open_id';
```

### First-Time Admin Setup

After your first admin login:

1. Navigate to the Admin Dashboard
2. Create your first parking facility
3. Add parking slots to the facility
4. Set pricing for each slot type
5. Monitor bookings and analytics

## Development Workflow

### Adding New Features

1. **Update Database Schema** (if needed):
   - Edit `drizzle/schema.ts`
   - Run `pnpm drizzle-kit generate`
   - Review generated SQL in `drizzle/migrations/`
   - Apply with `pnpm db:push`

2. **Add Backend Logic**:
   - Create database helpers in `server/db.ts`
   - Add tRPC procedures in `server/routers.ts`
   - Use proper error handling and validation

3. **Build Frontend**:
   - Create components in `client/src/components/`
   - Create pages in `client/src/pages/`
   - Use tRPC hooks for data fetching
   - Add proper loading and error states

4. **Test Changes**:
   - Run `pnpm check` for TypeScript validation
   - Test in browser at `http://localhost:3000`
   - Verify database changes

### Running Tests

```bash
pnpm test
```

Tests are located in `server/*.test.ts` files using Vitest.

### Code Formatting

```bash
pnpm format
```

## Production Deployment

### Build for Production

```bash
pnpm build
```

This creates:
- Optimized frontend bundle in `dist/`
- Compiled server code in `dist/index.js`

### Start Production Server

```bash
pnpm start
```

### Environment Variables for Production

Ensure all production environment variables are set:

```env
NODE_ENV=production
DATABASE_URL=mysql://prod_user:prod_password@prod_host:3306/parking_db
VITE_APP_ID=production_app_id
JWT_SECRET=production_secret_key
# ... other production vars
```

## Troubleshooting

### Database Connection Issues

**Error**: `ECONNREFUSED` when connecting to database

**Solution**:
1. Verify MySQL/TiDB is running
2. Check `DATABASE_URL` format
3. Verify credentials and permissions
4. Test connection: `mysql -u user -p -h localhost`

### OAuth Configuration Issues

**Error**: OAuth callback fails or redirect loop

**Solution**:
1. Verify `VITE_APP_ID` is correct
2. Check `OAUTH_SERVER_URL` is accessible
3. Ensure callback URL is registered in OAuth provider
4. Clear browser cookies and cache

### TypeScript Errors

**Error**: TypeScript compilation fails

**Solution**:
```bash
pnpm check
```

Review errors and ensure:
- All imports are correct
- Types match function signatures
- No undefined variables

### Migration Issues

**Error**: Database migration fails

**Solution**:
1. Check migration SQL in `drizzle/migrations/`
2. Verify database user has proper permissions
3. Check for conflicting table names
4. Review database logs for specific errors

## Performance Optimization

### Database Optimization

1. Add indexes to frequently queried columns:
```sql
CREATE INDEX idx_bookings_userId ON bookings(userId);
CREATE INDEX idx_bookings_slotId ON bookings(slotId);
CREATE INDEX idx_slots_facilityId ON parkingSlots(facilityId);
```

2. Monitor slow queries:
```sql
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2;
```

### Frontend Optimization

1. Enable gzip compression
2. Minify CSS and JavaScript
3. Use CDN for static assets
4. Implement lazy loading for images
5. Cache API responses appropriately

## Monitoring & Logging

### Enable Application Logging

Check `.manus-logs/` directory for:
- `devserver.log` - Server startup and warnings
- `browserConsole.log` - Client-side errors
- `networkRequests.log` - API request tracking
- `sessionReplay.log` - User interactions

### Monitor Database Performance

```sql
-- Check active connections
SHOW PROCESSLIST;

-- Check table sizes
SELECT table_name, ROUND(((data_length + index_length) / 1024 / 1024), 2) AS size_mb
FROM information_schema.tables
WHERE table_schema = 'parking_management';
```

## Backup & Recovery

### Database Backup

```bash
mysqldump -u user -p parking_management > backup.sql
```

### Database Restore

```bash
mysql -u user -p parking_management < backup.sql
```

## Security Considerations

1. **Environment Variables**: Never commit `.env` file to version control
2. **Database Credentials**: Use strong passwords
3. **JWT Secret**: Use a cryptographically secure random string
4. **HTTPS**: Always use HTTPS in production
5. **Input Validation**: All user inputs are validated
6. **SQL Injection**: Using Drizzle ORM prevents SQL injection
7. **CORS**: Configure CORS headers appropriately

## Support & Resources

- **Documentation**: See `README.md` for feature overview
- **API Documentation**: Review tRPC procedures in `server/routers.ts`
- **Database Schema**: Check `drizzle/schema.ts` for table structure
- **Component Library**: Browse `client/src/components/` for available components

---

**Last Updated**: April 2026
