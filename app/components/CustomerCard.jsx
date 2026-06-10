import React from 'react';
import {
  FwAccordion,
  FwAccordionBody,
  FwAccordionTitle
} from '@freshworks/crayons/react';
import {
  fieldValue,
  formatCustomerAccordionSubtitle,
  formatCustomerAccordionTitle,
  formatCustomerAddress,
  formatCustomerCreatedAt,
  formatMoney
} from '../utils/shopify-api';

function DetailRow({ label, value }) {
  return (
    <p className="shopify-detail-row">
      <span className="shopify-detail-label">{label}</span>
      <span className="shopify-detail-value">{value}</span>
    </p>
  );
}

function CustomerCard({ customer, onViewOrders }) {
  const title = formatCustomerAccordionTitle(customer);
  const subtitle = formatCustomerAccordionSubtitle(customer);
  const email = fieldValue(customer, 'email', '');
  const phone = fieldValue(customer, 'phone', 'NA');

  return (
    <FwAccordion className="shopify-card">
      <FwAccordionTitle>
        <div className="shopify-card-header">
          <div>
            <p className="shopify-card-title">{title}</p>
            <p className="shopify-card-subtitle">{subtitle}</p>
          </div>
        </div>
      </FwAccordionTitle>
      <FwAccordionBody>
        <DetailRow label="ID" value={fieldValue(customer, 'id', 'NA')} />
        <DetailRow label="Phone" value={phone} />
        <DetailRow label="Address" value={formatCustomerAddress(customer)} />
        <DetailRow label="Total spent" value={formatMoney(customer.total_spent, customer.currency)} />
        <DetailRow label="State" value={fieldValue(customer, 'state', 'NA')} />
        <DetailRow label="Tags" value={fieldValue(customer, 'tags', 'NA')} />
        <DetailRow label="Created" value={formatCustomerCreatedAt(customer)} />
        <DetailRow
          label="Last order"
          value={fieldValue(customer, 'last_order_id', 'None')}
        />
        {email ? (
          <button
            type="button"
            className="shopify-text-btn shopify-card-action"
            onClick={() => onViewOrders(email)}
          >
            View orders
          </button>
        ) : null}
      </FwAccordionBody>
    </FwAccordion>
  );
}

export default CustomerCard;
