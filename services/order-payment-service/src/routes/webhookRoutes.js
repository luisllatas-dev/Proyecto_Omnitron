const express = require('express');
const router = express.Router();
const {
  handlePayPalWebhook,
  handleMercadoPagoWebhook,
  handleIziPayWebhook,
  devSimulatePay
} = require('../controllers/webhookController');

// Webhooks de pasarelas
router.post('/webhook/paypal', handlePayPalWebhook);
router.post('/webhook/mercadopago', handleMercadoPagoWebhook);
router.post('/webhook/izipay', handleIziPayWebhook);

// Endpoint de prueba/desarrollo para simular pago
router.post('/dev-simulate-pay/:orderId', devSimulatePay);

module.exports = router;
