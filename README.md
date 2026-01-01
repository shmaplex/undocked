# UNDOCKED

<p align="center">
  <img src=".github/github-header.png" alt="Undocked Collage" width="full"/>
</p>

> Decentralized Docker containers for peer-to-peer apps that allow you to run, share, and collaborate without relying on centralized platforms, pick a service, host it locally, and broadcast it to your friends.

## Overview

This application is a desktop-first service orchestration and local infrastructure control panel, built with Wails (Go + React).

It is designed to give users direct, transparent control over local services, especially Docker-based workloads, without relying on opaque cloud dashboards or centralized SaaS platforms.

The app prioritizes:

- Local-first execution
- Clear system state visibility
- Human-readable service management
- Extensibility without lock-in
- Ethical, commons-oriented licensing

At its core, this is not “just a Docker GUI” — it is a foundation for local compute autonomy.

---

## What the App Does Today

### 1. Local Docker Awareness & Control

The app can:

- Detect whether Docker is installed and running
- Start Docker when supported by the host OS
- Display real-time Docker readiness status
- Prevent service actions when Docker is unavailable (fail-fast, explicit feedback)

This avoids silent failures and background magic — the user always knows why something works or doesn’t.

---

### 2. Service Lifecycle Management

Users can:

- Define services by:
  - Service ID
  - Docker image
  - Port mapping
- Start services on demand
- Stop services cleanly
- View live logs emitted by running services
- Reset or reconfigure services without restarting the app

All service actions are routed through explicit Go methods, not shell hacks or hidden scripts.

---

### 3. Recommended Services System

The app includes a Recommended Services panel:

- Curated service templates (e.g. translators, indexers, local APIs)
- One-click selection to populate service configuration
- Scrollable, fixed-height UI designed for future growth

This system is intentionally data-driven, not hardcoded, making it suitable for:

- Community-curated registries
- Offline bundles
- Future plugin systems

---

### 4. Clean, Intentional UI Architecture

- React + TypeScript frontend
- shadcn/ui + Tailwind-based design system
- Scroll-aware layouts (no infinite page creep)
- Status-first UI (state > decoration)
- No hidden layout shifts or hover tricks that obscure meaning

UI components are intentionally separated by responsibility:

- Status ≠ logs ≠ configuration
- Docker state ≠ service state

---

## Architectural Philosophy

### Local First, Not Cloud First

This app assumes:

- Your machine is a node
- Your services are yours
- The UI is a control surface, not a gatekeeper

No telemetry is required.
No account is required.
No network dependency is assumed.

---

### Explicit State Over Magic

The app favors:

- Explicit status checks
- Visible transitions
- Human-readable errors
- Predictable flows

If something is running, you can see why.
If something fails, you can see where.

---

### Wails as a Boundary, Not a Trap

Wails is used intentionally:

- Go handles system access, Docker integration, and events
- React handles presentation and user intent
- The boundary is clear and auditable

This keeps the system hackable without becoming fragile.

---

## Where the App Is Going

This app is a platform foundation, not a finished product.

Planned and plausible future directions include:

---

### 1. Peer-Aware Local Services

- Discover other nodes on the local network
- Visualize peers (IPFS-style map or graph)
- Share service metadata (not data) between peers
- Cooperative local clusters without central coordination

---

### 2. Plugin & Extension System

- Drop-in service definitions
- Optional UI panels
- Language-agnostic extensions (Go, WASM, external processes)
- Community-maintained registries

---

### 3. Decentralized Data Ownership

Future versions may integrate:

- Solid Pods / personal data stores
- Local-first configuration sync
- Portable service definitions
- User-owned logs, metrics, and annotations

The app becomes a client, not a custodian.

---

### 4. Advanced Service Introspection

Potential add-ons:

- Resource usage graphs (CPU, memory, IO)
- Health checks
- Restart policies
- Service dependency graphs
- Snapshot & rollback tooling

---

### 5. Ethical Compute & Research Tooling

Because this app runs locally and visibly, it is well-suited for:

- Research workflows
- Translation pipelines
- Indexing and archival tools
- Community compute
- Education and reproducibility

This aligns directly with Shmaplex’s focus on transparent systems and responsible tooling.

---

## Live Development

To run the app in live development mode:

wails dev

This starts:

- A Vite dev server for the frontend (hot reload enabled)
- A Go backend with live bindings

You can also open:

http://localhost:34115

to interact with Go methods directly from the browser during development.

---

## Building for Production

To build a redistributable production package:

wails build

This produces a native application for your platform with no external runtime dependencies.

---

## License

COMMON SENSE LICENSE (CSL) v1.1

Copyright (C) 2025
The Common Sense License Working Group

This project is licensed under the Common Sense License (CSL) v1.1.

What This Means (Plain English)

- Free for individuals, researchers, nonprofits, cooperatives, and small businesses
- You can run, modify, and distribute it
- Large-scale commercial users may not extract value without giving back
- If you profit significantly, you must contribute proportionally
- Ethical use is mandatory (no surveillance, military, or exploitative labor displacement)

If you build on the commons, you contribute to the commons.

Full license text is included in this repository and applies to all source code unless otherwise noted.

Learn more about the license and philosophy:
https://github.com/shmaplex/csl

---

## About Shmaplex

This project is developed under the Shmaplex organization.

Shmaplex focuses on:

- Local-first systems
- Transparent tooling
- Ethical infrastructure
- Community-aligned software

Learn more:
https://github.com/shmaplex

---

## Contributing

Contributions are welcome if they align with:

- Transparency
- Maintainability
- Ethical use
- Community benefit

Large-scale commercial users must comply with CSL contribution requirements.

---

## Final Note

This app is intentionally opinionated.

It exists because infrastructure should be understandable,
tools should respect their users,
and software should not silently extract value from the commons.

If that resonates, you are in the right place.
