# QAForge

## AI Automation Assistant for Test Engineers

QAForge is a Chrome extension product designed to help testers inspect any webpage and measure automation readiness with actionable scoring and recommendations.

This repository now contains the Version 1 Chrome extension MVP.

### What it does

- Analyzes page automation readiness and testability
- Scores page quality for stable automation
- Identifies missing IDs, labels, and dynamic selectors
- Provides recommendations to improve locator reliability
- Lets testers activate locator mode and inspect individual elements

### Project structure

- `chrome-extension/` — Chrome extension source
- `docs/` — product plan and roadmap
- `.github/` — repository workflow files

### How to install locally

1. Open Chrome or Edge.
2. Go to `chrome://extensions`.
3. Enable developer mode.
4. Click `Load unpacked`.
5. Select the `chrome-extension` folder.

### How to use

1. Open any website.
2. Click the QAForge extension icon.
3. Activate locator mode.
4. Click an element.
5. Copy locators or generate automation snippets.

### Version 1 goal

Build a publishable Chrome extension MVP that saves testers time by generating stable locators and automation code artifacts from any page.
