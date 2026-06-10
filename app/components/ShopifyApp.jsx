import React, { useCallback, useMemo, useState } from 'react';
import { FwInlineMessage } from '@freshworks/crayons/react';
import CustomerPanel from './CustomerPanel';
import OrdersPanel from './OrdersPanel';
import ShopifyLogo from './ShopifyLogo';
import {
  extractCustomerList,
  extractOrderList,
  fetchAllOrders,
  fetchCustomers,
  fetchOrderById,
  fetchOrdersByEmail,
  filterCustomers,
  filterOrders,
  searchCustomers,
  sortCustomersByTotalSpent,
  summarizeOrders
} from '../utils/shopify-api';
import { isValidEmail, isValidOrderId, normalizeOrderId } from '../utils/validation';

const CUSTOMER_PAGE_SIZE = 50;
const ORDER_PAGE_SIZE = 50;

function ShopifyApp({ client }) {
  const [activeTab, setActiveTab] = useState('customers');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderSearchError, setOrderSearchError] = useState('');
  const [customers, setCustomers] = useState([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [hasMoreCustomers, setHasMoreCustomers] = useState(false);
  const [orders, setOrders] = useState([]);
  const [hasMoreOrders, setHasMoreOrders] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState('');
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [loadingMoreCustomers, setLoadingMoreCustomers] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingMoreOrders, setLoadingMoreOrders] = useState(false);

  const filteredCustomers = useMemo(
    function () {
      return sortCustomersByTotalSpent(filterCustomers(customers, customerSearch));
    },
    [customers, customerSearch]
  );

  const filteredOrders = useMemo(
    function () {
      return filterOrders(orders, orderSearch);
    },
    [orders, orderSearch]
  );

  const orderSummary = useMemo(
    function () {
      return summarizeOrders(filteredOrders);
    },
    [filteredOrders]
  );

  const notify = useCallback(
    async function (type, message) {
      try {
        await client.interface.trigger('showNotify', { type, message });
      } catch {
        /* ignore */
      }
    },
    [client]
  );

  const showError = useCallback(
    async function (message) {
      setStatusMessage(message);
      setStatusType('error');
      await notify('danger', message);
    },
    [notify]
  );

  const clearStatus = useCallback(function () {
    setStatusMessage('');
    setStatusType('');
  }, []);

  const validateOrderSearch = useCallback(function (value) {
    const term = String(value || '').trim();
    if (!term) {
      setOrderSearchError('Enter an order ID or email.');
      return false;
    }
    if (!isValidEmail(term) && !isValidOrderId(term)) {
      setOrderSearchError('Enter a valid order ID or email.');
      return false;
    }
    setOrderSearchError('');
    return true;
  }, []);

  const handleLoadAllCustomers = async function () {
    setLoadingCustomers(true);
    clearStatus();

    try {
      const data = await fetchCustomers(client, { limit: CUSTOMER_PAGE_SIZE });
      const list = extractCustomerList(data);
      setCustomers(list);
      setHasMoreCustomers(list.length >= CUSTOMER_PAGE_SIZE);
      if (list.length === 0) {
        setStatusMessage('No customers found.');
        setStatusType('warning');
      }
    } catch (error) {
      await showError(error && error.message ? error.message : 'Failed to load customers.');
    } finally {
      setLoadingCustomers(false);
    }
  };

  const handleLoadMoreCustomers = async function () {
    if (!customers.length) {
      return;
    }

    setLoadingMoreCustomers(true);
    const lastId = customers[customers.length - 1].id;

    try {
      const data = await fetchCustomers(client, {
        limit: CUSTOMER_PAGE_SIZE,
        sinceId: lastId
      });
      const next = extractCustomerList(data);
      if (next.length === 0) {
        setHasMoreCustomers(false);
      } else {
        setCustomers(function (prev) {
          return prev.concat(next);
        });
        setHasMoreCustomers(next.length >= CUSTOMER_PAGE_SIZE);
      }
    } catch (error) {
      await showError(error && error.message ? error.message : 'Failed to load more.');
    } finally {
      setLoadingMoreCustomers(false);
    }
  };

  const handleSearchInShopify = async function () {
    const term = customerSearch.trim();
    if (!term) {
      return;
    }

    setLoadingCustomers(true);
    clearStatus();

    try {
      const data = await searchCustomers(client, term);
      const list = extractCustomerList(data);
      setCustomers(list);
      setHasMoreCustomers(false);
      if (list.length === 0) {
        setStatusMessage(`No results for "${term}".`);
        setStatusType('warning');
      }
    } catch (error) {
      await showError(error && error.message ? error.message : 'Search failed.');
    } finally {
      setLoadingCustomers(false);
    }
  };

  const handleLoadAllOrders = async function () {
    setLoadingOrders(true);
    clearStatus();
    setActiveTab('orders');

    try {
      const data = await fetchAllOrders(client, { limit: ORDER_PAGE_SIZE });
      const list = extractOrderList(data);
      setOrders(list);
      setHasMoreOrders(list.length >= ORDER_PAGE_SIZE);
      if (list.length === 0) {
        setStatusMessage('No orders found.');
        setStatusType('warning');
      }
    } catch (error) {
      await showError(error && error.message ? error.message : 'Failed to load orders.');
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleLoadMoreOrders = async function () {
    if (!orders.length) {
      return;
    }

    setLoadingMoreOrders(true);
    const lastId = orders[orders.length - 1].id;

    try {
      const data = await fetchAllOrders(client, {
        limit: ORDER_PAGE_SIZE,
        sinceId: lastId
      });
      const next = extractOrderList(data);
      if (next.length === 0) {
        setHasMoreOrders(false);
      } else {
        setOrders(function (prev) {
          return prev.concat(next);
        });
        setHasMoreOrders(next.length >= ORDER_PAGE_SIZE);
      }
    } catch (error) {
      await showError(error && error.message ? error.message : 'Failed to load more.');
    } finally {
      setLoadingMoreOrders(false);
    }
  };

  const handleSearchOrders = async function () {
    const term = orderSearch.trim();
    if (!validateOrderSearch(term)) {
      return;
    }

    setLoadingOrders(true);
    clearStatus();
    setActiveTab('orders');

    try {
      let list = [];
      if (isValidEmail(term)) {
        const data = await fetchOrdersByEmail(client, term);
        list = extractOrderList(data);
      } else {
        const data = await fetchOrderById(client, normalizeOrderId(term));
        list = extractOrderList(data);
      }
      setOrders(list);
      setHasMoreOrders(false);
      if (list.length === 0) {
        setStatusMessage(`No orders found for "${term}".`);
        setStatusType('warning');
      }
    } catch (error) {
      await showError(error && error.message ? error.message : 'Search failed.');
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleFetchOrders = async function (targetEmail) {
    const lookupEmail = String(targetEmail || '').trim();
    if (!isValidEmail(lookupEmail)) {
      setOrderSearchError('Invalid email address.');
      return;
    }

    setOrderSearch(lookupEmail);
    setOrderSearchError('');
    setLoadingOrders(true);
    clearStatus();
    setActiveTab('orders');

    try {
      const data = await fetchOrdersByEmail(client, lookupEmail);
      const list = extractOrderList(data);
      setOrders(list);
      setHasMoreOrders(false);
      if (list.length === 0) {
        setStatusMessage(`No orders for ${lookupEmail}.`);
        setStatusType('warning');
      }
    } catch (error) {
      await showError(error && error.message ? error.message : 'Failed to fetch orders.');
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleResetAll = function () {
    setCustomers([]);
    setCustomerSearch('');
    setHasMoreCustomers(false);
    setOrders([]);
    setOrderSearch('');
    setOrderSearchError('');
    setHasMoreOrders(false);
    clearStatus();
  };

  return (
    <div className="shopify-app">
      <header className="shopify-header">
        <div className="shopify-header-brand">
          <ShopifyLogo size={28} />
          <h2 className="shopify-heading">Shopify</h2>
        </div>
        <button type="button" className="shopify-text-btn shopify-reset" onClick={handleResetAll}>
          Reset
        </button>
      </header>

      <div className="shopify-tabs" role="tablist">
        <button
          type="button"
          className={'shopify-tab' + (activeTab === 'customers' ? ' shopify-tab--active' : '')}
          onClick={() => setActiveTab('customers')}
        >
          Customers
          {customers.length ? <span className="shopify-tab-count">{customers.length}</span> : null}
        </button>
        <button
          type="button"
          className={'shopify-tab' + (activeTab === 'orders' ? ' shopify-tab--active' : '')}
          onClick={() => setActiveTab('orders')}
        >
          Orders
          {orders.length ? <span className="shopify-tab-count">{orders.length}</span> : null}
        </button>
      </div>

      {statusMessage ? (
        <FwInlineMessage type={statusType || 'info'} closable onFwClose={clearStatus}>
          {statusMessage}
        </FwInlineMessage>
      ) : null}

      {activeTab === 'customers' ? (
        <CustomerPanel
          customers={customers}
          filteredCustomers={filteredCustomers}
          customerSearch={customerSearch}
          onSearchChange={setCustomerSearch}
          loading={loadingCustomers}
          loadingMore={loadingMoreCustomers}
          hasMore={hasMoreCustomers}
          onLoadAll={handleLoadAllCustomers}
          onLoadMore={handleLoadMoreCustomers}
          onSearchShopify={handleSearchInShopify}
          onClear={() => {
            setCustomers([]);
            setHasMoreCustomers(false);
            setCustomerSearch('');
          }}
          onViewOrders={handleFetchOrders}
        />
      ) : (
        <OrdersPanel
          orders={orders}
          filteredOrders={filteredOrders}
          orderSearch={orderSearch}
          orderSearchError={orderSearchError}
          orderSummary={orderSummary}
          loading={loadingOrders}
          loadingMore={loadingMoreOrders}
          hasMore={hasMoreOrders}
          onSearchChange={(value) => {
            setOrderSearch(value);
            if (orderSearchError) {
              setOrderSearchError('');
            }
          }}
          onLoadAll={handleLoadAllOrders}
          onLoadMore={handleLoadMoreOrders}
          onSearchShopify={handleSearchOrders}
          onClear={() => {
            setOrders([]);
            setHasMoreOrders(false);
            setOrderSearch('');
            setOrderSearchError('');
          }}
        />
      )}
    </div>
  );
}

export default ShopifyApp;
