"use client";

import { useEffect, useState } from "react";
import Editor from "@monaco-editor/react";

interface CodeEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  language?: string;
  readOnly?: boolean;
  placeholder?: string;
  height?: string;
}

export function CodeEditor({
  value = "",
  onChange,
  language = "json",
  readOnly = false,
  placeholder = "",
  height = "100%",
}: CodeEditorProps) {
  const [theme, setTheme] = useState<"vs-dark" | "light">("vs-dark");

  useEffect(() => {
    // Check if dark mode is active
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "vs-dark" : "light");

    // Watch for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          const isDark = document.documentElement.classList.contains("dark");
          setTheme(isDark ? "vs-dark" : "light");
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const handleChange = (newValue: string | undefined) => {
    const val = newValue || "";
    onChange?.(val);
  };

  return (
    <div
      className="border rounded-md overflow-hidden"
      style={{ height, paddingTop: "0.5rem" }}
    >
      <Editor
        height="100%"
        language={language}
        value={value || placeholder}
        onChange={handleChange}
        theme={theme}
        options={{
          minimap: { enabled: false },
          fontSize: 12,
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: "on",
          folding: true,
          autoClosingBrackets: readOnly ? "never" : "always",
          autoClosingQuotes: readOnly ? "never" : "always",
          formatOnPaste: !readOnly,
          formatOnType: !readOnly,
          readOnly: readOnly,
          readOnlyMessage: {
            value: null as any,
          },
          bracketPairColorization: {
            enabled: true,
          },
        }}
      />
    </div>
  );
}
