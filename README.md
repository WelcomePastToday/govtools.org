# GovTools Registry (govtools.org)

This is the central portal for the **GovTools** ecosystem (`WelcomePastToday/govtools.org`). 
It serves as the front-page routing and discovery registry for all sub-applications in the network.

## Overview

- **Framework**: Next.js 15+ (App Router)
- **Role**: It reads from `govtools.registry.yaml` to dynamically render navigation cards and routing links to the "Spoke" applications (e.g., Cataloger, Trackers).
- **Data Dependency**: None. This is a lightweight routing and registry application. The dashboards and trackers have been separated into `govtools-dashboard` and `govtools-data`.

## Development

```bash
npm install
npm run dev
```

For local development, copy `.env.example` to `.env.local`. In production, secrets are injected centrally via the `govtools-infra` orchestrator.

> **Security Note:** Avoid revealing backend infrastructure details (such as orchestration tools, registry file names, or specific network configs) on the public-facing UI. The landing page should remain opaque regarding how it is managed behind the scenes.
