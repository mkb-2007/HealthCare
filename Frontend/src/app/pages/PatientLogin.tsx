import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Mail, Lock, ArrowLeft, ArrowRight, Eye, EyeOff, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "../components/Logo";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Checkbox } from "../components/ui/checkbox";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { heroImage } from "../lib/data";
import api from "../../api/api";

export function PatientLogin() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {

    e.preventDefault();

    setError("");

    try {

      const response = await api.post("/patient/login", {
        email,
        password,
      });

      // Save logged in patient
      localStorage.setItem(
        "patient",
        JSON.stringify(response.data)
      );

      // ADD THIS LINE
      sessionStorage.setItem("hcp-auth", "patient");

      toast.success("Login Successful");

      const redirect =
        new URLSearchParams(window.location.search).get("redirect");

      navigate(redirect || "/dashboard");
    } catch (error: any) {

      console.error(error);

      const msg =
        error.response?.data?.message ||
        error.response?.data ||
        "Invalid Email or Password";

      setError(msg);

      toast.error(msg);

    }

  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Illustration side */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-blue-700 to-teal-600 lg:block">
        <ImageWithFallback
          src={heroImage}
          alt="Healthcare professionals"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-700/80 via-blue-800/80 to-teal-800/80" />
        <div className="relative z-10 flex h-full flex-col justify-between p-12 text-white">
          <Logo light />
          <div className="my-auto">
            <h2
              className="text-4xl font-bold leading-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Welcome back to <br /> better healthcare.
            </h2>
            <p className="mt-4 max-w-sm text-lg text-blue-100">
              Access your appointments, medical records and connect with top doctors — all in one
              place.
            </p>
          </div>
          <p className="text-sm text-blue-200">© 2026 HealthCare+</p>
        </div>
      </div>

      {/* Form side */}
      <div className="flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center justify-between">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              <ArrowLeft size={16} /> Back to home
            </Link>
            <Link
              to="/admin/login"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              Admin Portal <ArrowRight size={16} />
            </Link>
          </div>
          <div className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-xl shadow-slate-200/60">
            <div className="lg:hidden">
              <Logo />
            </div>
            <h1
              className="mt-4 text-2xl font-bold text-slate-900 dark:text-slate-50 lg:mt-0"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Patient Login
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Sign in to continue to your dashboard.</p>

            {error && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/40 p-3 text-xs font-medium text-red-600 dark:text-red-400">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form
              className="mt-6 space-y-5"
              onSubmit={handleLogin}
            >
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError("");
                    }}
                    placeholder="you@example.com"
                    className="h-11 rounded-xl pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError("");
                    }}
                    placeholder="••••••••"
                    className="h-11 rounded-xl pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-100 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <Checkbox defaultChecked /> Remember me
                </label>
                <a href="#" className="text-sm font-medium text-blue-600 hover:underline">
                  Forgot password?
                </a>
              </div>
              <Button className="h-11 w-full rounded-xl bg-blue-600 text-base hover:bg-blue-700">
                Login
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
              Don&apos;t have an account?{" "}
              <Link to="/register" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
