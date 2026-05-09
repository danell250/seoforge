# How to Use the Sitemap Generator

The Sitemap Generator creates XML sitemaps and robots.txt files for your website. Sitemaps help search engines discover and index your pages more efficiently. A well-structured sitemap is essential for SEO, especially for new or large websites.

## What is a Sitemap?

A sitemap is an XML file that lists all the important pages on your website. It tells search engines:
- Which pages exist on your site
- When pages were last updated
- How often pages change
- The relative priority of each page

Google and other search engines use sitemaps to crawl your site more intelligently.

## How to Use the Sitemap Generator

### Step 1: Access the Tool

1. Go to [seoaxe.site](https://www.seoaxe.site)
2. Click "Login" and sign in to your account
3. Navigate to `/app` and select the **"Sitemap"** tab

### Step 2: Add Your Pages

You have two options:

**Option A: Manual Entry**
1. Enter each page URL
   - Example: `https://www.yoursite.com/about`
2. Set parameters for each page:
   - **Change Frequency** - How often the page updates (always, hourly, daily, weekly, monthly, yearly, never)
   - **Priority** - Relative importance (0.0 to 1.0, where 1.0 is highest)
3. Click **"Add Page"**
4. Repeat for all important pages

**Option B: Import from Crawl**
1. Click **"Import from Site Crawl"**
2. Enter your domain
3. The tool will crawl your site and auto-populate pages
4. Review and adjust as needed

### Step 3: Configure Robots.txt

The tool also generates a robots.txt file to control crawler access:

**Allow All Crawlers**
- Allow all search engines to crawl your entire site
- Recommended for most sites

**Block Specific Paths**
- Block admin areas, private pages, or unnecessary directories
- Examples: `/admin`, `/private`, `/tmp`

**Set Crawl Delay**
- Slow down crawlers to avoid server overload
- Useful for smaller servers

### Step 4: Generate Files

Click **"Generate Sitemap & Robots.txt"**

The tool displays:
- **XML Sitemap** - Complete sitemap with all your pages
- **Robots.txt** - Crawler access control file
- **Sitemap Index** - If you have multiple sitemaps

### Step 5: Download Files

**Download Sitemap**
1. Click "Download sitemap.xml"
2. Save the file

**Download Robots.txt**
1. Click "Download robots.txt"
2. Save the file

### Step 6: Upload to Your Site

**Upload Sitemap**
1. Upload `sitemap.xml` to your website root
   - Location: `https://www.yoursite.com/sitemap.xml`
2. Ensure it's accessible at that URL

**Upload Robots.txt**
1. Upload `robots.txt` to your website root
   - Location: `https://www.yoursite.com/robots.txt`
2. Ensure it's accessible at that URL

### Step 7: Submit to Search Engines

**Google Search Console**
1. Go to [Google Search Console](https://search.google.com/search-console)
2. Select your property
3. Go to "Sitemaps"
4. Enter your sitemap URL: `https://www.yoursite.com/sitemap.xml`
5. Click "Submit"

**Bing Webmaster Tools**
1. Go to [Bing Webmaster Tools](https://www.bing.com/webmasters)
2. Select your site
3. Go to "Sitemaps"
4. Submit your sitemap URL

### Step 8: Monitor Indexing

After submission:
1. Check Search Console for sitemap status
2. Monitor which pages are indexed
3. Look for crawling errors
4. Update sitemap when you add/remove pages

## Best Practices

### Page Selection
- Include all important pages (homepage, about, services, products, blog posts)
- Exclude low-value pages (login, admin, thank you pages)
- Include canonical versions only (no duplicates)
- Keep sitemap under 50,000 URLs (split if needed)

### Change Frequency Guidelines
- **Always** - Homepage, real-time data pages
- **Daily** - News, blog posts, frequently updated content
- **Weekly** - Product pages, category pages
- **Monthly** - About pages, static content
- **Yearly** - Archive pages, historical content
- **Never** - Archived or obsolete pages

### Priority Guidelines
- **1.0** - Homepage
- **0.8-0.9** - Main category pages, important products
- **0.6-0.7** - Blog posts, individual products
- **0.4-0.5** - About, contact, FAQ pages
- **0.1-0.3** - Tag pages, archives

### Robots.txt Best Practices
- Block admin and private areas
- Allow all public content
- Point to your sitemap
- Keep it simple and clear

## Common Mistakes

**Including All Pages**
- Problem: Sitemap includes every page, including low-value ones
- Solution: Only include important, indexable pages

**Incorrect URLs**
- Problem: URLs don't match actual page URLs
- Solution: Verify all URLs are correct and accessible

**Not Updating**
- Problem: Sitemap doesn't reflect new or removed pages
- Solution: Update sitemap monthly or after major changes

**Wrong Change Frequency**
- Problem: Frequency doesn't match actual update pattern
- Solution: Set realistic frequency based on content updates

**Blocking Important Pages**
- Problem: Robots.txt blocks pages you want indexed
- Solution: Carefully review robots.txt rules

## Troubleshooting

**Issue: Sitemap not accessible**
- Solution: Check file permissions, ensure it's in root directory

**Issue: Search Console shows errors**
- Solution: Validate XML syntax, check for broken URLs

**Issue: Pages not being indexed**
- Solution: Check if pages are noindex, have quality issues, or blocked by robots.txt

**Issue: Sitemap too large**
- Solution: Split into multiple sitemaps and use a sitemap index

## Common Use Cases

### New Websites
- Create initial sitemap with all pages
- Submit to search engines for faster indexing
- Update as you add content

### Large Websites
- Use sitemap index for multiple sitemaps
- Organize by content type (products, blog, etc.)
- Keep each sitemap under 50,000 URLs

### E-commerce Sites
- Include all product and category pages
- Set appropriate change frequency (daily for products)
- Use priority to highlight important products

### Blogs
- Include all published posts
- Exclude draft or private posts
- Update sitemap after publishing new content

## Tips for Best Results

1. **Keep it updated** - Update sitemap when adding/removing pages
2. **Validate XML** - Use online validators to check syntax
3. **Monitor Search Console** - Check for errors and coverage
4. **Organize logically** - Group related pages together
5. **Use automation** - Set up automatic sitemap generation if possible

## Measuring Success

Track these metrics:
- **Indexed pages** - Number of pages indexed by Google
- **Crawl rate** - How often Google crawls your site
- **Coverage report** - Search Console coverage status
- **Sitemap status** - Success/error rate in Search Console

## Next Steps

After creating sitemap:
- **Site Crawler** - Discover all pages on your site
- **SEO Audit Tool** - Check individual page SEO
- **Site Monitor** - Track indexing over time

## Common Questions

**Q: Do I need a sitemap if my site is small?**
A: Even small sites benefit from sitemaps. It helps search engines find all your pages faster.

**Q: How often should I update my sitemap?**
A: Monthly or whenever you add/remove significant numbers of pages.

**Q: Can I have multiple sitemaps?**
A: Yes, use a sitemap index file to link multiple sitemaps (for sites with 50,000+ URLs).

**Q: What if I don't have a sitemap?**
A: Google can still discover pages through links, but a sitemap makes the process faster and more reliable.

Ready to create your sitemap? [Start generating now](https://www.seoaxe.site/app).
