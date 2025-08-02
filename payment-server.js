const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_your_stripe_secret_key');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: ['https://webglo.org', 'http://localhost:3000', 'http://127.0.0.1:5500'],
  credentials: true
}));
app.use(express.json());
app.use(express.static('.')); // Serve static files

// Email transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'hello@webglo.org',
    pass: process.env.EMAIL_PASSWORD || 'your_app_password'
  }
});

// Create payment intent
app.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'usd', orderData } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // Amount in cents ($297.00 = 29700)
      currency: currency,
      metadata: {
        service: 'Landing Page Express',
        business_name: orderData?.business_name || '',
        contact_email: orderData?.contact_email || '',
        industry: orderData?.industry || '',
        main_goal: orderData?.main_goal || ''
      }
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

// Webhook to handle successful payments
app.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    console.log('Payment succeeded:', paymentIntent.id);
    
    // Send confirmation email
    await sendConfirmationEmail(paymentIntent);
    
    // Store order in database (you would implement this)
    await saveOrder(paymentIntent);
  }

  res.json({received: true});
});

// Send confirmation email
async function sendConfirmationEmail(paymentIntent) {
  const orderNumber = `LPE-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0')}`;
  const deliveryDate = new Date(Date.now() + (48 * 60 * 60 * 1000));
  
  const emailContent = `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .header { background: linear-gradient(135deg, #ef4444, #f97316); color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .order-details { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; }
          .cta-button { 
            display: inline-block; 
            background: linear-gradient(135deg, #ef4444, #f97316); 
            color: white; 
            padding: 12px 24px; 
            text-decoration: none; 
            border-radius: 8px; 
            font-weight: bold; 
            margin: 10px 0; 
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🎉 Your Landing Page Express Order is Confirmed!</h1>
          <p>Thank you for choosing WebGlo - We're excited to create your landing page!</p>
        </div>
        
        <div class="content">
          <h2>Order Details</h2>
          <div class="order-details">
            <p><strong>Order Number:</strong> ${orderNumber}</p>
            <p><strong>Service:</strong> Landing Page Express</p>
            <p><strong>Amount Paid:</strong> $${(paymentIntent.amount / 100).toFixed(2)}</p>
            <p><strong>Payment ID:</strong> ${paymentIntent.id}</p>
            <p><strong>Expected Delivery:</strong> ${deliveryDate.toLocaleDateString()} by ${deliveryDate.toLocaleTimeString()}</p>
          </div>

          <h2>What Happens Next?</h2>
          <ol>
            <li><strong>Detailed Brief (Within 2 hours):</strong> We'll send you a comprehensive project questionnaire to gather additional assets and preferences.</li>
            <li><strong>Design & Development (24-40 hours):</strong> Our team will create your professional landing page.</li>
            <li><strong>Delivery & Review (48 hours):</strong> You'll receive your completed landing page with one free revision round.</li>
          </ol>

          <h2>📋 Start Gathering Your Assets</h2>
          <p>To help us deliver the best possible result, start collecting:</p>
          <ul>
            <li>Your business logo (high resolution)</li>
            <li>High-quality images or photos</li>
            <li>Any specific copy or text you want included</li>
            <li>Examples of designs you like</li>
            <li>Contact information for your landing page</li>
          </ul>

          <div style="text-align: center; margin: 30px 0;">
            <a href="https://webglo.org/project-brief?order=${orderNumber}" class="cta-button">
              Complete Your Project Brief →
            </a>
          </div>

          <h2>Need Help?</h2>
          <p>Our team is here to ensure your landing page exceeds expectations:</p>
          <ul>
            <li><strong>Email:</strong> hello@webglo.org (Response within 2 hours)</li>
            <li><strong>Live Chat:</strong> Available on our website 9 AM - 6 PM EST</li>
          </ul>
        </div>
        
        <div class="footer">
          <p>Thank you for choosing WebGlo!</p>
          <p>This email confirms your order ${orderNumber}. Please keep this for your records.</p>
          <p>WebGlo | Professional Web Solutions | <a href="https://webglo.org">webglo.org</a></p>
        </div>
      </body>
    </html>
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER || 'hello@webglo.org',
    to: paymentIntent.metadata.contact_email,
    bcc: 'orders@webglo.org', // Copy for internal tracking
    subject: `🎉 Order Confirmed: ${orderNumber} - Landing Page Express`,
    html: emailContent
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Confirmation email sent successfully');
  } catch (error) {
    console.error('Error sending confirmation email:', error);
  }
}

// Save order to database (implement your preferred database)
async function saveOrder(paymentIntent) {
  const orderData = {
    orderId: `LPE-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0')}`,
    paymentIntentId: paymentIntent.id,
    amount: paymentIntent.amount / 100,
    currency: paymentIntent.currency,
    status: 'confirmed',
    service: 'Landing Page Express',
    customerEmail: paymentIntent.metadata.contact_email,
    businessName: paymentIntent.metadata.business_name,
    industry: paymentIntent.metadata.industry,
    mainGoal: paymentIntent.metadata.main_goal,
    createdAt: new Date(),
    deliveryDeadline: new Date(Date.now() + (48 * 60 * 60 * 1000))
  };

  // Here you would save to your database
  // For now, we'll just log it
  console.log('Order saved:', orderData);
  
  // You could save to a JSON file, Google Sheets, MongoDB, etc.
  // Example for JSON file:
  const fs = require('fs').promises;
  try {
    const orders = await fs.readFile('orders.json', 'utf8').then(JSON.parse).catch(() => []);
    orders.push(orderData);
    await fs.writeFile('orders.json', JSON.stringify(orders, null, 2));
  } catch (error) {
    console.error('Error saving order:', error);
  }
}

// Get order details (for confirmation page)
app.get('/order/:orderId', async (req, res) => {
  try {
    // In a real implementation, fetch from database
    const fs = require('fs').promises;
    const orders = await fs.readFile('orders.json', 'utf8').then(JSON.parse).catch(() => []);
    const order = orders.find(o => o.orderId === req.params.orderId);
    
    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ error: 'Order not found' });
    }
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve the main pages
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/order-landing-page-express', (req, res) => {
  res.sendFile(__dirname + '/order-landing-page-express.html');
});

app.get('/order-confirmation', (req, res) => {
  res.sendFile(__dirname + '/order-confirmation.html');
});

app.listen(PORT, () => {
  console.log(`🚀 WebGlo payment server running on port ${PORT}`);
  console.log(`💳 Stripe integration ready`);
  console.log(`📧 Email notifications configured`);
});

module.exports = app;
