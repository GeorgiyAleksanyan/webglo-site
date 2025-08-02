# WebGlo Landing Page Express - GitHub Pages Setup Guide

## 🎯 **Zero Server Cost Solution**

This setup uses:
- ✅ **GitHub Pages** (free hosting)
- ✅ **Stripe Checkout** (hosted payment, 2.9% + 30¢ per transaction)
- ✅ **Google Apps Script** (free backend processing)
- ✅ **Google Drive** (free file storage, 15GB)
- ✅ **Google Sheets** (free database)
- ✅ **Gmail** (free email notifications)

**Total Cost: $0 monthly + transaction fees only**

---

## 🚀 **Quick Setup (30 minutes)**

### Step 1: Stripe Setup (5 minutes)

1. **Create Stripe Account**
   - Go to [stripe.com](https://stripe.com)
   - Complete business verification

2. **Get Publishable Key**
   - Dashboard → Developers → API Keys
   - Copy "Publishable key" (starts with `pk_`)
   - Update in `order-landing-page-express.html`:
   ```javascript
   const stripe = Stripe('pk_live_YOUR_KEY_HERE');
   ```

3. **Enable Checkout**
   - No additional setup needed - Stripe Checkout is ready to use

### Step 2: Google Apps Script Backend (10 minutes)

1. **Create New Apps Script Project**
   - Go to [script.google.com](https://script.google.com)
   - New Project → Paste `webglo-backend.gs` code

2. **Create Google Sheet for Orders**
   - Create new Google Sheet
   - Copy the Sheet ID from URL
   - Update `CONFIG.ORDERS_SHEET_ID` in script

3. **Create Google Drive Folder**
   - Create "WebGlo Customer Projects" folder
   - Copy folder ID from URL
   - Update `CONFIG.DRIVE_FOLDER_ID` in script

4. **Deploy as Web App**
   - Deploy → New Deployment
   - Type: Web app
   - Execute as: Me
   - Access: Anyone
   - Copy the web app URL

### Step 3: Connect Stripe to Google Apps Script (10 minutes)

1. **Set Up Webhook**
   - Stripe Dashboard → Developers → Webhooks
   - Add endpoint: `YOUR_APPS_SCRIPT_URL?path=webhook`
   - Events: Select `checkout.session.completed`
   - Copy webhook secret

2. **Update Script Configuration**
   ```javascript
   const CONFIG = {
     STRIPE_WEBHOOK_SECRET: 'whsec_your_secret_here',
     ORDERS_SHEET_ID: 'your_sheet_id',
     DRIVE_FOLDER_ID: 'your_folder_id',
     EMAIL_FROM: 'hello@webglo.org',
     WEBSITE_URL: 'https://yourusername.github.io/webglo-site'
   };
   ```

### Step 4: GitHub Pages Deployment (5 minutes)

1. **Update Repository Settings**
   - GitHub repo → Settings → Pages
   - Source: Deploy from branch
   - Branch: main / (root)

2. **Update URLs in Code**
   - Replace all `webglo.org` with your GitHub Pages URL
   - Update Stripe success/cancel URLs

3. **Push Changes**
   ```bash
   git add .
   git commit -m "Setup payment system for GitHub Pages"
   git push origin main
   ```

---

## 📋 **Order Workflow**

### Customer Journey:
1. **Order Form** → Customer fills out business details
2. **Stripe Checkout** → Secure payment processing
3. **Webhook** → Google Apps Script receives payment confirmation
4. **Auto-Processing**:
   - ✅ Create dedicated Google Drive folder
   - ✅ Save order to Google Sheets
   - ✅ Send confirmation email with project brief link
   - ✅ Send internal team notification

### File Storage System:
```
📁 WebGlo Customer Projects/
  📁 LPE-2025-0001 - Business Name - 2025-08-02/
    📁 01-Assets-Provided/
    📁 02-Design-Drafts/
    📁 03-Final-Deliverables/
    📁 04-Revisions/
```

---

## 💡 **Cost Breakdown**

### One-Time Costs:
- Domain (optional): ~$12/year
- Total: $0-12/year

### Per-Transaction Costs:
- Stripe fees: 2.9% + $0.30
- For $297 order: ~$8.91 + $0.30 = $9.21
- **Your profit: $287.79 per order**

### Scaling:
- 10 orders/month = $2,877.90 profit
- 50 orders/month = $14,389.50 profit
- 100 orders/month = $28,779 profit

**No additional infrastructure costs as you scale!**

---

## 🎯 **Ready to Launch!**

Once setup is complete:

1. **Switch Stripe to Live Mode**
   - Replace test keys with live keys
   - Update webhook to live endpoint

2. **Test with Real Payment**
   - Use small amount first
   - Verify complete workflow

3. **Launch Marketing**
   - Share order page URL
   - Monitor first orders closely

**You now have a fully automated, scalable payment system with zero monthly costs!** 🚀
