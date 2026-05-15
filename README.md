# GovTools Home (The Hub)

This is the central portal for the **GovTools** monorepo `WelcomePastToday/govtools`. 
It serves as the front-page routing to all sub-applications and visually renders metrics via dashboards (like the `gov-posts` and `gov-web-edits` trackers).

## Overview

- **Framework**: Next.js 15+ (App Router)
- **Role**: It reads from `govtools.registry.yaml` to dynamically render navigation cards and routing links to the "Spoke" applications (e.g., Cataloger, Trackers).
- **Data Dependency**: The trackers generate output directories (`govtools-posts-tracker/data`, `gov-web-edits/output`). In production, Docker maps these raw directories into `govtools-home/public` allowing the visualizations to pull static JSON/CSV data without touching the source code.

## Development

```bash
cd govtools/govtools-home
npm install
npm run dev
```

For environment secrets, please use the master `.env.local` located at the root of the monorepo (`govtools/`).

> **Security Note:** Avoid revealing backend infrastructure details (such as orchestration tools, registry file names, or specific network configs) on the public-facing UI. The landing page should remain opaque regarding how it is managed behind the scenes.
