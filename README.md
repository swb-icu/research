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

## What it deliberately does **not** do

- **It is not the trial's Screening Log** and doesn't replace it.
- **It does not estimate baseline creatinine.** The protocol references a "provided
  calculator" for cases where no pre-illness creatinine value is available (protocol,
  inclusion criteria footnote). That calculator was not available when this tool was built,
  so baseline creatinine must always be entered manually by the clinician using your trust's
  own method. If/when the actual MOSAICC calculator logic is available, it should be added
  here rather than guessed at.
- It stores nothing and sends nothing anywhere — all computation happens client-side in the
  browser tab, and the page has no server component.
- It is **not validated or endorsed by ICNARC CTU** or the MOSAICC trial team. It's a local
  team aid built from the public protocol text.

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
