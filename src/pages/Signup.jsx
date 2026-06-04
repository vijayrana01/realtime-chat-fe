import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setUserData } from "../Redux/userSlice";

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
  const colors = [
    "bg-zinc-700",
    "bg-red-500",
    "bg-yellow-400",
    "bg-sky-400",
    "bg-emerald-400",
  ];
  const textColors = [
    "",
    "text-red-400",
    "text-yellow-400",
    "text-sky-400",
    "text-emerald-400",
  ];
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  if (!password) return null;
  return (
    <div className="mt-2 px-1">
      <div className="flex gap-1.5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-0.5 flex-1 rounded-full transition-all duration-300 ${i <= strength ? colors[strength] : "bg-zinc-800"}`}
          />
        ))}
      </div>
      <p
        className={`text-[10px] mt-1.5 font-mono tracking-widest uppercase ${textColors[strength]}`}
      >
        {labels[strength]}
      </p>
    </div>
  );
};

// FIX: shared input style — bg-transparent + autofill override via inline style
const inputStyle = {
  // background: "transparent",
  WebkitBoxShadow: "0 0 0px 1000px transparent inset", // kills browser autofill white bg
  WebkitTextFillColor: "#e4e4e7", // keeps text color on autofill
  transition: "background-color 5000s ease-in-out 0s", // delays autofill bg switch forever
};

export default function NexTalkSignup() {
  const [form, setForm] = useState({ userName: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [focused, setFocused] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);
  console.log("Current user data in Signup:", userData);
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const API_URL = import.meta.env.VITE_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      // Option B: remap before sending
      const result = await axios.post(
        `${API_URL}/api/auth/signup`,
        {
          userName: form.userName,
          email: form.email,
          password: form.password,
        },
        { withCredentials: true },
      );
      dispatch(setUserData(result.data.user));
      navigate("/profile");
      // console.log("Signup response:", result.data);
      setSubmitted(true);
      // ✅ Fix
    } catch (err) {
      console.error("Signup error:", err);
      setError(
        err.response?.data?.message || "Signup failed. Please try again.",
      );
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
        <div className="w-full max-w-sm text-center">
          <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-7 h-7 text-emerald-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-zinc-100 tracking-tight mb-2">
            Account created
          </h2>
          <p className="text-zinc-500 text-sm mb-8">
            Welcome aboard,{" "}
            <span className="text-zinc-300 font-medium">{form.userName}</span>.
          </p>

          <button
            onClick={() => {
              setSubmitted(false);
              setForm({ userName: "", email: "", password: "" });
              navigate("/login");
            }}
            className="px-6 py-3 rounded-xl bg-emerald-400 hover:bg-emerald-500 text-zinc-900 font-semibold text-sm tracking-tight active:scale-[0.98] transition-all duration-100"
          >
            Login now
          </button>
        </div>
      </div>
    );
  }

  const fieldWrap = (name) =>
    `flex items-center gap-3 rounded-xl px-4 h-12 border transition-all duration-150 ${
      focused === name
        ? "bg-zinc-900 border-zinc-600"
        : "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700"
    }`;

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center">
            <svg
              className="w-4 h-4 text-zinc-900"
              viewBox="0 0 16 16"
              fill="currentColor"
            >
              <path d="M8 1.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM3 6.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM13 6.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM5.5 12a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM10.5 12a1.5 1.5 0 110 3 1.5 1.5 0 010-3z" />
            </svg>
          </div>
          <span className="text-lg font-bold text-zinc-100 tracking-tight">
            nexTalk
          </span>
        </div>

        {/* Heading */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-100 tracking-tight leading-tight mb-2">
            Start talking.
            <br />
            <span className="text-zinc-500">Create an account.</span>
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {/* Username */}
          <div className={fieldWrap("userName")}>
            <svg
              className="w-4 h-4 text-zinc-600 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
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
              className="flex-1 border-none outline-none text-zinc-200 placeholder-zinc-600 text-sm"
              required
            />
          </div>

          {/* Email */}
          <div className={fieldWrap("email")}>
            <svg
              className="w-4 h-4 text-zinc-600 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
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
              className="flex-1 border-none outline-none text-zinc-200 placeholder-zinc-600 text-sm"
              required
            />
          </div>

          {/* Password */}
          <div>
            <div className={fieldWrap("password")}>
              <svg
                className="w-4 h-4 text-zinc-600 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
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
                className="flex-1 border-none outline-none text-zinc-200 placeholder-zinc-600 text-sm"
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-zinc-600 hover:text-zinc-400 transition-colors shrink-0"
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
            className="mt-2 w-full py-3 rounded-xl bg-zinc-100 hover:bg-white text-zinc-900 font-semibold text-sm tracking-tight active:scale-[0.98] transition-all duration-100"
          >
            Create account
          </button>
        </form>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        <p className="text-center text-xs text-zinc-600 mt-8">
          Already have an account?{" "}
          <span
            className="text-zinc-400 hover:text-zinc-200 cursor-pointer transition-colors font-medium"
            onClick={() => navigate("/login")}
          >
            Sign in
          </span>
        </p>
      </div>
    </div>
  );
}
