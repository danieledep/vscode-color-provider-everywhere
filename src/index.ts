import type {
  CancellationToken,
  DocumentColorProvider,
  ProviderResult,
  Range as RangeType,
  TextDocument,
} from 'vscode'
import { defineExtension, useDisposable } from 'reactive-vscode'
import {
  Color,
  ColorInformation,
  ColorPresentation,
  commands,
  languages,
  Range,
  workspace,
} from 'vscode'

// --- Color pattern matching ---------------------------------------------

// #rgb, #rgba, #rrggbb, #rrggbbaa
const HEX_RE = /(?<![\w#])#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{4}|[0-9a-f]{3})(?![0-9a-f])/gi
// rgb()/rgba()/hsl()/hsla(), comma- or space-separated, optional `/ alpha`
const FUNC_RE = /\b(?:rgba?|hsla?)\([^)]*\)/gi

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, Number.isFinite(n) ? n : 0))
}

function parseHex(hex: string): Color | undefined {
  let h = hex.slice(1)
  if (h.length === 3 || h.length === 4)
    h = h.split('').map(c => c + c).join('')
  if (h.length !== 6 && h.length !== 8)
    return undefined
  const r = Number.parseInt(h.slice(0, 2), 16) / 255
  const g = Number.parseInt(h.slice(2, 4), 16) / 255
  const b = Number.parseInt(h.slice(4, 6), 16) / 255
  const a = h.length === 8 ? Number.parseInt(h.slice(6, 8), 16) / 255 : 1
  return new Color(r, g, b, a)
}

function channel(token: string, max: number): number {
  const t = token.trim()
  return t.endsWith('%')
    ? clamp01(Number.parseFloat(t) / 100)
    : clamp01(Number.parseFloat(t) / max)
}

function alpha(token: string): number {
  const t = token.trim()
  return t.endsWith('%') ? clamp01(Number.parseFloat(t) / 100) : clamp01(Number.parseFloat(t))
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h = (((h % 360) + 360) % 360) / 360
  if (s === 0)
    return [l, l, l]
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q
  const hue = (t: number): number => {
    if (t < 0)
      t += 1
    if (t > 1)
      t -= 1
    if (t < 1 / 6)
      return p + (q - p) * 6 * t
    if (t < 1 / 2)
      return q
    if (t < 2 / 3)
      return p + (q - p) * (2 / 3 - t) * 6
    return p
  }
  return [hue(h + 1 / 3), hue(h), hue(h - 1 / 3)]
}

function parseFunc(text: string): Color | undefined {
  const isHsl = /^hsl/i.test(text)
  const inner = text.slice(text.indexOf('(') + 1, text.lastIndexOf(')'))
  const [body, slashAlpha] = inner.split('/')
  const parts = body.trim().split(/[\s,]+/).filter(Boolean)
  if (parts.length < 3)
    return undefined

  let r: number, g: number, b: number
  if (isHsl) {
    [r, g, b] = hslToRgb(Number.parseFloat(parts[0]), channel(parts[1], 100), channel(parts[2], 100))
  }
  else {
    r = channel(parts[0], 255)
    g = channel(parts[1], 255)
    b = channel(parts[2], 255)
  }
  const alphaToken = slashAlpha ?? parts[3]
  return new Color(r, g, b, alphaToken === undefined ? 1 : alpha(alphaToken))
}

function scanColors(document: TextDocument): ColorInformation[] {
  const text = document.getText()
  const colors: ColorInformation[] = []

  const add = (index: number, raw: string, color: Color | undefined): void => {
    if (!color)
      return
    const range = new Range(document.positionAt(index), document.positionAt(index + raw.length))
    colors.push(new ColorInformation(range, color))
  }

  for (const m of text.matchAll(HEX_RE))
    add(m.index, m[0], parseHex(m[0]))
  for (const m of text.matchAll(FUNC_RE))
    add(m.index, m[0], parseFunc(m[0]))

  return colors
}

// --- Color presentations (what gets written back when picking) ----------

function round(n: number): number {
  return Math.round(n * 100) / 100
}

function toHex(c: Color): string {
  const h = (n: number): string => Math.round(clamp01(n) * 255).toString(16).padStart(2, '0')
  const base = `#${h(c.red)}${h(c.green)}${h(c.blue)}`
  return c.alpha < 1 ? `${base}${h(c.alpha)}` : base
}

function toRgb(c: Color): string {
  const v = (n: number): number => Math.round(clamp01(n) * 255)
  return c.alpha < 1
    ? `rgba(${v(c.red)}, ${v(c.green)}, ${v(c.blue)}, ${round(c.alpha)})`
    : `rgb(${v(c.red)}, ${v(c.green)}, ${v(c.blue)})`
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  let h = 0
  let s = 0
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    if (max === r)
      h = (g - b) / d + (g < b ? 6 : 0)
    else if (max === g)
      h = (b - r) / d + 2
    else
      h = (r - g) / d + 4
    h /= 6
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)]
}

function toHsl(c: Color): string {
  const [h, s, l] = rgbToHsl(c.red, c.green, c.blue)
  return c.alpha < 1 ? `hsla(${h}, ${s}%, ${l}%, ${round(c.alpha)})` : `hsl(${h}, ${s}%, ${l}%)`
}

// --- Provider -----------------------------------------------------------

// Documents currently being probed. While a URI is in this set our own
// provider returns nothing, so `vscode.executeDocumentColorProvider`
// reports exactly what *everyone else* (incl. VS Code's built-in default
// provider) would show. We only fill in when that result is empty, which
// guarantees we never stack a second picker on top of an existing one.
const probing = new Set<string>()

const provider: DocumentColorProvider = {
  async provideDocumentColors(document: TextDocument, token: CancellationToken): Promise<ColorInformation[]> {
    if (!workspace.getConfiguration('colorProviderEverywhere').get<boolean>('enabled', true))
      return []

    const key = document.uri.toString()
    if (probing.has(key))
      return []

    probing.add(key)
    try {
      const existing = await commands.executeCommand<ColorInformation[]>(
        'vscode.executeDocumentColorProvider',
        document.uri,
      )
      if (token.isCancellationRequested)
        return []
      // Someone else already handles this document — stay out of the way.
      if (existing && existing.length > 0)
        return []
      return scanColors(document)
    }
    finally {
      probing.delete(key)
    }
  },

  provideColorPresentations(
    color: Color,
    _context: { document: TextDocument, range: RangeType },
  ): ProviderResult<ColorPresentation[]> {
    return [toHex(color), toRgb(color), toHsl(color)].map(label => new ColorPresentation(label))
  },
}

const { activate, deactivate } = defineExtension(() => {
  useDisposable(languages.registerColorProvider('*', provider))
})

export { activate, deactivate }
