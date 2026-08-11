"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        duration: 3000,
        style: {
          background: "#1E293B",
          color: "#ffffff",
          border: "1px solid #2563EB",
          borderRadius: "0.75rem",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
