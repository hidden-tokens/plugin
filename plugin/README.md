# Hidden Tokens for Claude Code — the plugin

One install gives Claude Code the three pieces of Hidden Tokens:

| Piece | What it does | Where |
|---|---|---|
| **MCP server** | the Hidden Tokens connector, with the open project as the working folder and English tool names (`list_files`, `anonymise_folder`, `deanonymise`, `compute`, `ledger`…) | `.mcp.json` → `bin/serveur.mjs` |
| **Guard hook** | refuses `Read`, `Grep`, `cat`, `jq`… on the folder's files, the key and the decoded files; allows the coded copies `Hidden-Tokens/*-anonymise.*` and anything outside the folder (fail closed) | `hooks/hooks.json` → `hooks/garde.mjs` |
| **Skills** | the protocol (`hidden-tokens`) and six professions: legal, accounting, HR and payroll, telecom, banking and insurance, healthcare | `skills/` |

The engine itself is the **Hidden Tokens desktop app** (macOS, Windows): the launcher finds its bundled connector. Without the app, the hook and the skills still work, and Claude tells the user how to install; the folder cannot be pseudonymised until then. Set `HIDDEN_TOKENS_CONNECTOR` to a connector's `server/index.js` to use another copy. English tool names need the connector 2.47.0 or later (the app release that embeds it); an older app still works, with the French names.

## Install

```bash
claude plugin marketplace add hidden-tokens/plugin
```

```bash
claude plugin install hidden-tokens@hidden-tokens
```

Source: https://github.com/hidden-tokens/plugin — ready-made zips of the skills: https://hiddentokens.com/skills/

From a checkout of the private repository (development), `npm ci` in `connecteur/` first, then:

```bash
claude plugin install ./plugin
```

Restart Claude Code in the project you want protected. A folder is protected once it holds a `Hidden-Tokens/` sub-folder (after the first anonymisation, or created by the app).

## Use

Open a project that holds confidential files and say what you need: "summarise the matter", "P&L of the year and top 5 customers", "gender pay gap by job family". Claude starts with `list_files`, proposes a plan, waits for your yes, works on the codes, and delivers through `deanonymise`, `build_document` or `compute`. Ask "what did you see?" for the local journal.

French setup: `ANX_OUTILS=fr` in the environment keeps the original French tool names; the skills list both.

## The skills on their own

Each `skills/*/SKILL.md` follows the Agent Skills format and works anywhere skills are accepted: Claude.ai (Settings → Skills), Claude Desktop, Cowork, other agents. A skill is the recipe; the connector is the oven: without the tools, the skill refuses to improvise and points to the installer.

## Versions and licence

The plugin carries the connector's version. `hooks/garde.mjs` is a copy of `connecteur/claude-code/garde.mjs`; the connector's test suite checks they are identical. Licence: see the repository's README (the plugin's own files, skills included, are published under the same terms as the connector).

Contact: info@hiddentokens.com — https://hiddentokens.com
