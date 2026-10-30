# Hidden Tokens — work on confidential files without the AI seeing a real name

Hidden Tokens pseudonymises a working folder on your own computer before Claude reads it: names, identifiers and sensitive figures become codes such as NAME-001, Claude works on the codes, and the real values come back only in the files written on your disk. This plugin gives Claude the three pieces it needs:

| Piece | What it does | Where |
|---|---|---|
| **MCP server** | the Hidden Tokens connector, with the open project as the working folder and English tool names (`list_files`, `anonymise_folder`, `deanonymise`, `compute`, `ledger`…) | `.mcp.json` → `server/launcher.mjs` |
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

Restart Claude Code in the project you want protected. A folder is protected once it holds a `Hidden-Tokens/` sub-folder (after the first anonymisation, or created by the app).

## Use

Open a project that holds confidential files and say what you need: "summarise the matter", "P&L of the year and top 5 customers", "gender pay gap by job family". Claude starts with `list_files`, proposes a plan, waits for your yes, works on the codes, and delivers through `deanonymise`, `build_document` or `compute`. Ask "what did you see?" for the local journal.

French setup: `ANX_OUTILS=fr` in the environment keeps the original French tool names; the skills list both.

## The skills on their own

Each `skills/*/SKILL.md` follows the Agent Skills format and works anywhere skills are accepted: Claude.ai (Settings → Skills), Claude Desktop, Cowork, other agents. A skill is the recipe; the connector is the oven: without the tools, the skill refuses to improvise and points to the installer.

## What this plugin runs, reads and sends

- **MCP server.** `server/launcher.mjs` looks for the Hidden Tokens connector in this order: the path in `HIDDEN_TOKENS_CONNECTOR`, then the desktop app's install folder (`/Applications/Hidden Tokens.app/Contents/Resources/connecteur/server/index.js` on macOS, `%LOCALAPPDATA%\Programs\Hidden Tokens\resources\connecteur\server\index.js` on Windows, `/opt/Hidden Tokens/resources/…` on Linux). It starts that file with the same Node.js, with the open project as the working folder (`ANX_WORKDIR`) and English tool names (`ANX_OUTILS=en`). The connector is code from the Hidden Tokens app that you installed; it is not downloaded by the plugin. If none is found, the launcher prints how to install it and exits.
- **Guard hook.** `hooks/garde.mjs` runs before `Read`, `Edit`, `MultiEdit`, `Write`, `NotebookEdit`, `Grep`, `Glob` and `Bash`. It reads the tool call and checks the file system for a `Hidden-Tokens/` folder next to the target. It refuses a raw read of a protected folder's files, of the key and of decoded files, and allows everything else. It writes nothing and calls no network.
- **Skills.** Plain Markdown instructions; they run nothing.
- **Local socket.** When the Hidden Tokens app is running, the connector talks to it over a local socket on the same computer (a named pipe on Windows), so the app and Claude share one key.
- **Network.** The plugin sends nothing anywhere and fetches nothing. The connector makes no network request by default; licence checks are offline. Optional features of the app that use the network (update check, organisation registry on a shared drive) are set in the app, not by this plugin.
- **Data kept.** On your disk only, in the `Hidden-Tokens/` sub-folder of each protected folder: the coded copies, the key that maps codes to real values, and the local journal of what Claude received. Nothing leaves the computer through the plugin.

## Versions and licence

The plugin carries the connector's version. Source-available under the Functional Source License 1.1 with an Apache 2.0 future licence (FSL-1.1-ALv2): read, audit and use it for any purpose except a competing product; each version becomes Apache-2.0 two years after its release. Full text in `LICENSE`. Report a vulnerability as `SECURITY.md` explains.

Contact: info@hiddentokens.com — https://hiddentokens.com
