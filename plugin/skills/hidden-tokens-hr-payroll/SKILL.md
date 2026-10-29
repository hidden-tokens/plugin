---
name: hidden-tokens-hr-payroll
description: HR and payroll work with AI — pay gap analysis, headcount and turnover, a job description or contract, an annual review summary, a redundancy or disciplinary procedure, CV screening — without the AI seeing employee names, employee numbers, social security numbers, birth dates or individual salaries. Use when an HR manager, payroll officer, recruiter or works council mentions employees, payslips, a payroll export, CVs, contracts, reviews or a procedure. Builds on the hidden-tokens skill and the HR and payroll pack.
---

# Hidden Tokens for HR and payroll

Read the `hidden-tokens` skill first. This skill adds what people data needs.

## The pack

**HR and payroll** (`rh-paie`): announced employee numbers, badge numbers, employment contract and HR file numbers coded under their own name. Social security numbers, CNSS, IBANs and birth dates are recognised by the engine. **Salaries are a person's finances: protected by default** under the "Numbers" setting. Job titles, labour law, pay elements, bodies, diplomas, schools and skills stay readable so the AI can work on a contract, an annual review or a procedure.

## Typical requests and the route

| Request | Route |
|---|---|
| "Gender pay gap by job family" | `anonymise_file` on the payroll export → `compute`: average by job family and gender, groups of 5 or more only |
| "Headcount, turnover, seniority" | `compute` on hire and leave dates (event dates stay readable); `draw_dashboard` for the chart |
| "Draft the contract / the job description" | work on codes → `build_document` in the company template |
| "Summarise the annual reviews" | per code, themes only; the decoded summary goes back through `deanonymise` |
| "Screen these CVs" | `anonymise_folder`: names, schools' identifying details and employers are coded; rank by competence on codes |
| "Prepare the disciplinary letter" | codes throughout; `deanonymise` with `format: "docx"` |

## Rules of the trade

- **Small groups identify people.** A breakdown with fewer than five people per cell is a name in disguise. The tools warn; keep the warning, aggregate higher, and say why.
- **Birth dates are coded, event dates are readable**: compute seniority and age bands from what the tool returns, never reconstruct a birth date.
- **Individual salaries are protected**: reason on the indices and shares `compute` returns; the exact figures go to the user's page or Word document, not to you.
- **"Readable" rendering** is allowed for payroll when people are coded: pseudonyms make the narrative readable; copy them exactly.
- **Employers on a CV** are companies: coded. Skills, degrees and years stay readable; that is enough to screen.
- **Works council and employee notice**: the `ledger` page carries the deployer's elements and the employee notice of the signed policy; point the DPO to it.
