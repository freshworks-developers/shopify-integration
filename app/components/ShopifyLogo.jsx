import React from 'react';

function ShopifyLogo({ size = 28, className = '' }) {
  return (
    <img
      className={'shopify-logo ' + className}
      src="public/shopify.png"
      alt="Shopify"
      width={size}
      height={size}
    />
  );
}

export default ShopifyLogo;
