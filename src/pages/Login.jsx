import { useState } from "react";
import { useNavigate } from "react-router-dom";
import React from "react";
import { useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedUser, setUserData } from "../Redux/userSlice";

const inputStyle = {
  // background: "transparent",
  WebkitBoxShadow: "0 0 0px 1000px transparent inset", // kills browser autofill white bg
  WebkitTextFillColor: "#e4e4e7", // keeps text color on autofill
  transition: "background-color 5000s ease-in-out 0s", // delays autofill bg switch forever
};
export default function NexTalkLogin() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const {userData}=useSelector((state)=>state.user)
  // console.log("Current user data in Login:", userData);
  const navigate = useNavigate();
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });
  const API_URL = import.meta.env.VITE_API_URL;
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");

      const response = await axios.post(`${API_URL}/api/auth/login`, form, {
        withCredentials: true,
      });

      dispatch(setUserData(response.data.user));
      dispatch(setSelectedUser(null))
      navigate("/");
      setSubmitted(true);
    } catch (error) {
      console.error("Login error:", error);

      setError(error.response?.data?.message || "Invalid email or password");
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 font-sans">
        <div className="w-full max-w-sm text-center">
          <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-6 h-6 text-emerald-400"
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
            Welcome back.
          </h2>
          <p className="text-zinc-500 text-sm mb-8">
            Signed in as{" "}
            <span className="text-zinc-300 font-medium">{form.email}</span>
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setForm({ email: "", password: "" });
            }}
            className="w-full py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm font-medium transition-colors"
            onClick={() => navigate("/login")}
          >
            Back to login
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
            <svg width="16" height="16" viewBox="0 0 16 16" fill="#09090b">
              <circle cx="8" cy="3.5" r="1.5" />
              <circle cx="3" cy="8" r="1.5" />
              <circle cx="13" cy="8" r="1.5" />
              <circle cx="5.5" cy="12.5" r="1.5" />
              <circle cx="10.5" cy="12.5" r="1.5" />
            </svg>
          </div>
          <span className="text-lg font-bold text-zinc-100 tracking-tight">
            nexTalk
          </span>
        </div>

        {/* Heading */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-100 tracking-tight leading-tight mb-2">
            Welcome back.
            <br />
            <span className="text-zinc-500">Sign in to continue.</span>
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {/* Email */}
          <div>
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
                className="flex-1 bg-transparent border-none outline-none text-zinc-200 placeholder-zinc-600 text-sm"
                required
              />
            </div>
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
                className="flex-1 bg-transparent border-none outline-none text-zinc-200 placeholder-zinc-600 text-sm"
                required
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
          </div>

          {/* Remember me + Forgot */}
          {/* Error Message */}
          {error && (
            <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          {/* Remember me + Forgot */}
          <div className="flex items-center justify-between mt-1">
            <label className="flex items-center gap-2 cursor-pointer group">
              <div
                onClick={() => setRememberMe(!rememberMe)}
                className={`w-4 h-4 rounded border flex items-center justify-center transition-all duration-150 ${
                  rememberMe
                    ? "bg-zinc-100 border-zinc-100"
                    : "bg-transparent border-zinc-700 group-hover:border-zinc-500"
                }`}
              >
                {rememberMe && (
                  <svg
                    className="w-2.5 h-2.5 text-zinc-900"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>

              <span className="text-xs text-zinc-500 group-hover:text-zinc-400 transition-colors select-none">
                Remember me
              </span>
            </label>

            <span className="text-xs text-zinc-500 hover:text-zinc-300 cursor-pointer transition-colors">
              Forgot password?
            </span>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="mt-3 w-full py-3 rounded-xl bg-zinc-100 hover:bg-white text-zinc-900 font-semibold text-sm tracking-tight active:scale-[0.98] transition-all duration-100"
          >
            Sign in
          </button>
        </form>

        {/* Divider */}
        {/* <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-zinc-800" />
          <span className="text-zinc-700 text-xs">or continue with</span>
          <div className="flex-1 h-px bg-zinc-800" />
        </div> */}

        {/* OAuth */}
        {/* <div className="flex gap-3">
          {[
            { label: "Google", icon: (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )},
            { label: "GitHub", icon: (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-zinc-300 shrink-0">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
              </svg>
            )},
          ].map(({ label, icon }) => (
            <button
              key={label}
              type="button"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/80 text-zinc-400 hover:text-zinc-200 text-sm font-medium transition-all duration-150"
            >
              {icon}
              {label}
            </button>
          ))}
        </div> */}

        <p
          className="text-center text-xs text-zinc-600 mt-8"
          onClick={() => navigate("/signup")}
        >
          Don't have an account?{" "}
          <span className="text-zinc-400 hover:text-zinc-200 cursor-pointer transition-colors font-medium">
            Sign up
          </span>
        </p>
      </div>
    </div>
  );
}
