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
  name
    ?.split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";

const PALETTES = [
  { bg: "rgba(167,139,250,0.2)", text: "#c4b5fd" },
  { bg: "rgba(96,165,250,0.2)", text: "#93c5fd" },
  { bg: "rgba(52,211,153,0.2)", text: "#6ee7b7" },
  { bg: "rgba(251,191,36,0.2)", text: "#fde68a" },
  { bg: "rgba(249,115,22,0.2)", text: "#fdba74" },
  { bg: "rgba(236,72,153,0.2)", text: "#f9a8d4" },
];
const colorFor = (id) => PALETTES[(id?.charCodeAt(0) ?? 0) % PALETTES.length];

const formatTime = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  if (diffDays === 0)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return date.toLocaleDateString([], { weekday: "short" });
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
};

function Avatar({ id, image, name, online = false }) {
  const palette = colorFor(id);
  return (
    <div className="relative shrink-0">
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-semibold overflow-hidden"
        style={{ background: palette.bg, color: palette.text }}
      >
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover rounded-full"
          />
        ) : (
          initials(name)
        )}
      </div>
      {online && (
        <span
          className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2"
          style={{ background: "#34d399", borderColor: "#1a1a2e" }}
        />
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

  useEffect(() => {
    if (!friendSearch.trim()) {
      setSearchResults([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const res = await axios.get(
          `${API}/api/user/search?query=${friendSearch}`,
          { withCredentials: true },
        );
        setSearchResults(res.data.users ?? []);
      } catch (err) {
        console.error(err);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [friendSearch]);

  useEffect(() => {
    if (!search.trim()) {
      dispatch(setSearchData([]));
      return;
    }
    const t = setTimeout(async () => {
      try {
        const res = await axios.get(`${API}/api/user/search?query=${search}`, {
          withCredentials: true,
        });
        dispatch(setSearchData(res.data.users ?? []));
      } catch (err) {
        console.error(err);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const chatList = search.trim() ? (searchData ?? []) : (otherUsers ?? []);
  const filteredChats = chatList.filter((c) =>
    (c.userName || c.name)?.toLowerCase().includes(search.toLowerCase()),
  );

  const sendFriendRequest = async (userId) => {
    try {
      await axios.post(
        `${API}/api/friends/send/${userId}`,
        {},
        { withCredentials: true },
      );
      setSentRequests((p) => [...p, userId]);
    } catch (err) {
      if (err.response?.data?.message === "Request already sent")
        setSentRequests((p) => [...p, userId]);
    }
  };

  const acceptRequest = async (requestId) => {
    setLoadingReq(requestId);
    try {
      await axios.post(
        `${API}/api/friends/accept/${requestId}`,
        {},
        { withCredentials: true },
      );
      setPendingRequests((p) => p.filter((r) => r._id !== requestId));
      dispatch(refreshFriends());
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingReq(null);
    }
  };

  const declineRequest = async (requestId) => {
    setLoadingReq(requestId);
    try {
      await axios.post(
        `${API}/api/friends/decline/${requestId}`,
        {},
        { withCredentials: true },
      );
      setPendingRequests((p) => p.filter((r) => r._id !== requestId));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingReq(null);
    }
  };

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

  const sidebarHidden = selectedUser && mainTab === "chats";
  const myPalette = colorFor(userData?._id);

  return (
    <div
      className={`relative flex flex-col w-full h-full min-h-0 lg:w-[20%] lg:min-w-[300px] lg:max-w-[300px] border-r ${sidebarHidden ? "hidden lg:flex" : "flex"}`}
      style={{
        background: "linear-gradient(180deg, #0f0c29 0%, #1a1540 100%)",
        borderColor: "rgba(255,255,255,0.08)",
      }}
    >
      {/* ── Header ── */}
      <div
        className="flex items-center gap-3 px-4 py-3 shrink-0 border-b"
        style={{ borderColor: "rgba(255,255,255,0.07)" }}
      >
        <div
          className="relative shrink-0 cursor-pointer"
          onClick={() => navigate("/profile")}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold overflow-hidden"
            style={{ background: myPalette.bg, color: myPalette.text }}
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
          <span
            className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2"
            style={{ background: "#34d399", borderColor: "#0f0c29" }}
          />
        </div>

        <div className="flex-1 min-w-0">
          <p
            className="text-sm font-semibold truncate leading-tight"
            style={{ color: "#f0f0ff" }}
          >
            {userData?.name || userData?.userName}
          </p>
          <p
            className="text-[11px] flex items-center gap-1 mt-0.5"
            style={{ color: "#34d399" }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full inline-block"
              style={{ background: "#34d399" }}
            />
            Active now
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {[
            {
              label: "Edit profile",
              onClick: () => navigate("/profile"),
              path: "M16.862 3.487a2.25 2.25 0 013.182 3.182L7.5 19.213l-4 1 1-4 12.362-12.726z",
            },
            {
              label: "New chat",
              onClick: () => {},
              path: "M12 4.5v15m7.5-7.5h-15",
            },
          ].map(({ label, onClick, path }) => (
            <button
              key={label}
              onClick={onClick}
              aria-label={label}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(200,190,255,0.6)",
              }}
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d={path} />
              </svg>
            </button>
          ))}
        </div>
      </div>

      {/* ── Search ── */}
      <div
        className="px-4 py-2.5 shrink-0 border-b"
        style={{ borderColor: "rgba(255,255,255,0.07)" }}
      >
        <div
          className="flex items-center gap-2 rounded-xl px-3 h-9"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <svg
            className="w-3.5 h-3.5 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            style={{ color: "rgba(200,190,255,0.4)" }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z"
            />
          </svg>
          <input
            value={mainTab === "chats" ? search : friendSearch}
            onChange={(e) => {
              const val = e.target.value;
              if (mainTab === "chats") {
                setSearch(val);
                if (!val.trim()) dispatch(setSearchData([]));
              } else setFriendSearch(val);
            }}
            placeholder={
              mainTab === "chats" ? "Search people…" : "Search to add friends…"
            }
            className="flex-1 bg-transparent text-xs outline-none border-none min-w-0"
            style={{ color: "#f0f0ff" }}
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
              className="shrink-0 p-0.5"
              style={{ color: "rgba(200,190,255,0.5)" }}
            >
              <svg
                className="w-3 h-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* ── Main Tabs ── */}
      <div
        className="flex shrink-0 border-b"
        style={{ borderColor: "rgba(255,255,255,0.07)" }}
      >
        {[
          { key: "chats", label: "Chats" },
          { key: "friends", label: "Friends" },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => {
              setMainTab(key);
              if (key === "friends") dispatch(setSelectedUser(null));
            }}
            className="flex-1 py-2.5 text-xs font-medium transition-colors border-b-2 flex items-center justify-center gap-1.5"
            style={{
              color: mainTab === key ? "#a78bfa" : "rgba(200,190,255,0.4)",
              borderColor: mainTab === key ? "#a78bfa" : "transparent",
              background: "transparent",
            }}
          >
            {label}
            {key === "friends" && pendingRequests.length > 0 && (
              <span
                className="text-white text-[10px] font-medium rounded-full px-1.5 py-0.5 leading-none"
                style={{ background: "#ef4444" }}
              >
                {pendingRequests.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ════════ CHATS PANEL ════════ */}
      {mainTab === "chats" && (
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
          {filteredChats.length > 0 && (
            <p
              className="px-4 pt-3 pb-1 text-[10px] font-medium tracking-widest uppercase shrink-0"
              style={{ color: "rgba(200,190,255,0.35)" }}
            >
              {search.trim() ? "Search results" : "Recent"}
            </p>
          )}
          <div
            className="flex-1 overflow-y-auto px-2 pb-20 min-h-0 scrollbar-thin"
            style={{ scrollbarColor: "rgba(255,255,255,0.1) transparent" }}
          >
            {filteredChats.length === 0 && (
              <div className="flex flex-col items-center justify-center mt-16 gap-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.06)" }}
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    style={{ color: "rgba(200,190,255,0.4)" }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
                    />
                  </svg>
                </div>
                <div className="text-center">
                  <p
                    className="text-sm"
                    style={{ color: "rgba(220,220,255,0.5)" }}
                  >
                    {search.trim()
                      ? `No results for "${search}"`
                      : "No conversations yet"}
                  </p>
                  <p
                    className="text-xs mt-1"
                    style={{ color: "rgba(200,190,255,0.3)" }}
                  >
                    {search.trim()
                      ? "Try a different name"
                      : "Add friends to start chatting"}
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
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all mb-0.5"
                  style={{
                    background: isActive
                      ? "rgba(167,139,250,0.15)"
                      : "transparent",
                    border: isActive
                      ? "1px solid rgba(167,139,250,0.25)"
                      : "1px solid transparent",
                  }}
                >
                  <Avatar
                    id={chat._id}
                    image={chat.image}
                    name={chat.userName || chat.name}
                    online={isOnline}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span
                        className="text-sm font-medium truncate"
                        style={{ color: isActive ? "#c4b5fd" : "#f0f0ff" }}
                      >
                        {chat.userName || chat.name}
                      </span>
                      <span
                        className="text-[10px] shrink-0 ml-2"
                        style={{ color: "rgba(200,190,255,0.4)" }}
                      >
                        {formatTime(chat.lastMessageTime)}
                      </span>
                    </div>
                    <p
                      className="text-[11px] truncate"
                      style={{ color: "rgba(200,190,255,0.4)" }}
                    >
                      {chat.lastMessage || "No messages yet"}
                    </p>
                  </div>
                  {chat.unread > 0 && (
                    <span
                      className="shrink-0 text-white text-[10px] font-medium rounded-full w-5 h-5 flex items-center justify-center"
                      style={{ background: "#7c3aed" }}
                    >
                      {chat.unread > 9 ? "9+" : chat.unread}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ════════ FRIENDS PANEL ════════ */}
      {mainTab === "friends" && (
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div
            className="flex gap-2 px-4 py-3 shrink-0 border-b"
            style={{ borderColor: "rgba(255,255,255,0.07)" }}
          >
            {[
              { key: "add", label: "Add people" },
              { key: "pending", label: "Pending" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFriendTab(key)}
                className="flex-1 py-2 text-xs font-medium rounded-xl border transition-all flex items-center justify-center gap-1.5"
                style={{
                  background:
                    friendTab === key
                      ? "rgba(167,139,250,0.15)"
                      : "transparent",
                  borderColor:
                    friendTab === key
                      ? "rgba(167,139,250,0.35)"
                      : "rgba(255,255,255,0.1)",
                  color:
                    friendTab === key ? "#c4b5fd" : "rgba(200,190,255,0.45)",
                }}
              >
                {label}
                {key === "pending" && pendingRequests.length > 0 && (
                  <span
                    className="text-white text-[10px] font-medium rounded-full px-1.5 py-0.5 leading-none"
                    style={{ background: "#ef4444" }}
                  >
                    {pendingRequests.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Add tab */}
          {friendTab === "add" && (
            <div className="flex-1 overflow-y-auto min-h-0 px-2 py-2 pb-24">
              {!friendSearch.trim() && (
                <div className="flex flex-col items-center justify-center mt-12 gap-3">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(255,255,255,0.06)" }}
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                      style={{ color: "rgba(200,190,255,0.4)" }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z"
                      />
                    </svg>
                  </div>
                  <div className="text-center">
                    <p
                      className="text-sm"
                      style={{ color: "rgba(220,220,255,0.5)" }}
                    >
                      Find people
                    </p>
                    <p
                      className="text-xs mt-1"
                      style={{ color: "rgba(200,190,255,0.3)" }}
                    >
                      Search by name or username
                    </p>
                  </div>
                </div>
              )}
              {friendSearch.trim() && searchResults.length === 0 && (
                <div className="flex flex-col items-center justify-center mt-12 gap-2">
                  <p
                    className="text-sm"
                    style={{ color: "rgba(220,220,255,0.5)" }}
                  >
                    No users found
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: "rgba(200,190,255,0.3)" }}
                  >
                    Try a different search
                  </p>
                </div>
              )}
              {searchResults.map((user) => {
                if (user._id === userData?._id) return null;
                const sent = sentRequests.includes(user._id);
                return (
                  <div
                    key={user._id}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl mb-1.5 transition-colors"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <Avatar
                      id={user._id}
                      image={user.image}
                      name={user.userName || user.name}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-medium truncate"
                        style={{ color: "#f0f0ff" }}
                      >
                        {user.userName || user.name}
                      </p>
                      <p
                        className="text-[11px]"
                        style={{ color: "rgba(200,190,255,0.4)" }}
                      >
                        @{(user.userName || user.name)?.toLowerCase()}
                      </p>
                    </div>
                    <button
                      disabled={sent}
                      onClick={() => sendFriendRequest(user._id)}
                      className="text-xs px-3 py-1.5 rounded-lg border font-medium transition-all shrink-0"
                      style={{
                        borderColor: sent
                          ? "rgba(255,255,255,0.1)"
                          : "rgba(167,139,250,0.4)",
                        color: sent ? "rgba(200,190,255,0.3)" : "#c4b5fd",
                        background: sent
                          ? "rgba(255,255,255,0.04)"
                          : "rgba(167,139,250,0.1)",
                        cursor: sent ? "not-allowed" : "pointer",
                      }}
                    >
                      {sent ? "✓ Sent" : "+ Add"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pending tab */}
          {friendTab === "pending" && (
            <div className="flex-1 overflow-y-auto min-h-0 px-2 py-2 pb-24">
              {pendingRequests.length === 0 && (
                <div className="flex flex-col items-center justify-center mt-12 gap-3">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(255,255,255,0.06)" }}
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                      style={{ color: "rgba(200,190,255,0.4)" }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
                      />
                    </svg>
                  </div>
                  <div className="text-center">
                    <p
                      className="text-sm"
                      style={{ color: "rgba(220,220,255,0.5)" }}
                    >
                      No pending requests
                    </p>
                    <p
                      className="text-xs mt-1"
                      style={{ color: "rgba(200,190,255,0.3)" }}
                    >
                      You're all caught up
                    </p>
                  </div>
                </div>
              )}
              {pendingRequests.map((req) => {
                const sender = req.sender ?? req;
                const busy = loadingReq === req._id;
                return (
                  <div
                    key={req._id}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl mb-1.5"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <Avatar
                      id={sender._id}
                      image={sender.image}
                      name={sender.userName || sender.name}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-medium truncate"
                        style={{ color: "#f0f0ff" }}
                      >
                        {sender.userName || sender.name}
                      </p>
                      <p
                        className="text-[11px]"
                        style={{ color: "rgba(200,190,255,0.4)" }}
                      >
                        wants to connect
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        disabled={busy}
                        onClick={() => acceptRequest(req._id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white transition-colors active:scale-95 disabled:opacity-40"
                        style={{ background: "#059669" }}
                        title="Accept"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4.5 12.75l6 6 9-13.5"
                          />
                        </svg>
                      </button>
                      <button
                        disabled={busy}
                        onClick={() => declineRequest(req._id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors active:scale-95 disabled:opacity-40"
                        style={{
                          background: "rgba(255,255,255,0.06)",
                          color: "rgba(200,190,255,0.5)",
                        }}
                        title="Decline"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                          />
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
      <div
        className="absolute bottom-0 left-0 w-full px-4 pt-2 pb-3 shrink-0 border-t"
        style={{
          background: "rgba(15,12,41,0.9)",
          backdropFilter: "blur(12px)",
          borderColor: "rgba(255,255,255,0.07)",
        }}
      >
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-xs w-full rounded-xl px-3 py-2 transition-colors group"
          style={{ color: "rgba(200,190,255,0.45)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#f87171";
            e.currentTarget.style.background = "rgba(239,68,68,0.08)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "rgba(200,190,255,0.45)";
            e.currentTarget.style.background = "transparent";
          }}
        >
          <svg
            className="w-4 h-4 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
            />
          </svg>
          Log out
        </button>
        <div className="flex items-center gap-2 px-1 mt-1">
          <div
            className="flex-1 h-px"
            style={{ background: "rgba(255,255,255,0.06)" }}
          />
          <p
            className="text-[11px] text-center"
            style={{ color: "rgba(200,190,255,0.3)" }}
          >
            © {new Date().getFullYear()}{" "}
            <span
              className="font-semibold"
              style={{ color: "rgba(200,190,255,0.5)" }}
            >
              Vijay Rana
            </span>
          </p>
          <div
            className="flex-1 h-px"
            style={{ background: "rgba(255,255,255,0.06)" }}
          />
        </div>
      </div>
    </div>
  );
}
