"use client"

import { X } from "lucide-react"
import * as React from "react"
import type { ToastProps } from "@/hooks/use-toast"

export interface ToastActionElement {
    altText: string
    onClick: () => void
    label: string
}

const Toast = React.forwardRef<
    HTMLDivElement,
    ToastProps & { onClose: () => void }
>(({ id, title, description, variant = "default", onClose }, ref) => {
    return (
        <div
            ref={ref}
            className={`
        pointer-events-auto flex w-full max-w-md rounded-lg border p-4 shadow-lg transition-all
        ${variant === "destructive"
                    ? "border-red-200 bg-red-50 text-red-900"
                    : "border-neutral-200 bg-white text-neutral-900"
                }
      `}
        >
            <div className="flex-1">
                {title && (
                    <div className={`text-sm font-semibold ${variant === "destructive" ? "text-red-900" : "text-neutral-900"}`}>
                        {title}
                    </div>
                )}
                {description && (
                    <div className={`mt-1 text-sm ${variant === "destructive" ? "text-red-800" : "text-neutral-600"}`}>
                        {description}
                    </div>
                )}
            </div>
            <button
                onClick={onClose}
                className={`ml-4 inline-flex h-5 w-5 items-center justify-center rounded-md transition-colors
          ${variant === "destructive"
                        ? "text-red-700 hover:bg-red-100"
                        : "text-neutral-500 hover:bg-neutral-100"
                    }
        `}
            >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
            </button>
        </div>
    )
})
Toast.displayName = "Toast"

export { Toast }
