export function fieldValue(record, key, fallback) {
  if (record && record[key] !== undefined && record[key] !== null && record[key] !== '') {
    return record[key];
  }
  return fallback;
}

export function parseTemplateResponse(result) {
  if (!result || result.response === undefined) {
    return null;
  }
  return JSON.parse(result.response);
}

export function buildCustomerContext(options) {
  const context = {
    limit: String(options.limit || 50),
    since_id: options.sinceId ? String(options.sinceId) : ''
  };
  return context;
}

export async function fetchCustomers(client, options) {
  const opts = options || {};
  const result = await client.request.invokeTemplate('fetchCustomers', {
    context: buildCustomerContext(opts)
  });
  return parseTemplateResponse(result);
}

export async function searchCustomers(client, query) {
  const result = await client.request.invokeTemplate('searchCustomers', {
    context: { query: query }
  });
  return parseTemplateResponse(result);
}

export function buildOrderContext(options) {
  const opts = options || {};
  return {
    limit: String(opts.limit || 50),
    since_id: opts.sinceId ? String(opts.sinceId) : ''
  };
}

export async function fetchOrdersByEmail(client, customerEmail, options) {
  const opts = options || {};
  const result = await client.request.invokeTemplate('fetchCustomerOrders', {
    context: {
      customer_email: customerEmail,
      limit: String(opts.limit || 25)
    }
  });
  return parseTemplateResponse(result);
}

export async function fetchAllOrders(client, options) {
  const result = await client.request.invokeTemplate('fetchOrders', {
    context: buildOrderContext(options)
  });
  return parseTemplateResponse(result);
}

export async function fetchOrderById(client, orderId) {
  const result = await client.request.invokeTemplate('fetchOrderById', {
    context: { order_id: String(orderId) }
  });
  return parseTemplateResponse(result);
}

export async function fetchTicketContact(client) {
  try {
    const data = await client.data.get('contact');
    const contact = data && data.contact ? data.contact : {};
    return {
      name: contact.name || '',
      email: contact.email || '',
      phone: contact.phone || contact.mobile || ''
    };
  } catch {
    return { name: '', email: '', phone: '' };
  }
}

export function extractCustomerList(data) {
  if (!data) {
    return [];
  }
  if (Array.isArray(data.customers)) {
    return data.customers;
  }
  return [];
}

export function extractOrderList(data) {
  if (!data) {
    return [];
  }
  if (Array.isArray(data.orders)) {
    return data.orders;
  }
  if (data.order) {
    return [data.order];
  }
  return [];
}

export function filterOrders(orders, searchTerm) {
  const needle = String(searchTerm || '').trim().toLowerCase();
  if (!needle) {
    return orders;
  }
  const normalizedNeedle = needle.replace(/^#/, '');
  return orders.filter(function (order) {
    const haystack = [
      String(order.id || ''),
      String(order.order_number || ''),
      String(order.name || ''),
      fieldValue(order, 'email', ''),
      formatOrderBuyerName(order)
    ]
      .join(' ')
      .toLowerCase();
    return haystack.indexOf(needle) !== -1 || haystack.indexOf(normalizedNeedle) !== -1;
  });
}

export function formatCustomerName(customer) {
  const first = fieldValue(customer, 'first_name', '');
  const last = fieldValue(customer, 'last_name', '');
  return `${first} ${last}`.trim();
}

export function formatCustomerAccordionTitle(customer) {
  const email = fieldValue(customer, 'email', '');
  if (email) {
    return email;
  }
  return `ID ${fieldValue(customer, 'id', '?')}`;
}

export function formatCustomerAccordionSubtitle(customer) {
  const name = formatCustomerName(customer);
  if (name) {
    return name;
  }
  const phone = fieldValue(customer, 'phone', '');
  if (phone) {
    return phone;
  }
  return `Total spent: ${formatMoney(customer.total_spent, customer.currency)}`;
}

export function formatCustomerAddress(customer) {
  const addr = customer && customer.default_address;
  if (!addr) {
    return 'NA';
  }
  const parts = [
    addr.address1,
    addr.address2,
    addr.city,
    addr.province,
    addr.country,
    addr.zip
  ].filter(Boolean);
  return parts.length ? parts.join(', ') : 'NA';
}

export function formatCustomerCreatedAt(customer) {
  if (!customer.created_at) {
    return 'NA';
  }
  return new Date(customer.created_at).toLocaleDateString();
}

export function formatMoney(amount, currency) {
  if (amount === undefined || amount === null || amount === '') {
    return 'NA';
  }
  const code = currency || 'USD';
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: code
    }).format(Number(amount));
  } catch {
    return `${amount} ${code}`;
  }
}

export function sortCustomersByTotalSpent(customers) {
  return customers.slice().sort(function (a, b) {
    return Number(b.total_spent || 0) - Number(a.total_spent || 0);
  });
}

export function filterCustomers(customers, searchTerm) {
  const needle = String(searchTerm || '').trim().toLowerCase();
  if (!needle) {
    return customers;
  }
  return customers.filter(function (customer) {
    const haystack = [
      formatCustomerAccordionTitle(customer),
      formatCustomerName(customer),
      fieldValue(customer, 'email', ''),
      fieldValue(customer, 'phone', ''),
      String(customer.id || ''),
      fieldValue(customer, 'tags', '')
    ]
      .join(' ')
      .toLowerCase();
    return haystack.indexOf(needle) !== -1;
  });
}

export function formatOrderTitle(order) {
  const name = fieldValue(order, 'name', '');
  if (name) {
    return name.startsWith('#') ? `Order ${name}` : `Order #${name}`;
  }
  const orderNumber = fieldValue(order, 'order_number', order.id);
  return `Order #${orderNumber}`;
}

export function formatOrderFulfillmentStatus(order) {
  const status = order && order.fulfillment_status;
  if (status === 'fulfilled') {
    return 'Fulfilled';
  }
  if (status === 'partial') {
    return 'Partially fulfilled';
  }
  return 'Unfulfilled';
}

export function formatOrderBuyerName(order) {
  const buyer = order.customer || {};
  const name = `${fieldValue(buyer, 'first_name', '-')} ${fieldValue(buyer, 'last_name', '-')}`;
  const trimmed = name.trim();
  if (trimmed && trimmed !== '- -') {
    return trimmed;
  }
  return fieldValue(buyer, 'email', '-');
}

export function formatOrderCreatedAt(order) {
  if (!order.created_at) {
    return '-';
  }
  return new Date(order.created_at).toLocaleString();
}

export function summarizeOrders(orders) {
  const total = orders.reduce(function (sum, order) {
    return sum + Number(order.total_price || 0);
  }, 0);
  const currency = orders[0] && orders[0].currency ? orders[0].currency : 'USD';
  return {
    count: orders.length,
    totalLabel: formatMoney(total, currency)
  };
}
