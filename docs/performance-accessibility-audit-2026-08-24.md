# Tight Secure Performance and Accessibility Audit

**Audit date:** 24 August 2026  
**Production target:** `https://tight-secure.vercel.app/`  
**Methods:** Lighthouse production audit, served-client-bundle review, local remediated-preview Lighthouse validation, code review, and manual responsive render review.

## Executive summary

The production audit found a **solid interaction baseline**: zero measured cumulative layout shift and total blocking time, HTTPS delivery, and a page that renders its local password-check experience without requesting the password from an application endpoint. The initial production Lighthouse run scored **88 for Performance**, **92 for Accessibility**, **77 for Best Practices**, and **91 for SEO**.

Two accessibility failures and one avoidable client error were identified. The viewport restricted user zoom; several low-contrast text treatments fell below the required contrast threshold; and an unresolved template analytics URL generated a failed external request. The current local release candidate removes the zoom restriction and unresolved analytics script, increases the affected contrast values, and scores **100 for Lighthouse Accessibility** with no remaining weighted accessibility failures in the local validation. Production must be retested after this release is deployed to confirm the same result.

## Baseline production results

| Category | Lighthouse score | Interpretation |
|---|---:|---|
| Performance | 88 | Good baseline, with JavaScript-removal opportunity. |
| Accessibility | 92 | Two actionable issues were found and remediated locally. |
| Best Practices | 77 | A console network error and a deprecation warning reduced the score. |
| SEO | 91 | Solid baseline for a client-rendered local tool. |

| Metric | Production result | Interpretation |
|---|---:|---|
| First Contentful Paint | 2.5 s | Usable, though there is room to improve initial paint. |
| Largest Contentful Paint | 3.1 s | Reasonable, but above an aggressive fast-page target. |
| Total Blocking Time | 0 ms | No measured main-thread blocking problem. |
| Cumulative Layout Shift | 0 | Stable page layout during measurement. |
| Speed Index | 4.3 s | Visual completion can improve with bundle trimming. |
| Network requests | 6 | Lean request count. |
| Total transferred size | 337 KiB | Modest transfer size for the current single-page application. |

## Accessibility findings and remediation

| Finding | Evidence from production audit | Local remediation | Validation state |
|---|---|---|---|
| Restricted zoom | Viewport used `maximum-scale=1`. | Removed the maximum-scale restriction. | Regression test added; local Lighthouse reports 100 Accessibility. |
| Low contrast | Passed-check signal text had a 2.19:1 contrast ratio on the dark signal rail; muted Practice text had 4.44:1 against its sheet background. | Increased muted foreground contrast and used a light green passed-check signal on the dark rail. | Local Lighthouse reports no weighted accessibility failures. |
| Template analytics error | Production console attempted to load `/%VITE_ANALYTICS_ENDPOINT%/umami`, producing `ERR_HTTP2_PROTOCOL_ERROR`. | Removed the unresolved analytics script. | Source and local preview no longer reference the placeholder. |

The audit aligns with the general need for sufficient text contrast and zoom support described by [WCAG 2.2][1] and the [Lighthouse accessibility guidance][2].

## Best-practice and performance findings

The production audit recorded one `unload` deprecation warning and the unresolved analytics console error. The analytics error is remediated in the release candidate. The `unload` warning originates in the served production bundle and should be rechecked after deployment; it may be associated with template/runtime code rather than the password-check feature itself.

The major performance opportunity was **123 KiB of estimated unused JavaScript**. The production bundle is a broad template-derived client application, while Tight Secure exposes a focused local tool. Future work should review unused UI, animation, mapping, and template integrations; remove unused providers and components; and split optional features into lazy-loaded modules. The local development server scored lower for performance because Vite development mode is unoptimized, so those local speed figures are not comparable to the production baseline.

## Validation status

| Check | Status |
|---|---|
| Production Lighthouse baseline | Complete |
| Independent axe CLI scan | Attempted, but blocked by a missing optional ChromeDriver binary in the sandbox rather than a Tight Secure page failure. |
| Local Lighthouse accessibility validation | Complete — 100 Accessibility, no weighted failures. |
| Viewport regression test | Complete and passing. |
| Full test suite | 8 tests passing. |
| TypeScript and production build | Passing. |
| Production re-audit after remediation | Pending deployment of the current release candidate. |

## Recommended next actions

1. Deploy the current release candidate, then rerun the production Lighthouse audit to confirm the accessibility score and console-error improvement.
2. Audit and remove unused template dependencies and providers to address the 123 KiB estimated unused JavaScript opportunity.
3. Add a deliberate Content Security Policy and remaining response-security headers, as identified in the earlier security rescan.

## References

[1]: https://www.w3.org/TR/WCAG22/ "Web Content Accessibility Guidelines (WCAG) 2.2"
[2]: https://developer.chrome.com/docs/lighthouse/accessibility "Chrome Lighthouse Accessibility"
