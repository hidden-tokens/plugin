---
name: hidden-tokens-accounting
description: Accounting and finance work with AI on a client's books — general ledger review, P&L and balance sheet commentary, monthly reporting, top customers and suppliers, anomalies, a client letter — without the AI seeing the client's name, counterparties, invoice numbers or tax identifiers. Use when an accountant, auditor, CFO or bookkeeper mentions a ledger, trial balance, journal entries, invoices, a reporting pack, a tax filing or a client's accounts. Builds on the hidden-tokens skill and the accounting pack.
---

# Hidden Tokens for accounting

Read the `hidden-tokens` skill first. This skill adds what the books need.

## The pack

**Accounting — Morocco and France** (`expertise-comptable`): announced invoice, voucher, entry and filing numbers coded under their own name, French intra-EU VAT numbers coded; chart of accounts, taxes and administrations, financial statements, CFO indicators, software and formats, and ledger line vocabulary stay readable so the AI can work on a general ledger, a reporting pack or a client letter.

Counterparties (companies, people), IBANs and addresses are the engine's job. **Amounts follow the "Numbers" setting**: by default a company's figures stay readable, a person's finances are protected; the plan says which columns are protected.

## Typical requests and the route

| Request | Route |
|---|---|
| "Review this general ledger" | `list_files` → `anonymise_file` on the ledger (table mode, counterparties coded whole) → analysis on codes |
| "P&L of the year, top 5 customers" | `compute`: sum by account class, ranking by coded counterparty; exact values on disk, ranks and shares for you |
| "Monthly reporting pack" | `build_workbook` for the Excel, `build_presentation` for the slides, `draw_dashboard` for the charts: all built on disk with the real figures |
| "Letter to the client about the closing" | `build_document` in the firm's template; exact figures via `{{calculation}}` |
| "Any anomalies?" | duplicates, round amounts, weekend dates, same counterparty on several accounts: all visible on codes |

## Rules of the trade

- **Never add protected figures yourself.** When amounts are protected, the coded table carries placeholders of the right scale, not values. Describe the calculation to `compute`; it returns the exact figure and the index values you may reason on.
- **Same counterparty, same code, every month**: the key is cumulative over the folder, so a supplier keeps its code across files. Use that for trends.
- **Account numbers and labels stay readable**: group by them freely.
- **Invoice numbers are coded** when announced as such ("invoice no. …"), so a reconciliation is done on codes; the decoded output restores them.
- **Deliver on disk**: a ledger extract for the client goes through `build_workbook` or `restore_figures`, never through a pasted table.
- **A 224-line ledger must come back fully usable**: if the coded copy seems to lose rows or columns, say so and ask for a new plan rather than guessing.
