# WebGlo Payment System Setup Guide

This guide will help you set up the complete payment and order processing system for your Landing Page Express service.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Fill in your actual values in `.env`:

```env
# Stripe Configuration (Get from https://stripe.com/docs/keys)
STRIPE_PUBLISHABLE_KEY=pk_live_your_publishable_key_here
STRIPE_SECRET_KEY=sk_live_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Email Configuration
EMAIL_USER=hello@webglo.org
EMAIL_PASSWORD=your_gmail_app_password_here

# Server Configuration
PORT=3000
NODE_ENV=production
```

### 3. Start the Server

```bash
# Development
npm run dev

# Production
npm start
```

## 📋 Complete Setup Checklist

### Stripe Setup

1. **Create Stripe Account**
   - Go to [stripe.com](https://stripe.com) and create an account
   - Complete business verification for live payments

2. **Get API Keys**
   - Go to Developers → API Keys
   - Copy your Publishable key (starts with `pk_`)
   - Copy your Secret key (starts with `sk_`)
   - Add them to your `.env` file

3. **Set Up Webhooks**
   - Go to Developers → Webhooks
   - Click "Add endpoint"
   - URL: `https://yourdomain.com/webhook`
   - Events to send: `payment_intent.succeeded`
   - Copy the webhook secret and add to `.env`

### Email Setup (Gmail)

1. **Enable 2-Factor Authentication**
   - Go to Google Account settings
   - Enable 2FA if not already enabled

2. **Generate App Password**
   - Go to Security → App passwords
   - Generate password for "Mail"
   - Use this password in `EMAIL_PASSWORD`

### Domain & SSL Setup

1. **Domain Configuration**
   - Point your domain to your server
   - Ensure SSL certificate is installed
   - Update URLs in `payment-server.js`

2. **Update Order Form**
   - Edit `order-landing-page-express.html`
   - Replace `pk_test_your_stripe_key_here` with your actual publishable key
   - Update any hardcoded URLs

## 🔄 Order Workflow

Here's how the complete system works:

1. **Customer visits Landing Page Express**
   - `landing-page-express.html`
   - Clicks "Order Now" button

2. **Order Form**
   - `order-landing-page-express.html`
   - Collects business details and requirements
   - Validates form before payment

3. **Payment Processing**
   - Stripe handles secure payment
   - Server creates payment intent
   - Customer enters card details

4. **Order Confirmation**
   - `order-confirmation.html`
   - Shows order details and next steps
   - Celebrates with confetti animation

5. **Email Notifications**
   - Automatic confirmation email sent
   - Includes order details and project brief link

6. **Project Brief**
   - `project-brief.html`
   - Detailed questionnaire for assets and requirements
   - File uploads for logos and images

## 🎨 Customization

### Stripe Appearance
Update the Stripe payment form appearance in `order-landing-page-express.html`:

```javascript
const appearance = {
  theme: 'stripe',
  variables: {
    colorPrimary: '#ef4444',
    colorBackground: '#ffffff',
    colorText: '#374151',
    borderRadius: '12px'
  }
};
```

### Email Templates
Customize the confirmation email in `payment-server.js` by editing the `emailContent` variable.

### Form Fields
Add or remove form fields in `order-landing-page-express.html` and `project-brief.html` as needed.

## 💾 Data Storage

The current setup saves orders to a JSON file (`orders.json`). For production, consider:

### Database Options

1. **MongoDB** (Recommended)
```bash
npm install mongodb
```

2. **PostgreSQL**
```bash
npm install pg
```

3. **Google Sheets** (Simple option)
```bash
npm install googleapis
```

### Example MongoDB Integration

```javascript
const { MongoClient } = require('mongodb');

const client = new MongoClient(process.env.DATABASE_URL);
const db = client.db('webglo');
const orders = db.collection('orders');

async function saveOrder(orderData) {
  await orders.insertOne(orderData);
}
```

## 🔒 Security Considerations

### Production Checklist

- [ ] Use live Stripe keys (not test keys)
- [ ] Set up proper webhook signature verification
- [ ] Use HTTPS for all endpoints
- [ ] Implement rate limiting
- [ ] Add input validation and sanitization
- [ ] Set up proper CORS policies
- [ ] Use environment variables for all secrets
- [ ] Implement proper error handling
- [ ] Set up monitoring and alerts

### Rate Limiting Example

```javascript
const rateLimit = require('express-rate-limit');

const orderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many order attempts, please try again later.'
});

app.use('/create-payment-intent', orderLimiter);
```

## 📊 Analytics & Tracking

### Google Analytics
Add tracking to order and confirmation pages:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
  
  // Track order completion
  gtag('event', 'purchase', {
    transaction_id: 'order_number',
    value: 297,
    currency: 'USD'
  });
</script>
```

### Facebook Pixel
```html
<!-- Facebook Pixel -->
<script>
  fbq('track', 'Purchase', {
    value: 297,
    currency: 'USD'
  });
</script>
```

## 🚨 Testing

### Test the Complete Flow

1. **Test Mode**
   - Use Stripe test keys
   - Use test card: `4242 4242 4242 4242`
   - Verify emails are sent
   - Check order storage

2. **Production Testing**
   - Use small real transaction
   - Test webhook delivery
   - Verify all notifications work

### Test Cards

```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
Insufficient funds: 4000 0000 0000 9995
3D Secure: 4000 0027 6000 3184
```

## 📞 Support & Maintenance

### Monitoring
- Set up uptime monitoring for your server
- Monitor webhook delivery in Stripe dashboard
- Track email delivery rates
- Monitor order completion rates

### Backup
- Regular database backups
- Keep order data secure
- Monitor for failed payments

## 🎯 Next Steps

Once the basic system is working:

1. **Add Advanced Features**
   - Order tracking dashboard
   - Customer portal
   - Automated follow-ups
   - Revision request system

2. **Scale the System**
   - Add more payment methods (PayPal, etc.)
   - Implement subscription options
   - Add team collaboration features
   - Create client approval workflows

3. **Optimize Conversions**
   - A/B test the order form
   - Add urgency elements
   - Implement cart abandonment emails
   - Add social proof elements

---

## 🤝 Need Help?

If you run into issues:

1. Check the console logs for errors
2. Verify all environment variables are set
3. Test webhook delivery in Stripe dashboard
4. Check email spam folders
5. Review server logs for payment processing

**Remember**: Start with test mode, verify everything works, then switch to live mode for production! 🚀
