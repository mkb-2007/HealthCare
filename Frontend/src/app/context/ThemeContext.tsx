import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";

type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: (originX?: number, originY?: number) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "light",
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem("hcp-theme");
    if (stored === "dark" || stored === "light") return stored;
    return "light";
  });

  const overlayRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("hcp-theme", theme);
  }, [theme]);

  useEffect(() => {
    const savedFont = localStorage.getItem("hcp-font-size") || "medium";
    let scale = "100%";
    if (savedFont === "small") scale = "90%";
    else if (savedFont === "large") scale = "110%";
    document.documentElement.style.fontSize = scale;
  }, []);

  const toggleTheme = useCallback((originX?: number, originY?: number) => {
    const x = originX ?? window.innerWidth / 2;
    const y = originY ?? window.innerHeight / 2;

    // Compute max radius to cover the entire viewport from origin
    const maxR = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const overlay = overlayRef.current;
    if (!overlay) {
      setTheme((t) => (t === "light" ? "dark" : "light"));
      return;
    }

    const nextTheme = theme === "light" ? "dark" : "light";

    // Take a screenshot-like snapshot of current state via clip-path
    overlay.style.background = nextTheme === "dark" ? "#020b18" : "#f8fafc";
    overlay.style.clipPath = `circle(0px at ${x}px ${y}px)`;
    overlay.style.opacity = "1";
    overlay.style.transition = "none";

    // Force reflow
    void overlay.offsetWidth;

    overlay.style.transition = "clip-path 550ms cubic-bezier(0.4, 0, 0.2, 1)";
    overlay.style.clipPath = `circle(${maxR}px at ${x}px ${y}px)`;

    const onEnd = () => {
      setTheme(nextTheme);
      overlay.style.opacity = "0";
      overlay.style.transition = "none";
      overlay.style.clipPath = `circle(0px at ${x}px ${y}px)`;
      overlay.removeEventListener("transitionend", onEnd);
    };

    overlay.addEventListener("transitionend", onEnd);
    cancelAnimationFrame(rafRef.current);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
      {/* Ripple overlay — sits above everything, pointer-events-none so it never blocks clicks */}
      <div
        ref={overlayRef}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          pointerEvents: "none",
          opacity: 0,
          willChange: "clip-path",
        }}
      />
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
