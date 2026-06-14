# Color Provider Everywhere

Show the native VS Code color picker in **every** file — even in languages
where no extension registers a color provider (or registers one that returns
no colors) — **without ever creating duplicate color decorators**.

## Why

VS Code shows an inline, clickable color swatch (the color picker) through a
`DocumentColorProvider`. It also ships a built-in *default* provider that
detects colors by pattern. That default only engages when **no other**
provider claims the document.

The catch: if a language extension registers a color provider that returns an
empty result — common for templating languages like Twig, Blade, Liquid,
Nunjucks — VS Code considers the document "handled" and suppresses the default
provider. The result: no color picker, even though the file is full of hex
colors. (You may have noticed colors appear in a diff/timeline view but not in
the editor — that's because the language provider doesn't run on the `git:`
scheme there, so the default kicks back in.)

## How it works

This extension registers a single color provider for all languages. Before it
contributes anything, it asks VS Code what colors **everyone else** would show
for the document via `vscode.executeDocumentColorProvider`. A re-entrancy guard
makes this provider invisible during that probe, so the answer reflects only
the other providers and VS Code's own default decorator.

- If that result is **non-empty**, this provider stays out of the way — so you
  never get two pickers stacked on the same color.
- If it's **empty**, this provider fills the gap by detecting `#hex`,
  `rgb()/rgba()`, and `hsl()/hsla()` colors.

In short: it behaves exactly like VS Code's default color decorator, but it
also engages in the cases where the platform incorrectly considers a document
"already handled."

## Settings

| Setting | Default | Description |
| --- | --- | --- |
| `colorProviderEverywhere.enabled` | `true` | Enable the fallback color picker. |

## Development

```bash
pnpm install
pnpm dev        # build & watch
```

Press <kbd>F5</kbd> to launch the Extension Development Host.

## License

[MIT](./LICENSE.md)
