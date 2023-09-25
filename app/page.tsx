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
    runCodeInIframe(sanitizedCode)
    setGeneratedCode(sanitizedCode)
    setLoading(false)
  }, [input])

  const runCodeInIframe = (code: string) => {
    console.log("code run happned")
    const iframe = iframeRef.current
    if (iframe) {
      const doc = (iframe as any).contentDocument

      // Load React and ReactDOM from CDNs
      const reactScript = document.createElement("script")
      reactScript.src = "https://unpkg.com/react@17/umd/react.development.js"
      doc.body.appendChild(reactScript)

      const reactDOMScript = document.createElement("script")
      reactDOMScript.src =
        "https://unpkg.com/react-dom@17/umd/react-dom.development.js"
      doc.body.appendChild(reactDOMScript)

      reactDOMScript.onload = () => {
        const script = document.createElement("script")

        // Convert ES6 imports to UMD/global references in the `code`
        // For instance, replace `import React from 'react'` with a global `React`
        // This example assumes no such imports; modify as needed.

        script.textContent = `
          ${code.replace("import React from 'react';", "")}
          ReactDOM.render(React.createElement(App), document.body);
        `
        doc.body.appendChild(script)
      }
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
      {Boolean(generatedCode) && (
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          <CodeBox code={generatedCode} />
          <div>
            <iframe
              ref={iframeRef}
              style={{
                width: "100%",
                height: "100%",
                borderRadius: 5,
                border: "1px solid black",
              }}
            />
          </div>
        </div>
      )}
    </section>
  )
}
