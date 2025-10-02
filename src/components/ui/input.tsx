import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
    return (
        <input
            type={type}
            data-slot="input"
            className={cn(
                "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground bg-background dark:bg-input/50 h-10 w-full min-w-0 rounded-md border-2 px-3 py-2 text-base shadow-sm transition-[color,box-shadow,border-color] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                "focus-visible:border-primary focus-visible:ring-primary/20 focus-visible:ring-4",
                "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
                "hover:border-primary/50",
                className
            )}
            {...props}
        />
    );
}

export { Input };
