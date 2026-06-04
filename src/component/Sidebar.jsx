import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  setOtherUsers,
  setSearchData,
  setSelectedUser,
  setUserData,
  refreshFriends,
  resetUnread,
} from "../Redux/userSlice";

const API = import.meta.env.VITE_API_URL;

const initials = (name) =>
  name?.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "?";

const PALETTES = [
  "bg-purple-50 text-purple-800",
  "bg-teal-50 text-teal-800",
  "bg-amber-50 text-amber-800",
  "bg-pink-50 text-pink-800",
  "bg-sky-50 text-sky-800",
  "bg-orange-50 text-orange-800",
];
const colorFor = (id) =>
  PALETTES[(id?.charCodeAt(0) ?? 0) % PALETTES.length];

// ── format time helper ─────────────────────────────────────
const formatTime = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  if (diffDays === 0)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7)
    return date.toLocaleDateString([], { weekday: "short" });
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
};

// ── Avatar component ───────────────────────────────────────
function Avatar({ id, image, name, online = false }) {
  return (
    <div className="relative shrink-0">
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-medium overflow-hidden ${colorFor(id)}`}
      >
        {image ? (
          <img src={image} alt={name} className="w-full h-full object-cover rounded-full" />
        ) : (
          initials(name)
        )}
      </div>
      {online && (
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
      )}
    </div>
  );
}

export default function Sidebar() {
  const { userData, otherUsers, selectedUser, onlineUser, searchData } =
    useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [mainTab, setMainTab] = useState("chats");
  const [friendTab, setFriendTab] = useState("add");
  const [search, setSearch] = useState("");
  const [friendSearch, setFriendSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loadingReq, setLoadingReq] = useState(null);

  // ── fetch pending requests ─────────────────────────────
  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    try {
      const res = await axios.get(`${API}/api/friends/requests`, {
        withCredentials: true,
      });
      setPendingRequests(res.data.requests ?? []);
    } catch (err) {
      console.error(err);
    }
  };

  // ── debounced friend search ────────────────────────────
  useEffect(() => {
    if (!friendSearch.trim()) {
      setSearchResults([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const res = await axios.get(
          `${API}/api/user/search?query=${friendSearch}`,
          { withCredentials: true }
        );
        setSearchResults(res.data.users ?? []);
      } catch (err) {
        console.error(err);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [friendSearch]);

  // ── debounced chat search → updates searchData in Redux ─
  useEffect(() => {
    if (!search.trim()) {
      dispatch(setSearchData([])); // ✅ clear when empty
      return;
    }
    const t = setTimeout(async () => {
      try {
        const res = await axios.get(
          `${API}/api/user/search?query=${search}`,
          { withCredentials: true }
        );
        dispatch(setSearchData(res.data.users ?? [])); // ✅ save to Redux
      } catch (err) {
        console.error(err);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  // ✅ use searchData when searching, otherUsers (friends) otherwise
  const chatList = search.trim()
    ? (searchData ?? [])
    : (otherUsers ?? []);

  const filteredChats = chatList.filter((c) =>
    (c.userName || c.name)?.toLowerCase().includes(search.toLowerCase())
  );

  // ── send friend request ────────────────────────────────
  const sendFriendRequest = async (userId) => {
    try {
      await axios.post(
        `${API}/api/friends/send/${userId}`,
        {},
        { withCredentials: true }
      );
      setSentRequests((p) => [...p, userId]);
    } catch (err) {
      if (err.response?.data?.message === "Request already sent")
        setSentRequests((p) => [...p, userId]);
    }
  };

  // ── accept request ─────────────────────────────────────
  const acceptRequest = async (requestId) => {
    setLoadingReq(requestId);
    try {
      await axios.post(
        `${API}/api/friends/accept/${requestId}`,
        {},
        { withCredentials: true }
      );
      setPendingRequests((p) => p.filter((r) => r._id !== requestId));
      dispatch(refreshFriends());
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingReq(null);
    }
  };

  // ── decline request ────────────────────────────────────
  const declineRequest = async (requestId) => {
    setLoadingReq(requestId);
    try {
      await axios.post(
        `${API}/api/friends/decline/${requestId}`,
        {},
        { withCredentials: true }
      );
      setPendingRequests((p) => p.filter((r) => r._id !== requestId));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingReq(null);
    }
  };

  // ── logout ─────────────────────────────────────────────
  const handleLogout = async () => {
    try {
      await axios.get(`${API}/api/auth/logout`, { withCredentials: true });
      dispatch(setUserData(null));
      dispatch(setOtherUsers(null));
      navigate("/login");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div
      className={`
        relative flex flex-col bg-white border-r border-slate-100
        w-full h-full
        lg:w-[300px] lg:min-w-[300px] lg:max-w-[300px]
        ${selectedUser ? "hidden lg:flex" : "flex"}
      `}
    >
      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
        <div
          className="relative shrink-0 cursor-pointer"
          onClick={() => navigate("/profile")}
        >
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium overflow-hidden ${colorFor(userData?._id)}`}
          >
            {userData?.image ? (
              <img
                src={userData.image}
                alt="me"
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              initials(userData?.name || userData?.userName)
            )}
          </div>
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-800 truncate leading-tight">
            {userData?.name || userData?.userName}
          </p>
          <p className="text-[11px] text-emerald-500 flex items-center gap-1 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            Active now
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => navigate("/profile")}
            className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors"
            aria-label="Edit profile"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 3.487a2.25 2.25 0 013.182 3.182L7.5 19.213l-4 1 1-4 12.362-12.726z" />
            </svg>
          </button>
          <button
            className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors"
            aria-label="New chat"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Search ── */}
      <div className="px-4 py-2.5 border-b border-slate-100">
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 h-9">
          <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
          </svg>
          <input
            value={mainTab === "chats" ? search : friendSearch}
            onChange={(e) => {
              const val = e.target.value;
              if (mainTab === "chats") {
                setSearch(val);
                if (!val.trim()) dispatch(setSearchData([]));
              } else {
                setFriendSearch(val);
              }
            }}
            placeholder={mainTab === "chats" ? "Search people…" : "Search to add friends…"}
            className="flex-1 bg-transparent text-xs text-slate-700 placeholder:text-slate-400 outline-none border-none min-w-0"
          />
          {(mainTab === "chats" ? search : friendSearch) && (
            <button
              onClick={() => {
                if (mainTab === "chats") {
                  setSearch("");
                  dispatch(setSearchData([]));
                } else {
                  setFriendSearch("");
                  setSearchResults([]);
                }
              }}
              className="text-slate-400 hover:text-slate-600 shrink-0 p-0.5"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* ── Main Tabs ── */}
      <div className="flex border-b border-slate-100">
        {[{ key: "chats", label: "Chats" }, { key: "friends", label: "Friends" }].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setMainTab(key)}
            className={`flex-1 py-2.5 text-xs font-medium transition-colors border-b-2 flex items-center justify-center gap-1.5 ${
              mainTab === key
                ? "text-blue-600 border-blue-500"
                : "text-slate-400 border-transparent hover:text-slate-600"
            }`}
          >
            {label}
            {key === "friends" && pendingRequests.length > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-medium rounded-full px-1.5 py-0.5 leading-none">
                {pendingRequests.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ════════ CHATS PANEL ════════ */}
      {mainTab === "chats" && (
        <>
          {filteredChats.length > 0 && (
            <p className="px-4 pt-3 pb-1 text-[10px] font-medium tracking-widest uppercase text-slate-400">
              {search.trim() ? "Search results" : "Recent"}
            </p>
          )}
          <div className="flex-1 overflow-y-auto px-2 pb-16 scrollbar-thin scrollbar-thumb-slate-200">
            {filteredChats.length === 0 && (
              <div className="flex flex-col items-center justify-center mt-16 gap-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-sm text-slate-500">
                    {search.trim() ? `No results for "${search}"` : "No conversations yet"}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {search.trim() ? "Try a different name" : "Add friends to start chatting"}
                  </p>
                </div>
              </div>
            )}

            {filteredChats.map((chat) => {
              const isOnline = onlineUser?.includes(chat._id);
              const isActive = chat._id === selectedUser?._id;
              return (
                <button
                  key={chat._id}
                  onClick={() => {
                    dispatch(setSelectedUser(chat));
                    dispatch(resetUnread({ userId: chat._id }));
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all mb-0.5 ${
                    isActive
                      ? "bg-blue-50 border border-blue-100"
                      : "hover:bg-slate-50 border border-transparent"
                  }`}
                >
                  <Avatar
                    id={chat._id}
                    image={chat.image}
                    name={chat.userName || chat.name}
                    online={isOnline}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className={`text-sm font-medium truncate ${isActive ? "text-blue-700" : "text-slate-800"}`}>
                        {chat.userName || chat.name}
                      </span>
                      <span className="text-[10px] text-slate-400 shrink-0 ml-2">
                        {formatTime(chat.lastMessageTime)}
                      </span>
                    </div>
                    <p className="text-[11px] truncate text-slate-400">
                      {chat.lastMessage || "No messages yet"}
                    </p>
                  </div>
                  {chat.unread > 0 && (
                    <span className="shrink-0 bg-blue-500 text-white text-[10px] font-medium rounded-full w-5 h-5 flex items-center justify-center">
                      {chat.unread > 9 ? "9+" : chat.unread}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* ════════ FRIENDS PANEL ════════ */}
      {mainTab === "friends" && (
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Sub-tabs */}
          <div className="flex gap-2 px-4 py-3 border-b border-slate-100">
            {[{ key: "add", label: "Add people" }, { key: "pending", label: "Pending" }].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFriendTab(key)}
                className={`flex-1 py-2 text-xs font-medium rounded-xl border transition-all flex items-center justify-center gap-1.5 ${
                  friendTab === key
                    ? "bg-blue-50 border-blue-200 text-blue-700"
                    : "border-slate-200 text-slate-500 hover:bg-slate-50"
                }`}
              >
                {label}
                {key === "pending" && pendingRequests.length > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-medium rounded-full px-1.5 py-0.5 leading-none">
                    {pendingRequests.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* ── Add tab ── */}
          {friendTab === "add" && (
            <div className="flex-1 overflow-y-auto px-2 py-2 pb-16 scrollbar-thin scrollbar-thumb-slate-200">
              {!friendSearch.trim() && (
                <div className="flex flex-col items-center justify-center mt-12 gap-3">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-slate-500">Find people</p>
                    <p className="text-xs text-slate-400 mt-1">Search by name or username</p>
                  </div>
                </div>
              )}
              {friendSearch.trim() && searchResults.length === 0 && (
                <div className="flex flex-col items-center justify-center mt-12 gap-2">
                  <p className="text-sm text-slate-500">No users found</p>
                  <p className="text-xs text-slate-400">Try a different search</p>
                </div>
              )}
              {searchResults.map((user) => {
                if (user._id === userData?._id) return null;
                const sent = sentRequests.includes(user._id);
                return (
                  <div
                    key={user._id}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl border border-slate-100 mb-1.5 bg-white hover:border-slate-200 transition-colors"
                  >
                    <Avatar id={user._id} image={user.image} name={user.userName || user.name} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">
                        {user.userName || user.name}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        @{(user.userName || user.name)?.toLowerCase()}
                      </p>
                    </div>
                    <button
                      disabled={sent}
                      onClick={() => sendFriendRequest(user._id)}
                      className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all shrink-0 ${
                        sent
                          ? "border-slate-200 text-slate-400 bg-slate-50 cursor-not-allowed"
                          : "border-blue-300 text-blue-600 hover:bg-blue-50 active:scale-95"
                      }`}
                    >
                      {sent ? "✓ Sent" : "+ Add"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Pending tab ── */}
          {friendTab === "pending" && (
            <div className="flex-1 overflow-y-auto px-2 py-2 pb-16 scrollbar-thin scrollbar-thumb-slate-200">
              {pendingRequests.length === 0 && (
                <div className="flex flex-col items-center justify-center mt-12 gap-3">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-slate-500">No pending requests</p>
                    <p className="text-xs text-slate-400 mt-1">You're all caught up</p>
                  </div>
                </div>
              )}
              {pendingRequests.map((req) => {
                const sender = req.sender ?? req;
                const busy = loadingReq === req._id;
                return (
                  <div
                    key={req._id}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl border border-slate-100 mb-1.5 bg-white"
                  >
                    <Avatar id={sender._id} image={sender.image} name={sender.userName || sender.name} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">
                        {sender.userName || sender.name}
                      </p>
                      <p className="text-[11px] text-slate-400">wants to connect</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        disabled={busy}
                        onClick={() => acceptRequest(req._id)}
                        className="w-8 h-8 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 flex items-center justify-center text-white transition-colors active:scale-95"
                        title="Accept"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      </button>
                      <button
                        disabled={busy}
                        onClick={() => declineRequest(req._id)}
                        className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-red-50 hover:text-red-500 disabled:opacity-40 flex items-center justify-center text-slate-400 transition-colors active:scale-95"
                        title="Decline"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Footer / Logout ── */}
      <div className="absolute bottom-0 left-0 w-full px-4 py-3 border-t border-slate-100 bg-white">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-xs text-slate-400 hover:text-red-500 transition-colors w-full rounded-xl px-3 py-2 hover:bg-red-50"
        >
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
          </svg>
          Log out
        </button>
      </div>
    </div>
  );
}