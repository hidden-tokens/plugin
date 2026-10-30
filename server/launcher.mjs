#!/usr/bin/env node
/* ============================================================================
   Hidden Tokens for Claude Code — the MCP server launcher of the plugin.
   (In server/, not bin/: claude.ai and Cowork refuse a plugin with a
   top-level bin/ directory.)

   The plugin ships the skills and the guard hook; the engine itself is the
   Hidden Tokens connector, which lives either inside the desktop app (the
   normal case) or in a checkout of the repository (development). This
   launcher finds it and runs it with the current project as the working
   folder, so Claude Code reads the folder's files through Hidden Tokens only.

   Lookup order:
     1. HIDDEN_TOKENS_CONNECTOR   path to the connector's server/index.js
     2. the desktop app           macOS, Windows, Linux install locations
     3. the repository            ../connecteur/server/index.js next to this plugin
   Nothing found: a clear message on stderr and exit 1 (Claude Code shows the
   server as failed; the skill tells the user how to install).
   ========================================================================== */
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const SUFFIXE = path.join("connecteur", "server", "index.js");

export function candidats(env = process.env, plateforme = process.platform, home = os.homedir()) {
  const out = [];
  if (env.HIDDEN_TOKENS_CONNECTOR) out.push(env.HIDDEN_TOKENS_CONNECTOR);
  if (plateforme === "darwin") {
    out.push(path.join("/Applications", "Hidden Tokens.app", "Contents", "Resources", SUFFIXE));
    out.push(path.join(home, "Applications", "Hidden Tokens.app", "Contents", "Resources", SUFFIXE));
  } else if (plateforme === "win32") {
    const local = env.LOCALAPPDATA || path.join(home, "AppData", "Local");
    out.push(path.join(local, "Programs", "Hidden Tokens", "resources", SUFFIXE));
    out.push(path.join(env.ProgramFiles || "C:\\Program Files", "Hidden Tokens", "resources", SUFFIXE));
  } else {
    out.push(path.join("/opt", "Hidden Tokens", "resources", SUFFIXE));
    out.push(path.join(home, ".local", "share", "hidden-tokens", SUFFIXE));
  }
  // A checkout of the repository: plugin/ and connecteur/ side by side.
  out.push(path.join(ICI, "..", "..", SUFFIXE));
  return out;
}

export function trouverConnecteur(env = process.env) {
  for (const c of candidats(env)) {
    try {
      if (!fs.statSync(c).isFile()) continue;
      // The repository checkout needs its dependencies installed.
      const deps = path.join(path.dirname(c), "..", "node_modules", "@modelcontextprotocol");
      if (c.startsWith(path.join(ICI, "..", "..")) && !fs.existsSync(deps)) continue;
      return c;
    } catch {}
  }
  return null;
}

const MESSAGE = [
  "Hidden Tokens: the connector was not found on this computer.",
  "Install the Hidden Tokens desktop app from https://hiddentokens.com (14-day free trial),",
  "or set HIDDEN_TOKENS_CONNECTOR to the path of the connector's server/index.js.",
  "The plugin's skills and the guard hook keep working; the folder cannot be pseudonymised until the connector runs.",
].join("\n");

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const serveur = trouverConnecteur();
  if (!serveur) { process.stderr.write(MESSAGE + "\n"); process.exit(1); }
  const env = {
    ...process.env,
    // The project opened in Claude Code is the working folder, unless told otherwise.
    ANX_WORKDIR: process.env.ANX_WORKDIR || process.cwd(),
    // English tool names (list_files, anonymise_folder…) unless the user chose French.
    ANX_OUTILS: process.env.ANX_OUTILS || "en",
  };
  const enfant = spawn(process.execPath, [serveur], { stdio: "inherit", env });
  enfant.on("exit", (code, signal) => process.exit(code ?? (signal ? 1 : 0)));
  for (const s of ["SIGINT", "SIGTERM", "SIGHUP"]) process.on(s, () => enfant.kill(s));
}
