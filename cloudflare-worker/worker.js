/**
 * WebGlo Stripe Payment Backend - Cloudflare Workers
 * FREE deployment on Cloudflare Workers
 */

import Stripe from 'stripe';

// CORS headers for your frontend
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // In production, replace with your domain
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Stripe-Signature',
  'Access-Control-Max-Age': '86400',
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Initialize Stripe with your secret key from environment variables
    const stripe = new Stripe(env.STRIPE_SECRET_KEY);

    try {
      // Health check endpoint
      if (url.pathname === '/' && request.method === 'GET') {
        return new Response(JSON.stringify({
          status: 'healthy',
          service: 'WebGlo Payment Backend',
          platform: 'Cloudflare Workers',
          timestamp: new Date().toISOString(),
          environment: env.ENVIRONMENT || 'production'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Create Stripe Checkout Session (JSON API)
      if (url.pathname === '/create-checkout-session' && request.method === 'POST') {
        const body = await request.json();
        
        console.log('Creating checkout session for Landing Page Express:', body);

        // Generate unique order number
        const orderNumber = 'WG' + Date.now() + Math.random().toString(36).substr(2, 4).toUpperCase();

        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: [{
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'Landing Page Express',
                description: 'Professional landing page delivered in 48 hours',
              },
              unit_amount: 29700, // $297.00 in cents
            },
            quantity: 1,
          }],
          mode: 'payment',
          success_url: body.success_url || 'https://webglo.org/order-confirmation.html?session_id={CHECKOUT_SESSION_ID}',
          cancel_url: body.cancel_url || 'https://webglo.org/cancel.html',
          customer_email: body.customer_email,
          metadata: {
            order_number: orderNumber,
            business_name: body.business_name || '',
            industry: body.industry || '',
            main_goal: body.main_goal || '',
            contact_email: body.contact_email || body.customer_email,
            service_type: 'landing_page_express'
          },
        });

        return new Response(JSON.stringify({
          sessionId: session.id,
          url: session.url,
          orderNumber: orderNumber
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Stripe Webhook handler
      if (url.pathname === '/webhook' && request.method === 'POST') {
        const body = await request.text();
        const sig = request.headers.get('stripe-signature');

        let event;
        try {
          event = stripe.webhooks.constructEvent(body, sig, env.STRIPE_WEBHOOK_SECRET);
        } catch (err) {
          console.error('Webhook signature verification failed:', err.message);
          return new Response(`Webhook Error: ${err.message}`, { status: 400 });
        }

        console.log('Webhook received:', event.type);

        // Handle the checkout session completed event
        if (event.type === 'checkout.session.completed') {
          const session = event.data.object;
          
          console.log('Payment successful!', {
            session_id: session.id,
            customer_email: session.customer_email,
            amount: session.amount_total,
            metadata: session.metadata
          });

          // Send order data to Google Apps Script for processing
          try {
            const gasUrl = env.GOOGLE_APPS_SCRIPT_URL;
            if (gasUrl) {
              const gasResponse = await fetch(gasUrl, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  action: 'process_order',
                  session_data: {
                    session_id: session.id,
                    customer_email: session.customer_email,
                    customer_name: session.customer_details?.name || '',
                    amount_total: session.amount_total,
                    metadata: session.metadata
                  }
                })
              });

              const gasResult = await gasResponse.text();
              console.log('Google Apps Script response:', gasResult);
            }
          } catch (gasError) {
            console.error('Error sending to Google Apps Script:', gasError);
            // Don't fail the webhook if GAS fails - log and continue
          }
        }

        return new Response(JSON.stringify({ received: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // 404 for unknown routes
      return new Response('Not found', { 
        status: 404,
        headers: corsHeaders
      });

    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  },
};
