# How to Use the Hreflang Tool

The Hreflang Tool helps you implement proper hreflang tags for multilingual websites. Hreflang tags tell Google which language and regional version of a page to show to users based on their location and language preferences. This is essential for international SEO.

## What is Hreflang?

Hreflang is an HTML attribute that specifies the language and geographical targeting of a webpage. It helps Google:
- Serve the correct language version to users
- Avoid duplicate content issues across language versions
- Improve rankings in local search results

Example: A user searching in French from France should see the French version of your page, not the English version.

## When to Use Hreflang

You need hreflang if you have:
- **Multiple language versions** of the same page (e.g., /en/page and /fr/page)
- **Regional variations** (e.g., /us/page and /uk/page)
- **Different content for different regions**
- **International targeting** for your website

## How to Use the Hreflang Tool

### Step 1: Access the Tool

1. Go to [seoaxe.site](https://www.seoaxe.site)
2. Click "Login" and sign in to your account
3. Navigate to `/app` and select the **"Languages"** tab

### Step 2: Add Your Page Versions

Enter each language/region version of your page:

**For each version:**
1. **Page URL** - The full URL of the page
   - Example: `https://www.yoursite.com/en/about`
2. **Language Code** - ISO 639-1 language code
   - Example: `en` for English, `fr` for French, `de` for German
3. **Region Code** (Optional) - ISO 3166-1 alpha-2 country code
   - Example: `US` for United States, `GB` for United Kingdom
4. Click **"Add Version"**

Repeat for each language/region version of the page.

### Step 3: Set Default Version

Select which version should be shown to users whose language/region isn't specified:
- Usually your primary language (e.g., English)
- This is the fallback version

### Step 4: Generate Hreflang Tags

Click **"Generate Hreflang Tags"**

The tool displays:
- **HTML Link Tags** - To add to your page `<head>` section
- **HTTP Header** - For non-HTML documents (PDFs, etc.)
- **XML Sitemap** - Alternative implementation method

### Step 5: Implement the Tags

Choose your implementation method:

**Option A: HTML Link Tags (Recommended)**
1. Copy the generated HTML
2. Paste into the `<head>` section of each page version
3. Ensure each page has its own set of hreflang tags

**Option B: HTTP Headers**
1. Copy the HTTP header format
2. Configure your server to send these headers
3. Use for non-HTML content

**Option C: XML Sitemap**
1. Copy the sitemap format
2. Add to your sitemap.xml file
3. Submit to Google Search Console

### Step 6: Validate Implementation

After implementing:
1. Use [Google's Hreflang Tags Testing Tool](https://search.google.com/test/hreflang)
2. Enter your page URL
3. Verify all language versions are detected
4. Check for errors or warnings

### Step 7: Submit to Search Console

1. Go to Google Search Console
2. Select your property
3. Go to "International Targeting" → "Language"
4. Verify Google is detecting your hreflang tags
5. Check for any errors

## Language and Region Codes

### Common Language Codes
- `en` - English
- `es` - Spanish
- `fr` - French
- `de` - German
- `pt` - Portuguese
- `it` - Italian
- `nl` - Dutch
- `zh` - Chinese
- `ja` - Japanese
- `ko` - Korean
- `ar` - Arabic
- `hi` - Hindi

### Common Region Codes
- `US` - United States
- `GB` - United Kingdom
- `CA` - Canada
- `AU` - Australia
- `DE` - Germany
- `FR` - France
- `ES` - Spain
- `IT` - Italy
- `BR` - Brazil
- `ZA` - South Africa
- `IN` - India
- `JP` - Japan
- `CN` - China

### Format Combinations
- `en-US` - English for United States
- `en-GB` - English for United Kingdom
- `fr-FR` - French for France
- `fr-CA` - French for Canada
- `de-DE` - German for Germany
- `pt-BR` - Portuguese for Brazil

## Best Practices

### URL Structure
- Use clear, consistent URL patterns
- Include language code in URL path or subdomain
- Examples:
  - `yoursite.com/en/page`
  - `en.yoursite.com/page`
  - `yoursite.com/page?lang=en`

### Content Quality
- Ensure translations are accurate, not machine-translated
- Adapt content for regional differences (currency, dates, examples)
- Maintain consistent quality across all versions
- Localize images and media

### Implementation
- Add hreflang to ALL language versions
- Include self-referencing tags
- Set x-default for fallback
- Keep tags consistent across all versions

## Common Mistakes

**Missing Self-Reference**
- Each page must reference itself
- Fix: Add a tag pointing to its own URL

**Incorrect Language Codes**
- Using non-standard codes
- Fix: Use ISO 639-1 codes

**Broken URLs**
- Pointing to non-existent pages
- Fix: Verify all URLs are accessible

**Inconsistent Implementation**
- Some pages have tags, others don't
- Fix: Implement consistently across all pages

**Duplicate Content**
- Not translating content, just changing language code
- Fix: Actually translate and localize content

## Troubleshooting

**Issue: Google not detecting hreflang**
- Solution: Wait 1-2 weeks for re-crawling, verify tags are in HTML source

**Issue: Wrong version showing in search**
- Solution: Check language codes, verify content matches language

**Issue: Validation errors**
- Solution: Use Google's testing tool, check syntax and URLs

**Issue: Duplicate content warnings**
- Solution: Ensure hreflang is implemented correctly, content is actually different

## Common Use Cases

### E-commerce Sites
- Different currencies and payment methods by region
- Localized product descriptions
- Region-specific shipping information

### SaaS Companies
- Language-specific documentation
- Regional pricing
- Local customer support

### Content Publishers
- Localized news and articles
- Region-specific content
- Cultural adaptations

### International Businesses
- Multi-language service pages
- Regional office locations
- Local contact information

## Tips for Best Results

1. **Plan your structure** - Decide on URL pattern before implementing
2. **Use professional translation** - Machine translation often fails
3. **Test thoroughly** - Use Google's testing tools before going live
4. **Monitor performance** - Track rankings by region
5. **Keep updated** - Add new language versions as needed

## Measuring Success

Track these metrics:
- **Regional rankings** - Position in country-specific search
- **Traffic by country** - Organic traffic from target regions
- **Language-specific conversions** - Conversion rates by language
- **Search Console errors** - Monitor for hreflang errors

## Next Steps

After implementing hreflang:
- **Sitemap Generator** - Add all language versions to sitemap
- **SEO Audit Tool** - Check each version for issues
- **Site Monitor** - Track performance by region

## Common Questions

**Q: Do I need hreflang if I only have English?**
A: No, only needed for multiple language or regional versions.

**Q: Can I use hreflang for subdomains?**
A: Yes, hreflang works across subdomains and directories.

**Q: What if I have similar but not identical content?**
A: If content is truly different, you may not need hreflang. If it's the same content in different languages, you do.

**Q: How long until Google recognizes hreflang?**
A: Usually 1-4 weeks after implementation and re-crawling.

Ready to implement multilingual SEO? [Start adding hreflang tags now](https://www.seoaxe.site/app).
