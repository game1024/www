import { useEffect, useState } from "react"
import { Icon } from "@iconify/react"

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light")

  useEffect(() => {
    // 获取初始主题
    const isDark = document.documentElement.classList.contains("dark")
    setTheme(isDark ? "dark" : "light")
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark")
      document.documentElement.setAttribute("data-theme", "github-dark")
      localStorage.setItem("theme", "dark")
    } else {
      document.documentElement.classList.remove("dark")
      document.documentElement.setAttribute("data-theme", "github-light")
      localStorage.setItem("theme", "light")
    }
  }

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center justify-center size-9 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
      aria-label="切换主题"
    >
      <Icon
        icon={theme === "light" ? "ri:sun-line" : "ri:moon-line"}
        className="size-4"
      />
    </button>
  )
}
