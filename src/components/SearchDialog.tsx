import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

interface PagefindResult {
  id: string
  data: () => Promise<PagefindResultData>
}

interface PagefindResultData {
  url: string
  meta: { title?: string; image?: string }
  excerpt: string
  content: string
  sub_results: {
    title: string
    url: string
    excerpt: string
  }[]
}

interface SearchResult {
  url: string
  title: string
  excerpt: string
}

let pagefindInstance: any = null

async function getPagefind() {
  if (pagefindInstance) return pagefindInstance
  try {
    // Use dynamic URL to prevent Vite from resolving at dev time
    const url = "/pagefind/pagefind.js"
    pagefindInstance = await import(/* @vite-ignore */ url)
    await pagefindInstance.init()
    return pagefindInstance
  } catch {
    console.warn("Pagefind not available — run a build first to generate the index.")
    return null
  }
}

export function SearchDialog() {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [results, setResults] = React.useState<SearchResult[]>([])
  const [loading, setLoading] = React.useState(false)
  const [activeIndex, setActiveIndex] = React.useState(-1)
  const [isMac, setIsMac] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const resultListRef = React.useRef<HTMLUListElement>(null)
  const debounceRef = React.useRef<ReturnType<typeof setTimeout>>()

  // 检测是否为 Mac 系统
  React.useEffect(() => {
    setIsMac(/Mac|iPhone|iPad|iPod/.test(navigator.userAgent))
  }, [])

  // Ctrl+K / Cmd+K shortcut
  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setOpen((v) => !v)
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [])

  // Focus input when dialog opens
  React.useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100)
    } else {
      setQuery("")
      setResults([])
      setActiveIndex(-1)
    }
  }, [open])

  // Debounced search
  React.useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!query.trim()) {
      setResults([])
      setLoading(false)
      return
    }

    setLoading(true)
    debounceRef.current = setTimeout(async () => {
      const pf = await getPagefind()
      if (!pf) {
        setLoading(false)
        return
      }

      const search = await pf.search(query)
      const mapped: SearchResult[] = []
      // Load first 8 results
      for (const r of search.results.slice(0, 8) as PagefindResult[]) {
        const data = await r.data()
        mapped.push({
          url: data.url,
          title: data.meta?.title || "Untitled",
          excerpt: data.excerpt,
        })
      }
      setResults(mapped)
      setActiveIndex(-1)
      setLoading(false)
    }, 250)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query])

  return (
    <>
      {/* Desktop trigger */}
      <button
        onClick={() => setOpen(true)}
        className="relative hidden sm:flex items-center h-9 w-36 lg:w-64 rounded-md border border-input bg-background pl-9 pr-3 text-sm text-muted-foreground ring-offset-background hover:bg-accent/50 transition-all cursor-pointer"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="absolute left-3 top-1/2 -translate-y-1/2 size-4 pointer-events-none"
        >
          <path d="M18.031 16.6168L22.3137 20.8995L20.8995 22.3137L16.6168 18.031C15.0769 19.263 13.124 20 11 20C6.032 20 2 15.968 2 11C2 6.032 6.032 2 11 2C15.968 2 20 6.032 20 11C20 13.124 19.263 15.0769 18.031 16.6168ZM16.0247 15.8748C17.2475 14.6146 18 12.8956 18 11C18 7.1325 14.8675 4 11 4C7.1325 4 4 7.1325 4 11C4 14.8675 7.1325 18 11 18C12.8956 18 14.6146 17.2475 15.8748 16.0247L16.0247 15.8748Z" />
        </svg>
        <span>搜索</span>
        <div className="ml-auto pointer-events-none hidden h-5 select-none items-center gap-1 sm:flex">
          <kbd className="rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">
            <span className="text-xs">{isMac ? "Cmd" : "Ctrl"}</span>
          </kbd>
          <kbd className="rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">
            <span className="text-xs">K</span>
          </kbd>
        </div>
      </button>

      {/* Mobile trigger */}
      <button
        onClick={() => setOpen(true)}
        className="sm:hidden flex items-center justify-center size-9 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
        aria-label="搜索"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="size-4"
        >
          <path d="M18.031 16.6168L22.3137 20.8995L20.8995 22.3137L16.6168 18.031C15.0769 19.263 13.124 20 11 20C6.032 20 2 15.968 2 11C2 6.032 6.032 2 11 2C15.968 2 20 6.032 20 11C20 13.124 19.263 15.0769 18.031 16.6168ZM16.0247 15.8748C17.2475 14.6146 18 12.8956 18 11C18 7.1325 14.8675 4 11 4C7.1325 4 4 7.1325 4 11C4 14.8675 7.1325 18 11 18C12.8956 18 14.6146 17.2475 15.8748 16.0247L16.0247 15.8748Z" />
        </svg>
      </button>

      {/* Search Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showCloseButton={false}
          className="sm:max-w-xl p-0 gap-0 overflow-hidden top-[20%] translate-y-0"
        >
          <DialogTitle className="sr-only">搜索文章</DialogTitle>
          {/* Search Input */}
          <div className="flex items-center border-b px-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="size-4 shrink-0 text-muted-foreground"
            >
              <path d="M18.031 16.6168L22.3137 20.8995L20.8995 22.3137L16.6168 18.031C15.0769 19.263 13.124 20 11 20C6.032 20 2 15.968 2 11C2 6.032 6.032 2 11 2C15.968 2 20 6.032 20 11C20 13.124 19.263 15.0769 18.031 16.6168ZM16.0247 15.8748C17.2475 14.6146 18 12.8956 18 11C18 7.1325 14.8675 4 11 4C7.1325 4 4 7.1325 4 11C4 14.8675 7.1325 18 11 18C12.8956 18 14.6146 17.2475 15.8748 16.0247L16.0247 15.8748Z" />
            </svg>
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault()
                  setActiveIndex((prev) => {
                    const next = prev < results.length - 1 ? prev + 1 : 0
                    requestAnimationFrame(() => {
                      resultListRef.current?.children[next]?.scrollIntoView({ block: "nearest" })
                    })
                    return next
                  })
                } else if (e.key === "ArrowUp") {
                  e.preventDefault()
                  setActiveIndex((prev) => {
                    const next = prev > 0 ? prev - 1 : results.length - 1
                    requestAnimationFrame(() => {
                      resultListRef.current?.children[next]?.scrollIntoView({ block: "nearest" })
                    })
                    return next
                  })
                } else if (e.key === "Enter" && activeIndex >= 0 && activeIndex < results.length) {
                  e.preventDefault()
                  setOpen(false)
                  window.location.href = results[activeIndex].url
                }
              }}
              placeholder="搜索文章..."
              className="flex h-11 w-full bg-transparent py-3 px-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="shrink-0 rounded-sm opacity-50 hover:opacity-100 transition-opacity cursor-pointer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="size-4"
                >
                  <path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 10.5858L9.17157 7.75736L7.75736 9.17157L10.5858 12L7.75736 14.8284L9.17157 16.2426L12 13.4142L14.8284 16.2426L16.2426 14.8284L13.4142 12L16.2426 9.17157L14.8284 7.75736L12 10.5858Z" />
                </svg>
              </button>
            )}
          </div>

          {/* Results */}
          <ScrollArea className="max-h-[min(60vh,400px)]" client:load>
            <div className="p-2">
              {loading && (
                <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                  <svg className="animate-spin size-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  搜索中...
                </div>
              )}

              {!loading && query && results.length === 0 && (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="size-10 mx-auto mb-2 opacity-30"
                  >
                    <path d="M18.031 16.6168L22.3137 20.8995L20.8995 22.3137L16.6168 18.031C15.0769 19.263 13.124 20 11 20C6.032 20 2 15.968 2 11C2 6.032 6.032 2 11 2C15.968 2 20 6.032 20 11C20 13.124 19.263 15.0769 18.031 16.6168ZM16.0247 15.8748C17.2475 14.6146 18 12.8956 18 11C18 7.1325 14.8675 4 11 4C7.1325 4 4 7.1325 4 11C4 14.8675 7.1325 18 11 18C12.8956 18 14.6146 17.2475 15.8748 16.0247L16.0247 15.8748Z" />
                  </svg>
                  未找到相关文章
                </div>
              )}

              {!loading && !query && (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  输入关键词搜索文章
                </div>
              )}

              {!loading && results.length > 0 && (
                <ul ref={resultListRef} className="space-y-1">
                  {results.map((result, i) => (
                    <li key={i}>
                      <a
                        href={result.url}
                        className={`flex flex-col gap-1 rounded-md px-3 py-2.5 transition-colors ${i === activeIndex ? "bg-accent" : "hover:bg-accent"}`}
                        onMouseEnter={() => setActiveIndex(i)}
                        onClick={() => setOpen(false)}
                      >
                        <span className="text-sm font-medium leading-tight">
                          {result.title}
                        </span>
                        <span
                          className="text-xs text-muted-foreground leading-relaxed line-clamp-2 [&_mark]:bg-primary/20 [&_mark]:text-foreground [&_mark]:rounded-sm"
                          dangerouslySetInnerHTML={{ __html: result.excerpt }}
                        />
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="flex items-center justify-between border-t px-3 py-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="rounded border bg-muted px-1 py-0.5 font-mono text-[10px]">↑↓</kbd>
                导航
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border bg-muted px-1 py-0.5 font-mono text-[10px]">Enter</kbd>
                打开
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border bg-muted px-1 py-0.5 font-mono text-[10px]">Esc</kbd>
                关闭
              </span>
            </div>
            <span className="opacity-60">Pagefind</span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
