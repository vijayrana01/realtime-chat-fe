import { useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { setUserData } from "../Redux/userSlice";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

export default function Profile() {
  const { userData } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const [name, setName]                   = useState(userData?.name  || "");
  const [avatarPreview, setAvatarPreview] = useState(userData?.image || null);
  const [backEndImage, setBackEndImage]   = useState(null);
  const [editing, setEditing]             = useState(false);
  const [original, setOriginal]           = useState("");
  const [saving, setSaving]               = useState(false);

  const fileRef = useRef();
  const nameRef = useRef();
  const navigate = useNavigate();

  const initials = (name?.[0] || userData?.userName?.[0] || "U").toUpperCase();

  const startEdit = () => {
    setOriginal(name);
    setEditing(true);
    setTimeout(() => nameRef.current?.focus(), 0);
  };

  const cancelEdit = () => {
    setName(original);
    setEditing(false);
  };

  const handleAvatarChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  setBackEndImage(file);
  setAvatarPreview(URL.createObjectURL(file));
  setEditing(true); // ✅ show Save button when avatar changes
  setOriginal(name); // ✅ preserve cancel-restore point
};

  const handleProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      if (backEndImage) {
        formData.append("image", backEndImage);
      }
      const result = await axios.put(
        `${API_URL}/api/user/profile`,
        formData,
        { withCredentials: true }
      );
      dispatch(setUserData(result.data.user));
      navigate("/"); // ✅ redirect to home after update
      setEditing(false);
    } catch (err) {
      console.error("Update failed:", err);
    } finally {
      setSaving(false);
    }
  };

  const readOnlyFields = [
    {
      key: "userName",
      label: "Username",
      value: userData?.userName || "",
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      ),
    },
    {
      key: "email",
      label: "Email",
      value: userData?.email || "",
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center relative p-6">
      <p
        className="absolute top-4 left-4 text-slate-500 hover:text-slate-700 cursor-pointer text-sm"
        onClick={() => navigate("/")}
      >
        ← Back
      </p>

      <form onSubmit={handleProfile} className="w-full max-w-sm">

        {/* Avatar */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-24 h-24 mb-3">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Avatar"
                className="w-24 h-24 rounded-full object-cover border-2 border-slate-300"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-sky-100 border-2 border-slate-300 flex items-center justify-center text-sky-700 text-2xl font-medium">
                {initials}
              </div>
            )}
            <button
              type="button"
              onClick={() => fileRef.current.click()}
              className="absolute bottom-0.5 right-0.5 w-7 h-7 rounded-full bg-white border border-slate-300 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
          <p className="text-slate-800 font-semibold text-lg">
            {name || `@${userData?.userName}`}
          </p>
          <span className="text-xs text-slate-500 mt-0.5">{userData?.email}</span>
          <span className="text-xs text-emerald-600 mt-2 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            Active
          </span>
        </div>

        {/* Fields */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <p className="text-[10px] uppercase tracking-widest text-slate-400 font-mono mb-3">
            Account details
          </p>

          {/* Name — editable */}
          <div className="flex items-center gap-3 py-2.5 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A8.966 8.966 0 0112 15a8.966 8.966 0 016.879 2.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-slate-400 mb-0.5">Full Name</p>
              <input
                ref={nameRef}
                value={name}
                readOnly={!editing}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full bg-transparent text-sm font-medium text-slate-700 placeholder:text-slate-400 outline-none border-none focus:text-slate-900 read-only:cursor-default"
              />
            </div>
            {!editing && (
              <button
                type="button"
                onClick={startEdit}
                className="text-slate-400 hover:text-slate-700 transition-colors p-1 shrink-0"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            )}
          </div>

          {/* Username & Email — read-only */}
          {readOnlyFields.map(({ key, label, value, icon }) => (
            <div key={key} className="flex items-center gap-3 py-2.5 border-b border-slate-100 last:border-none">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  {icon}
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-slate-400 mb-0.5">{label}</p>
                <input
                  value={value}
                  readOnly
                  className="w-full bg-transparent text-sm font-medium text-slate-700 outline-none border-none cursor-default select-text"
                />
              </div>
            </div>
          ))}

          {/* Save / Cancel */}
          {editing && (
            <div className="flex gap-2 mt-4">
              <button
                type="button"
                onClick={cancelEdit}
                className="flex-1 py-2 rounded-xl border border-slate-300 text-slate-600 text-sm hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-sm transition-colors disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          )}
        </div>

        {/* Member since */}
        {userData?.createdAt && (
          <p className="text-center text-xs text-slate-400 mt-6">
            Member since{" "}
            {new Date(userData.createdAt).toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </p>
        )}
      </form>
    </div>
  );
}