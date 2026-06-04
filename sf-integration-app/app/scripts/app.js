init();

async function init() {
  const appClient = await app.initialized();
  window.client = appClient;
  appClient.events.on('app.activated', resizeApp);
  window.fetchCustomerOrders = fetchCustomerOrders;
  window.renderCustomerData = renderCustomerData;
  window.clearCustomerOrders = clearCustomerOrders;
  window.clearCustomerData = clearCustomerData;
  window.reset = reset;
}

/**
 * This asynchronous function resizes the app's instance height to 600px.
 * It uses the Freshworks Client SDK `client.instance.resize()` method to achieve this.
 * If the resizing process fails, it logs an error message in the console.
 */
async function resizeApp() {
  try {
    await window.client.instance.resize({ height: '600px' });
  } catch (err) {
    console.error('failed to resize', err);
  }
}


/**
 * This asynchronous function fetches customer data from Shopify.
 * It first clears any previous customer orders data by calling clearCustomerOrders().
 * Then, it calls the 'fetchCustomers' request template with an empty object as context.
 * It directly parses the JSON response received from the request template and logs the response in the console.
 * In case of an error, the function logs the error message along with a description.
 * @returns {Array} custResponse - array of customer objects
 */
async function fetchShopifyCustomers() {
  clearCustomerOrders();
  try {
    const custResponse = JSON.parse((await window.client.request.invokeTemplate('fetchCustomers', {})).response);
    console.log("Shopify customers:", custResponse);
    return custResponse;
  } catch (error) {
    console.error("Error fetching Shopify customers:", error);
  }
}

/**
 * This function generates an HTML string to create a Crayons accordion card
 * displaying customer details such as name, phone, email, address,
 * total orders, and last order ID.
 *
 * @param {Object} customer - An object containing customer details.
 * @param {string} customer.first_name - The first name of the customer.
 * @param {string} customer.last_name - The last name of the customer.
 * @param {string} customer.phone - The phone number of the customer.
 * @param {string} customer.email - The email address of the customer.
 * @param {string} customer.address - The address of the customer.
 * @param {string} customer.orders_count - The total number of orders by the customer.
 * @param {string} customer.last_order_id - The ID of the last order placed by the customer.
 *
 * @returns {string} An HTML string representing the accordion card with customer details.
 */
function customerField(customer, key, fallback) {
  return customer[key] || fallback;
}

function createCard(customer) {
  const name = `${customerField(customer, 'first_name', '')} ${customerField(customer, 'last_name', '')}`.trim();

  return `
    <br />
    <fw-accordion>
      <div class="fw-card-1 fw-py-8 fw-px-16 fw-flex fw-flex-row">
        <section class="fw-flex-grow fw-px-24 fw-flex fw-flex-column">
          <fw-accordion-title>
            <p class="fw-type-xs fw-mt-0 fw-mb-16"><b>Name: </b>${name}</p>
            <p class="fw-type-xs fw-mt-0 fw-mb-16"><b>Phone: </b>${customerField(customer, 'phone', 'NA')}</p>
          </fw-accordion-title>
          <fw-accordion-body>
            <p><b>Email:</b> ${customerField(customer, 'email', 'NA')}</p>
            <p><b>Address:</b> ${customerField(customer, 'address', 'NA')}</p>
            <p><b>Total Orders:</b> ${customerField(customer, 'orders_count', 'NA')}</p>
            <p><b>Last Order ID:</b> ${customerField(customer, 'last_order_id', 'NA')}</p>
          </fw-accordion-body>
        </section>
      </div>
    </fw-accordion>
  `;
}


/**
 * This asynchronous function fetches customer data from Shopify,
 * creates a card for each customer and renders the cards in
 * the designated container element on the page.
 */
async function renderCustomerData() {
  // Fetches customer data by calling the 'fetchShopifyCustomers' async function
  const customersData = await fetchShopifyCustomers();
  
  if (customersData && customersData.customers && customersData.customers.length !== 0) {
    // Gets the container element for customer cards by its ID
    const cardsContainer = document.getElementById('customer-cards-container');
    // Iterates over the fetched customers, creates a card for each customer,
    // and concatenates the card's markup in a single string
    const cardsMarkup = customersData.customers
      .map(customer => createCard(customer))
      .join('');

    // Inserts the concatenated cards markup into the container element,
    // replacing any existing content inside the container
    cardsContainer.innerHTML = cardsMarkup;
 
  }else{
    const orderDetails = document.getElementById('orderDetails');
    orderDetails.innerHTML = '<br/>No orders found for this Email ID, please try again'
  }
}



/*
 * The `clearCustomerData` function is used to clear the content of the
 * element with the ID `customer-cards-container`. This is typically used
 * to remove any customer cards displayed within the container, making it empty.
 */
function clearCustomerData() {
  const cardsContainer = document.getElementById('customer-cards-container');
  cardsContainer.innerHTML = '';
}


/**
 * This asynchronous function clears existing customer orders from the DOM.
 * It does so by targeting an element with the ID 'orderDetails'
 * and setting its innerHTML content to an empty string.
 */
function clearCustomerOrders() {
  const inputField = document.getElementById('customerEmail');
  inputField.value = '';
  const cardsContainer = document.getElementById('orderDetails');
  cardsContainer.innerHTML = '';
}



/**
 * fetchCustomerOrders function retrieves and displays shopify orders for the given customer email
 * @param {string} customerEmail - Customer email used for fetching the orders
 */
async function fetchCustomerOrders() {
  // Clear previous customer data (if any)
  clearCustomerData();
  clearCustomerOrders();
  

  const inputField = document.getElementById('customerEmail');
  const customerEmail = inputField.value;
  console.log('Input Value:', customerEmail);

  try {
    // Invoke template defined in config/requests.json to fetch customer orders using the provided email
    console.log(customerEmail);
    const customerOrders = await window.client.request.invokeTemplate('fetchCustomerOrders', {
      context: { customer_email: customerEmail }
    });

    // Parse and extract orders from the template response
    const orders = JSON.parse(customerOrders.response);

    // Log orders to the console
    console.log(orders);

    // Display orders in the app UI
    displayOrderDetails(orders);

  } catch (error) {
    // Log error if any occurred while fetching the Shopify orders
    console.error("Error while fetching Shopify orders:", error);
  }
}


function reset() {
  clearCustomerData();
  clearCustomerOrders();
}

// This function is used to display order details based on the provided array of orders.
// It goes through each order object, extracts the relevant information such as order
// ID, customer name, email, total price, status, and creation date, and formats them
// into Crayons' Accordion components. These accordions are then added as HTML content
// inside an element with ID 'orderDetails'.
function orderField(order, key, fallback) {
  return order[key] || fallback;
}

function createOrderCard(order) {
  const buyer = order.customer || {};
  const buyerName = `${orderField(buyer, 'first_name', '-')} ${orderField(buyer, 'last_name', '-')}`.trim();
  const createdAt = order.created_at ? new Date(order.created_at).toLocaleString() : '-';

  return `
      <br/>
      <fw-accordion>
        <fw-accordion-title>
          <h5 class="fw-type-h5 fw-m-0">Order ID: ${orderField(order, 'id', '-')}</h5>
        </fw-accordion-title>
        <fw-accordion-body>
          <div class="fw-card-1 fw-py-16 fw-px-20 fw-flex fw-flex-column">
            <p class="fw-type-xs fw-mt-0 fw-mb-16"><b>Customer</b>: ${buyerName}</p>
            <p class="fw-type-xs fw-mt-0 fw-mb-16"><b>Email</b>: ${orderField(buyer, 'email', 'NA')}</p>
            <section class="fw-type-xs fw-flex fw-flex-row options">
              <span><b>Total</b>: $${orderField(order, 'total_price', '-')}</span><br/>
              <span><b>Status</b>: ${orderField(order, 'financial_status', '-')}</span><br/>
              <span><b>Created at</b>: ${createdAt}</span>
            </section>
          </div>
        </fw-accordion-body>
      </fw-accordion>
      `;
}

function displayOrderDetails(orders) {
  const orderDetails = document.getElementById('orderDetails');
  orderDetails.innerHTML = orders.orders.map((order) => createOrderCard(order)).join('');
}