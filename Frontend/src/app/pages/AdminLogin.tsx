import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { User, Lock, ArrowLeft, ArrowRight, ShieldCheck, Eye, EyeOff, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "../components/Logo";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { adminBuildingImage } from "../lib/data";

export function AdminLogin() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const storedAdminPw = sessionStorage.getItem("hcp-admin-password");
    const storedUserPw = sessionStorage.getItem("hcp-user-password");
    const validPassword = storedAdminPw || storedUserPw || "admin123";

    const cleanUser = username.trim();
    const cleanPw = password;

    if (cleanUser !== "admin" || (cleanPw !== validPassword && cleanPw !== "admin123")) {
      sessionStorage.removeItem("hcp-auth");
      const msg = "Invalid username or password. Access denied.";
      setError(msg);
      toast.error(msg);
      return;
    }

    sessionStorage.setItem("hcp-auth", "admin");
    toast.success("Welcome to Admin Dashboard!");
    const redirect = new URLSearchParams(window.location.search).get("redirect");
    navigate(redirect ?? "/admin");
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 p-6">
      <div className="absolute inset-0">
        <ImageWithFallback
          src={adminBuildingImage}
          alt="Hospital building"
          className="h-full w-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950/90 to-slate-950" />
      </div>

      <div className="absolute left-6 right-6 top-6 flex items-center justify-between z-20">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
        >
          <ArrowLeft size={16} /> Back to home
        </Link>
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
        >
          Patient Login <ArrowRight size={16} />
        </Link>
      </div>

      <div className="relative w-full max-w-md">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col items-center text-center">
            <Logo light />
            <div className="mt-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600/20 text-blue-300">
              <ShieldCheck size={28} />
            </div>
            <h1
              className="mt-4 text-2xl font-bold text-white"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Admin Portal
            </h1>
            <p className="mt-1 text-sm text-slate-400">Restricted access — authorized staff only.</p>
          </div>

          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs font-medium text-red-300">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form
            className="mt-6 space-y-5"
            onSubmit={handleAdminLogin}
          >
            <div className="space-y-2">
              <Label htmlFor="user" className="text-slate-200">
                Username
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="user"
                  required
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="Enter username"
                  className="h-11 rounded-xl border-white/10 bg-white/5 pl-10 text-white placeholder:text-slate-500"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pw" className="text-slate-200">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="pw"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="••••••••"
                  className="h-11 rounded-xl border-white/10 bg-white/5 pl-10 pr-10 text-white placeholder:text-slate-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 focus:outline-none transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <Button className="h-11 w-full rounded-xl bg-blue-600 text-base hover:bg-blue-500">
              Login to Dashboard
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
