import React from 'react';
import {
  FwButton,
  FwInput,
  FwSpinner
} from '@freshworks/crayons/react';
import OrderCard from './OrderCard';

function OrdersPanel({
  orders,
  filteredOrders,
  orderSearch,
  orderSearchError,
  orderSummary,
  loading,
  loadingMore,
  hasMore,
  onSearchChange,
  onLoadAll,
  onLoadMore,
  onSearchShopify,
  onClear
}) {
  const hasResults = orders.length > 0;

  return (
    <section className="shopify-panel">
      <div className="shopify-toolbar">
        <FwInput
          placeholder="Search by order ID or customer email"
          value={orderSearch}
          state={orderSearchError ? 'error' : 'normal'}
          errorText={orderSearchError}
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
            disabled={!orderSearch.trim()}
            onFwClick={onSearchShopify}
          >
            Search
          </FwButton>
        </div>
      </div>

      {hasResults ? (
        <div className="shopify-results-meta">
          <span>
            {filteredOrders.length} of {orders.length} shown
            {hasMore ? ' · more available' : ''}
            {filteredOrders.length ? ` · ${orderSummary.totalLabel}` : ''}
          </span>
          <button type="button" className="shopify-text-btn" onClick={onClear}>
            Clear
          </button>
        </div>
      ) : null}

      {loading && !hasResults ? (
        <div className="shopify-empty">
          <FwSpinner size="small" />
          <span>Loading orders…</span>
        </div>
      ) : null}

      {!loading && !hasResults ? (
        <p className="shopify-empty">Load or search orders from your Shopify store.</p>
      ) : null}

      <div className="shopify-results">
        {filteredOrders.map(function (order) {
          return <OrderCard key={order.id} order={order} />;
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

export default OrdersPanel;
