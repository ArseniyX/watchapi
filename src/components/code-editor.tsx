"use client";

import Editor from "@monaco-editor/react";

interface CodeEditorProps {
    value?: string;
    onChange?: (value: string) => void;
    language?: string;
    readOnly?: boolean;
}

export function CodeEditor({
    value = "",
    onChange,
    language = "json",
    readOnly = false,
}: CodeEditorProps) {
    const handleChange = (newValue: string | undefined) => {
        const val = newValue || "";
        onChange?.(val);
    };

    return (
        <div className="h-full bg-card">
            <Editor
                height="100%"
                language={language}
                value={value}
                onChange={handleChange}
                theme="vs-dark"
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
