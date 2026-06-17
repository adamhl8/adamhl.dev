export const caddyfile = await (
  await fetch(
    "https://raw.githubusercontent.com/caddyserver/vscode-caddyfile/refs/heads/master/syntaxes/caddyfile.tmLanguage.json",
  )
).json()
