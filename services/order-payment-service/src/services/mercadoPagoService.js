const { MercadoPagoConfig, Preference } = require('mercadopago');

const getClient = () => {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN || 'TEST_ACCESS_TOKEN';
  return new MercadoPagoConfig({ accessToken });
};

const createMercadoPagoPreference = async (orderId, items, payerEmail) => {
  const client = getClient();
  const preference = new Preference(client);

  const preferenceItems = items.map(item => ({
    id: item.courseId.toString(),
    title: item.title,
    quantity: 1,
    unit_price: Number(item.finalPrice),
    currency_id: 'USD'
  }));

  const response = await preference.create({
    body: {
      items: preferenceItems,
      payer: {
        email: payerEmail
      },
      external_reference: orderId.toString(),
      back_urls: {
        success: `${process.env.CLIENT_FRONTEND_URL || 'http://localhost:3000'}/checkout/success`,
        failure: `${process.env.CLIENT_FRONTEND_URL || 'http://localhost:3000'}/checkout/failure`,
        pending: `${process.env.CLIENT_FRONTEND_URL || 'http://localhost:3000'}/checkout/pending`
      },
      auto_return: 'approved'
    }
  });

  return response;
};

module.exports = {
  createMercadoPagoPreference
};
