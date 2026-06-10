import React, { useLayoutEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { defineCustomElements } from '@freshworks/crayons/loader';
import '@freshworks/crayons/css/crayons-min.css';
import ShopifyApp from './ShopifyApp';

defineCustomElements();

const SIDEBAR_HEIGHT = '720px';

function ShopifyMain() {
  const [child, setChild] = useState(
    <p className="shopify-loading-text">Loading Shopify integration…</p>
  );

  useLayoutEffect(() => {
    window.app.initialized().then((client) => {
      window.client = client;
      const resize = () =>
        client.instance.resize({ height: SIDEBAR_HEIGHT }).catch(() => {});
      resize();
      client.events.on('app.activated', resize);
      setChild(<ShopifyApp client={client} />);
    });
  }, []);

  return <div className="shopify-root">{child}</div>;
}

const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ShopifyMain />
  </React.StrictMode>
);
