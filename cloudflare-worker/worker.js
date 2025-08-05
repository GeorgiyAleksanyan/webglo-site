/**
 * WebGlo Stripe Payment Backend - Cloudflare Workers
 * FREE deployment on Cloudflare Workers (No npm dependencies)
 */

// CORS headers for your frontend
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // In production, replace with your domain
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Stripe-Signature',
  'Access-Control-Max-Age': '86400',
};

// Stripe API helper functions
async function createCheckoutSession(stripeSecretKey, sessionData) {
  const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${stripeSecretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      'payment_method_types[]': 'card',
      'line_items[0][price_data][currency]': 'usd',
      'line_items[0][price_data][product_data][name]': 'Landing Page Express',
      'line_items[0][price_data][product_data][description]': 'Professional landing page delivered in 48 hours',
      'line_items[0][price_data][unit_amount]': '29700', // $297.00 in cents
      'line_items[0][quantity]': '1',
      'mode': 'payment',
      'success_url': sessionData.success_url,
      'cancel_url': sessionData.cancel_url,
      'customer_email': sessionData.customer_email,
      'automatic_payment_methods[enabled]': 'false', // Disable Link and other auto methods
      'billing_address_collection': 'required',
      'customer_creation': 'always',
      'invoice_creation[enabled]': 'true',
      // Include ALL form fields in metadata
      'metadata[order_number]': sessionData.order_number,
      'metadata[business_name]': sessionData.business_name || '',
      'metadata[industry]': sessionData.industry || '',
      'metadata[main_goal]': sessionData.main_goal || '',
      'metadata[contact_email]': sessionData.contact_email || sessionData.customer_email,
      'metadata[current_website]': sessionData.current_website || '',
      'metadata[target_audience]': sessionData.target_audience || '',
      'metadata[main_offer]': sessionData.main_offer || '',
      'metadata[preferred_colors]': sessionData.preferred_colors || '',
      'metadata[style_preference]': sessionData.style_preference || '',
      'metadata[inspiration_links]': sessionData.inspiration_links || '',
      'metadata[contact_name]': sessionData.contact_name || '',
      'metadata[phone_number]': sessionData.phone_number || '',
      'metadata[best_time_contact]': sessionData.best_time_contact || '',
      'metadata[special_requirements]': sessionData.special_requirements || '',
      'metadata[completion_deadline]': sessionData.completion_deadline || '',
      'metadata[service_type]': 'landing_page_express'
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Stripe API error: ${error}`);
  }

  return await response.json();
}

async function constructWebhookEvent(body, signature, webhookSecret) {
  // Simple webhook signature verification for Cloudflare Workers
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(webhookSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );

  const parts = signature.split(',');
  const timestamp = parts.find(part => part.startsWith('t=')).substring(2);
  const expectedSignature = parts.find(part => part.startsWith('v1=')).substring(3);

  const payload = timestamp + '.' + body;
  const payloadBytes = encoder.encode(payload);
  
  const signatureBytes = Uint8Array.from(atob(expectedSignature), c => c.charCodeAt(0));
  
  const isValid = await crypto.subtle.verify(
    'HMAC',
    key,
    signatureBytes,
    payloadBytes
  );

  if (!isValid) {
    throw new Error('Invalid signature');
  }

  return JSON.parse(body);
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Health check endpoint (handle both GET and HEAD requests)
      if (url.pathname === '/' && (request.method === 'GET' || request.method === 'HEAD')) {
        const responseData = {
          status: 'healthy',
          service: 'WebGlo Payment Backend',
          platform: 'Cloudflare Workers',
          timestamp: new Date().toISOString(),
          environment: env.ENVIRONMENT || 'production'
        };
        
        // For HEAD requests, return empty body but same headers
        return new Response(request.method === 'HEAD' ? null : JSON.stringify(responseData), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Create Stripe Checkout Session (JSON API)
      if (url.pathname === '/create-checkout-session' && request.method === 'POST') {
        const body = await request.json();
        
        console.log('Creating checkout session for Landing Page Express:', body);

        // Generate unique order number
        const orderNumber = 'WG' + Date.now() + Math.random().toString(36).substr(2, 4).toUpperCase();

        const sessionData = {
          success_url: body.success_url || 'https://webglo.org/order-confirmation.html?session_id={CHECKOUT_SESSION_ID}',
          cancel_url: body.cancel_url || 'https://webglo.org/cancel.html',
          customer_email: body.customer_email,
          order_number: orderNumber,
          business_name: body.business_name || '',
          industry: body.industry || '',
          main_goal: body.main_goal || '',
          contact_email: body.contact_email || body.customer_email,
          // Additional form fields
          current_website: body.current_website || '',
          target_audience: body.target_audience || '',
          main_offer: body.main_offer || '',
          preferred_colors: body.preferred_colors || '',
          style_preference: body.style_preference || '',
          inspiration_links: body.inspiration_links || '',
          contact_name: body.contact_name || '',
          phone_number: body.phone_number || '',
          best_time_contact: body.best_time_contact || '',
          special_requirements: body.special_requirements || '',
          completion_deadline: body.completion_deadline || ''
        };

        const session = await createCheckoutSession(env.STRIPE_SECRET_KEY, sessionData);

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
          event = await constructWebhookEvent(body, sig, env.STRIPE_WEBHOOK_SECRET);
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
