import Giscus from "@giscus/react"
import { useEffect, useState } from "react"

type GiscusTheme = "light" | "dark_dimmed"

const resolveTheme = (): GiscusTheme => {
  const currentTheme = document.documentElement.dataset["theme"]
  return currentTheme === "light" ? "light" : "dark_dimmed"
}

export const ThemedGiscus = () => {
  const [theme, setTheme] = useState<GiscusTheme>(resolveTheme())

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setTheme(resolveTheme())
    })
    observer.observe(document.documentElement, { attributeFilter: ["data-theme"] })

    return () => {
      observer.disconnect()
    }
  }, [])

  return (
    <Giscus
      id="comments"
      repo="adamhl8/adamhl.dev"
      repoId="R_kgDONCeP3A"
      category="Comments"
      categoryId="DIC_kwDONCeP3M4CwFGz"
      mapping="pathname"
      reactionsEnabled="1"
      inputPosition="top"
      theme={theme}
      lang="en"
    />
  )
}
