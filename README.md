# Hidden Tokens for Claude Code and claude.ai

Work on confidential files with Claude without Claude ever seeing a real
name. This repository holds the **Claude Code plugin** and the **skills** of
Hidden Tokens. The engine is the Hidden Tokens desktop app: the plugin finds
it on your computer.

Website: https://hiddentokens.com · Contact: info@hiddentokens.com

## Install in Claude Code

```bash
claude plugin marketplace add hidden-tokens/plugin
claude plugin install hidden-tokens@hidden-tokens
```

Restart Claude Code in the project you want protected. You get three pieces:

| Piece | What it does |
|---|---|
| **MCP server** | the Hidden Tokens connector, with the open project as the working folder and English tool names (`list_files`, `anonymise_folder`, `deanonymise`, `compute`, `ledger`…) |
| **Guard hook** | refuses `Read`, `Grep`, `cat`, `jq`… on the folder's files, the key and the decoded files; allows the coded copies and anything outside the folder |
| **Skills** | the protocol (`hidden-tokens`) and six professions: legal, accounting, HR and payroll, telecom, banking and insurance, healthcare |

Details in [`plugin/README.md`](plugin/README.md).

## Use the skills elsewhere

Each `plugin/skills/*/SKILL.md` follows the Agent Skills format and works
wherever skills are accepted: claude.ai (Settings → Skills), Claude Desktop,
Cowork, other agents. Ready-made zips: https://hiddentokens.com/skills/

A skill is the recipe; the connector is the oven. Without the tools, the skill
refuses to improvise and points to the installer.

## Versions

The plugin carries the version of the connector it was published with. This
repository is a snapshot of each release, built from a private source: see
`CONTRIBUTING.md`.

## Licence, security and name

Source-available under the Functional Source License 1.1 with an Apache 2.0
future licence (FSL-1.1-ALv2): read, audit and use it for any purpose except a
competing product; each version becomes Apache-2.0 two years after its
release. Full text in `LICENSE`. Vulnerabilities: `SECURITY.md`. The name and
logo: `TRADEMARKS.md`.
