---
name: hidden-tokens-healthcare
description: Healthcare work with AI on patient data — a discharge summary, a referral letter, lab result interpretation, a cohort or activity analysis, a complaint, an insurer's medical file — without the AI seeing patient names, patient numbers, insurance numbers, practitioner identifiers or birth dates. Use when a clinician, lab, clinic manager, medical insurer or occupational health service mentions patients, medical records, lab results, a consultation, a prescription or a care pathway. Builds on the hidden-tokens skill and the healthcare pack.
---

# Hidden Tokens for healthcare

Read the `hidden-tokens` skill first. This skill adds what patient data needs.

## The pack

**Healthcare — care, laboratories, health insurance** (`sante`): announced patient file / IPP numbers, insured numbers (AMO, CNOPS, CNSS, social security, mutual), practitioner identifiers (INPE, RPPS, ADELI), batch numbers coded under their own name. Specialties, services and examinations, medical vocabulary, common drugs by INN and by segment (-olol, -pril, -sartan, -prazole, statins, gliflozins, -xaban…), bodies and devices, biology units and ICD-10 codes stay readable so the AI can work on a report or a medical letter.

Names, addresses, phones, emails, national IDs and birth dates are the engine's job.

## Typical requests and the route

| Request | Route |
|---|---|
| "Write the discharge summary / referral letter" | `anonymise_file` on the notes → draft on codes → `deanonymise` with `format: "docx"` or `build_document` in the practice's template |
| "Interpret these lab results" | values and units stay readable; the patient is a code; comment freely |
| "Activity by specialty this quarter" | `compute` by specialty and month; patients and practitioners stay codes |
| "Review this insurer's medical file" | `anonymise_folder`; `read_scan` for scanned reports, reviewed by the user first |
| "Reply to the patient's complaint" | `deanonymise` with `format: "presse_papiers"` |

## Rules of the trade

- **A patient is a code, a practitioner is a code too**: the letter is written "Dear NAME-002" and decoded on disk; do not look for who signs.
- **Clinical content stays readable by design**: diagnoses, drugs, doses, results and dates of care are the work; the identity is not.
- **Birth dates are coded, care dates are readable**: compute an age band only from what the tool returns.
- **Small cohorts identify**: a rare diagnosis in a small service is a name; keep groups of five or more in any breakdown, as the tools warn.
- **Scans and photos** (reports, ID cards, insurance cards) go through `read_scan` or `redact_image`, and the user reviews the result before it is coded.
- **Proof for the hospital's DPO**: `ai_journal`, `coverage_report` and the signed `ledger` (GDPR art. 30 draft entry, AI Act deployer elements).
