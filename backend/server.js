const express = require('express');
const stripe = require('stripe');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Stripe with secret key
const stripeClient = stripe(process.env.STRIPE_SECRET_KEY);

// Middleware
app.use(cors({
  origin: ['https://webglo.org', 'https://georgiyaleksanyan.github.io', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuration
const CONFIG = {
  WEBSITE_URL: 'https://webglo.org',
  EMAIL_FROM: 'hello@webglo.org'
};

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'WebGlo Backend API is running',
    timestamp: new Date().toISOString(),
    version: '1.0'
  });
});

// Create Stripe Checkout Session
app.post('/create-checkout-session', async (req, res) => {
  try {
    console.log('=== CHECKOUT SESSION CREATION DEBUG ===');
    console.log('Received body:', req.body);
    
    const {
      amount = 29700, // Default $297.00 in cents
      currency = 'usd',
      customer_email,
      order_number,
      business_name = '',
      industry = '',
      main_goal = '',
      contact_email = ''
    } = req.body;

    // Generate order number if not provided
    const orderNum = order_number || `ORD-${Date.now()}`;
    
    const session = await stripeClient.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: currency,
          product_data: {
            name: 'Landing Page Express',
            description: 'Professional landing page delivered in 48 hours'
          },
          unit_amount: amount
        },
        quantity: 1
      }],
      mode: 'payment',
      success_url: `${CONFIG.WEBSITE_URL}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${CONFIG.WEBSITE_URL}/cancel.html`,
      customer_email: customer_email,
      metadata: {
        order_number: orderNum,
        business_name: business_name,
        industry: industry,
        main_goal: main_goal,
        contact_email: contact_email || customer_email
      }
    });

    console.log('SUCCESS: Stripe session created:', session.id);
    console.log('Checkout URL:', session.url);

    res.json({ 
      sessionId: session.id,
      url: session.url 
    });

  } catch (error) {
    console.error('STRIPE ERROR:', error.message);
    res.status(400).json({ 
      error: 'Failed to create checkout session',
      message: error.message 
    });
  }
});

// Handle form submission and redirect (for compatibility with existing forms)
app.post('/create-checkout-form', async (req, res) => {
  try {
    console.log('=== FORM CHECKOUT SESSION CREATION ===');
    console.log('Form data received:', req.body);
    
    const {
      amount = 29700,
      currency = 'usd',
      customer_email,
      order_number,
      business_name = '',
      industry = '',
      main_goal = '',
      contact_email = ''
    } = req.body;

    const orderNum = order_number || `ORD-${Date.now()}`;
    
    const session = await stripeClient.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: currency,
          product_data: {
            name: 'Landing Page Express',
            description: 'Professional landing page delivered in 48 hours'
          },
          unit_amount: amount
        },
        quantity: 1
      }],
      mode: 'payment',
      success_url: `${CONFIG.WEBSITE_URL}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${CONFIG.WEBSITE_URL}/cancel.html`,
      customer_email: customer_email,
      metadata: {
        order_number: orderNum,
        business_name: business_name,
        industry: industry,
        main_goal: main_goal,
        contact_email: contact_email || customer_email
      }
    });

    console.log('SUCCESS: Redirecting to Stripe checkout:', session.url);

    // Return HTML with redirect (similar to your Google Apps Script approach)
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Redirecting to Payment...</title>
        <meta charset="UTF-8">
      </head>
      <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
        <h2>Redirecting to secure payment...</h2>
        <p>If you are not automatically redirected, <a href="${session.url}" id="manualLink">click here</a>.</p>
        
        <script>
          console.log("Stripe checkout URL: ${session.url}");
          
          function redirect() {
            try {
              window.location.href = "${session.url}";
            } catch (e) {
              console.error("Redirect failed:", e);
              document.getElementById("manualLink").style.cssText = "background: #ef4444; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-size: 18px; margin-top: 20px;";
              document.getElementById("manualLink").textContent = "Click Here to Continue to Payment";
            }
          }
          
          // Immediate redirect
          redirect();
          
          // Fallback redirect after 500ms
          setTimeout(redirect, 500);
        </script>
      </body>
      </html>
    `);

  } catch (error) {
    console.error('FORM STRIPE ERROR:', error.message);
    res.status(400).send(`
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 500px; margin: 50px auto; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #dc2626;">Payment Error</h2>
        <p style="color: #374151;">There was an issue processing your payment:</p>
        <p style="background: #fef2f2; padding: 10px; border-radius: 4px; color: #991b1b;">${error.message}</p>
        <button onclick="window.history.back()" style="background: #2563eb; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer;">Go Back</button>
      </div>
    `);
  }
});

// Stripe Webhook Handler
app.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripeClient.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.log(`Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      console.log('Payment succeeded:', session.id);
      
      // Here you can add logic to:
      // - Send confirmation emails
      // - Save order data
      // - Create customer folders
      // - Send notifications
      
      await processOrder(session);
      break;
      
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({received: true});
});

// Process completed order (placeholder for your business logic)
async function processOrder(session) {
  try {
    console.log('Processing order:', session.metadata.order_number);
    console.log('Customer:', session.customer_details.email);
    console.log('Amount:', session.amount_total / 100);
    
    // TODO: Add your order processing logic here:
    // - Send emails
    // - Create Google Drive folders
    // - Save to database/sheets
    // - Send notifications
    
  } catch (error) {
    console.error('Order processing error:', error);
  }
}

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 WebGlo Backend running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/`);
});
