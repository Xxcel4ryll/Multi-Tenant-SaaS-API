# SQL Exercise: Client Invoice Reporting

## Problem Statement

Given the following tables:
- `organizations(id)`
- `clients(id, org_id, full_name)`
- `invoices(id, org_id, client_id, total_amount, status, created_at)`
- `invoice_items(id, invoice_id, description, amount)`

Write a SQL query that returns, for a given `org_id`:
1. Each client
2. The total invoiced amount per client for a specified date range (e.g., Jan 1–31)
3. The count of invoices per client in that range

**Requirements:**
- Only include invoices with `status = 'Paid'`
- Ensure the query is tenant-safe (scoped by `org_id`)

---

## SQL Query Solution

```sql
SELECT 
    c.id AS client_id,
    c.full_name AS client_name,
    COUNT(i.id) AS invoice_count,
    COALESCE(SUM(i.total_amount), 0) AS total_invoiced_amount
FROM 
    clients c
LEFT JOIN 
    invoices i ON c.id = i.client_id 
        AND i.org_id = :org_id 
        AND i.status = 'Paid'
        AND i.created_at >= :start_date 
        AND i.created_at < :end_date
WHERE 
    c.org_id = :org_id
GROUP BY 
    c.id, c.full_name
ORDER BY 
    c.full_name;
```

### Query Parameters

```sql
-- Example for January 2024
:org_id = 'uuid-here'
:start_date = '2024-01-01'
:end_date = '2024-02-01'  -- Exclusive end date
```

### Query Explanation

The query uses `LEFT JOIN` to include all clients from the organization, even those with no paid invoices in the specified date range.

For tenant-safety, `org_id` is filtered in two places: `WHERE c.org_id = :org_id` ensures only clients from the specified organization are returned, while `AND i.org_id = :org_id` in the JOIN provides defense-in-depth for invoice tenant isolation.

The date range uses `>=` for start date and `<` for end date to create an inclusive start, exclusive end range. `COALESCE(SUM(i.total_amount), 0)` returns 0 instead of NULL for clients with no invoices.

Results are grouped by `client.id` and `client.full_name` to calculate per-client totals.

### Performance Optimizations

**Filtering in JOIN Conditions**
```sql
LEFT JOIN invoices i ON c.id = i.client_id 
    AND i.org_id = :org_id      -- Filter BEFORE join
    AND i.status = 'Paid'        -- Filter BEFORE join
    AND i.created_at >= :start_date 
    AND i.created_at < :end_date
```
Filters are applied during the join, reducing the working set early. This prevents joining all invoices then filtering, which would be significantly slower.

**Column Selection in Aggregation**
```sql
COUNT(i.id) AS invoice_count  -- Count specific column, not COUNT(*)
```
Using `COUNT(i.id)` correctly returns 0 for clients with no matches and handles NULLs properly in LEFT JOIN scenarios. More explicit than `COUNT(*)`.

**Efficient Grouping**
```sql
GROUP BY c.id, c.full_name
```
Groups by primary key first (`c.id`) and includes non-aggregated columns to avoid implicit grouping issues.

### Expected Output

| client_id | client_name | invoice_count | total_invoiced_amount |
|-----------|-------------|---------------|----------------------|
| uuid-1    | Acme Corp   | 5             | 15000.00             |
| uuid-2    | Beta Inc    | 0             | 0.00                 |
| uuid-3    | Gamma LLC   | 12            | 48500.50             |

---

## Query Performance Analysis

### Execution Plan Verification

Use `EXPLAIN ANALYZE` to verify optimal query execution:

```sql
EXPLAIN ANALYZE
SELECT 
    c.id AS client_id,
    c.full_name AS client_name,
    COUNT(i.id) AS invoice_count,
    COALESCE(SUM(i.total_amount), 0) AS total_invoiced_amount
FROM 
    clients c
LEFT JOIN 
    invoices i ON c.id = i.client_id 
        AND i.org_id = :org_id 
        AND i.status = 'Paid'
        AND i.created_at >= '2024-01-01'
        AND i.created_at < '2024-02-01'
WHERE 
    c.org_id = :org_id
GROUP BY 
    c.id, c.full_name
ORDER BY 
    c.full_name;
```

**Look for these patterns in the execution plan:**

- Index Scan on `idx_invoices_org_status_date` (optimal)
- Index Scan on `idx_clients_org_id` (optimal)
- Sequential Scan on invoices or clients (needs indexes)
- Hash Join with large datasets (acceptable but monitor)
- Nested Loop or Merge Join (optimal for indexed queries)

### Common Performance Anti-Patterns

**Filtering after aggregation (slow)**
```sql
-- Aggregates all data then filters
SELECT c.id, c.full_name, COUNT(i.id)
FROM clients c
LEFT JOIN invoices i ON c.id = i.client_id
WHERE c.org_id = :org_id
HAVING SUM(CASE WHEN i.status = 'Paid' THEN i.total_amount ELSE 0 END) > 0;
```

**Filter before aggregation instead (fast)**
```sql
-- Filters during join
LEFT JOIN invoices i ON c.id = i.client_id 
    AND i.org_id = :org_id 
    AND i.status = 'Paid'
```

**OR conditions on indexed columns (slow)**
```sql
-- May not use indexes efficiently
WHERE i.status = 'Paid' OR i.status = 'Completed'
```

**Use IN for multiple values instead (fast)**
```sql
-- Better index usage
WHERE i.status IN ('Paid', 'Completed')
```

**Functions on indexed columns (slow)**
```sql
-- Index on created_at cannot be used
WHERE DATE(i.created_at) = '2024-01-15'
```

**Use range conditions instead (fast)**
```sql
-- Uses index efficiently
WHERE i.created_at >= '2024-01-15' AND i.created_at < '2024-01-16'
```

### Pre-Deployment Verification

Before deploying this query to production:

1. Run `EXPLAIN ANALYZE` and verify index usage
2. Ensure `idx_invoices_org_status_date` is being used
3. Verify no sequential scans on large tables
4. Check query execution time with production-like data volumes
5. Test with multiple date ranges (1 day, 1 month, 1 year)
6. Monitor query performance under concurrent load
7. Set appropriate query timeout (5-10 seconds max)
8. Add to slow query log monitoring

---

## Index Strategy

### Essential Indexes

```sql
-- 1. Most critical: Composite index covering all filter conditions
CREATE INDEX idx_invoices_org_status_date 
ON invoices(org_id, status, created_at);

-- 2. Tenant isolation on clients table
CREATE INDEX idx_clients_org_id ON clients(org_id);

-- 3. Foreign key indexes (usually auto-created, but verify)
CREATE INDEX idx_invoices_client_id ON invoices(client_id);
CREATE INDEX idx_invoices_org_id ON invoices(org_id);
```

### Rationale

The composite index `invoices(org_id, status, created_at)` covers all three filter conditions in the JOIN clause. Column order matters: `org_id` first provides tenant isolation and is the most selective filter, `status` second narrows to paid invoices, and `created_at` last enables efficient date range scanning. This eliminates full table scans on the invoices table.

The `clients(org_id)` index enables fast filtering in the WHERE clause and is essential for multi-tenant query performance.

Foreign key indexes support JOIN operations between clients and invoices while ensuring referential integrity checks remain fast. Most databases create these automatically with FK constraints, but verify they exist.

In multi-tenant systems, always include `org_id` in composite indexes to leverage tenant-based filtering, which is typically the most selective condition.

### Database-Specific Index Optimizations

**PostgreSQL:**
```sql
-- Use BRIN index for large, chronologically ordered tables
CREATE INDEX idx_invoices_created_at_brin 
ON invoices USING BRIN (created_at);

-- Partial index for only 'Paid' invoices (smaller, faster)
CREATE INDEX idx_invoices_paid_org_date 
ON invoices(org_id, created_at)
WHERE status = 'Paid';

-- Include index for covering queries (PostgreSQL 11+)
CREATE INDEX idx_invoices_covering 
ON invoices(org_id, status, created_at) 
INCLUDE (client_id, total_amount);
```

**MySQL:**
```sql
-- Force index usage if optimizer chooses wrong index
SELECT /*+ INDEX(invoices idx_invoices_org_status_date) */
    c.id AS client_id,
    c.full_name AS client_name,
    COUNT(i.id) AS invoice_count,
    COALESCE(SUM(i.total_amount), 0) AS total_invoiced_amount
FROM clients c
LEFT JOIN invoices i ON c.id = i.client_id 
    AND i.org_id = :org_id 
    AND i.status = 'Paid'
    AND i.created_at >= :start_date 
    AND i.created_at < :end_date
WHERE c.org_id = :org_id
GROUP BY c.id, c.full_name;
```

**SQL Server:**
```sql
-- Filtered index (similar to PostgreSQL partial index)
CREATE INDEX idx_invoices_paid_org_date
ON invoices(org_id, created_at)
INCLUDE (client_id, total_amount)
WHERE status = 'Paid';

-- Use WITH (NOLOCK) for read-heavy reporting (read uncommitted)
SELECT 
    c.id AS client_id,
    c.full_name AS client_name,
    COUNT(i.id) AS invoice_count,
    COALESCE(SUM(i.total_amount), 0) AS total_invoiced_amount
FROM clients c WITH (NOLOCK)
LEFT JOIN invoices i WITH (NOLOCK) ON c.id = i.client_id 
    AND i.org_id = @org_id
    -- ... rest of query
```

### Index Trade-offs

These indexes provide 100x+ faster query execution on large datasets and are essential for multi-tenant performance at scale. The cost is 5-15% slower writes per index and additional storage (roughly 1-2x the table size for all indexes combined).

### Performance Expectations

| Dataset Size | Without Indexes | With Indexes | Index Used |
|--------------|----------------|--------------|------------|
| < 10K rows   | 50-200ms       | 5-20ms       | idx_invoices_org_status_date |
| 100K rows    | 1-5 seconds    | 10-50ms      | idx_invoices_org_status_date |
| 1M+ rows     | 10-60+ seconds | 20-100ms     | idx_invoices_org_status_date |
| 10M+ rows    | Minutes/timeout | 100-500ms    | Requires partitioning |

Times assume proper indexes and reasonable client counts per organization (< 10,000 clients).

### Scaling Considerations

**For organizations with 10,000+ clients:**

```sql
-- Add pagination to prevent large result sets
SELECT 
    c.id AS client_id,
    c.full_name AS client_name,
    COUNT(i.id) AS invoice_count,
    COALESCE(SUM(i.total_amount), 0) AS total_invoiced_amount
FROM 
    clients c
LEFT JOIN 
    invoices i ON c.id = i.client_id 
        AND i.org_id = :org_id 
        AND i.status = 'Paid'
        AND i.created_at >= :start_date 
        AND i.created_at < :end_date
WHERE 
    c.org_id = :org_id
GROUP BY 
    c.id, c.full_name
ORDER BY 
    c.full_name
LIMIT 100 OFFSET :offset;  -- Add pagination
```

**For high-traffic reporting (100+ queries/second)**

Implement caching with Redis:
```typescript
// Cache key: org:{org_id}:invoices:{start_date}:{end_date}
const cacheKey = `org:${orgId}:invoices:${startDate}:${endDate}`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);

const results = await db.query(/* ... */);
await redis.setex(cacheKey, 3600, JSON.stringify(results)); // 1 hour TTL
```

Use materialized views for common date ranges:
```sql
-- Pre-aggregate current month data
CREATE MATERIALIZED VIEW mv_current_month_invoices AS
SELECT 
    c.org_id,
    c.id AS client_id,
    c.full_name AS client_name,
    COUNT(i.id) AS invoice_count,
    COALESCE(SUM(i.total_amount), 0) AS total_invoiced_amount
FROM clients c
LEFT JOIN invoices i ON c.id = i.client_id 
    AND i.status = 'Paid'
    AND i.created_at >= DATE_TRUNC('month', CURRENT_DATE)
GROUP BY c.org_id, c.id, c.full_name;

-- Refresh nightly or on-demand
REFRESH MATERIALIZED VIEW mv_current_month_invoices;
```

Consider table partitioning by org_id or date:
```sql
-- Partition invoices by created_at (monthly partitions)
CREATE TABLE invoices (
    id UUID PRIMARY KEY,
    org_id UUID NOT NULL,
    client_id UUID NOT NULL,
    total_amount DECIMAL(10,2),
    status VARCHAR(20),
    created_at TIMESTAMP NOT NULL
) PARTITION BY RANGE (created_at);

CREATE TABLE invoices_2024_01 PARTITION OF invoices
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
    
CREATE TABLE invoices_2024_02 PARTITION OF invoices
    FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');
```

With partitioning, queries only scan relevant partitions, dramatically reducing I/O.

---

## Production Performance Best Practices

### Connection Management

```typescript
// Use connection pooling (example with node-postgres)
const pool = new Pool({
  max: 20,                // Maximum pool size
  min: 5,                 // Minimum pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  maxUses: 7500          // Recycle connections periodically
});

// Set statement timeout to prevent long-running queries
await client.query('SET statement_timeout = 10000'); // 10 seconds
```

### Query Optimization Techniques

**Prepared Statements (Query Plan Caching)**
```sql
-- PostgreSQL: Named prepared statement
PREPARE client_invoice_report (uuid, timestamp, timestamp) AS
SELECT 
    c.id AS client_id,
    c.full_name AS client_name,
    COUNT(i.id) AS invoice_count,
    COALESCE(SUM(i.total_amount), 0) AS total_invoiced_amount
FROM clients c
LEFT JOIN invoices i ON c.id = i.client_id 
    AND i.org_id = $1
    AND i.status = 'Paid'
    AND i.created_at >= $2 
    AND i.created_at < $3
WHERE c.org_id = $1
GROUP BY c.id, c.full_name
ORDER BY c.full_name;

-- Execute with parameters
EXECUTE client_invoice_report('org-uuid', '2024-01-01', '2024-02-01');
```

The query plan is computed once and reused, providing 20-30% performance improvement for repeated queries while protecting against SQL injection.

### Read Replica Strategy

```typescript
// Route reporting queries to read replicas
const getClientInvoiceReport = async (orgId, startDate, endDate) => {
  // Use read replica for analytics queries
  const connection = await readReplicaPool.getConnection();
  
  try {
    const results = await connection.query(
      clientInvoiceReportQuery,
      [orgId, startDate, endDate]
    );
    return results;
  } finally {
    connection.release();
  }
};

// Write operations go to primary
const createInvoice = async (invoiceData) => {
  const connection = await primaryPool.getConnection();
  // ... insert logic
};
```

Routing reports to read replicas offloads traffic from the primary database, improves write performance, and enables horizontal read scaling.

### Monitoring and Alerts

```sql
-- Identify slow queries (PostgreSQL)
SELECT 
    query,
    calls,
    mean_exec_time,
    max_exec_time,
    total_exec_time
FROM pg_stat_statements
WHERE query LIKE '%clients%invoices%'
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Monitor index usage
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
WHERE tablename IN ('invoices', 'clients')
    AND idx_scan < 100  -- Potentially unused indexes
ORDER BY idx_scan;
```

Configure alerts for queries taking over 5 seconds, index scans dropping to zero (unused indexes), increasing sequential scans (missing indexes), and connection pool exhaustion.

### Alternative Query Variations

**A. Only clients with invoices (faster for sparse data):**
```sql
SELECT 
    c.id AS client_id,
    c.full_name AS client_name,
    COUNT(i.id) AS invoice_count,
    SUM(i.total_amount) AS total_invoiced_amount
FROM clients c
INNER JOIN invoices i ON c.id = i.client_id 
    AND i.org_id = :org_id 
    AND i.status = 'Paid'
    AND i.created_at >= :start_date 
    AND i.created_at < :end_date
WHERE c.org_id = :org_id
GROUP BY c.id, c.full_name
ORDER BY total_invoiced_amount DESC;
```

This variation works best when most clients have invoices, reducing LEFT JOIN overhead.

**B. Include invoice details (for drill-down reports):**
```sql
-- Use CTE for better readability and potential query optimization
WITH client_totals AS (
    SELECT 
        c.id AS client_id,
        c.full_name AS client_name,
        COUNT(i.id) AS invoice_count,
        COALESCE(SUM(i.total_amount), 0) AS total_invoiced_amount
    FROM clients c
    LEFT JOIN invoices i ON c.id = i.client_id 
        AND i.org_id = :org_id 
        AND i.status = 'Paid'
        AND i.created_at >= :start_date 
        AND i.created_at < :end_date
    WHERE c.org_id = :org_id
    GROUP BY c.id, c.full_name
)
SELECT * FROM client_totals
WHERE total_invoiced_amount > 0
ORDER BY total_invoiced_amount DESC;
```

This CTE approach is useful when filtering aggregated results or joining with other tables.

### Performance Testing Script

```sql
-- Benchmark query with different data volumes
DO $$
DECLARE
    start_time timestamp;
    end_time timestamp;
    execution_time interval;
BEGIN
    -- Test with actual org_id
    start_time := clock_timestamp();
    
    PERFORM 
        c.id,
        c.full_name,
        COUNT(i.id),
        COALESCE(SUM(i.total_amount), 0)
    FROM clients c
    LEFT JOIN invoices i ON c.id = i.client_id 
        AND i.org_id = 'test-org-id'
        AND i.status = 'Paid'
        AND i.created_at >= '2024-01-01'
        AND i.created_at < '2024-02-01'
    WHERE c.org_id = 'test-org-id'
    GROUP BY c.id, c.full_name;
    
    end_time := clock_timestamp();
    execution_time := end_time - start_time;
    
    RAISE NOTICE 'Execution time: %', execution_time;
END $$;
```

### Load Testing Recommendations

**Simulate concurrent queries:**
```bash
# Using Apache Bench (ab)
ab -n 1000 -c 10 -p payload.json -T application/json \
   http://localhost:3000/api/reports/client-invoices

# Using k6 for more sophisticated load testing
k6 run --vus 50 --duration 30s load-test.js
```

**Expected results with proper indexes:**
- 50 concurrent users: < 100ms average response time
- 100 concurrent users: < 200ms average response time
- 500 concurrent users: < 500ms average response time (with connection pooling)

---

## Testing the Query

### Sample Test Data

```sql
-- Insert test organization
INSERT INTO organizations (id) VALUES ('org-123');

-- Insert test clients
INSERT INTO clients (id, org_id, full_name) VALUES
    ('client-1', 'org-123', 'Acme Corp'),
    ('client-2', 'org-123', 'Beta Inc'),
    ('client-3', 'org-123', 'Gamma LLC');

-- Insert test invoices
INSERT INTO invoices (id, org_id, client_id, total_amount, status, created_at) VALUES
    ('inv-1', 'org-123', 'client-1', 1000.00, 'Paid', '2024-01-05'),
    ('inv-2', 'org-123', 'client-1', 2500.00, 'Paid', '2024-01-15'),
    ('inv-3', 'org-123', 'client-3', 5000.00, 'Paid', '2024-01-20'),
    ('inv-4', 'org-123', 'client-1', 1500.00, 'Pending', '2024-01-25'),  -- Should be excluded (not Paid)
    ('inv-5', 'org-123', 'client-3', 3000.00, 'Paid', '2024-02-01');     -- Should be excluded (outside date range)
```

### Expected Result

```
client_id  | client_name | invoice_count | total_invoiced_amount
-----------+-------------+---------------+----------------------
client-1   | Acme Corp   | 2             | 3500.00
client-2   | Beta Inc    | 0             | 0.00
client-3   | Gamma LLC   | 1             | 5000.00
```

---

## Performance Summary

### Critical Success Factors for Production Performance

| Factor | Impact | Implementation |
|--------|--------|----------------|
| **Composite Index** | 100x faster | `invoices(org_id, status, created_at)` |
| **Prepared Statements** | 30% faster | Cache query plans |
| **Connection Pooling** | 50% better throughput | Min 5, Max 20 connections |
| **Read Replicas** | Horizontal scaling | Route reports to replicas |
| **Caching (Redis)** | 1000x faster for repeated queries | 1-hour TTL |
| **Pagination** | Prevents memory issues | LIMIT/OFFSET for large result sets |
| **Statement Timeout** | Prevents hung queries | 5-10 seconds max |

### Scaling Strategy

**< 1,000 clients:** Use base query with indexes (10-50ms)

**1,000 - 10,000 clients:** Add pagination (50-100ms per page)

**> 100,000 clients or > 1M invoices:** Use materialized views + partitioning

**Query frequency > 100/day:** Implement Redis caching (1-5ms for cached results)

### Pre-Production Checklist

**Indexes Created**
- `invoices(org_id, status, created_at)`
- `clients(org_id)`
- Foreign key indexes verified

**Performance Validated**
- `EXPLAIN ANALYZE` shows index usage
- Query completes in < 100ms with production data volume
- No sequential scans on large tables
- Tested with largest organization's data

**Production Safeguards**
- Connection pooling configured
- Statement timeout set (10 seconds)
- Query routed to read replica
- Monitoring and alerts configured
- Load tested with 50+ concurrent users

**Optional Optimizations** (if needed)
- Caching layer implemented (Redis/Memcached)
- Pagination added for large result sets
- Materialized views for common date ranges
- Table partitioning for very large tables
