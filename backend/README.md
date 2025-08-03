# WebGlo Backend

Express.js backend for handling Stripe payments for WebGlo Landing Page Express service.

## Features

- ✅ Stripe Checkout Session Creation
- ✅ Webhook handling for payment confirmation
- ✅ CORS configured for GitHub Pages
- ✅ Form submission compatibility
- ✅ JSON API endpoints
- ✅ Error handling and logging

## Deployment Options

### Option 1: Render (Recommended)
1. Push this backend folder to GitHub
2. Connect your GitHub repo to Render
3. Deploy as a Web Service
4. Add environment variables in Render dashboard

### Option 2: Railway
1. Push to GitHub
2. Connect to Railway
3. Deploy with automatic builds

### Option 3: Fly.io
1. Install Fly CLI
2. Run `fly launch` in this directory
3. Add secrets with `fly secrets set`

## Environment Variables

Copy `.env.example` to `.env` and fill in:

```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
PORT=3000
```

## API Endpoints

### POST /create-checkout-session
Creates a Stripe checkout session and returns session ID + URL.

**Body:**
```json
{
  "amount": 29700,
  "currency": "usd",
  "customer_email": "customer@example.com",
  "order_number": "ORD-123",
  "business_name": "Test Business",
  "industry": "Technology",
  "main_goal": "Increase sales",
  "contact_email": "contact@example.com"
}
```

**Response:**
```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/..."
}
```

### POST /create-checkout-form
Same as above but returns HTML redirect page (for form compatibility).

### POST /webhook
Stripe webhook endpoint for payment confirmations.

## Local Development

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your Stripe keys
npm start
```

## Integration with GitHub Pages

Update your forms to post to your deployed backend URL:

```javascript
const response = await fetch('https://your-backend-url.com/create-checkout-session', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    customer_email: 'test@example.com',
    amount: 29700
  })
});

const { url } = await response.json();
window.location.href = url;
```
