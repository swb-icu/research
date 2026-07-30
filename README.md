# SWB-ICU Research

Home for research projects, analysis code, and small tools built by the team.

## Structure

- **`docs/`** — anything meant to be served as a live webpage via GitHub Pages. Each
  subfolder under `docs/` is one project with its own `index.html`, published at
  `https://swb-icu.github.io/research/<project-name>/`.
- Other top-level folders — analysis scripts, notebooks, or project material that isn't a
  webpage.

## Projects

| Project | Description | Live page |
|---|---|---|
| [`docs/index.html`](docs/index.html) | SWB ICU landing page — buttons through to each trial below. | https://swb-icu.github.io/research/ |
| [`release`](docs/release/) | RELEASE trial info page (APRV vs. conventional ventilation). | https://swb-icu.github.io/research/release/ |
| [`abbrupt`](docs/abbrupt/) | ABBRUPT trial info page — placeholder, content TBC. | https://swb-icu.github.io/research/abbrupt/ |
| [`shorter`](docs/shorter/) | SHORTER trial info page — placeholder, content TBC. | https://swb-icu.github.io/research/shorter/ |
| [`genomicc`](docs/genomicc/) | GenOMICC trial info page — placeholder, content TBC. | https://swb-icu.github.io/research/genomicc/ |
| [`mosaicc-eligibility-tool`](docs/mosaicc-eligibility-tool/) | Bedside reference aid for MOSAICC trial inclusion/exclusion criteria (protocol v6.0). Not affiliated with or validated by ICNARC CTU — local team aid only. | https://swb-icu.github.io/research/mosaicc-eligibility-tool/ |

## GitHub Pages setup (one-time)

Settings → Pages → Source: Deploy from a branch → Branch: `main`, folder: `/docs` → Save.
