"use client"

import { useState } from "react"

export function CodeEditor() {
  const [code, setCode] = useState(`{
  "email": "test1@test.test",
  "password": "{{passTestUser1}}",
  "returnSecureToken": true
}`)

  return (
    <div className="h-full bg-card">
      <div className="flex h-full">
        <div className="flex flex-col border-r border-border bg-muted px-2 py-3 text-right font-mono text-xs text-muted-foreground">
          {code.split("\n").map((_, i) => (
            <div key={i} className="leading-6">
              {i + 1}
            </div>
          ))}
        </div>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="flex-1 resize-none bg-card p-3 font-mono text-sm text-foreground outline-none"
          spellCheck={false}
        />
      </div>
    </div>
  )
}
