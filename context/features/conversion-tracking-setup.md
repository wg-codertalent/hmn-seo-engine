# Conversion tracking setup for Google Ads

## Overview

Track earnings estimator form completions as lead conversions in Google Ads (AW-17946792768).
When a user completes the full form and `submitted=true` is set, a `gtag('event', 'conversion')` fires.

## Requirements

- [x] Add Google Ads tag (AW-17946792768) to the site via gtag.js config in `app/layout.tsx`
- [x] Fire `gtag('event', 'conversion')` on successful `/earnings-estimator` form submission
- [ ] Replace `CONVERSION_LABEL` in `PropertyEstimateForm.tsx` with the actual label from Google Ads
