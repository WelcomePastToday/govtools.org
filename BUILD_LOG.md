# GovTools Registry Build Log

## [v3.0.0] - Polyrepo Extraction
* **Architectural Refactor**: The monolithic GovTools repository has been split into a decoupled, polyrepo architecture.
* `govtools-landing` has been extracted and renamed to `govtools.org` and initialized as an independent, standalone repository.
* The frontend now acts purely as a routing mechanism and directory via `govtools.registry.yaml`.
* **Decoupled Data Dependencies**: Tracker dashboards (`gov-posts`, `gov-web-edits`) and `dni-preserved` have been moved to the `govtools-dashboard` repository. The heavy CSV/JSON static data volumes are no longer mapped into this project.
* **Governance**: Applied strict `.gitignore` rules and transitioned to a decentralized `.env.example` structure for local development. Production orchestration (Caddy and Docker) is now handled remotely via the `govtools-infra` master repository.

## [v3.1.0] - Polyrepo Flattening
- Extracted from the monorepo as a standalone registry application.
- Standardized documentation and CI/CD pipelines.
