/** Keep in sync with --port in package.json `dev` script */
const PORT = 3100;

console.log(`
${"=".repeat(58)}
  KABUKI — after you see "Ready", open THIS in Chrome/Safari:

    http://127.0.0.1:${PORT}

  Cursor’s built-in browser often fails; use a normal browser.
${"=".repeat(58)}
`);
