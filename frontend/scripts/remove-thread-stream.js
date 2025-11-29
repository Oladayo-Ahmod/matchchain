const fs = require('fs');
const path = require('path');

const pkgRoot = path.join(__dirname, '..'); // frontend/
const ts = path.join(pkgRoot, 'node_modules', 'thread-stream');

const targets = [
  'test',
  'bench',
  'bench.js',
  'README.md',
  'LICENSE',
  'tsconfig.json',
  '*.md',
];

function rm(p) {
  try {
    if (fs.existsSync(p)) {
      fs.rmSync(p, { recursive: true, force: true });
      console.log('[clean-thread-stream] Removed:', p);
    }
  } catch (err) {
    console.warn('[clean-thread-stream] Failed to remove:', p, err && err.message);
  }
}

// Remove named entries
for (const t of targets) {
  // if target contains wildcard, remove matching files
  if (t.includes('*')) {
    try {
      const files = fs.readdirSync(ts);
      files.forEach(f => {
        if (f.endsWith('.md')) rm(path.join(ts, f));
      });
    } catch (e) {}
  } else {
    rm(path.join(ts, t));
  }
}
