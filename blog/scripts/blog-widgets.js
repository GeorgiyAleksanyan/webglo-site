// WebGlo Blog Widgets JavaScript

// Framework Assessment Calculator
function calculateRecommendation() {
    const experience = document.querySelector('input[name="experience"]:checked');
    const timeline = document.querySelector('input[name="timeline"]:checked');
    const complexity = document.querySelector('input[name="complexity"]:checked');
    
    if (!experience || !timeline || !complexity) {
        alert('Please answer all questions to get your recommendation.');
        return;
    }
    
    let reactScore = 0;
    let vueScore = 0;
    
    // Experience scoring
    if (experience.value === 'advanced') {
        reactScore += 3;
        vueScore += 1;
    } else {
        reactScore -= 2;
        vueScore += 3;
    }
    
    // Timeline scoring
    if (timeline.value === 'short') {
        reactScore -= 2;
        vueScore += 3;
    } else {
        reactScore += 2;
        vueScore += 1;
    }
    
    // Complexity scoring
    if (complexity.value === 'complex') {
        reactScore += 3;
        vueScore += 1;
    } else {
        reactScore += 1;
        vueScore += 3;
    }
    
    // Show result
    const resultDiv = document.getElementById('recommendation-result');
    resultDiv.classList.remove('recommendation-hidden');
    
    let recommendation;
    let recommendationClass;
    
    if (reactScore > vueScore + 2) {
        recommendation = "🎯 <strong>React is recommended</strong> for your project! Your team's experience and project requirements align well with React's strengths.";
        recommendationClass = "react-recommendation";
    } else if (vueScore > reactScore + 2) {
        recommendation = "🎯 <strong>Vue.js is recommended</strong> for your project! Vue.js will help you deliver faster with your current constraints.";
        recommendationClass = "vue-recommendation";
    } else {
        recommendation = "🤔 <strong>Both frameworks are viable</strong> for your project. Consider additional factors like team preferences and long-term goals.";
        recommendationClass = "neutral-recommendation";
    }
    
    resultDiv.innerHTML = `
        <div class="${recommendationClass}">
            <h4>Your Personalized Recommendation</h4>
            <p>${recommendation}</p>
            <div class="score-breakdown">
                <span>React Score: ${reactScore} | Vue.js Score: ${vueScore}</span>
            </div>
            <div class="next-steps">
                <p><strong>Ready for expert validation?</strong></p>
                <a href="contact.html" class="webglo-cta-button">Get Free Detailed Assessment</a>
            </div>
        </div>
    `;
    
    // Scroll to result
    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Interactive Scoring Calculator
let scores = {
    react: 0,
    vue: 0
};

function initializeScoringWidget() {
    const scoreButtons = document.querySelectorAll('.score-btn');
    
    scoreButtons.forEach(button => {
        button.addEventListener('click', function() {
            const factor = this.dataset.factor;
            const framework = this.dataset.framework;
            const score = parseInt(this.dataset.score);
            
            // Remove previous selection for this factor
            const factorButtons = document.querySelectorAll(`[data-factor="${factor}"]`);
            factorButtons.forEach(btn => btn.classList.remove('selected'));
            
            // Add selection to current button group
            const siblingButtons = this.parentElement.querySelectorAll('.score-btn');
            siblingButtons.forEach(btn => btn.classList.add('selected'));
            
            // Update scores
            if (framework === 'react') {
                scores.react += score;
            } else {
                scores.vue += score;
            }
            
            // Update display
            updateScoreDisplay();
        });
    });
}

function updateScoreDisplay() {
    const reactTotal = document.getElementById('react-total');
    const vueTotal = document.getElementById('vue-total');
    const recommendation = document.getElementById('score-recommendation');
    
    if (reactTotal) reactTotal.textContent = scores.react;
    if (vueTotal) vueTotal.textContent = scores.vue;
    
    if (recommendation) {
        let message = '';
        let className = '';
        
        if (scores.react > scores.vue + 3) {
            message = '🎯 React is strongly recommended for your project based on your scoring!';
            className = 'react-winner';
        } else if (scores.vue > scores.react + 3) {
            message = '🎯 Vue.js is strongly recommended for your project based on your scoring!';
            className = 'vue-winner';
        } else if (Math.abs(scores.react - scores.vue) <= 3) {
            message = '🤝 Both frameworks are viable options. Consider team preferences and specific requirements.';
            className = 'tie-result';
        } else {
            message = 'Continue scoring to get your recommendation...';
            className = 'incomplete';
        }
        
        recommendation.textContent = message;
        recommendation.className = `recommendation ${className}`;
    }
}

// Testimonial Carousel
function initializeTestimonialCarousel() {
    const testimonials = document.querySelectorAll('.testimonial-card');
    let currentIndex = 0;
    
    if (testimonials.length > 1) {
        setInterval(() => {
            testimonials[currentIndex].classList.remove('active');
            currentIndex = (currentIndex + 1) % testimonials.length;
            testimonials[currentIndex].classList.add('active');
        }, 5000); // Change every 5 seconds
    }
}

// Animate stats on scroll
function animateStatsOnScroll() {
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const statNumbers = entry.target.querySelectorAll('.stat-number, .proof-number');
                
                statNumbers.forEach(stat => {
                    const finalValue = stat.textContent;
                    const numericValue = parseInt(finalValue.replace(/[^\d]/g, ''));
                    
                    if (!isNaN(numericValue)) {
                        animateCounter(stat, 0, numericValue, finalValue, 2000);
                    }
                });
                
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe stat containers
    const statContainers = document.querySelectorAll('.impact-stats, .social-proof-bar');
    statContainers.forEach(container => observer.observe(container));
}

function animateCounter(element, start, end, originalText, duration) {
    const startTime = performance.now();
    const suffix = originalText.replace(/[\d,]/g, '');
    
    function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const currentValue = Math.floor(start + (end - start) * easeOutCubic(progress));
        element.textContent = currentValue.toLocaleString() + suffix;
        
        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = originalText;
        }
    }
    
    requestAnimationFrame(updateCounter);
}

function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

// Add hover effects to cards
function addCardHoverEffects() {
    const cards = document.querySelectorAll('.framework-card, .cta-card, .decision-matrix-card');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.15)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '';
        });
    });
}

// Performance bar animation
function animatePerformanceBars() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const bars = entry.target.querySelectorAll('.bar');
                bars.forEach((bar, index) => {
                    setTimeout(() => {
                        bar.style.transform = 'scaleX(1)';
                        bar.style.transformOrigin = 'left';
                        bar.style.transition = 'transform 0.8s ease-out';
                    }, index * 200);
                });
                observer.unobserve(entry.target);
            }
        });
    });
    
    const performanceWidget = document.querySelector('.webglo-performance-widget');
    if (performanceWidget) {
        // Initially hide bars
        const bars = performanceWidget.querySelectorAll('.bar');
        bars.forEach(bar => {
            bar.style.transform = 'scaleX(0)';
        });
        
        observer.observe(performanceWidget);
    }
}

// Smooth scroll for anchor links
function initializeSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Initialize all widgets when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Blog widgets initializing...');
    
    // Initialize sticky navigation first
    initializeStickyNavigation();
    
    // Initialize tracking
    trackReadingEngagement();
    
    // Initialize other widgets
    initializeScoringWidget();
    initializeTestimonialCarousel();
    animateStatsOnScroll();
    addCardHoverEffects();
    animatePerformanceBars();
    initializeSmoothScroll();
    initializeEnhancedScroll();
    enhanceReadingProgress();
    
    // Add some loading animations
    const widgets = document.querySelectorAll('.webglo-hero-banner, .webglo-toc-widget, .webglo-interactive-widget, .webglo-performance-widget, .webglo-testimonial-widget, .webglo-scoring-widget, .webglo-final-cta-section, .webglo-article-feedback-widget, .webglo-newsletter-widget');
    
    widgets.forEach((widget, index) => {
        widget.style.opacity = '0';
        widget.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            widget.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
            widget.style.opacity = '1';
            widget.style.transform = 'translateY(0)';
        }, index * 150);
    });
    
    // Initialize form validation
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
        const emailInput = document.getElementById('newsletter-email');
        if (emailInput) {
            emailInput.addEventListener('blur', validateEmail);
        }
    }
});

// Also try to initialize sticky nav as early as possible
window.addEventListener('load', function() {
    // Ensure sticky nav is working after all content loads
    setTimeout(initializeStickyNavigation, 100);
});

// Email validation
function validateEmail() {
    const emailInput = document.getElementById('newsletter-email');
    const email = emailInput.value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (email && !emailRegex.test(email)) {
        emailInput.style.borderColor = '#dc3545';
        showNewsletterResult('Please enter a valid email address.', 'error');
    } else {
        emailInput.style.borderColor = '';
        const resultDiv = document.getElementById('newsletter-result');
        if (resultDiv.classList.contains('error')) {
            resultDiv.classList.add('hidden');
        }
    }
}

// Export functions for global access
window.webgloWidgets = {
    calculateRecommendation,
    updateScoreDisplay,
    animateCounter
};

// Article Feedback Functions
function submitFeedback(type) {
    const helpfulBtn = document.querySelector('.feedback-btn.helpful');
    const notHelpfulBtn = document.querySelector('.feedback-btn.not-helpful');
    const resultDiv = document.getElementById('feedback-result');
    
    // Remove previous selections
    helpfulBtn.classList.remove('selected');
    notHelpfulBtn.classList.remove('selected');
    
    // Add selection to clicked button
    if (type === 'helpful') {
        helpfulBtn.classList.add('selected');
    } else {
        notHelpfulBtn.classList.add('selected');
    }
    
    // Show thank you message
    resultDiv.classList.remove('hidden');
    resultDiv.innerHTML = '<p>Thank you for your feedback! 🙏</p>';
    
    // Track feedback locally with session data
    trackFeedbackLocally(type);
    
    // Track feedback (Google Analytics)
    if (typeof gtag !== 'undefined') {
        gtag('event', 'article_feedback', {
            'feedback_type': type,
            'article_slug': getArticleSlug(),
            'article_id': getArticleId()
        });
    }
    
    // Submit to Google Apps Script
    submitFeedbackToServer(type);
}

function trackFeedbackLocally(feedbackType) {
    const sessionKey = 'webglo_blog_feedback';
    const articleId = getArticleId();
    const articleSlug = getArticleSlug();
    
    // Get existing session data
    let sessionData = {};
    try {
        const stored = sessionStorage.getItem(sessionKey);
        sessionData = stored ? JSON.parse(stored) : {};
    } catch (e) {
        console.log('Session storage not available');
    }
    
    // Initialize article data if not exists
    if (!sessionData[articleId]) {
        sessionData[articleId] = {
            slug: articleSlug,
            views: 1,
            feedback: null,
            readTime: 0,
            interactions: [],
            firstView: new Date().toISOString()
        };
    }
    
    // Update feedback
    sessionData[articleId].feedback = feedbackType;
    sessionData[articleId].interactions.push({
        type: 'feedback',
        value: feedbackType,
        timestamp: new Date().toISOString()
    });
    
    // Store updated data
    try {
        sessionStorage.setItem(sessionKey, JSON.stringify(sessionData));
    } catch (e) {
        console.log('Session storage update failed');
    }
    
    console.log('Feedback tracked locally:', sessionData[articleId]);
}

function submitFeedbackToServer(feedbackType) {
    const data = {
        type: 'article_feedback',
        feedback: feedbackType,
        article_id: getArticleId(),
        article_slug: getArticleSlug(),
        timestamp: new Date().toISOString(),
        page_url: window.location.href,
        user_session: getUserSessionId(),
        session_data: getSessionFeedbackData()
    };
    
    // Get the production Google Apps Script URL for feedback
    const scriptUrl = getGoogleAppsScriptUrl('feedback');
    
    if (scriptUrl && scriptUrl !== 'YOUR_GOOGLE_APPS_SCRIPT_URL') {
        fetch(scriptUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        }).catch(error => {
            console.log('Feedback submission error:', error);
        });
    } else {
        console.log('Feedback data ready for submission:', data);
    }
}

// Newsletter Subscription Functions
function submitNewsletter(event) {
    event.preventDefault();
    
    const email = document.getElementById('newsletter-email').value;
    const termsAgreed = document.getElementById('terms-agreement').checked;
    const privacyAgreed = document.getElementById('privacy-agreement').checked;
    const resultDiv = document.getElementById('newsletter-result');
    
    // Validate form
    if (!email) {
        showNewsletterResult('Please enter your email address.', 'error');
        return;
    }
    
    if (!termsAgreed || !privacyAgreed) {
        showNewsletterResult('Please agree to the terms and privacy policy.', 'error');
        return;
    }
    
    // Show loading state
    const submitBtn = document.querySelector('.newsletter-submit');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Joining...';
    submitBtn.disabled = true;
    
    // Track newsletter signup locally
    trackNewsletterSignupLocally(email);
    
    // Prepare data for Google Apps Script (same format as main form handler)
    const data = {
        type: 'newsletter_subscription',
        email: email,
        source: 'blog_article',
        article_id: getArticleId(),
        article_slug: getArticleSlug(),
        timestamp: new Date().toISOString(),
        terms_agreed: termsAgreed,
        privacy_agreed: privacyAgreed,
        user_session: getUserSessionId(),
        page_url: window.location.href
    };
    
    // Use the same Google Apps Script URL as the main form handler
    const scriptUrl = getGoogleAppsScriptUrl('newsletter');
    
    if (scriptUrl && scriptUrl !== 'YOUR_NEWSLETTER_APPS_SCRIPT_URL') {
        // Submit via existing form handler system
        if (typeof window.SimpleFormHandler !== 'undefined') {
            // Use existing form handler if available
            window.SimpleFormHandler.submitViaJsonp(data)
                .then(result => {
                    showNewsletterResult('🎉 Welcome aboard! Check your email for confirmation.', 'success');
                    document.getElementById('newsletter-form').reset();
                    
                    // Track successful subscription
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'newsletter_signup', {
                            'source': 'blog_article',
                            'article_slug': getArticleSlug(),
                            'article_id': getArticleId()
                        });
                    }
                })
                .catch(error => {
                    showNewsletterResult('Something went wrong. Please try again.', 'error');
                    console.error('Newsletter submission error:', error);
                })
                .finally(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                });
        } else {
            // Fallback to direct fetch
            fetch(scriptUrl, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            })
            .then(() => {
                showNewsletterResult('🎉 Welcome aboard! Check your email for confirmation.', 'success');
                document.getElementById('newsletter-form').reset();
                
                // Track subscription
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'newsletter_signup', {
                        'source': 'blog_article',
                        'article_slug': getArticleSlug(),
                        'article_id': getArticleId()
                    });
                }
            })
            .catch(() => {
                showNewsletterResult('Something went wrong. Please try again.', 'error');
            })
            .finally(() => {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            });
        }
    } else {
        // Development mode - just show success
        showNewsletterResult('🎉 Welcome aboard! Check your email for confirmation.', 'success');
        document.getElementById('newsletter-form').reset();
        console.log('Newsletter data ready for submission:', data);
        
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

function trackNewsletterSignupLocally(email) {
    const sessionKey = 'webglo_blog_feedback';
    const articleId = getArticleId();
    
    // Get existing session data
    let sessionData = {};
    try {
        const stored = sessionStorage.getItem(sessionKey);
        sessionData = stored ? JSON.parse(stored) : {};
    } catch (e) {
        console.log('Session storage not available');
    }
    
    // Initialize article data if not exists
    if (!sessionData[articleId]) {
        sessionData[articleId] = {
            slug: getArticleSlug(),
            views: 1,
            feedback: null,
            readTime: 0,
            interactions: [],
            firstView: new Date().toISOString()
        };
    }
    
    // Add newsletter signup interaction
    sessionData[articleId].interactions.push({
        type: 'newsletter_signup',
        email: email.substring(0, 3) + '***', // Partial email for privacy
        timestamp: new Date().toISOString()
    });
    
    // Store updated data
    try {
        sessionStorage.setItem(sessionKey, JSON.stringify(sessionData));
    } catch (e) {
        console.log('Session storage update failed');
    }
    
    console.log('Newsletter signup tracked locally');
}

function showNewsletterResult(message, type) {
    const resultDiv = document.getElementById('newsletter-result');
    resultDiv.className = `newsletter-result ${type}`;
    resultDiv.textContent = message;
    resultDiv.classList.remove('hidden');
    
    // Auto-hide after 5 seconds for success messages
    if (type === 'success') {
        setTimeout(() => {
            resultDiv.classList.add('hidden');
        }, 5000);
    }
}

// Utility function to get article slug
function getArticleSlug() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('slug') || urlParams.get('id') || 'unknown';
}

// Utility function to get article ID
function getArticleId() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id') || urlParams.get('slug') || 'unknown';
}

// Generate or get user session ID
function getUserSessionId() {
    const sessionKey = 'webglo_session_id';
    let sessionId = sessionStorage.getItem(sessionKey);
    
    if (!sessionId) {
        sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        try {
            sessionStorage.setItem(sessionKey, sessionId);
        } catch (e) {
            console.log('Session storage not available');
        }
    }
    
    return sessionId;
}

// Get Google Apps Script URL based on type
function getGoogleAppsScriptUrl(type) {
    // Production Google Apps Script URL - same one used in form-handler-production.js
    const productionUrl = 'https://script.google.com/macros/s/AKfycbxtonT0H__IZAsENyE97Wb1IOu1Gfq-XI899L5Gecg3zk-JczZmjQOOrEwcIiX2YH0/exec';
    
    // For development, return null to use console logging
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return null;
    }
    
    // Both feedback and newsletter use the same Apps Script endpoint
    // The script differentiates based on the 'type' field in the data
    return productionUrl;
}

// Get session feedback data for analytics
function getSessionFeedbackData() {
    const sessionKey = 'webglo_blog_feedback';
    try {
        const stored = sessionStorage.getItem(sessionKey);
        return stored ? JSON.parse(stored) : {};
    } catch (e) {
        return {};
    }
}

// Track reading time and engagement
function trackReadingEngagement() {
    const articleId = getArticleId();
    const sessionKey = 'webglo_blog_feedback';
    let startTime = Date.now();
    let isActive = true;
    
    // Track when user becomes inactive/active
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            // User switched tabs or minimized
            isActive = false;
            updateReadingTime();
        } else {
            // User returned
            isActive = true;
            startTime = Date.now(); // Reset timer
        }
    });
    
    // Update reading time periodically
    function updateReadingTime() {
        if (!isActive) return;
        
        const readTime = Math.floor((Date.now() - startTime) / 1000);
        
        try {
            const stored = sessionStorage.getItem(sessionKey);
            let sessionData = stored ? JSON.parse(stored) : {};
            
            if (!sessionData[articleId]) {
                sessionData[articleId] = {
                    slug: getArticleSlug(),
                    views: 1,
                    feedback: null,
                    readTime: 0,
                    interactions: [],
                    firstView: new Date().toISOString()
                };
            }
            
            sessionData[articleId].readTime += readTime;
            sessionStorage.setItem(sessionKey, JSON.stringify(sessionData));
        } catch (e) {
            console.log('Reading time tracking failed');
        }
        
        startTime = Date.now(); // Reset for next interval
    }
    
    // Update every 30 seconds
    setInterval(updateReadingTime, 30000);
    
    // Final update when leaving page
    window.addEventListener('beforeunload', updateReadingTime);
}

// Enhanced smooth scroll for TOC links
function initializeEnhancedScroll() {
    // Enhanced sticky navigation
    initializeStickyNavigation();
    
    document.querySelectorAll('.toc-section a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const target = document.getElementById(targetId);
            
            if (target) {
                // Add visual highlight to clicked TOC item
                document.querySelectorAll('.toc-section a').forEach(link => {
                    link.classList.remove('active');
                });
                this.classList.add('active');
                
                // Smooth scroll with offset for sticky nav
                const offset = 100; // Adjust based on your sticky nav height
                const targetPosition = target.offsetTop - offset;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Track TOC navigation
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'toc_navigation', {
                        'section': targetId,
                        'article_slug': getArticleSlug()
                    });
                }
            }
        });
    });
}

// Enhanced Sticky Navigation
function initializeStickyNavigation() {
    const nav = document.querySelector('#webglo-navigation nav') || document.querySelector('#main-navigation');
    let lastScrollY = window.scrollY;
    
    if (!nav) {
        console.log('Navigation not found, retrying...');
        // Retry after a short delay in case nav hasn't loaded yet
        setTimeout(initializeStickyNavigation, 500);
        return;
    }
    
    console.log('Sticky navigation initialized for:', nav);
    
    // Ensure nav has sticky positioning
    nav.style.position = 'sticky';
    nav.style.top = '0';
    nav.style.zIndex = '1000';
    
    function handleScroll() {
        const currentScrollY = window.scrollY;
        
        // Add scrolled class for visual effects
        if (currentScrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
        
        lastScrollY = currentScrollY;
    }
    
    // Throttled scroll listener for better performance
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (scrollTimeout) clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(handleScroll, 10);
    });
    
    // Initial call
    handleScroll();
}

// Reading progress with TOC highlighting
function enhanceReadingProgress() {
    const tocLinks = document.querySelectorAll('.toc-section a[href^="#"]');
    const sections = Array.from(tocLinks).map(link => {
        const targetId = link.getAttribute('href').substring(1);
        return {
            element: document.getElementById(targetId),
            link: link
        };
    }).filter(item => item.element);
    
    function updateActiveSection() {
        const scrollPosition = window.scrollY + 150; // Offset for better UX
        
        // Find the current section
        let currentSection = null;
        sections.forEach(section => {
            if (section.element && section.element.offsetTop <= scrollPosition) {
                currentSection = section;
            }
        });
        
        // Update active TOC link
        tocLinks.forEach(link => link.classList.remove('active'));
        if (currentSection && currentSection.link) {
            currentSection.link.classList.add('active');
        }
    }
    
    // Throttled scroll listener
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (scrollTimeout) clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(updateActiveSection, 50);
    });
    
    // Initial call
    updateActiveSection();
}
