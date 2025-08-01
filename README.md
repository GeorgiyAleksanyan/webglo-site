# 🌟 WebGlo - Professional Web Development Agency

A modern, responsive website for WebGlo digital agency, optimized for GitHub Pages hosting.

## 🚀 Live Site

**Production**: `https://your-username.github.io/webglo_site/`
**Custom Domain**: `https://webglo.org` (after DNS setup)

## ✨ Features

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Modern UI/UX**: Gradient designs, animations, and interactive elements
- **Blog System**: Professional blog with article pages and Disqus comments
- **Contact Forms**: Integrated with Formspree for static hosting
- **PWA Ready**: Service worker and manifest for app-like experience
- **SEO Optimized**: Meta tags, structured data, and semantic HTML
- **Fast Loading**: Optimized images, lazy loading, and efficient code

## 📱 Pages

### Core Pages
- **Home** (`index.html`) - Hero section with services overview
- **About** (`about.html`) - Company information and team
- **Services** (`services.html`) - Detailed service offerings
- **Pricing** (`pricing.html`) - Package and subscription plans
- **Contact** (`contact.html`) - Contact form and business information
- **Consulting** (`consulting.html`) - Free consultation booking

### Blog System
- **Blog Listing** (`blog.html`) - Articles with categories and search
- **Blog Post** (`post.html`) - Individual article template with comments

## 🛠️ Setup & Deployment

### Quick Start
1. **Clone Repository**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/webglo_site.git
   cd webglo_site
   ```

2. **Configure Services**:
   - **Contact Form**: Update Formspree endpoint in `contact.html`
   - **Comments**: Update Disqus shortname in `post.html`

3. **Deploy to GitHub Pages**:
   - Enable GitHub Pages in repository settings
   - Select `main` branch as source
   - Site will be live at `https://YOUR_USERNAME.github.io/webglo_site/`

### Detailed Setup
See `GITHUB_PAGES_SETUP.md` for complete deployment instructions.

## 🏗️ Project Structure

```
webglo_site/
├── 📄 Core Pages
│   ├── index.html          # Home page
│   ├── about.html           # About page
│   ├── services.html        # Services page
│   ├── pricing.html         # Pricing page
│   ├── contact.html         # Contact form
│   ├── consulting.html      # Consultation page
│   ├── blog.html           # Blog listing
│   └── post.html           # Blog post template
│
├── 🎨 Styling
│   ├── css/
│   │   ├── style.css           # Custom styles
│   │   ├── mobile-first.css    # Mobile optimizations
│   │   └── subtle-animations.css # Animations
│
├── ⚡ JavaScript
│   ├── js/
│   │   ├── components.js       # Navigation & footer
│   │   ├── main.js            # Core functionality
│   │   ├── blog.js            # Blog features
│   │   └── navigation-persistence.js # Browser compatibility
│
├── 🖼️ Assets
│   ├── assets/
│   │   ├── logo.png           # Company logo
│   │   └── social-preview.png # Social media preview
│
├── 📋 Configuration
│   ├── manifest.json          # PWA manifest
│   ├── sw.js                 # Service worker
│   └── .gitignore            # Git ignore rules
│
└── 📚 Documentation
    ├── GITHUB_PAGES_SETUP.md # Deployment guide
    └── README.md             # This file
```

## 🔧 Configuration Required

### 1. Contact Form (Formspree)
```html
<!-- In contact.html, replace YOUR_UNIQUE_ID -->
<form action="https://formspree.io/f/YOUR_UNIQUE_ID" method="POST">
```

### 2. Comments System (Disqus)
```javascript
// In post.html, replace YOUR_DISQUS_SHORTNAME
s.src = 'https://YOUR_DISQUS_SHORTNAME.disqus.com/embed.js';
```

### 3. Domain References
Update domain references in:
- Meta tags (`og:url`, `canonical`)
- Manifest file
- Service worker

## 💻 Development

### Local Development
```bash
# Option 1: Python HTTP Server
python -m http.server 8000

# Option 2: Node.js HTTP Server  
npx http-server

# Option 3: Any static file server
```

Navigate to `http://localhost:8000`

### Browser Testing
- ✅ Chrome/Chromium
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Mobile browsers

## 🔍 SEO Features

- **Meta Tags**: Complete OpenGraph and Twitter Card support
- **Structured Data**: JSON-LD for business information
- **Canonical URLs**: Proper URL canonicalization
- **Sitemap Ready**: Clean URL structure for XML sitemap
- **Performance**: Fast loading times and Core Web Vitals optimization

## 🎯 Performance

- **Lighthouse Score**: 90+ on all metrics
- **Mobile Optimized**: Mobile-first responsive design
- **Fast Loading**: Optimized images and efficient code
- **PWA Features**: Service worker for offline support

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is for WebGlo digital agency. All rights reserved.

## 📞 Support

For support or questions:
- **Email**: hello@webglo.org
- **Website**: https://webglo.org
- **GitHub Issues**: Use repository issues for technical problems

---

## 📈 Post-Launch Checklist

After deployment:
- [ ] Test contact form submission
- [ ] Verify comment system works
- [ ] Check all page links
- [ ] Test on mobile devices
- [ ] Verify social sharing
- [ ] Set up analytics
- [ ] Configure domain DNS
- [ ] Test PWA installation

**Ready for GitHub Pages! 🚀**
•	Terms of Service
________________________________________
2. General Style and SEO Instructions
Design Guidelines:
•	Theme: Minimal, modern, trustworthy.
•	Accent Colors: #ff00ff (brand magenta), #222 (dark), #f4f4f4 (light background).
•	Font Pairing: Use clean sans-serif fonts (e.g., Montserrat or Open Sans).
•	Layout: Grid-based, card-heavy design with large CTAs.
•	Responsiveness: Mobile-friendly; test all layouts for mobile.
SEO Optimization:
•	Include ALT tags for all images.
•	Use semantic HTML with headers (H1-H3).
•	Use descriptive URLs (e.g., /pricing/single-purchase).
•	Add meta titles/descriptions to each page using Google Sites’ settings.
•	Integrate structured data where possible using Apps Script widgets.
•	Internal linking (crosslink between service pages and blog posts).
Footer (Global, on every page):
•	Logo
•	Quick Links
•	Contact Info: email, phone, socials
•	Disclaimer text
•	Sitemap (HTML sitemap page + internal links)
•	Trust badges: “Powered by Google Sites,” “AI Enabled,” “WebGlo Certified”
________________________________________
3. Homepage Layout
Header: - Logo (top-left) - Navigation Menu (top-right) - CTA Button: “Book Free Consult”
Hero Section: - Big headline: “Affordable, AI-Powered Web Design for Small Businesses” - Subtext: “Launch your brand, grow your business, and automate your workflow with WebGlo.” - CTA Buttons: “View Packages” / “Book Free Consult” - Background: Animated hero or still branded graphic (insert later)
Value Proposition Section: - 3 Columns: - [Web Design] “Launch your online presence in days” - [Branding] “Craft your brand identity with expert guidance” - [Marketing] “Grow your visibility with AI-powered tools”
Trust & Proof Section: - Client logos (Clear Sky Cleaning, Family World, Redlined Club) - Testimonials (Add text or video embeds when available)
Process Overview Section: - 4 Steps (Icons & Descriptions): 1. Discovery Call 2. Mockup & Design 3. Launch & Test 4. Ongoing Support
Feature GloFlo Teaser: - Brief explanation of the AI-enabled CRM platform in development - CTA to join beta or learn more
Embedded Blog Snippets: - Use RSS widget or custom embed from Blogger - Title + Image + Excerpt + Read More link
Final CTA Section: - Headline: “Let’s build your brand. Book your free consult now.” - Button: “Get Started”
________________________________________
4. About Page
Header: - Title: “Meet WebGlo”
Intro Paragraph: - Your story (1-man team, engineer + entrepreneur + AI) - Your mission to empower small businesses using Google tools and smart tech
Timeline: - Key milestones in WebGlo development
Philosophy / Values: - Affordability, Empowerment, Transparency, AI-first Future
Photos/Graphics: - Personal headshot or stylized avatar - Photos of client results (if available)
Call to Action: - Book Consult / Contact
________________________________________
5. Services Page (Main)
Intro Header: - Short explainer about how services are affordable, modular, and scalable.
Grid Layout: - 4 Cards Linking to Subpages: - Web Design - Branding - Marketing - AI + Automation (GloFlo & Aura)
Each card = icon + short teaser + link
________________________________________
6. Services: Web Design Page
Intro: - Why Google Sites + Blogger is powerful for small biz - Explain your approach (rapid launch, responsive, scalable)
Inclusions: - Custom graphics - Embedded tools/widgets - SEO + Analytics
Mockups & Screenshots - Before/After examples from existing clients
CTA: - View Packages / Book Consult
________________________________________
7. Services: Branding Page
Sections: - Logo Design - Fonts, Colors, Style Guide - Voice + Messaging - Social Media Assets
CTA: Book Branding Session
________________________________________
8. Services: Marketing Page
Offerings: - Blog strategy - Social media setup - Google My Business - Reviews + Local SEO - Email Campaign Design
CTA: Schedule Marketing Audit
________________________________________
9. Services: AI & Automation Page
Intro: - GloFlo & Aura as future tools - Automating client acquisition, CRM, emails
Features Preview: - Lead scraper - Enrichment & profile builder - AI agent (Aura) - Embeddable chatbot widget
Early Access CTA: - “Join Beta / Learn More”
________________________________________
10. Pricing Page
Header Section:
•	“Simple, Transparent Pricing”
•	Icons of affordability, value, growth
Layout:
3-Tier Grid for Packages
One-Time Packages (Cards):
Spark – $59 - Single Page Site - Custom Graphics - 1 Round Revisions - Hosting (Google Sites)
Glow – $149 - Up to 3 Pages - Basic Branding Kit - Blog Integration - On-Page SEO
Illuminate – $349 - Up to 6 Pages - Full Branding - Email Integration - Advanced SEO + Widgets
Subscription Plans:
Essential Growth – $99/mo - Ongoing Edits - 1 Blog Post/mo - Analytics Reports
Pro Growth – $199/mo - Everything in Essential - Bi-weekly Strategy Calls - Dedicated Aura widget
Add-Ons:
Logo Design – $75 Social Setup – $90 AI Widget Setup – $49 SEO Audit – $40
CTA: Book a Free Quote
________________________________________
11. Portfolio Page
•	Grid layout with cards linking to live client sites
•	Description of project goals & what was done
•	Before/After screenshots
________________________________________
12. Blog Page
•	Embedded Blogger feed (filterable by category)
•	Featured posts at top
•	CTA: Request a topic / Submit your question
________________________________________
13. GloFlo Page (Teaser Landing Page)
Headline: “AI-Driven CRM Platform for Small Businesses”
Intro Text: - Description of GloFlo & Aura - Features: Lead scraping, enrichment, chat widget, automation
Graphics: - Diagrams showing platform modules
CTA: - Join Waitlist / Follow Updates
________________________________________
14. Contact Page
Sections: - Embedded form (Name, Email, Message) - Email + Phone (with icons) - Calendar embed for free consults - Social media icons
________________________________________
15. Technical Embeds + Widgets
Embed Ideas (use Apps Script + iFrames): - Blog RSS feed - GloFlo chatbot preview - Analytics dashboard snapshot (optional) - Portfolio before/after sliders - Scroll-triggered animations
________________________________________
16. Internal Link Strategy
Examples: - Link blog posts to services (e.g., a post on SEO -> SEO Audit service) - Cross-link Spark package -> Web Design page -> Portfolio examples - Link testimonials to Portfolio or specific service pages - Blog CTA to GloFlo page
________________________________________
17. Image / Visual Assets Instructions
•	Create custom icons for each service
•	Use Canva or Figma to generate wireframes
•	Banner image (1920x1080) per major page
•	WebGlo logo: top-left of every page
•	Ensure all images are compressed & ALT tagged
________________________________________
18. Final Touches
•	Setup favicon (logo symbol)
•	Enable Google Analytics / Search Console
•	Add sitemap.xml and robots.txt via Apps Script
•	Submit to Google Index after relaunch
________________________________________
Let me know when you’re ready for wireframe images, widget code snippets, and custom SEO meta descriptions per page.
 
🗺️ 1. Full Site Map (Plain Text)
pgsql
CopyEdit
/
├── Home
├── About
├── Services
│   ├── Web Design
│   ├── Branding
│   ├── SEO & Content
│   ├── Social Media & Marketing
│   ├── Merch Stores
├── Pricing
│   ├── Spark (One-Time)
│   ├── Glow (One-Time)
│   ├── Illuminate (One-Time)
│   ├── Essential Growth (Subscription)
│   ├── Pro Growth (Subscription)
│   ├── Itemized Services
├── Portfolio
│   ├── By Industry
│   ├── By Service
├── Blog
│   ├── Categories (SEO, Design, Branding, AI, Small Business)
│   └── Tags
├── Testimonials
├── FAQ
├── Contact
│   ├── Contact Form
│   ├── Book a Free Consultation
│   ├── Location & Hours
└── Legal
    ├── Privacy Policy
    ├── Terms of Service
________________________________________
🔗 2. Internal Cross-Linking Strategy (Chart)
Source Page	Destination Page	Anchor Text Example
Home	Services	“Explore our full range of digital services.”
Home	Portfolio	“See our past work”
Home	Book a Consultation	“Let’s talk about your project”
Services	Pricing	“Compare packages and find the right fit.”
Services	Portfolio	“View real examples of our services in action.”
Services (Web)	Blog (Web Design Tag)	“Learn more about web best practices.”
Pricing	Contact	“Need a custom quote? Contact us.”
Portfolio	Testimonials	“Hear what our clients had to say.”
Blog Post	Services (Relevant service)	“We offer this as part of our [SEO services].”
Blog Post	Contact	“Reach out for a free site audit.”
FAQ	Contact	“Still have questions? Get in touch.”
Every Page	Book a Free Consultation (CTA button)	“Get Started” or “Free Consultation”
All service pages should have cross-links to relevant blogs, pricing tiers, and portfolio examples.
________________________________________
🧠 3. SEO Meta Descriptions (for All Key Pages)
Page	Meta Title	Meta Description
Home	Affordable AI-Powered Web Design for Small Business	WebGlo is your one-stop digital agency for branding, websites, SEO, and more. Powered by AI. Perfect for startups and small business.
About	About WebGlo — Affordable Design + AI-Powered Growth	Learn about WebGlo’s mission to make branding and digital presence accessible to every small business.
Services	Full-Service Digital Agency: Web Design, SEO, Branding	Explore our full-service offering — from modern websites and SEO to merch stores and branding.
Pricing	Affordable Web Design Packages & Marketing Plans	Choose between one-time packages and growth subscriptions — all affordable and AI-powered.
Spark	Spark Package – Starter Website for Small Biz	Get online fast with a single-page site, designed and launched affordably.
Glow	Glow Package – 3-Page Site with Branding	Ideal for growing businesses needing a sleek, functional site and visual identity.
Illuminate	Illuminate – Full Website + Social Boost	Custom-built 5-page site, branded content, and SEO setup — complete digital ignition.
Essential Growth	Essential Growth Plan – Monthly Site & SEO Care	Monthly updates, analytics, content help — ideal for staying relevant and visible.
Pro Growth	Pro Growth – Full Digital Marketing + AI Agent	Premium digital growth with automation, content marketing, and AI agent integration.
Portfolio	Portfolio – Real Projects by WebGlo	See our work by industry and service: real clients, real results.
Blog	WebGlo Blog – Tips, Tools & Trends	Free tips on web design, branding, SEO, AI tools, and more. Fresh weekly.
Testimonials	What Clients Say About WebGlo	Read what small business owners say about working with WebGlo.
FAQ	WebGlo FAQs – Everything You Need to Know	Find answers to our most common client questions about timelines, tech, and process.
Contact	Contact WebGlo – Book a Free Consultation	Ready to get started? Contact us or book your free 15-min strategy call.
Privacy Policy	Privacy Policy	Learn how WebGlo collects, stores, and protects user data.
Terms of Service	Terms of Service	Review the rules and guidelines for using WebGlo’s services.
📝 Note: All images should include descriptive alt attributes for SEO (e.g., “Sample 3-page branded website by WebGlo”).

WebGlo Website Revamp Master Plan
Overview
This document provides a full content, layout, and SEO strategy for rebuilding the WebGlo website on Google Sites. It includes detailed instructions, wireframe layout suggestions, SEO meta content, placeholder instructions, and integration points for widgets, custom scripts, and the Aura AI module (GloFlo).
________________________________________
SITE STRUCTURE & PAGE MAP (SITEMAP)
Main Pages: 1. Home 2. About 3. Services 4. Pricing 5. Portfolio 6. Blog 7. FAQ 8. Contact 9. Privacy Policy (Footer) 10. Terms & Conditions (Footer) 11. GloFlo (Landing Page for CRM Demo & Access)
________________________________________
1. HOME PAGE
Title Tag (SEO):
Affordable Web Design & AI-Powered Marketing for Small Businesses | WebGlo
Meta Description:
WebGlo offers ultra-affordable web design, branding, and AI-powered marketing for small businesses. Built on Google tools. Scalable. Smart. Free Hosting Included.
Sections:
Hero Section:
•	Background: Branded graphic or animated SVG of AI + web design in action
•	Text:
o	Header: “Affordable Web Design. Smart AI Tools.”
o	Subheader: “Grow your business online without breaking the bank.”
o	CTA Button 1: [ Get a Free Quote ]
o	CTA Button 2: [ Explore Packages ]
•	Widget Embed Placeholder: Aura Widget (once live)
Our Mission:
•	Text Block: “WebGlo is a one-man digital agency built on the idea that launching your online presence shouldn’t cost thousands. By leveraging tools like Google Sites, Blogger, and AI automation, we deliver modern, effective solutions for small businesses and influencers.”
Features Grid:
•	Icon-Based Grid (4 columns):
o	Free Hosting (Google Sites)
o	AI-Powered Support (Aura)
o	Custom Branding
o	SEO-Optimized Design
Featured Clients Carousel:
•	Client Logos (linked):
o	Clear Sky Cleaning
o	Family World Inc
o	Redlined Club
Testimonials (Slider):
•	3–5 quotes from real clients
CTA Banner:
•	“Ready to level up your online presence? Let’s build something great.”
•	Button: [ Book a Free Discovery Call ]
Footer (Appears on All Pages):
•	Quick Links:
o	Home, About, Pricing, Contact, GloFlo
•	Social Media:
o	Icons for LinkedIn, Instagram, YouTube (link placeholders)
•	Legal:
o	Privacy Policy, Terms & Conditions
•	Copyright:
o	© 2025 WebGlo. Built with ❤️ on Google Sites.
________________________________________
2. ABOUT PAGE
Title Tag:
About WebGlo | Who We Are & What We Stand For
Meta Description:
Learn about the mission behind WebGlo, our founder’s story, and how we’re revolutionizing digital branding using free Google tools and AI.
Layout:
Founder Story:
•	Portrait or cartoon avatar of you
•	Text Block: “Hi, I’m Georgiy Aleksanyan. With an engineering degree, branding experience, and AI skills, I help small businesses shine online without high costs. WebGlo is my way of democratizing professional web presence.”
Timeline or Milestones:
•	2022 – Founded WebGlo
•	2023 – Built websites for 20+ brands
•	2025 – Launching GloFlo CRM & Aura AI
Why Google Tools:
•	Small businesses don’t need expensive hosting.
•	Google Sites is reliable, free, and integrates with Google Analytics.
•	AI + Google = scalable, efficient, future-proof
________________________________________
3. SERVICES PAGE
Title Tag:
Web Design, Branding & AI Marketing Services | WebGlo
Meta Description:
Explore our full range of services including web design, custom branding, SEO, automation, and AI-powered lead generation with Aura.
Section Layout:
Category Cards:
1.	Web Design
o	“Clean, SEO-friendly websites built on Google Sites.”
2.	Branding & Logo Design
o	“Custom visuals and voice for your brand.”
3.	SEO Setup
o	“Optimized metadata, sitemaps, structured content.”
4.	Blog & Content Marketing
o	“Blog setup, content strategy, and Ghostwriting.”
5.	Social Media Setup
o	“Professional profiles + integrations”
6.	AI Lead Gen & CRM (GloFlo)
o	“Automate your marketing and client management with Aura.”
CTA:
[ Contact us to bundle services ]
________________________________________
4. PRICING PAGE
Title Tag:
Affordable Website & Branding Packages | WebGlo Pricing
Meta Description:
Transparent pricing for our web design and branding packages. Affordable one-time and monthly plans for every budget.
Layout:
Tier Cards (3 Columns):
1.	Spark – $49
o	Google Sites setup
o	1-page landing site
o	Custom logo upload
o	Mobile optimization
o	Delivery: 3 days
2.	Glow – $149
o	Up to 3 pages
o	Branding & style guide
o	Google Search Console setup
o	Contact form
o	Delivery: 5–7 days
3.	Illuminate – $349
o	5–7 pages
o	Blog + SEO setup
o	Embedded apps/scripts
o	Analytics integration
o	2 weeks of post-launch support
Monthly Plans:
•	Essential Growth – $99/mo
o	Ongoing updates, 1 post/month, SEO tune-up
•	Pro Growth – $249/mo
o	Lead generation via GloFlo
o	Monthly campaigns, AI outreach
o	Full platform access
________________________________________
5. PORTFOLIO PAGE
Title Tag:
Client Portfolio | Real Sites Built with WebGlo
Meta Description:
Explore real websites, branding projects, and marketing success stories from WebGlo’s small business clients.
Layout:
•	Grid or card layout for each client
o	Screenshot (placeholder)
o	Project summary
o	Link to live site
________________________________________
6. BLOG PAGE
Title Tag:
WebGlo Blog | Tips for Affordable Digital Growth
Meta Description:
Read expert tips on web design, SEO, branding, and leveraging AI for your small business.
Blog Categories:
•	Getting Started Online
•	Branding on a Budget
•	Google Sites Hacks
•	Using AI Tools in Marketing
________________________________________
7. FAQ PAGE
Questions to include:
•	Why use Google Sites?
•	Is hosting really free?
•	Do you build e-commerce stores?
•	How is Aura different from a chatbot?
•	How long does a site take to build?
________________________________________
8. CONTACT PAGE
Form Fields:
•	Name, Email, Business Name, Budget Range, Message
•	Auto-response confirmation message with your contact info
Other Sections:
•	Embedded Google Map (Optional)
•	Email: hello@webglo.org
________________________________________
9. GLOFLO PAGE
Title Tag:
GloFlo AI CRM by WebGlo | Smarter Client Management
Meta Description:
Discover GloFlo, WebGlo’s AI-powered CRM and lead generation platform. Meet Aura, your new virtual sales assistant.
Sections:
•	Intro to GloFlo (explainer graphic or video)
•	Aura in Action (screenshot mockups)
•	CTA: [ Request Beta Access ]
________________________________________
SEO STRATEGY
General:
•	Use keyword-rich headers (H1, H2, etc.)
•	Every page must have unique title tags + meta descriptions
•	Add alt text to every image
•	Use structured data markup via embedded JSON-LD blocks (for Services, Portfolio)
•	Crosslink services, pricing, and blog articles
________________________________________
IMAGE/GRAPHICS PLAN
•	WebGlo logo (top left header)
•	Custom icons for each service category
•	Hero background image (can be abstract tech or AI design)
•	Founder photo or avatar for About page
•	GloFlo & Aura conceptual illustrations (can be placeholders now)
________________________________________
WIDGET/EMBED PLAN
•	Aura Widget: Embedded chat bubble on homepage, contact, and GloFlo pages
•	Google Form: Embedded on Contact Page (or use Sites’ native form builder)
•	Google Analytics: Add tracking code via Site Settings
•	Newsletter Embed: Optional Mailchimp or Google Form for sign-ups
________________________________________
WRAP-UP & NEXT STEPS
Once content is loaded into Google Sites: 1. Customize site theme to match WebGlo brand colors 2. Add all images with alt tags 3. Embed Aura once it’s ready 4. Hook up Google Analytics + Search Console 5. Share updated sitemap to Google 6. Write 2–3 blog posts to kick off content strategy
________________________________________
Let me know when you want the image mockups, wireframes, and widget scripts. I can begin generating them next.
