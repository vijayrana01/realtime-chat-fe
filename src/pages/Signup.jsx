import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setUserData } from "../Redux/userSlice";

const inputStyle = {
  WebkitBoxShadow: "0 0 0px 1000px transparent inset",
  WebkitTextFillColor: "#f0f0ff",
  transition: "background-color 5000s ease-in-out 0s",
};

const StrengthBar = ({ password }) => {
  const getStrength = (p) => {
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  };
  const strength = getStrength(password);
  const colors = ["", "#ef4444", "#facc15", "#38bdf8", "#34d399"];
  const textColors = ["", "#f87171", "#fde047", "#7dd3fc", "#6ee7b7"];
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  if (!password) return null;
  return (
    <div className="mt-2 px-0.5">
      <div className="flex gap-1.5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-[3px] flex-1 rounded-full transition-all duration-300"
            style={{
              background:
                i <= strength ? colors[strength] : "rgba(255,255,255,0.1)",
            }}
          />
        ))}
      </div>
      <p
        className="text-[10px] mt-1.5 font-mono tracking-widest uppercase"
        style={{ color: textColors[strength] }}
      >
        {labels[strength]}
      </p>
    </div>
  );
};

export default function NexTalkSignup() {
  const [form, setForm] = useState({ userName: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const API_URL = import.meta.env.VITE_API_URL;

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);
    try {
      const result = await axios.post(
        `${API_URL}/api/auth/signup`,
        { userName: form.userName, email: form.email, password: form.password },
        { withCredentials: true },
      );
      dispatch(setUserData(result.data.user));
      navigate("/profile");
    } catch (err) {
      setError(
        err.response?.data?.message || "Signup failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const fieldBase =
    "flex items-center gap-3 px-4 h-[46px] rounded-xl border transition-all duration-150";
  const fieldStyle = (name) =>
    focused === name
      ? `${fieldBase} border-[rgba(167,139,250,0.7)] bg-[rgba(255,255,255,0.09)]`
      : `${fieldBase} border-[rgba(255,255,255,0.11)] bg-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.2)]`;

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 font-sans relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #0f0c29 0%, #302b63 45%, #24243e 100%)",
      }}
    >
      {/* Blobs */}
      <div
        className="absolute top-[-80px] left-[-80px] w-80 h-80 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute bottom-[-60px] right-[-40px] w-64 h-64 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(99,179,237,0.18) 0%, transparent 70%)",
        }}
      />

      <div
        className="w-full max-w-sm rounded-[20px] p-9 relative z-10"
        style={{
          background: "rgba(255,255,255,0.07)",
          border: "1px solid rgba(255,255,255,0.14)",
          backdropFilter: "blur(20px)",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 mb-7">
          <div
            className="w-[34px] h-[34px] rounded-[9px] flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #a78bfa, #60a5fa)" }}
          >
            <svg width="17" height="17" viewBox="0 0 16 16" fill="#fff">
              <circle cx="8" cy="3.5" r="1.5" />
              <circle cx="3" cy="8" r="1.5" />
              <circle cx="13" cy="8" r="1.5" />
              <circle cx="5.5" cy="12.5" r="1.5" />
              <circle cx="10.5" cy="12.5" r="1.5" />
            </svg>
          </div>
          <span
            className="text-lg font-bold tracking-tight"
            style={{ color: "#f0f0ff" }}
          >
            nexTalk
          </span>
        </div>

        {/* Heading */}
        <div className="mb-6">
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: "#f0f0ff" }}
          >
            Create your account
          </h1>
          <p
            className="text-[13.5px] mt-1"
            style={{ color: "rgba(220,220,255,0.5)" }}
          >
            Join nexTalk and start talking today
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
          {/* Error */}
          {error && (
            <div
              className="text-sm rounded-[10px] px-3 py-2"
              style={{
                background: "rgba(239,68,68,0.12)",
                border: "1px solid rgba(239,68,68,0.28)",
                color: "#fca5a5",
              }}
            >
              {error}
            </div>
          )}

          {/* Username */}
          <div className={fieldStyle("userName")}>
            <svg
              className="w-4 h-4 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              style={{ color: "rgba(200,190,255,0.45)" }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
              />
            </svg>
            <input
              name="userName"
              type="text"
              placeholder="Username"
              value={form.userName}
              onChange={handleChange}
              onFocus={() => setFocused("userName")}
              onBlur={() => setFocused("")}
              style={inputStyle}
              className="flex-1 bg-transparent border-none outline-none text-sm"
              required
            />
          </div>

          {/* Email */}
          <div className={fieldStyle("email")}>
            <svg
              className="w-4 h-4 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              style={{ color: "rgba(200,190,255,0.45)" }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
              />
            </svg>
            <input
              name="email"
              type="email"
              placeholder="Email address"
              value={form.email}
              onChange={handleChange}
              onFocus={() => setFocused("email")}
              onBlur={() => setFocused("")}
              style={inputStyle}
              className="flex-1 bg-transparent border-none outline-none text-sm"
              required
            />
          </div>

          {/* Password */}
          <div>
            <div className={fieldStyle("password")}>
              <svg
                className="w-4 h-4 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
                style={{ color: "rgba(200,190,255,0.45)" }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                />
              </svg>
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                onFocus={() => setFocused("password")}
                onBlur={() => setFocused("")}
                style={inputStyle}
                className="flex-1 bg-transparent border-none outline-none text-sm"
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="shrink-0 transition-colors"
                style={{
                  color: "rgba(200,190,255,0.45)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
                aria-label="Toggle password"
              >
                {showPassword ? (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                )}
              </button>
            </div>
            <StrengthBar password={form.password} />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full h-[46px] rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 transition-all duration-100 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              background: "linear-gradient(135deg, #7c3aed, #4f87e8)",
              boxShadow: "0 4px 20px rgba(124,58,237,0.35)",
              border: "none",
            }}
          >
            {loading ? (
              <>
                <svg
                  className="w-4 h-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Creating account…
              </>
            ) : (
              "Create account"
            )}
          </button>
        </form>

        <p
          className="text-center text-xs mt-6"
          style={{ color: "rgba(220,220,255,0.45)" }}
        >
          Already have an account?{" "}
          <span
            className="cursor-pointer transition-colors"
            style={{ color: "#a78bfa" }}
            onClick={() => navigate("/login")}
          >
            Sign in
          </span>
        </p>
      </div>
    </div>
  );
}
