# DBOps (Database Operations Tool)

Professional database connection and query toolset supporting SQL execution across mainstream databases. Connect directly to your databases from FastGPT workflows for data querying and processing.

## Version Notes

- **0.0.2** - Added SSL configuration, enabling SSL/TLS encryption for database connections.

## 🚀 Supported Databases

- **MySQL** - Popular open-source relational database
- **PostgreSQL** - Powerful object-relational database
- **Microsoft SQL Server** - Enterprise relational database
- **Oracle** - Large-scale commercial relational database
- **ClickHouse** - High-performance columnar analytical database

## 📋 Usage Guide

### General Steps

1. Add the "Database Operations" tool node to your FastGPT workflow.
2. Select your target database type.
3. Fill in the connection configuration.
4. Input the SQL statement to execute.
5. Run the workflow to obtain query results.

### SSL Configuration

All database connection configurations offer an **Enable SSL** toggle, disabled by default. When enabled, each database applies appropriate encryption:

- **MySQL** - Uses TLS connection
- **PostgreSQL** - Uses SSL connection
- **Microsoft SQL Server** - Enables encrypted connection
- **ClickHouse** - Switches HTTP connection to HTTPS
- **Oracle** - Enables server certificate DN matching; when using TLS, `connectString` also requires a `tcps` descriptor and wallet/certificates.

### MySQL Configuration

**Required Parameters:**
- **Database Name** - Target database name
- **Host** - Database host address (e.g. `mysql.yourdomain.com`, `123.45.67.89`)
- **Port** - MySQL port (default: 3306)
- **Username** - Database user
- **Password** - Database password

**Optional Parameters:**
- **Charset** - Database character set (default: `utf8mb4`)
- **Timezone** - Timezone setting (default: `+00:00`)
- **Connection Limit** - Connection pool maximum (default: 10)
- **Connect Timeout** - Timeout in milliseconds (default: 30000)

**Inputs:**
- **SQL** - SQL statement to execute (required)

---

### PostgreSQL Configuration

**Required Parameters:**
- **Host** - Database host address (e.g. `postgres.yourdomain.com`, `123.45.67.89`)
- **Port** - PostgreSQL port (default: 5432)
- **Username** - Database user
- **Password** - Database password

**Optional Parameters:**
- **Database Name** - Target database name
- **Connection Limit** - Connection pool maximum (default: 10)
- **Connect Timeout** - Timeout in milliseconds (default: 30000)

**Inputs:**
- **SQL** - SQL statement to execute (required)

---

### Microsoft SQL Server Configuration

**Required Parameters:**
- **Database Name** - Target database name
- **Host** - Database host address (e.g. `sqlserver.yourdomain.com`, `123.45.67.89`)
- **Port** - SQL Server port (default: 1433)
- **Username** - Database user
- **Password** - Database password

**Optional Parameters:**
- **Domain** - Windows domain authentication
- **Instance Name** - SQL Server named instance
- **Connection Limit** - Connection pool maximum (default: 10)
- **Connect Timeout** - Timeout in milliseconds (default: 30000)

**Inputs:**
- **SQL** - SQL statement to execute (required)

---

### Oracle Configuration

**Required Parameters:**
- **Database Name** - Oracle service name (e.g. `ORCLPDB1`)
- **Host** - Oracle server address
- **Port** - Oracle listener port (default: 1521)
- **Username** - Oracle user
- **Password** - Oracle password

The plugin combines these into `host:port/service_name` format (e.g. `oracle.yourdomain.com:1521/ORCLPDB1`).

**Optional Parameters:**
- **Connection Limit** - Connection pool maximum (default: 10)
- **Connect Timeout** - Timeout in milliseconds (default: 30000)

**Inputs:**
- **SQL** - SQL statement to execute (required)

---

### ClickHouse Configuration

**Required Parameters:**
- **Database Name** - Target database name
- **URL** - ClickHouse HTTP endpoint URL (e.g. `https://clickhouse.yourdomain.com:8443`, `http://123.45.67.89:8123`)
- **Username** - ClickHouse user
- **Password** - ClickHouse password

**Optional Parameters:**
- **Connection Limit** - Connection pool maximum (default: 10)
- **Connect Timeout** - Timeout in milliseconds (default: 30000)

**Inputs:**
- **SQL** - SQL statement to execute (required)

## 💡 Tips & Best Practices

### Security Recommendations

- ⚠️ **Encrypted Secrets**: Database passwords are encrypted at rest.
- 📋 **Principle of Least Privilege**: Create a dedicated database user for FastGPT with read-only permissions where appropriate.
- 🔒 **Network Isolation**: Restrict database access to trusted networks and IP ranges.
- 📝 **Audit Logging**: Regularly monitor and audit database operations.

## 🎯 Typical Use Cases

1. **Data Query & Analytics**: Retrieve customer profiles, inspect sales reports, monitor real-time business metrics.
2. **Data Validation & Cleaning**: Verify data completeness and accuracy, format batch inputs, detect duplicates.
3. **AI Customer Support**: Query order statuses, fetch inventory details, verify user account permissions.
4. **Workflow Automation**: Schedule data backups, trigger automated reporting, synchronize records.

## ⚠️ Notes

1. **Connectivity**: Verify database network connectivity before running workflows.
2. **Permissions**: Ensure user permissions are sufficient for the executed SQL commands.
3. **Performance**: Large queries may impact performance; prefer bounded queries with `LIMIT`.
