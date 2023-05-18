# Shopify Integration with Freshworks Products

This document talks about Building a Shopify Integration app with custom store to that of Freshworks Products

This document talks about how to build a shopify integration app with AI capabilities provided by Freshworks

To build a OAuth enabled shopify integration with Freshworks app below are the steps required
1. Ensure you have store details and API credentials required to access the APIs. If it is not there then follow the steps below
   1. Sign up with Shopify as a partner using [Shopify Sign Up page](https://partners.shopify.com/signup/developer)
   2. Once signed up, create a new store such as [Thakurs Boutique](https://thakurs-boutique.myshopify.com/)
   3. From store settings, go to `apps and sales channels` -> `develop apps` -> `Create an App`.
   4. Under app configuration add necessary changes and storefront integrations
   5. Extract API key and secret
   6. Install the app on shopify store, while at it Extract Admin access token and Store front access token
2. Ensure you have signed up for developer portal and have successfully signed up for at least one Freshworks products
3. Ensure you have installed latest FDK CLI with prerequisites on your machine
4. If you do not have it already, follow the steps as per [getting-started guide](https://github.com/freshworks-developers/bangalore-workshop/blob/main/step-1/getting_started.md)
5. Ensure you have VS code editor configured with AI Plugin

Once you have the necessary setup done, follow along the [app development guide](docs/app_dev_guide.md)