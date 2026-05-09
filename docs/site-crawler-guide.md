# How to Use the Site Crawler

The Site Crawler analyzes your entire website at scale, identifying SEO issues across multiple pages. It crawls your site, extracts page data, and provides a comprehensive report of problems and optimization opportunities.

## What the Site Crawler Does

The crawler scans your website and:
- Discovers all pages on your site
- Extracts titles, meta descriptions, headings
- Identifies technical SEO issues
- Finds duplicate content
- Checks internal and external links
- Analyzes page structure and hierarchy
- Generates a prioritized list of fixes

## How to Use the Site Crawler

### Step 1: Access the Tool

1. Go to [seoaxe.site](https://www.seoaxe.site)
2. Click "Login" and sign in to your account
3. Navigate to `/app` and select the **"Repair Site"** tab

### Step 2: Enter Your Domain

1. Enter your website's domain
   - Example: `https://www.yoursite.com`
2. (Optional) Set crawl limits:
   - **Max pages** - Limit how many pages to crawl (default: 100)
   - **Depth** - How many levels deep to crawl (default: 3)
3. Click **"Crawl Site"**

### Step 3: Wait for Crawl to Complete

Crawling typically takes 1-5 minutes depending on:
- Site size (number of pages)
- Page load speed
- Server response time

The tool shows progress:
- Pages discovered
- Pages analyzed
- Current status

### Step 4: Review the Crawl Results

The report displays:

**Overview**
- Total pages crawled
- Pages with errors
- Pages with warnings
- Overall site health score

**Issues by Category**
- **Meta Tags** - Missing titles, duplicate meta descriptions
- **Content** - Thin content, duplicate content
- **Technical** - 404 errors, slow pages
- **Structure** - Missing H1s, poor heading hierarchy
- **Links** - Broken links, orphan pages

**Page-by-Page Breakdown**
- List of all discovered pages
- Status for each page
- Specific issues found
- Priority level (High, Medium, Low)

### Step 5: Prioritize Fixes

Start with high-priority issues:

**Critical (Fix First)**
- Missing title tags
- Missing H1 headings
- 404 error pages
- Duplicate meta descriptions
- Canonical tag issues

**Important (Fix Soon)**
- Thin content pages
- Missing meta descriptions
- Poor heading structure
- Broken internal links

**Nice to Have**
- Long URLs
- Missing alt text
- Social tag issues

### Step 6: Export or Optimize

**Export Report**
1. Click "Export CSV" to download the full report
2. Share with your team or track progress

**Optimize Pages**
1. Select pages you want to fix
2. Click "Optimize Selected"
3. The Single Page Optimizer will repair each page
4. Deploy optimized pages to your CMS

## Understanding Crawl Results

### Common Issues Explained

**Missing Title Tag**
- Impact: High - Google can't understand the page
- Fix: Add a unique, keyword-focused title to each page

**Duplicate Meta Description**
- Impact: Medium - Confuses Google about page uniqueness
- Fix: Write unique descriptions for each page

**Missing H1**
- Impact: High - No clear heading for the page
- Fix: Add one H1 with your main keyword

**Thin Content**
- Impact: Medium - Not enough information to rank
- Fix: Expand content to at least 300 words

**404 Error**
- Impact: High - Broken user experience
- Fix: Fix broken link or redirect to relevant page

**Orphan Page**
- Impact: Low - Page exists but no links to it
- Fix: Add internal links to the page

## Best Practices

### Before Crawling
- **Check robots.txt** - Ensure crawler isn't blocked
- **Test with small crawl** - Start with 10-20 pages
- **Check server capacity** - Don't overload your server

### During Crawling
- **Monitor progress** - Watch for errors or timeouts
- **Adjust limits if needed** - Reduce page count if slow
- **Save the report** - Export results for reference

### After Crawling
- **Fix critical issues first** - Prioritize by impact
- **Track progress** - Mark issues as resolved
- **Re-crawl regularly** - Monthly or after major changes

## Crawl Settings Explained

**Max Pages**
- Limits how many pages the crawler visits
- Start with 50-100 for large sites
- Increase for comprehensive analysis

**Crawl Depth**
- How many levels deep to follow links
- Level 1: Homepage only
- Level 2: Homepage + linked pages
- Level 3: Homepage + linked pages + their links

**Follow External Links**
- Whether to crawl links to other domains
- Usually disabled to stay on your site

## Troubleshooting

**Issue: Crawl is very slow**
- Solution: Reduce max pages or crawl depth

**Issue: Pages missing from results**
- Solution: Check robots.txt, ensure links are crawlable

**Issue: Timeout errors**
- Solution: Your server may be slow; reduce concurrent requests

**Issue: Duplicate pages detected**
- Solution: Add canonical tags to specify preferred version

## Common Use Cases

### New Website Launch
- Crawl entire site before launch
- Fix all critical issues
- Re-crawl after fixes

### Regular Maintenance
- Monthly crawl to catch new issues
- Track health score over time
- Prioritize ongoing improvements

### Content Audit
- Identify thin content pages
- Find duplicate content
- Plan content updates

### Technical Audit
- Find broken links
- Check for 404 errors
- Verify proper redirects

## Tips for Best Results

1. **Crawl regularly** - Monthly or quarterly
2. **Start small** - Test with limited pages first
3. **Prioritize by traffic** - Fix high-traffic pages first
4. **Document changes** - Keep track of what you fix
5. **Monitor impact** - Track rankings after fixes

## Next Steps

After crawling:
- **Single Page Optimizer** - Fix individual pages
- **Sitemap Generator** - Ensure all pages are indexed
- **Site Monitor** - Track changes over time

## Common Questions

**Q: How long does a crawl take?**
A: Typically 1-5 minutes for 100 pages, depending on site speed.

**Q: Can I crawl any website?**
A: You can crawl any public site, but you should only crawl sites you own or have permission to analyze.

**Q: What if my site has 10,000+ pages?**
A: Crawl in batches of 100-500 pages at a time to avoid overloading servers.

**Q: Will this affect my site performance?**
A: The crawler respects rate limits, but avoid crawling during peak traffic times.

Ready to analyze your entire site? [Start crawling now](https://www.seoaxe.site/app).
