import React from 'react';
import {
  FwButton,
  FwInput,
  FwSpinner
} from '@freshworks/crayons/react';
import CustomerCard from './CustomerCard';

function CustomerPanel({
  customers,
  filteredCustomers,
  customerSearch,
  onSearchChange,
  loading,
  loadingMore,
  hasMore,
  onLoadAll,
  onLoadMore,
  onSearchShopify,
  onClear,
  onViewOrders
}) {
  const hasResults = customers.length > 0;

  return (
    <section className="shopify-panel">
      <div className="shopify-toolbar">
        <FwInput
          placeholder="Search by name, email, or ID"
          value={customerSearch}
          onFwInput={(event) => onSearchChange(event.detail.value)}
        />
        <div className="shopify-toolbar-actions">
          <button
            type="button"
            className={'shopify-btn' + (loading ? ' shopify-btn--loading' : '')}
            disabled={loading}
            onClick={onLoadAll}
          >
            {loading ? <FwSpinner size="small" /> : 'Load all'}
          </button>
          <FwButton
            color="secondary"
            loading={loading}
            disabled={!customerSearch.trim()}
            onFwClick={onSearchShopify}
          >
            Search
          </FwButton>
        </div>
      </div>

      {hasResults ? (
        <div className="shopify-results-meta">
          <span>
            {filteredCustomers.length} of {customers.length} shown
            {hasMore ? ' · more available' : ''}
          </span>
          <button type="button" className="shopify-text-btn" onClick={onClear}>
            Clear
          </button>
        </div>
      ) : null}

      {loading && !hasResults ? (
        <div className="shopify-empty">
          <FwSpinner size="small" />
          <span>Loading…</span>
        </div>
      ) : null}

      {!loading && !hasResults ? (
        <p className="shopify-empty">Load or search customers from your Shopify store.</p>
      ) : null}

      <div className="shopify-results">
        {filteredCustomers.map(function (customer) {
          return (
            <CustomerCard
              key={customer.id || customer.email}
              customer={customer}
              onViewOrders={onViewOrders}
            />
          );
        })}
      </div>

      {hasMore && hasResults ? (
        <div className="shopify-load-more">
          <button
            type="button"
            className="shopify-text-btn"
            disabled={loadingMore}
            onClick={onLoadMore}
          >
            {loadingMore ? 'Loading…' : 'Load more'}
          </button>
        </div>
      ) : null}
    </section>
  );
}

export default CustomerPanel;
