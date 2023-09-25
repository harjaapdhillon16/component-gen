"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { ReloadIcon } from "@radix-ui/react-icons"
import axios from "axios"

import { siteConfig } from "@/config/site"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const CodeBox = ({ code }: { code: string }) => {
  return (
    <div className=" rounded-md bg-gray-800 p-4">
      <pre className="font-mono text-sm text-white overflow-auto h-full">
        <code>{code}</code>
      </pre>
    </div>
  )
}

export default function IndexPage() {
  const [loading, setLoading] = useState(false)
  const [input, setInput] = useState("")
  const iframeRef = useRef(null)
  const [generatedCode, setGeneratedCode] = useState("")
  const fetchAllFunctions = useCallback(async () => {
    setLoading(true)
    const { data } = await axios.post("/api/hello", {
      input: input,
    })
    const sanitizedCode = data?.message
      ?.replace("```jsx", "")
      .replace("```", "")
    runCode(sanitizedCode)
    setGeneratedCode(sanitizedCode)
    setLoading(false)
  }, [input])

  const runCode = (code: string) => {
    console.log("code run happned")
    const iframe = iframeRef.current
    if (iframe) {
      const doc = (iframe as any).contentDocument
      ;(iframe as any).setAttribute("type", "module")

      // Prepare the scripts
      const reactScript = document.createElement("script")
      reactScript.src = "https://unpkg.com/react@17/umd/react.development.js"

      const reactDOMScript = document.createElement("script")
      reactDOMScript.src =
        "https://unpkg.com/react-dom@17/umd/react-dom.development.js"

      // When React and ReactDOM scripts are loaded, inject the user's code
      reactDOMScript.onload = () => {
        const script = document.createElement("script")

        // Assume the main component the user creates is named 'App'
        // and try to render it to the body of the iframe
        script.textContent = `
          ${code}
          ReactDOM.render(React.createElement(App), document.body);
        `
        doc.body.appendChild(script)
      }

      // Append the React and ReactDOM scripts
      doc.body.appendChild(reactScript)
      doc.body.appendChild(reactDOMScript)
    }
  }

  return (
    <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
      <div className="flex max-w-[980px] flex-col items-start gap-2">
        <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
          Create Prompt Based UI{`'`}s with JUTSU X GPT4 API{`'`}s
        </h1>
        <p className="max-w-[700px] text-lg text-muted-foreground">
          Type in a prompt and see the result !
        </p>
      </div>
      <div className="flex gap-4">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Your Prompt"
        />
        <Button disabled={loading} onClick={() => fetchAllFunctions()}>
          {loading && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />}
          {loading ? "Generating" : "Generate"}
        </Button>
      </div>
      <div
        className={`grid grid-cols-1 gap-2 md:grid-cols-2 ${
          Boolean(generatedCode) ? "" : "hidden"
        }`}
      >
        <CodeBox code={generatedCode} />
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              height: "100%",
              justifyContent: "center",
            }}
          >
            VM CODE TO RUN OUR CODE
          </div>
        </div>
      </div>
    </section>
  )
}
