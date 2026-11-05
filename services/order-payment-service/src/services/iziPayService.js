const axios = require('axios');
const crypto = require('crypto');

const createIziPayPaymentToken = async (orderId, amount, currency = 'USD', email) => {
  const publicKey = process.env.IZIPAY_PUBLIC_KEY || 'TEST_PUBLIC_KEY';
  const hmacKey = process.env.IZIPAY_HMAC_SHA256 || 'TEST_HMAC_KEY';
  const serverUrl = process.env.IZIPAY_SERVER_URL || 'https://api.micuentaweb.pe';

  // En IziPay el monto se envía en céntimos (ej. 10.50 USD -> 1050)
  const amountInCents = Math.round(amount * 100);

  const auth = Buffer.from(`${publicKey}:${hmacKey}`).toString('base64');

  const body = {
    amount: amountInCents,
    currency: currency === 'PEN' ? 'PEN' : 'USD',
    orderId: orderId.toString(),
    customer: {
      email: email
    }
  };

  try {
    const response = await axios.post(`${serverUrl}/api-payment/V4/Charge/CreatePayment`, body, {
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (error) {
    console.error('[IziPay Service Error]', error.response?.data || error.message);
    throw new Error('Error al generar sesión de pago con IziPay');
  }
};

const verifyIziPaySignature = (krAnswer, krHash, hmacKey) => {
  const key = hmacKey || process.env.IZIPAY_HMAC_SHA256;
  const hash = crypto.createHmac('sha256', key).update(krAnswer).digest('hex');
  return hash === krHash;
};

module.exports = {
  createIziPayPaymentToken,
  verifyIziPaySignature
};
