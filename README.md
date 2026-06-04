# Shopify Integration — Freshdesk

![Shopify to Freshdesk — fetch Shopify orders and customers in the ticket sidebar](shopify-banner.png)

A **Freshdesk ticket sidebar** app that pulls **Shopify customers** and **orders** into the agent view using Crayons UI and Platform request templates.

| | |
|---|---|
| **Platform** | 3.0 |
| **Surface** | `ticket_sidebar` |
| **Node** | 24.11.1 |
| **FDK** | 10.1.2 |

---

## Screenshots

### Ticket sidebar (default view)

Email input, action buttons, and Crayons layout in the Freshdesk ticket sidebar.

![Shopify integration app in Freshdesk ticket sidebar](docs/assets/app-placeholder-sf-integration.png)

### Fetch Customers

Customer list rendered as accordion cards from the Shopify Admin API.

![Fetch Customers — Shopify customer cards in the sidebar](docs/assets/fetch-cust-sf-integration.png)

### Fetch Orders

Orders for the entered customer email, shown as expandable order cards.

![Fetch Orders — Shopify orders by customer email](docs/assets/fetch-order-sf-integration.png)

---

## What it does

Agents working a ticket can:

- Look up **orders** for a customer email
- Browse a sample list of **Shopify customers** in accordion cards
- Clear results and reset the form between lookups

All Shopify calls run through **request templates** (`fetchCustomers`, `fetchCustomerOrders`). Store credentials stay in **installation parameters** (access token is secure).

---

## UI actions

| Button | Action |
|--------|--------|
| **Fetch Orders** | Loads orders for the email in the input field |
| **Clear Orders** | Clears the email field and order list |
| **Fetch Customers** | Loads customer cards from your Shopify store |
| **Clear Customers** | Removes customer cards from the sidebar |
| **Reset All** | Clears both customers and orders |

Built with **Crayons** components: `fw-input`, `fw-button`, `fw-accordion`, `fw-text`.

---

## Prerequisites

- Node **24.11.1** and FDK **10.1.2**
- A Freshdesk account for local testing (`?dev=true`)
- A Shopify store and **Admin API access token**
- Shopify API version in requests: `2023-04` (see `config/requests.json`)

---

## Step 1 — Shopify credentials

### 1.1 Create a custom app in Shopify

1. In Shopify Admin, go to **Settings** → **Apps and sales channels** → **Develop apps**.
2. **Create an app** (e.g. `Freshdesk integration`).
3. Configure **Admin API scopes** needed for customers and orders (e.g. `read_customers`, `read_orders`).
4. **Install** the app on your store.

### 1.2 Copy install values

| Install parameter | Where to find it |
|-------------------|------------------|
| **Shopify sub domain** | Store URL: `your-store` from `your-store.myshopify.com` |
| **Shopify Access Token** | App → **API credentials** → **Admin API access token** |

Use the **Admin API** token, not the Storefront token.

---

## Step 2 — Run locally

```bash
cd only-migration/shopify-integration/sf-integration-app
npm install
fdk config set global_apps.enabled true
fdk validate
fdk run
```

Keep `fdk run` running.

---

## Step 3 — Developer settings

With `fdk run` active:

1. Open **http://localhost:10001/custom_configs**
2. Enter **Shopify sub domain** and **Shopify Access Token**
3. Save

Alternative: **http://localhost:10001/system_settings**

---

## Step 4 — Test in Freshdesk

1. Open your Freshdesk site with **`?dev=true`** (use **`&dev=true`** if the URL already has query params).
2. Allow **local network** access when prompted.
3. Open a ticket → **Apps** sidebar → launch this app.
4. Enter a customer email → **Fetch Orders**, or try **Fetch Customers**.

---

## Troubleshooting

| Symptom | What to check |
|---------|----------------|
| Request fails / 401 | Correct subdomain and Admin API token; app installed on store |
| No customers returned | Store has customers; API scopes include customer read |
| No orders for email | Valid email with orders in Shopify; try another address |
| `fdk validate` — global apps error | Run `fdk config set global_apps.enabled true` |
| App does not load | `fdk run` running; `?dev=true`; local network allowed |

---

## Project layout

```
sf-integration-app/
├── app/
│   ├── index.html
│   ├── scripts/app.js
│   └── styles/
├── config/
│   ├── iparams.json
│   └── requests.json
├── tests/
├── manifest.json
└── README.md
```

Screenshots: `../docs/assets/*.png` · Guides: `../docs/app_dev_guide.md`, `../docs/solution.md`

---

## Validation

```bash
fdk validate
npm run fdk-unit-test
```

Target: **0 platform errors**, **0 lint errors**.
