# Color Provider Everywhere

Shows VS Code's native color picker in every file — including languages where no extension provides one, or provides one that returns no colors — without ever stacking duplicate swatches.

## Why

Color swatches come from a `DocumentColorProvider`. VS Code's built-in default only runs when no other provider claims the document. Some language extensions (Twig, Blade, Liquid, Nunjucks…) register a provider that returns nothing, so VS Code treats the file as handled and shows no picker — even when it's full of hex colors.

## How it works

It registers one provider for all languages. Before returning anything, it asks VS Code what every other provider would show via `vscode.executeDocumentColorProvider`, staying invisible during that check:

- Non-empty result → it returns nothing, so swatches never stack.
- Empty result → it fills in, matching `#hex`, `rgb()`/`rgba()`, and `hsl()`/`hsla()`.

The effect: it mirrors VS Code's default color decorator, and also engages when the platform wrongly treats a file as already handled.

## Settings

| Setting | Default | Description |
| --- | --- | --- |
| `colorProviderEverywhere.enabled` | `true` | Enable the fallback color picker. |

## Development

```bash
pnpm install
pnpm dev    # build & watch
```

Press F5 to launch the Extension Development Host.

## License

[MIT](./LICENSE.md)
