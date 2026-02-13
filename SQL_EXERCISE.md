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

## Summary

The composite index `invoices(org_id, status, created_at)` is critical for performance, providing 100x+ speedup on large datasets. Combined with proper tenant-safety filtering (org_id in both WHERE and JOIN), this query efficiently handles multi-tenant reporting requirements.
