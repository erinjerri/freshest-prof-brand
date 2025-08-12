export function richTextToPlainText(state: any, maxLen = 200): string {
  try {
    const nodes = state?.root?.children
    if (!Array.isArray(nodes)) return ''
    const walk = (n: any): string => {
      if (!n) return ''
      if (Array.isArray(n)) return n.map(walk).join(' ')
      if (typeof n !== 'object') return ''
      if (n.type === 'text') return n.text || ''
      return walk(n.children || [])
    }
    const text = walk(nodes).replace(/\s+/g, ' ').trim()
    return text.length > maxLen ? `${text.slice(0, maxLen).trim()}…` : text
  } catch {
    return ''
  }
}
