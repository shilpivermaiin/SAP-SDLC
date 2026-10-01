// Builds a self-contained static demo into ./dist-demo (no SAP system, no Node server needed at runtime).
// Usage: npm run build:demo   -> host the dist-demo folder on any static host (GitHub Pages, Netlify, ...).
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const out = path.join(root, "dist-demo");
const webapp = path.join(root, "webapp");

function copyDir(src, dst, skip) {
	fs.mkdirSync(dst, { recursive: true });
	for (const name of fs.readdirSync(src)) {
		const s = path.join(src, name);
		if (skip && skip(s)) { continue; }
		const d = path.join(dst, name);
		if (fs.statSync(s).isDirectory()) { copyDir(s, d, skip); } else { fs.copyFileSync(s, d); }
	}
}

fs.rmSync(out, { recursive: true, force: true });

// app sources, minus the local-only mock files
copyDir(webapp, out, (p) => p === path.join(webapp, "test") || p === path.join(webapp, "localService"));
// stubs for the sap.ui.export library (not part of OpenUI5)
copyDir(path.join(webapp, "test", "stubs"), path.join(out, "stubs"));
// metadata + seed data for the in-browser mock
const ls = path.join(webapp, "localService");
fs.mkdirSync(path.join(out, "mock"), { recursive: true });
for (const f of ["metadata_main.xml", "metadata_rate.xml"]) { fs.copyFileSync(path.join(ls, f), path.join(out, "mock", f)); }
for (const dir of ["main", "rate"]) {
	fs.mkdirSync(path.join(out, "mock", dir), { recursive: true });
	for (const f of fs.readdirSync(path.join(ls, "mockdata", dir)).filter((n) => n.endsWith(".json"))) {
		fs.copyFileSync(path.join(ls, "mockdata", dir, f), path.join(out, "mock", dir, f));
	}
}
// demo entry page + in-browser OData mock (replace the real index.html)
fs.copyFileSync(path.join(root, "demo", "index.html"), path.join(out, "index.html"));
fs.copyFileSync(path.join(root, "demo", "mockserver.js"), path.join(out, "mockserver.js"));
fs.writeFileSync(path.join(out, ".nojekyll"), "");
console.log("Demo built in " + out);
