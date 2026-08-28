import { codeToHtml } from 'shiki'

export type CodeBlockProps = {
  code: string
  language?: string
}

/**
 * Server-rendered, syntax-highlighted code block (shiki, highlighted at
 * request/build time — zero client JS). Falls back to plain text if the
 * language grammar isn't recognized, so the build never fails on user input.
 */
export async function CodeBlock({ code, language }: CodeBlockProps) {
  const lang = (language || 'text').toLowerCase()

  let html: string
  try {
    html = await codeToHtml(code, { lang, theme: 'github-dark' })
  } catch {
    html = await codeToHtml(code, { lang: 'text', theme: 'github-dark' })
  }

  return (
    <figure className="my-8 overflow-hidden rounded-xl bg-foreground text-background">
      {language ? (
        <figcaption className="flex items-center justify-between border-b border-background/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-background/70">
          <span>{language}</span>
        </figcaption>
      ) : null}
      <div
        className="overflow-x-auto px-4 py-4 font-mono text-[13.5px] leading-[1.7]"
        // shiki returns a self-contained <pre><code> string; safe (server-generated).
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </figure>
  )
}
