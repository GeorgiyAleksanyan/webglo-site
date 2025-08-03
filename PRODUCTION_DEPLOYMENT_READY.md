# 🚀 WebGlo Production Deployment Guide

## ✅ Project Status: READY FOR DEPLOYMENT

### 🧹 Cleanup Complete
- ✅ Removed all test/dev files
- ✅ Secured API keys (removed hardcoded keys)
- ✅ Updated .gitignore for security
- ✅ Created environment configuration system
- ✅ Backend optimized for production

---

## 🎯 Recommended Platform: Railway.app

**Why Railway?**
- Pay-per-use model ($5/month minimum, includes $5 usage)
- Perfect for Stripe webhooks (reliable, fast)
- Simple GitHub deployment
- Auto HTTPS & custom domains
- Excellent Node.js support

**Alternative:** Render.com (has free tier, $7/month for reliability)

---

## 📋 Deployment Steps

### 1. **Prepare Repository**
```bash
# Ensure all changes are committed
git add .
git commit -m "Production deployment ready"
git push origin main
```

### 2. **Deploy Backend to Railway**

1. **Sign up**: [railway.app](https://railway.app)
2. **Connect GitHub**: Link your repository
3. **Deploy**: Select `webglo_site/backend` folder
4. **Environment Variables**: Add these in Railway dashboard:
   ```
   STRIPE_SECRET_KEY=sk_live_YOUR_ACTUAL_LIVE_KEY
   STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
   NODE_ENV=production
   ```

### 3. **Configure Stripe Webhook**

1. **Stripe Dashboard** → Webhooks
2. **Add Endpoint**: `https://your-app.railway.app/webhook`
3. **Events**: Select `checkout.session.completed`
4. **Copy webhook secret** → Add to Railway environment

### 4. **Update Frontend Configuration**

Edit `js/config.js` with your production values:
```javascript
window.ENV = {
  STRIPE_PUBLISHABLE_KEY: 'pk_live_YOUR_ACTUAL_LIVE_KEY',
  BACKEND_URL: 'https://your-app.railway.app',
  ENVIRONMENT: 'production'
};
```

### 5. **Deploy GitHub Pages**

Your main site stays on GitHub Pages (free):
- Frontend: `https://webglo.org` (GitHub Pages)
- Backend: `https://your-app.railway.app` (Railway)

---

## 🔐 Security Checklist

- ✅ No hardcoded API keys in repository
- ✅ Environment variables configured
- ✅ HTTPS enforced
- ✅ CORS properly configured
- ✅ Webhook signature verification enabled

---

## 💰 Cost Breakdown

| Service | Cost | Purpose |
|---------|------|---------|
| GitHub Pages | FREE | Frontend hosting |
| Railway.app | $5-10/month | Backend + webhooks |
| Stripe | 2.9% + 30¢ per transaction | Payment processing |
| **Total Fixed** | **$5-10/month** | Infrastructure |

---

## 🧪 Testing Plan

### Pre-deployment Test:
1. Test payment flow with test keys
2. Verify webhook processing
3. Check success/cancel page redirects

### Post-deployment Test:
1. **Small test payment** ($1.00 with live keys)
2. Verify webhook received
3. Test from production domain

---

## 🚨 Go-Live Steps

1. **Switch to Live Keys**:
   - Update Railway environment with `sk_live_` keys
   - Update frontend with `pk_live_` keys
   - Configure live webhook endpoint

2. **Update DNS** (if needed):
   - Ensure CNAME points to GitHub Pages
   - SSL should work automatically

3. **Monitor**:
   - Check Railway logs
   - Monitor Stripe dashboard
   - Test complete payment flow

---

## 📞 Support

- **Railway**: Discord community + docs
- **Stripe**: Excellent documentation + support
- **GitHub Pages**: GitHub docs + community

---

## 🎯 Success Criteria

✅ Customer can complete payment
✅ Webhook processes order
✅ Success page displays properly
✅ No exposed API keys
✅ HTTPS everywhere
✅ Total cost under $10/month

**Ready to deploy!** 🚀
