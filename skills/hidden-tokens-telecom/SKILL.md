---
name: hidden-tokens-telecom
description: Telecom operator work with AI on subscriber data — call centre transcripts, CDR exports, subscriber lists, churn and complaint analysis, a customer letter — without the AI seeing phone numbers, IMSI, IMEI, ICCID, MAC addresses, PUK codes or customer identifiers. Use when someone at an operator, MVNO or ISP mentions subscribers, a CDR, SIM cards, terminals, a call centre, a complaint or a customer base. Builds on the hidden-tokens skill and the telecom pack.
---

# Hidden Tokens for telecom

Read the `hidden-tokens` skill first. This skill adds what subscriber data needs.

## The pack

**Telecom — Moroccan operator** (`telecom-ma`, usable for any operator): IMSI, IMEI, ICCID, international MSISDN (+212 / 00212 and others), MAC addresses, announced PUK and PIN codes coded under their own name. In table mode (CDR exports, subscriber lists) the MSISDN, IMSI, IMEI, ICCID, MAC and customer id columns are coded from the plan onwards. Operators, brands and the vocabulary of offers and service stay readable so the AI can work on a call centre transcript.

Names, addresses, emails and ID numbers are the engine's job.

## Typical requests and the route

| Request | Route |
|---|---|
| "Analyse these call centre transcripts" | `anonymise_folder` → themes, sentiment and recurring causes on codes |
| "Churn drivers from this CDR export" | `anonymise_file` table mode → `compute`: counts and averages by plan, region or month; subscribers stay codes |
| "Top complaints by region" | `compute` by region (readable), `draw_dashboard` for the chart |
| "Reply to this subscriber" | `deanonymise` with `format: "presse_papiers"` |
| "Report for the regulator" | `build_document` in the operator's template; counts via `{{calculation}}` |

## Rules of the trade

- **A phone number is an identity**: it is coded even when it looks like a plain number; never reconstruct one from a partial.
- **One subscriber, one code, across files**: the cumulative key lets you follow a customer from CDR to complaint to letter without knowing who they are.
- **Volumes and durations stay readable**: minutes, bytes, counts and timestamps are the analysis; subscriber identifiers are not.
- **Large exports**: a CDR file is table mode; if the plan codes a column you need readable (a plan name, a cell id), ask the user to exclude it in the plan rather than decoding anything.
- **Compliance**: the `ledger` and `coverage_report` outputs show the DPO which exports were protected and when.
