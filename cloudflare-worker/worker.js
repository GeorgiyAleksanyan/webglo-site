/**
 * WebGlo Stripe Payment Backend - Cloudflare Workers
 * FREE deployment on Cloudflare Workers
 */

import Stripe from 'stripe';

// CORS headers for your frontend
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // In production, replace with your domain
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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
          timestamp: new Date().toISOString()
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Create Stripe Checkout Session (JSON API)
      if (url.pathname === '/create-checkout-session' && request.method === 'POST') {
        const body = await request.json();
        
        console.log('Creating checkout session:', body);

        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: [{
            price_data: {
              currency: 'usd',
              product_data: {
                name: `WebGlo ${body.business_name || 'Business'} Project`,
                description: `Industry: ${body.industry || 'General'} | Goal: ${body.main_goal || 'Business growth'}`,
              },
              unit_amount: body.amount || 100, // Amount in cents
            },
            quantity: 1,
          }],
          mode: 'payment',
          customer_email: body.customer_email,
          metadata: {
            business_name: body.business_name || '',
            industry: body.industry || '',
            main_goal: body.main_goal || '',
            order_number: body.order_number || `WG-${Date.now()}`,
          },
          success_url: 'https://webglo.org/success.html?session_id={CHECKOUT_SESSION_ID}',
          cancel_url: 'https://webglo.org/cancel.html',
        });

        console.log('Checkout session created:', session.id);

        return new Response(JSON.stringify({ 
          url: session.url,
          session_id: session.id 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Create Stripe Checkout Session (Form submission)
      if (url.pathname === '/create-checkout-form' && request.method === 'POST') {
        const formData = await request.formData();
        
        const sessionData = {
          customer_email: formData.get('customer_email'),
          business_name: formData.get('business_name'),
          industry: formData.get('industry'),
          main_goal: formData.get('main_goal'),
          amount: parseInt(formData.get('amount')) || 100,
          order_number: formData.get('order_number') || `WG-${Date.now()}`,
        };

        console.log('Creating checkout session from form:', sessionData);

        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: [{
            price_data: {
              currency: 'usd',
              product_data: {
                name: `WebGlo ${sessionData.business_name || 'Business'} Project`,
                description: `Industry: ${sessionData.industry || 'General'} | Goal: ${sessionData.main_goal || 'Business growth'}`,
              },
              unit_amount: sessionData.amount,
            },
            quantity: 1,
          }],
          mode: 'payment',
          customer_email: sessionData.customer_email,
          metadata: sessionData,
          success_url: 'https://webglo.org/success.html?session_id={CHECKOUT_SESSION_ID}',
          cancel_url: 'https://webglo.org/cancel.html',
        });

        console.log('Checkout session created:', session.id);

        // Redirect to Stripe Checkout
        return Response.redirect(session.url, 303);
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

          // Here you could:
          // 1. Send confirmation email
          // 2. Create order in your database
          // 3. Trigger fulfillment process
          
          console.log('Order processing completed for:', session.metadata?.order_number);
        }

        return new Response('Webhook handled', { 
          status: 200,
          headers: corsHeaders 
        });
      }

      // 404 for unmatched routes
      return new Response('Not Found', { 
        status: 404,
        headers: corsHeaders 
      });

    } catch (error) {
      console.error('Error:', error);
      return new Response(JSON.stringify({ 
        error: error.message,
        service: 'WebGlo Payment Backend'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  },
};
