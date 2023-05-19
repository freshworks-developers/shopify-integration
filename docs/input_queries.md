# Input queries for building the app usecase

1. Use prompt "add installation settings namely Shopify Sub Domain and Shopify Access Token to freshworks app"
   1. Include the code snippet in `iparams.json`
   2. Run your app using `fdk run` and navigate to `http://localhost:10001/custom_configs` to verify the installation settings
   3. Add the Store URI and Access Token in custom_configs and install
      1. The Store URI be like `https://{shop-name}.myshopify.com/admin/api/2023-04`
      2. The Shopify Store front access token will be like `shpat_0c17e982684f3c0a785cf92eb9hfs822` 

2. Refer to the [Shopify API Postman Collection](assets/shopify-api-collection.json) by importing it in to [Postman](https://www.postman.com/downloads/) and explore the APIs

3. use shopify api to Retrieve all customers using request method with shopify access token iparam
   1. Update the code as necessary

4. render fetchShopifyCustomers reponse in a collapsable card layout using crayons card

5. use prompt "modify this code segment to display blank value when json value is null or undefined
      <p>Phone: ${customer.phone}</p>
      <p>Address: ${customer.address}</p>
      <p>Total Orders: ${customer.orders_count}</p>
      <p>Last Order ID: ${customer.last_order_id}</p>"

6. Use prompt "Increase my freshworks app height using app methods"
7. Use prompt "create crayons button to invoke customer data using fetchShopifyCustomers() inside a modal"
8. Use prompt "Create a input field to get the customer email address. add a Crayons button, upon click, make an API call to Shopify that retrieves the recent orders for a customer with the email address {customer_email}"
9. Use prompt "use request method to make an API call to Shopify that retrieves the recent orders for a customer with the email address {customer_email}. Parse the response and display the order details, such as order number, items name, and total amount"
10. Use prompt "display shopify customer order details in crayons card layout"
11. Refactor my code
12. Security check
13. Generate code comments
14. Update readme doc
