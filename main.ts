// Four Winds Duel — the hand-in program (Node 22, standard library only).
//
// It copies this repository's game/ and screenshots/ into the output directory
// and writes /output/dossier.json with make.fun's vendored library, so the
// sealed scorer can check the game and the judge can read it. Outside the
// grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

// The repository root: the directory this file lives in.
const repoRoot = fileURLToPath(new URL('.', import.meta.url));

// The grader writes to /output; a local run writes wherever the env var says.
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Start from a clean output directory so a stale file can never ride along.
rmSync(outputDir, { recursive: true, force: true });
mkdirSync(outputDir, { recursive: true });

// The playable game, exactly as it sits in the repository.
cpSync(join(repoRoot, 'game'), join(outputDir, 'game'), { recursive: true });

// The screenshots, when the repository holds them.
const shotsDir = join(repoRoot, 'screenshots');
if (existsSync(shotsDir)) {
  cpSync(shotsDir, join(outputDir, 'screenshots'), { recursive: true });
}

// The dossier: the same caps the bounty's gate uses, so this program refuses
// exactly where the scorer would — a bad entry fails here, loudly, not later.
const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
writeFileSync(join(outputDir, 'dossier.json'), dossier);

// A short summary on stdout, so a local run shows what it handed in.
console.log(`Four Winds Duel: wrote ${outputDir} (game/, screenshots/, dossier.json ${dossier.length} bytes)`);
