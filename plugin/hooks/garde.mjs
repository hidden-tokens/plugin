#!/usr/bin/env node
/* ============================================================================
   LE VERROU DANS CLAUDE CODE — un crochet PreToolUse (v2.41.0, T10).

   Claude Code a ses propres outils (Read, Grep, Glob, Edit, Bash : cat, jq,
   grep…). Le protocole Hidden Tokens dit de ne jamais lire les pièces du
   dossier par un autre moyen que le connecteur ; en T10 il l'a respecté seul,
   mais rien ne l'y obligeait. Ce crochet l'y oblige.

   Un DOSSIER PROTÉGÉ est un dossier qui contient un sous-dossier Hidden-Tokens
   (avec son repère ou ses réglages). Dedans, sont REFUSÉS :
   - lire, chercher, modifier une PIÈCE (un fichier que le connecteur sait lire :
     tableur, Word, PDF, texte, journal, dump, .env, image…) ;
   - toucher la clé (cle-*, *NE-JAMAIS-PARTAGER*, cle-de-session*) ou un fichier
     décodé (*-decode-*) ;
   - chercher récursivement dans le dossier sans viser les copies codées ;
   - une commande shell qui nomme une pièce, la clé, un fichier décodé, ou qui
     parcourt le dossier entier.
   Sont PERMIS : les copies codées (Hidden-Tokens/*-anonymise.*), les fichiers
   que l'IA écrit elle-même (code, scripts), tout ce qui est hors du dossier.

   Entrée : le JSON de Claude Code sur stdin ({ tool_name, tool_input, cwd }).
   Sortie : rien (on laisse faire) ou une décision « deny » avec la raison.
   Installation : .claude/settings.json du dossier (cf. README.md voisin).
   ========================================================================== */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const OUTDIR = "Hidden-Tokens";
const PIECE_RX = /\.(?:xlsx|xls|xlsm|csv|tsv|pdf|docx|doc|docm|dotx|rtf|odt|pages|pptx|potx|md|txt|png|jpe?g|webp|bmp|tiff?|heic|log|sql|json|jsonl|ndjson|ya?ml|ini|conf|cfg|toml|properties|xml|out|err|eml|msg)$|(?:^|[\\/])\.env(?:\.[\w.-]+)?$/i;
const CLE_RX = /(?:^|[\\/])(?:cle-[^\\/]*|[^\\/]*NE-JAMAIS-PARTAGER[^\\/]*|registre[^\\/]*\.json|journal-ia)(?:[\\/]|$)|-decode-/i;
const COPIE_CODEE_RX = /-anonymise(?:\.[\w-]+)+$/i;

/* Le dossier protégé qui contient `p`, ou null. */
export function dossierProtege(p) {
  let d = path.resolve(p);
  try { if (!fs.statSync(d).isDirectory()) d = path.dirname(d); } catch { d = path.dirname(d); }
  for (;;) {
    const ht = path.join(d, OUTDIR);
    if (fs.existsSync(path.join(ht, ".nanomizer-repere")) || fs.existsSync(path.join(ht, "reglages.json")) || fs.existsSync(path.join(ht, "licence.txt"))) return d;
    const up = path.dirname(d);
    if (up === d) return null;
    d = up;
  }
}

/* Le verdict sur UN chemin : null (permis) ou la raison du refus. */
export function verdictChemin(p, { lecture = true } = {}) {
  const abs = path.resolve(p);
  const racine = dossierProtege(abs);
  if (!racine) return null;
  const rel = path.relative(racine, abs);
  if (!rel || rel === ".") return lecture ? "le dossier de travail Hidden Tokens en entier" : null;
  if (CLE_RX.test(rel)) return "la clé de correspondance ou un fichier décodé";
  const dansSortie = rel === OUTDIR || rel.startsWith(OUTDIR + path.sep);
  if (dansSortie) return COPIE_CODEE_RX.test(rel) || !lecture ? null : (rel === OUTDIR ? "la boîte de sortie Hidden Tokens en entier (vise les copies *-anonymise.*)" : null);
  if (PIECE_RX.test(rel)) return `une pièce du dossier (${path.basename(rel)})`;
  return null;
}

/* Les pièces du dossier protégé qui contient `cwd` (noms seuls), pour juger une commande shell. */
function piecesDe(racine) {
  const out = [];
  const scan = (d, n = 0) => {
    let names = [];
    try { names = fs.readdirSync(d, { withFileTypes: true }); } catch { return; }
    for (const e of names) {
      if (e.name === OUTDIR || e.name === "node_modules" || e.name === ".git") continue;
      const p = path.join(d, e.name);
      if (e.isDirectory() && n < 3) scan(p, n + 1);
      else if (e.isFile() && PIECE_RX.test(e.name)) out.push(path.relative(racine, p));
    }
  };
  scan(racine);
  return out;
}

const echapper = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/* Le verdict sur une commande shell. */
export function verdictCommande(cmd, cwd) {
  const c = String(cmd || "");
  const racines = new Set();
  const r0 = dossierProtege(cwd || process.cwd());
  if (r0) racines.add(r0);
  // Les chemins absolus ou ~/… cités dans la commande.
  // Chemins POSIX, ~/…, et Windows (« C:\Users\… »).
  for (const m of c.matchAll(/(?:~|\/|\b[A-Za-z]:\\)[^\s'"`;|&<>()]+/g)) {
    const p = m[0].startsWith("~") ? path.join(process.env.HOME || "", m[0].slice(1)) : m[0];
    const r = dossierProtege(p);
    if (r) racines.add(r);
    if (r) { const v = verdictChemin(p); if (v && !/en entier/.test(v)) return `la commande vise ${v}`; }
  }
  if (!racines.size) return null;
  if (CLE_RX.test(c)) return "la commande vise la clé de correspondance ou un fichier décodé";
  for (const racine of racines) {
    for (const rel of piecesDe(racine)) {
      const base = path.basename(rel);
      if (new RegExp(`(?:^|[\\s'"\`/\\\\=:(])${echapper(base)}(?=$|[\\s'"\`;|&<>)])`).test(c)) return `la commande nomme une pièce du dossier (${base})`;
    }
  }
  // Parcourir tout le dossier (grep -r ., find ., cat *, rg sans chemin) sans viser les copies codées.
  const recursif = new RegExp([
    "\\b(?:grep|egrep|fgrep)\\b[^|;&]*\\s-\\w*[rR]",                  // grep -r
    "\\b(?:rg|ag|ack)\\b",                                         // ripgrep & co : récursifs d'office
    "\\bfind\\s+(?:\\.|\\$PWD|~)",                                   // find .
    "\\b(?:cat|head|tail|less|more|strings|xxd|od|jq|awk|sed|wc|cp|tar|zip|rsync|scp|base64)\\b[^|;&]*\\s(?:\\*|\\.\\/?\\*?|\\.)(?=\\s|$)", // cat *, tar … .
  ].join("|"));
  if (recursif.test(c) && !new RegExp(`${OUTDIR}/[^\\s]*anonymise`).test(c) && r0) return "la commande parcourt tout le dossier de travail (vise Hidden-Tokens/*-anonymise.*)";
  return null;
}

/* Le verdict sur un appel d'outil de Claude Code : null ou la raison. */
export function verdict({ tool_name: outil, tool_input: e = {}, cwd } = {}) {
  const base = cwd || process.cwd();
  const res = (p) => path.resolve(base, String(p));
  switch (outil) {
    case "Read": case "NotebookRead":
      return e.file_path ? verdictChemin(res(e.file_path)) : null;
    case "Edit": case "MultiEdit": case "NotebookEdit": {
      const p = e.file_path || e.notebook_path;
      return p ? verdictChemin(res(p)) : null;
    }
    case "Write": {
      // Écrire un fichier neuf est permis ; écraser une pièce ou la clé, non.
      if (!e.file_path) return null;
      const p = res(e.file_path);
      return fs.existsSync(p) ? verdictChemin(p) : (CLE_RX.test(p) && dossierProtege(p) ? "la clé de correspondance" : null);
    }
    case "Grep": case "Glob": {
      const p = res(e.path || ".");
      const v = verdictChemin(p);
      if (!v) return null;
      // Chercher dans la boîte de sortie en ne visant que les copies codées : permis.
      const motif = String(e.glob || e.pattern || "");
      if (/Hidden-Tokens/.test(p) && /anonymise/.test(motif) && outil !== "Glob") return null;
      if (outil === "Glob" && /anonymise/.test(motif)) return null;
      return v;
    }
    case "Bash":
      return verdictCommande(e.command, base);
    default:
      return null;
  }
}

const MESSAGE = (raison) =>
  `🔒 Hidden Tokens : refusé — ${raison}. Les fichiers de ce dossier sont confidentiels : ` +
  "lis-les par les outils Hidden Tokens (lister_fichiers, anonymiser_fichier — list_files, anonymise_file en anglais), puis travaille sur les copies " +
  "codées Hidden-Tokens/*-anonymise.* (Read, grep et jq y sont permis). — (EN) Blocked by Hidden Tokens: this folder's " +
  "files are confidential; open them with the Hidden Tokens tools (list_files, anonymise_file), then work on the coded copies Hidden-Tokens/*-anonymise.*.";

/* Point d'entrée du crochet. */
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  let brut = "";
  process.stdin.on("data", (x) => { brut += x; });
  process.stdin.on("end", () => {
    let raison = null;
    try { raison = verdict(JSON.parse(brut || "{}")); }
    catch (err) {
      // Fail-closed DANS un dossier protégé seulement.
      try { if (dossierProtege(JSON.parse(brut || "{}").cwd || process.cwd())) raison = "crochet de verrou en erreur (" + err.message + ")"; } catch { raison = null; }
    }
    if (raison) {
      process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: "PreToolUse", permissionDecision: "deny", permissionDecisionReason: MESSAGE(raison) } }));
    }
    process.exit(0);
  });
}
