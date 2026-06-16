Use Cases - StyleHub Retail / Shopify Integration
=================================================

Company Overview
----------------

**StyleHub Retail** is an online fashion merchant using **Freshdesk** for post-purchase support and **Shopify** as its storefront. Agents need order and customer context on every ticket without tab-switching to Shopify Admin.

* * * * *

Use Case Scenarios
------------------

### 1\. Order Lookup by Customer Email

**Scenario**: A shopper emails about a missing delivery. The agent has the requester email on the Freshdesk ticket but no order number.

**Use Case**: The sidebar calls `fetchCustomerOrders` via **Request Templates**, passing the email as template context. Order cards show fulfillment status, totals, and line items so the agent can answer from the ticket view.

* * * * *

### 2\. Customer Browse for VIP Identification

**Scenario**: StyleHub's loyalty team handles escalations and must quickly see lifetime spend and order count for a caller.

**Use Case**: **Load all** and **Search** actions invoke `fetchCustomers` and `searchCustomers`. Customer accordion cards sort by total spent; agents filter locally by name, email, or Shopify customer ID.

* * * * *

### 3\. Direct Order ID Lookup

**Scenario**: Social-media support receives a screenshot with an order number but the wrong contact email on the ticket.

**Use Case**: The orders tab accepts a numeric order ID and calls `fetchOrderById`. Validation in `validation.js` rejects malformed IDs before the request leaves the Freshworks platform.

* * * * *

### 4\. Paginated Loads for Large Catalogs

**Scenario**: StyleHub has 50,000+ customers. Loading the full list in one call would time out or hit Shopify rate limits.

**Use Case**: Customer and order fetches use `since_id` pagination with **Load more** controls. The UI tracks `hasMoreCustomers` and `hasMoreOrders` so agents pull additional pages only when needed.

* * * * *

### 5\. Secure Shopify Credentials at Install

**Scenario**: Admin API tokens must not appear in frontend source or browser network tabs visible to agents.

**Use Case**: Store subdomain and access token are collected in **installation parameters** (`shopify_subdomain`, secure `shopify_access_token`). Request Templates inject credentials server-side; React components only call `client.request.invokeTemplate`.
