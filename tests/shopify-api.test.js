import { describe, test, expect, vi, beforeEach } from 'vitest';
import {
  fetchAllOrders,
  fetchCustomers,
  fetchOrderById,
  fetchOrdersByEmail,
  filterCustomers,
  filterOrders,
  formatCustomerAccordionTitle,
  formatCustomerAccordionSubtitle,
  formatCustomerAddress,
  formatCustomerName,
  formatOrderBuyerName,
  formatOrderFulfillmentStatus,
  formatOrderTitle,
  parseTemplateResponse,
  searchCustomers,
  sortCustomersByTotalSpent,
  summarizeOrders
} from '../app/utils/shopify-api.js';
import { isValidEmail, isValidOrderId, normalizeOrderId } from '../app/utils/validation.js';

describe('validation.js', function () {
  test('isValidEmail accepts valid addresses', function () {
    expect(isValidEmail('agent@example.com')).toBe(true);
  });

  test('isValidEmail rejects invalid addresses', function () {
    expect(isValidEmail('not-an-email')).toBe(false);
    expect(isValidEmail('')).toBe(false);
  });

  test('isValidOrderId accepts numeric order ids', function () {
    expect(isValidOrderId('450789469')).toBe(true);
    expect(isValidOrderId('#1001')).toBe(true);
    expect(isValidOrderId('not-an-id')).toBe(false);
  });

  test('normalizeOrderId strips hash prefix', function () {
    expect(normalizeOrderId('#1001')).toBe('1001');
  });
});

describe('shopify-api.js', function () {
  const mockClient = {
    request: {
      invokeTemplate: vi.fn()
    },
    data: {
      get: vi.fn()
    }
  };

  beforeEach(function () {
    vi.clearAllMocks();
  });

  test('parseTemplateResponse parses JSON response string', function () {
    const data = parseTemplateResponse({ response: '{"customers":[]}' });
    expect(data).toEqual({ customers: [] });
  });

  test('formatCustomerName returns first and last name only', function () {
    expect(formatCustomerName({ first_name: 'Jane', last_name: 'Doe' })).toBe('Jane Doe');
    expect(formatCustomerName({ email: 'buyer@shop.com' })).toBe('');
  });

  test('formatCustomerAccordionTitle prefers email', function () {
    expect(formatCustomerAccordionTitle({ email: 'buyer@shop.com', id: 42 })).toBe('buyer@shop.com');
    expect(formatCustomerAccordionTitle({ id: 42 })).toBe('ID 42');
  });

  test('formatCustomerAccordionSubtitle shows total spent when contact is hidden', function () {
    expect(
      formatCustomerAccordionSubtitle({ id: 42, total_spent: '120.50', currency: 'USD' })
    ).toBe('Total spent: $120.50');
  });

  test('formatCustomerAddress uses default_address', function () {
    expect(
      formatCustomerAddress({
        default_address: {
          address1: '1 Main St',
          city: 'Austin',
          province: 'TX',
          country: 'US',
          zip: '78701'
        }
      })
    ).toBe('1 Main St, Austin, TX, US, 78701');
  });

  test('filterCustomers matches email and name', function () {
    const customers = [
      { id: 1, first_name: 'Jane', email: 'jane@shop.com' },
      { id: 2, first_name: 'Sam', email: 'sam@shop.com' }
    ];
    expect(filterCustomers(customers, 'jane').length).toBe(1);
  });

  test('sortCustomersByTotalSpent orders highest spend first', function () {
    const customers = [
      { id: 1, total_spent: '10.00' },
      { id: 2, total_spent: '250.00' },
      { id: 3, total_spent: '75.50' }
    ];
    const sorted = sortCustomersByTotalSpent(customers);
    expect(sorted.map(function (customer) {
      return customer.id;
    })).toEqual([2, 3, 1]);
  });

  test('summarizeOrders totals order count and amount', function () {
    const summary = summarizeOrders([
      { total_price: '10.00', currency: 'USD' },
      { total_price: '5.50', currency: 'USD' }
    ]);
    expect(summary.count).toBe(2);
    expect(summary.totalLabel).toContain('15.50');
  });

  test('formatOrderBuyerName uses order customer object', function () {
    expect(
      formatOrderBuyerName({ customer: { first_name: 'Sam', last_name: 'Lee' } })
    ).toBe('Sam Lee');
  });

  test('formatOrderTitle avoids double hash prefix', function () {
    expect(formatOrderTitle({ name: '#1002' })).toBe('Order #1002');
  });

  test('formatOrderFulfillmentStatus maps shopify statuses', function () {
    expect(formatOrderFulfillmentStatus({ fulfillment_status: 'fulfilled' })).toBe('Fulfilled');
    expect(formatOrderFulfillmentStatus({ fulfillment_status: null })).toBe('Unfulfilled');
    expect(formatOrderFulfillmentStatus({ fulfillment_status: 'partial' })).toBe(
      'Partially fulfilled'
    );
  });

  test('fetchCustomers passes pagination context', async function () {
    mockClient.request.invokeTemplate.mockResolvedValue({
      response: '{"customers":[{"id":1,"email":"a@b.com"}]}'
    });

    const data = await fetchCustomers(mockClient, { limit: 50, sinceId: 10 });
    expect(mockClient.request.invokeTemplate).toHaveBeenCalledWith('fetchCustomers', {
      context: { limit: '50', since_id: '10' }
    });
    expect(data.customers).toHaveLength(1);
  });

  test('searchCustomers passes query context', async function () {
    mockClient.request.invokeTemplate.mockResolvedValue({
      response: '{"customers":[{"id":2,"email":"find@shop.com"}]}'
    });

    await searchCustomers(mockClient, 'find@shop.com');
    expect(mockClient.request.invokeTemplate).toHaveBeenCalledWith('searchCustomers', {
      context: { query: 'find@shop.com' }
    });
  });

  test('fetchOrdersByEmail passes customer email and limit', async function () {
    mockClient.request.invokeTemplate.mockResolvedValue({
      response: '{"orders":[{"id":99}]}'
    });

    const data = await fetchOrdersByEmail(mockClient, 'buyer@shop.com');
    expect(mockClient.request.invokeTemplate).toHaveBeenCalledWith('fetchCustomerOrders', {
      context: { customer_email: 'buyer@shop.com', limit: '25' }
    });
    expect(data.orders[0].id).toBe(99);
  });

  test('fetchAllOrders passes pagination context', async function () {
    mockClient.request.invokeTemplate.mockResolvedValue({
      response: '{"orders":[{"id":1}]}'
    });

    await fetchAllOrders(mockClient, { limit: 50, sinceId: 10 });
    expect(mockClient.request.invokeTemplate).toHaveBeenCalledWith('fetchOrders', {
      context: { limit: '50', since_id: '10' }
    });
  });

  test('fetchOrderById passes order id context', async function () {
    mockClient.request.invokeTemplate.mockResolvedValue({
      response: '{"order":{"id":123}}'
    });

    const data = await fetchOrderById(mockClient, '123');
    expect(mockClient.request.invokeTemplate).toHaveBeenCalledWith('fetchOrderById', {
      context: { order_id: '123' }
    });
    expect(data.order.id).toBe(123);
  });

  test('filterOrders matches order id and email', function () {
    const orders = [
      { id: 450789469, email: 'buyer@shop.com', order_number: 1001, name: '#1001' },
      { id: 450789470, email: 'other@shop.com', order_number: 1002, name: '#1002' }
    ];
    expect(filterOrders(orders, '450789469').length).toBe(1);
    expect(filterOrders(orders, 'buyer@shop.com').length).toBe(1);
  });
});
