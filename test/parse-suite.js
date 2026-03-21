#!/usr/bin/env node
// Parse-suite test runner for tree-sitter-dafny
// Uses a single tree-sitter invocation with --paths for fast batch parsing.
//
// Usage:
//   node test/parse-suite.js [--dir PATH] [--count N] [--offset N]
//                            [--verbose] [--fail-fast] [--summary]
//                            [--exclude-errors] [--only-errors] [--threshold N]

const { execFileSync } = require("child_process");
const { readdirSync, readFileSync, writeFileSync, unlinkSync } = require("fs");
const path = require("path");
const os = require("os");

// --- Parse CLI args ---
const args = process.argv.slice(2);
function flag(name) {
  return args.includes(name);
}
function opt(name, def) {
  const i = args.indexOf(name);
  return i >= 0 && i + 1 < args.length ? args[i + 1] : def;
}

const DAFNY_TEST_DIR = path.resolve(
  opt("--dir", path.resolve(__dirname, "../../dafny/Source/IntegrationTests/TestFiles/LitTests"))
);
const TS_CLI = path.resolve(
  __dirname,
  "../node_modules/tree-sitter-cli/tree-sitter.exe"
);

// --- Collect .dfy files recursively ---
function collectDfyFiles(dir) {
  const results = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectDfyFiles(full));
    } else if (entry.name.endsWith(".dfy")) {
      results.push(full);
    }
  }
  return results;
}

// --- Check if a file is an intentional error test ---
function isIntentionalErrorFile(filePath) {
  try {
    const head = readFileSync(filePath, "utf-8").slice(0, 1000);
    const firstLines = head.split("\n").slice(0, 10).join(" ");
    if (/exits-with [2-4]/.test(firstLines)) return true;
    if (/expect-exit-code=[2-4]/.test(firstLines)) return true;
    if (/complete garbage/i.test(head.slice(0, 200))) return true;
    return false;
  } catch {
    return false;
  }
}

// --- Batch parse files using single tree-sitter invocation ---
// With -q flag, only files with errors produce output lines like:
//   path/to/file.dfy   0.11 ms   73 bytes/ms  (ERROR [0, 0] - [0, 7])
function batchParse(filePaths) {
  const pathsFile = path.join(os.tmpdir(), `ts-parse-${process.pid}.txt`);
  // tree-sitter needs forward-slash paths on Windows
  writeFileSync(pathsFile, filePaths.map(f => f.replace(/\\/g, "/")).join("\n"));

  let output = "";
  try {
    output = execFileSync(TS_CLI, ["parse", "--paths", pathsFile, "-q"], {
      encoding: "utf-8",
      timeout: 600000, // 10 minutes max
      stdio: ["pipe", "pipe", "pipe"],
      maxBuffer: 50 * 1024 * 1024, // 50MB
    });
  } catch (e) {
    // tree-sitter exits non-zero when there are parse errors
    output = (e.stdout || "") + (e.stderr || "");
  }

  try { unlinkSync(pathsFile); } catch {}

  // Parse the output to find failed files and their error counts
  const failedMap = new Map();
  for (const line of output.split("\n")) {
    // Match lines like: path.dfy\t...ms\t...bytes/ms\t(ERROR ...)
    // Also match bare ERROR lines that include a file path
    const errorMatch = line.match(/^(.+\.dfy)\s+[\d.]+\s*ms/);
    if (errorMatch) {
      const file = errorMatch[1].trim();
      const errors = (line.match(/ERROR/g) || []).length;
      if (errors > 0) {
        // Normalize path for matching
        const normalized = path.resolve(file);
        failedMap.set(normalized, (failedMap.get(normalized) || 0) + errors);
      }
    }
  }

  return failedMap;
}

const count = parseInt(opt("--count", "500"), 10);
const offset = parseInt(opt("--offset", "0"), 10);
const verbose = flag("--verbose") || flag("-v");
const failFast = flag("--fail-fast");
const summaryOnly = flag("--summary");
const excludeErrors = flag("--exclude-errors");
const onlyErrors = flag("--only-errors");

// --- Main ---
console.log(`Collecting .dfy files from ${DAFNY_TEST_DIR} ...`);
let allFiles = collectDfyFiles(DAFNY_TEST_DIR).sort();
const totalFound = allFiles.length;

// Classify files
let errorFileCount = 0;
let validFileCount = 0;
const classified = allFiles.map((f) => {
  const isError = isIntentionalErrorFile(f);
  if (isError) errorFileCount++;
  else validFileCount++;
  return { path: f, isError };
});

if (excludeErrors) {
  allFiles = classified.filter((f) => !f.isError).map((f) => f.path);
  console.log(
    `Found ${totalFound} total .dfy files (${errorFileCount} intentional-error, ${validFileCount} valid Dafny)`
  );
  console.log(`Excluding ${errorFileCount} intentional-error files`);
} else if (onlyErrors) {
  allFiles = classified.filter((f) => f.isError).map((f) => f.path);
  console.log(
    `Found ${totalFound} total .dfy files (${errorFileCount} intentional-error, ${validFileCount} valid Dafny)`
  );
  console.log(`Testing only ${errorFileCount} intentional-error files`);
} else {
  console.log(`Found ${totalFound} total .dfy files`);
}

const files = allFiles.slice(offset, offset + count);
console.log(
  `Testing ${files.length} files (offset=${offset}, count=${count})\n`
);

const startAll = performance.now();

// Run single batch parse
const failedMap = batchParse(files);

const passed = [];
const failed = [];

for (const f of files) {
  const rel = path.relative(DAFNY_TEST_DIR, f);
  const normalized = path.resolve(f);
  const errors = failedMap.get(normalized) || 0;

  if (errors === 0) {
    passed.push({ file: rel, errors: 0 });
    if (!summaryOnly) {
      process.stdout.write(`  \x1b[32m✓\x1b[0m ${rel}\n`);
    }
  } else {
    failed.push({ file: rel, errors });
    if (!summaryOnly) {
      process.stdout.write(
        `  \x1b[31m✗\x1b[0m ${rel} (${errors} errors)\n`
      );
    }
  }
}

const totalMs = performance.now() - startAll;
const total = passed.length + failed.length;
const pct = total > 0 ? ((passed.length / total) * 100).toFixed(1) : "0.0";

// --- Summary ---
console.log("\n" + "=".repeat(60));
console.log(`Results: ${passed.length}/${total} passed (${pct}%)`);
console.log(`         ${failed.length} failed`);
console.log(`Time:    ${(totalMs / 1000).toFixed(1)}s`);
console.log("=".repeat(60));

if (verbose && failed.length > 0) {
  console.log("\nFailed files:");
  for (const f of failed) {
    console.log(`  ${f.file} (${f.errors} errors)`);
  }
}

if (!verbose && !summaryOnly && failed.length > 0 && failed.length <= 30) {
  console.log("\nFailed files:");
  for (const f of failed) {
    console.log(`  ${f.file}`);
  }
}

if (failed.length > 0 && !verbose && failed.length > 30) {
  console.log(`\n(${failed.length} failures — use --verbose to list all)`);
}

// Exit code: 0 if >= threshold, 1 otherwise
const threshold = parseFloat(opt("--threshold", "0"));
if (threshold > 0 && parseFloat(pct) < threshold) {
  console.log(`\nFAIL: ${pct}% < ${threshold}% threshold`);
  process.exit(1);
}
