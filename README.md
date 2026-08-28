# Tight Secure

> **A privacy-focused password-intelligence workspace for understanding predictable patterns and building stronger credentials locally.**

| Project lens | Details |
| --- | --- |
| **Type** | Web application |
| **Stack** | TypeScript · React · Vite |
| **Status** | Actively maintained |

## Overview

A privacy-focused password-intelligence workspace for understanding predictable patterns and building stronger credentials locally. This README keeps the project’s verified setup, usage, privacy, and implementation notes together in one place.

## Repository Snapshot

The top-level workspace currently includes `LICENSE`, `README.md`, `client/`, `components.json`, `docs/`, `ideas.md`, `package.json`, `patches/`, `pnpm-lock.yaml`, `server/`, `shared/`, `template.json`. Review the project-specific sections below before installing dependencies, supplying configuration values, or running a build.


---

Password Atlas is a client-side password intelligence dashboard. It helps people read password strength in context, spot common weak patterns, compare the score against the importance of the protected account, and generate a stronger passphrase.

## What it includes

| Capability | Description |
| --- | --- |
| Local analysis | Password text is analysed in the browser and is not submitted to an application API. |
| Contextual targets | The strength target changes for email, phone, apps, social accounts, and banking. |
| Practical guidance | The interface explains length, character variety, common patterns, password reuse, and two-step sign-in. |
| Responsive visual system | The glass-and-skeuomorphic interface is optimised for compact touch screens and wide desktop workspaces. |
| Personal themes | Users can switch light/dark mode and choose from ten accent palettes. |

## Run locally

Install dependencies and start the Vite development server.

```bash
pnpm install
pnpm dev
```

Create a production build with:

```bash
pnpm build
```

## Privacy note

The password-strength calculation is deliberately implemented on the client. Do not enter a password you do not control into any third-party password checker, and use a trusted password manager to generate and store unique credentials.
