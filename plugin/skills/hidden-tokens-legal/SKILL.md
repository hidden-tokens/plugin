---
name: hidden-tokens-legal
description: Law firm work on a client matter with AI under professional secrecy — summarise a case file, draft pleadings, a letter before claim, a memo or a timeline from exhibits, contracts, judgments and correspondence, without the AI seeing parties' names, company registration numbers or case numbers. Use when a lawyer, paralegal, notary or in-house counsel mentions a matter, a case, exhibits, pleadings, a contract to review or a dispute, in France, Morocco, the UK or elsewhere. Builds on the hidden-tokens skill and the legal industry packs.
---

# Hidden Tokens for legal work

Read the `hidden-tokens` skill first: it holds the protocol and the tools. This skill adds what a matter needs.

## The packs

Enabled per folder in the Hidden Tokens app, or by the firm's signed policy. Ask the user which applies if `key_status` does not say.

- **Legal — France** (`juridique-fr`): SIRET and announced SIREN (Luhn-checked), RG numbers, prosecutor's office numbers, Cour de cassation appeal numbers coded under their own name. Courts, codes and sources of law stay readable so the AI can work on pleadings or a judgment.
- **Legal — Morocco** (`juridique-ma`): court file numbers (NNNN/8202/YYYY), bailiff's reports, announced judgment numbers coded; RC / ICE / IF / patente / CNSS columns coded whole. Courts, court officers, DOC and Code de commerce, Barid Al-Maghrib and OMPIC stay readable.
- **Notary — Morocco** (`notariat-ma`): land title numbers with their registry index, registration requisitions, minute and repertory numbers, adoulaire deeds and "property known as …" coded; land registry, mortgage, joint ownership, succession and deed taxation stay readable.
- Invoice, credit note and single-group transfer references (`VIR-727363`) stay readable in both legal packs: they are exhibits, not identities.

Parties, ID cards, IBANs, addresses, phone numbers and emails are the engine's job, in every pack.

## Typical requests and the route

| Request | Route |
|---|---|
| "Summarise the file" | `list_files` → `anonymise_folder` → summary on codes, exhibits by `[F-XXXXX]` |
| "Draft the letter before claim / the pleadings" | work on codes → `build_document` in the firm's Word template, or `deanonymise` with `format: "docx"` |
| "What do we claim, exactly?" | amounts via `compute` (sum of unpaid invoices, interest base), never added by hand from coded tables |
| "Timeline of the dispute" | event dates stay readable; build it on codes; `draw_dashboard` (Graphviz) for a diagram |
| "Reply to the client's email" | `deanonymise` with `format: "presse_papiers"`, the user pastes it |
| "Prove to the client their data stayed protected" | `seal_folder` with the matter reference; verifiable on hiddentokens.com |

## Rules of the trade

- **Party names are codes, and stay codes in the draft.** `NAME-001` versus `COMPANY-002`: write "the Claimant" or keep the code; decoding restores the names on disk.
- **Court city and jurisdiction stay readable**: use them, they anchor the procedure.
- **Exact amounts.** A claim is a sum; use `compute` for totals and ask for the exact figure in the Word document via `{{calculation}}`.
- **Exhibits list**: cite by `[F-XXXXX]` and the coded title; the user maps them back.
- **Readable rendering** (pseudonyms instead of codes) makes a long brief easier to write; the pseudonyms are fictitious, copy them exactly.
- **Confidentiality reminder**: when the user pastes an exhibit in clear, offer the Hidden Tokens route instead of reading it.
- **Bar guidance**: for France, the CNB guide on AI use (April 2026) asks for pseudonymisation before any AI; the `ai_journal` and `seal_folder` outputs are the evidence a client or the bar may ask for.
