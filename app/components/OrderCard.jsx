import React from 'react';
import {
  FwAccordion,
  FwAccordionBody,
  FwAccordionTitle
} from '@freshworks/crayons/react';
import {
  fieldValue,
  formatMoney,
  formatOrderCreatedAt,
  formatOrderFulfillmentStatus,
  formatOrderTitle
} from '../utils/shopify-api';

function OrderCard({ order }) {
  const buyer = order.customer || {};
  const lineCount = Array.isArray(order.line_items) ? order.line_items.length : 0;

  return (
    <FwAccordion className="shopify-card">
      <FwAccordionTitle>
        <div className="shopify-card-header">
          <div>
            <p className="shopify-card-title">{formatOrderTitle(order)}</p>
            <p className="shopify-card-subtitle">{formatOrderFulfillmentStatus(order)}</p>
          </div>
          <span className="shopify-badge shopify-badge--muted">
            {fieldValue(order, 'financial_status', 'unknown')}
          </span>
        </div>
      </FwAccordionTitle>
      <FwAccordionBody>
        <p className="shopify-detail-row">
          <span className="shopify-detail-label">Email</span>
          <span className="shopify-detail-value">{fieldValue(buyer, 'email', 'NA')}</span>
        </p>
        <p className="shopify-detail-row">
          <span className="shopify-detail-label">Total</span>
          <span className="shopify-detail-value">
            {formatMoney(order.total_price, order.currency)}
          </span>
        </p>
        <p className="shopify-detail-row">
          <span className="shopify-detail-label">Fulfillment</span>
          <span className="shopify-detail-value">
            {fieldValue(order, 'fulfillment_status', 'unfulfilled')}
          </span>
        </p>
        <p className="shopify-detail-row">
          <span className="shopify-detail-label">Items</span>
          <span className="shopify-detail-value">{lineCount}</span>
        </p>
        <p className="shopify-detail-row">
          <span className="shopify-detail-label">Created</span>
          <span className="shopify-detail-value">{formatOrderCreatedAt(order)}</span>
        </p>
      </FwAccordionBody>
    </FwAccordion>
  );
}

export default OrderCard;
