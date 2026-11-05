const axios = require('axios');

const getPayPalBaseUrl = () => {
  return process.env.PAYPAL_MODE === 'production'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';
};

const getPayPalAccessToken = async () => {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Credenciales de PayPal no configuradas');
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const response = await axios.post(
    `${getPayPalBaseUrl()}/v1/oauth2/token`,
    'grant_type=client_credentials',
    {
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
  );

  return response.data.access_token;
};

const createPayPalOrder = async (orderId, amount, currency = 'USD') => {
  const token = await getPayPalAccessToken();

  const body = {
    intent: 'CAPTURE',
    purchase_units: [
      {
        reference_id: orderId.toString(),
        custom_id: orderId.toString(),
        amount: {
          currency_code: currency,
          value: amount.toFixed(2)
        },
        description: `Compra Omnitron - Orden #${orderId}`
      }
    ]
  };

  const response = await axios.post(`${getPayPalBaseUrl()}/v2/checkout/orders`, body, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  return response.data;
};

const capturePayPalPayment = async (paypalOrderId) => {
  const token = await getPayPalAccessToken();

  const response = await axios.post(
    `${getPayPalBaseUrl()}/v2/checkout/orders/${paypalOrderId}/capture`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );

  return response.data;
};

module.exports = {
  createPayPalOrder,
  capturePayPalPayment
};
