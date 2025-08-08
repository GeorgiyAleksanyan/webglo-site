# WebGlo Website Audit Tool

This module provides a free, AI-powered website audit for users. It aggregates data from public APIs (like Google PageSpeed Insights) and uses Google Gemini AI (with user-provided API key) to generate a personalized report and recommendations. The final report is delivered as a branded Google Doc.

## Features
- Website performance and SEO analysis (PageSpeed Insights)
- Optional AI-powered summary, recommendations, and sales pitch (Gemini API)
- User privacy: no data stored, user provides their own API key
- Branded Google Doc report with actionable tips and WebGlo CTA

## Usage
1. Deploy the Google Apps Script as a web app.
2. Users submit their website URL, email, and (optionally) Gemini API key.
3. The script aggregates audit data, calls Gemini AI, and generates a Google Doc report.
4. The report is shared with the user.

## Setup
- See `Code.gs` for main script logic.
- See `PROMPT.md` for Gemini AI training script.

---
