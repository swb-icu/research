# MOSAICC Eligibility Aid

A single-page, static bedside reference tool that implements the inclusion and exclusion
criteria from the **MOSAICC Protocol v6.0 (20FEB2025)** — *Multicentre evaluation Of Sodium
bicarbonate in Acute kidney Injury in Critical Care* (ISRCTN14027629).

No build step, no dependencies, no backend. It's one HTML file (`index.html`) that runs
entirely in the browser.

## What it does

Clinical staff enter:
- Age, arterial pH, PaCO₂
- Baseline and current serum creatinine (± a 48h-prior value), and/or urine output over a
  timed period, to check the AKI KDIGO stage 2/3 criterion (inclusion 3a/3b/3c)
- Ionised calcium, plasma sodium, and potassium (auto-derives the three dynamic/correctable
  exclusion criteria)
- Tick boxes for the remaining exclusion criteria

The page then shows a live eligible / not-eligible / incomplete verdict with the specific
criteria driving that verdict.

## Baseline creatinine estimator

The AKI KDIGO 2/3 card includes a collapsible "No baseline creatinine available? Estimate
it" section. It back-calculates serum creatinine from the four-variable MDRD equation,
assuming a fixed eGFR of 75 mL/min/1.73m² — the AKIN/KDIGO convention used when no genuine
pre-illness value exists. Inputs are age and sex only (no ethnicity coefficient). The
"Use this value" button populates the baseline creatinine field and re-runs the
eligibility check.

This logic was ported from `Baseline serum creatinine calculator.xls` (provided
separately) and is also available as a standalone page:
[`baseline-creatinine-calculator.html`](baseline-creatinine-calculator.html). See that
page's footer for the exact formula and known limitations — notably, the fixed eGFR of 75
won't reflect a genuinely low baseline in patients with pre-existing CKD, and a `+3.056`
calibration offset carried over from the source spreadsheet has unconfirmed provenance.
Treat it as an estimate to support clinical judgement, not a substitute for a real
pre-illness value if one can be found.

## What it deliberately does **not** do

- **It is not the trial's Screening Log** and doesn't replace it.
- It stores nothing and sends nothing anywhere — all computation happens client-side in the
  browser tab, and the page has no server component.
- It is **not validated or endorsed by ICNARC CTU** or the MOSAICC trial team. It's a local
  team aid built from the public protocol text, and the baseline creatinine estimator above
  is not part of the published protocol — it's a convenience aid layered on top.

## Keeping it in sync with the protocol

The protocol is amended periodically (see protocol Appendix 1 — Amendment History; this
build reflects amendment SA005, v6.0). If a future amendment changes the inclusion/exclusion
criteria, update the logic in `index.html` (`<script>` section, function `evaluate()`) and
the criteria text in the HTML body, and bump a version note somewhere visible on the page.

## Hosting on GitHub Pages

1. Push `index.html` and this `README.md` to the repository root (or a `/docs` folder).
2. In the repo: **Settings → Pages → Build and deployment → Source: Deploy from a branch**,
   select the branch and `/ (root)` (or `/docs`), save.
3. GitHub will publish it at `https://<your-username>.github.io/<repo-name>/` within a
   couple of minutes.

## Disclaimer

This tool is provided as a convenience aid only. Always confirm eligibility against the
current approved protocol version and your local research team/PI before enrolling a
patient. The authors accept no liability for enrolment decisions made using this tool.
