---
name: hidden-tokens-banking-insurance
description: Banking, insurance and compliance work with AI — claims files, policy reviews, KYC and onboarding packs, loan files, complaint handling, a customer letter — without the AI seeing account numbers, IBANs, card details, policy or claim numbers, plates or customer names. Use when a banker, insurer, broker, claims handler or compliance officer mentions a claim, a policy, a customer file, a loan, a KYC pack or a card dispute. Builds on the hidden-tokens skill and the banking and insurance pack.
---

# Hidden Tokens for banking and insurance

Read the `hidden-tokens` skill first. This skill adds what customer files need.

## The pack

**Banking and insurance** (`banque-assurance`): IBANs of every country (mod 97 checked) and Moroccan RIBs, announced BIC/SWIFT, card security codes, policy, claim, cheque and LCN numbers, Moroccan plates coded under their own name. Regulators, banks and insurers of the market, compliance acronyms and contract vocabulary stay readable so the AI can work on a claim or a policy.

Card numbers (Luhn-checked), ID cards and driving licences, names, addresses, phones and emails are the engine's job.

## Typical requests and the route

| Request | Route |
|---|---|
| "Assess this claim file" | `list_files` → `anonymise_folder` (statements, photos via `read_scan` / `redact_image`) → assessment on codes |
| "Summarise the policy and the exclusions" | `anonymise_file`; clauses and vocabulary stay readable |
| "Review this KYC pack" | `read_scan` on scanned IDs (the user reviews the OCR first), then `anonymise_file`; check completeness on codes |
| "Loan portfolio by segment" | `compute`: sums and counts by product, region, month; customers stay codes |
| "Reply to the complaint" | `deanonymise` with `format: "presse_papiers"` or `"docx"` |
| "Report to the regulator" | `build_document`, counts via `{{calculation}}`; `ledger` for the audit trail |

## Rules of the trade

- **A bank detail is never partially useful**: do not keep "the last four digits"; the code is the reference.
- **Scanned documents wait for the user**: OCR output goes to a file they review before anything is coded; redacted images are written on disk and shown to them first.
- **Amounts**: a company's figures are readable, a person's finances are protected by default; use `compute` for any figure on a personal file.
- **Fraud patterns** (same IBAN across customers, same plate on two claims) are visible on codes: same value, same code.
- **Proof for the auditor**: `ai_journal` for one answer, `seal_folder` for one file, `ledger` for the period.
