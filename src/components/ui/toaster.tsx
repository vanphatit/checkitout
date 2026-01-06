"use client"

import { useToast } from "@/hooks/use-toast"
import { Toast } from "@/components/ui/toast"

export function Toaster() {
    const { toasts, dismiss } = useToast()

    return (
        <div className="fixed top-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:flex-col md:max-w-[420px]">
            {toasts.map(({ id, title, description, variant }) => (
                <div
                    key={id}
                    className="animate-in slide-in-from-top-full fade-in-0 sm:slide-in-from-bottom-full mb-4"
                >
                    <Toast
                        id={id}
                        title={title}
                        description={description}
                        variant={variant}
                        onClose={() => dismiss(id)}
                    />
                </div>
            ))}
        </div>
    )
}
