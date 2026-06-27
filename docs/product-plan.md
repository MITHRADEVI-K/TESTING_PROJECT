# QAForge Product Plan

## Product Vision
QAForge is an Automation Readiness Analyzer for test engineers.

It helps testers understand how automation-friendly a page is, where locator stability issues exist, and how to improve automation quality before writing code.

## Core Value
- Provides a score for automation readiness
- Identifies locator quality issues
- Highlights automation risk areas
- Helps testers decide whether a page is testable

## Version 1 Scope
### Must-have features
- Page scan and automation readiness score
- Page inventory: forms, inputs, buttons, links, tables, iframes
- Locator quality analysis for key interactive elements
- Recommendations to improve automation stability
- Locator mode for inspecting elements directly

### Not in Version 1
- ZIP export
- Full project generation
- AI assistance
- Settings and framework switching

## Architecture
- `popup/` — UI layer for extension popup
- `content/` — DOM scanning and page analysis
- `analyzer/` — scoring and recommendations
- `generator/` — future code generation templates
- `shared/` — common types and helpers

## Technologies
- React (future UI upgrade)
- TypeScript
- Vite
- Tailwind CSS
- Chrome Extension Manifest V3
- JSZip (future export)

## Roadmap
1. Foundation: manifest and messaging
2. DOM Scanner: detect forms, buttons, inputs, tables, links, iframes
3. Automation Analyzer: score, quality, accessibility recommendations
4. Locator Engine: copy stable selectors and show locator insights
5. Publish: package as Chrome extension, add docs and screenshots

## Product Differentiator
This is not a locator helper. It is a higher-level automation readiness tool that evaluates pages and surfaces automation quality issues.
