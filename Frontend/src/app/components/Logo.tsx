import { Link } from "react-router";

export function Logo({
  className = "",
  light = false,
  to = "/",
}: {
  className?: string;
  light?: boolean;
  to?: string;
}) {
  return (
    <Link to={to} className={`flex items-center gap-2.5 ${className}`}>
      <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#2563eb] to-[#14b8a6] shadow-lg shadow-blue-500/30">
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="none">
          {/* medical cross */}
          <path
            d="M10 3h4v5h5v4h-5v5h-4v-5H5V8h5V3z"
            fill="currentColor"
            opacity="0.35"
          />
          {/* heartbeat line */}
          <path
            d="M2 12h4l2-4 3 8 2.5-6 1.5 2H22"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span
        className={`text-[1.35rem] font-semibold tracking-tight ${
          light ? "text-white" : "text-slate-900 dark:text-slate-50"
        }`}
        style={{ fontFamily: "var(--font-display)" }}
      >
        HealthCare<span className="text-[#14b8a6]">+</span>
      </span>
    </Link>
  );
}
