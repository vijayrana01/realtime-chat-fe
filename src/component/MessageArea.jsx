import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setSelectedUser,
  updateLastMessage,
  incrementUnread,
} from "../Redux/userSlice";
import EmojiPicker from "emoji-picker-react";
import ReceiverMessage from "./RecieverMessage";
import SenderMessage from "./SenderMessage";
import axios from "axios";
import { setMessages } from "../Redux/messagesSlice";

export default function MessageArea() {
  const [emojisOpen, setEmojisOpen] = useState(false);
  const [text, setText] = useState("");
  const [frontEndImage, setFrontEndImage] = useState(null);
  const [backEndImage, setBackEndImage] = useState(null);
  const [sending, setSending] = useState(false);

  const { messages } = useSelector((state) => state.message);
  const { selectedUser, userData, onlineUser, socket } = useSelector(
    (state) => state.user,
  );
  const isOnline = onlineUser?.includes(selectedUser?._id);

  const bottomRef = useRef();
  const fileInputRef = useRef();
  const dispatch = useDispatch();
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!socket) return;
    socket.on("newMessage", (mess) => {
      dispatch(
        setMessages([...(Array.isArray(messages) ? messages : []), mess]),
      );
      const senderId = mess.sender?._id ?? mess.sender;
      dispatch(updateLastMessage({ senderId, message: mess.message }));
      if (senderId !== selectedUser?._id)
        dispatch(incrementUnread({ senderId }));
    });
    return () => socket.off("newMessage");
  }, [messages, socket, selectedUser]);

  const handleSend = async () => {
    if (!text.trim() && !backEndImage) return;
    setSending(true);
    try {
      const formData = new FormData();
      formData.append("text", text);
      if (backEndImage) formData.append("image", backEndImage);
      const result = await axios.post(
        `${API_URL}/api/message/send/${selectedUser._id}`,
        formData,
        { withCredentials: true },
      );
      dispatch(
        setMessages([
          ...(Array.isArray(messages) ? messages : []),
          result.data.message,
        ]),
      );
      setText("");
      setBackEndImage(null);
      setFrontEndImage(null);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setBackEndImage(file);
    setFrontEndImage(URL.createObjectURL(file));
    e.target.value = "";
  };

  const onEmojiClick = (emojiData) => {
    setText((prev) => prev + emojiData.emoji);
    setEmojisOpen(false);
  };

  const initials = (name) =>
    name
      ?.split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?";

  if (!selectedUser) {
    return (
      <div
        className="hidden lg:flex lg:flex-1 h-full flex-col items-center justify-center gap-4"
        style={{
          background:
            "linear-gradient(135deg, #0f0c29 0%, #1a1540 60%, #24243e 100%)",
        }}
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <svg
            className="w-7 h-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            style={{ color: "rgba(167,139,250,0.6)" }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold" style={{ color: "#f0f0ff" }}>
            Welcome to NexTalk
          </p>
          <p
            className="text-xs mt-1"
            style={{ color: "rgba(200,190,255,0.4)" }}
          >
            Choose a chat from the sidebar to start messaging
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-full lg:flex-1 h-full flex flex-col"
      style={{
        background: "linear-gradient(180deg, #0f0c29 0%, #1a1540 100%)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3 shrink-0 border-b"
        style={{
          background: "rgba(255,255,255,0.04)",
          borderColor: "rgba(255,255,255,0.08)",
          backdropFilter: "blur(12px)",
        }}
      >
        <button
          onClick={() => dispatch(setSelectedUser(null))}
          className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg transition-colors shrink-0"
          style={{
            color: "rgba(200,190,255,0.6)",
            background: "rgba(255,255,255,0.06)",
          }}
          aria-label="Back"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <div className="relative shrink-0">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold overflow-hidden"
            style={{ background: "rgba(167,139,250,0.2)", color: "#c4b5fd" }}
          >
            {selectedUser?.image ? (
              <img
                src={selectedUser.image}
                alt={selectedUser?.userName}
                className="w-full h-full object-cover"
              />
            ) : (
              initials(selectedUser?.userName)
            )}
          </div>
          {isOnline && (
            <span
              className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2"
              style={{ background: "#34d399", borderColor: "#0f0c29" }}
            />
          )}
        </div>

        <div className="flex-1">
          <p className="text-sm font-semibold" style={{ color: "#f0f0ff" }}>
            {selectedUser?.userName || "Unknown"}
          </p>
          {isOnline ? (
            <p
              className="text-[11px] flex items-center gap-1 mt-0.5"
              style={{ color: "#34d399" }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full inline-block"
                style={{ background: "#34d399" }}
              />{" "}
              Online
            </p>
          ) : (
            <p
              className="text-[11px] mt-0.5"
              style={{ color: "rgba(200,190,255,0.35)" }}
            >
              Offline
            </p>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {[
            {
              label: "Call",
              path: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z",
            },
            {
              label: "Video",
              path: "M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z",
            },
            {
              label: "Info",
              path: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
            },
          ].map(({ label, path }) => (
            <button
              key={label}
              aria-label={label}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(200,190,255,0.55)",
              }}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d={path} />
              </svg>
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div
        className="relative flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2.5 scrollbar-thin"
        style={{ scrollbarColor: "rgba(255,255,255,0.08) transparent" }}
      >
        {messages?.length === 0 && (
          <p
            className="text-center text-xs mt-8"
            style={{ color: "rgba(200,190,255,0.35)" }}
          >
            No messages yet. Say hello!
          </p>
        )}
        {messages?.map((msg, i) => {
          const isMe =
            msg.sender === userData?._id || msg.sender?._id === userData?._id;
          return isMe ? (
            <SenderMessage key={msg._id || i} msg={msg} userData={userData} />
          ) : (
            <ReceiverMessage
              key={msg._id || i}
              msg={msg}
              selectedUser={selectedUser}
            />
          );
        })}
        <div ref={bottomRef} />

        {emojisOpen && (
          <div className="absolute bottom-2 right-4 z-50">
            <EmojiPicker
              width={280}
              height={350}
              onEmojiClick={onEmojiClick}
              theme="dark"
            />
          </div>
        )}
      </div>

      {/* Image preview */}
      {frontEndImage && (
        <div
          className="px-4 py-2 flex items-center gap-3 shrink-0 border-t"
          style={{
            background: "rgba(255,255,255,0.04)",
            borderColor: "rgba(255,255,255,0.08)",
          }}
        >
          <div className="relative w-14 h-14 shrink-0">
            <img
              src={frontEndImage}
              className="w-full h-full object-cover rounded-xl"
              style={{ border: "1px solid rgba(255,255,255,0.1)" }}
            />
            <button
              onClick={() => {
                setBackEndImage(null);
                setFrontEndImage(null);
              }}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-white"
              style={{ background: "#7c3aed" }}
              aria-label="Remove"
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
          </div>
          <p className="text-xs" style={{ color: "rgba(200,190,255,0.4)" }}>
            Image ready to send
          </p>
        </div>
      )}

      {/* Input bar */}
      <div
        className="px-4 py-3 flex items-center gap-2.5 shrink-0 border-t"
        style={{
          background: "rgba(255,255,255,0.04)",
          borderColor: "rgba(255,255,255,0.08)",
          backdropFilter: "blur(12px)",
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageChange}
        />

        <div
          className="flex-1 flex items-center gap-2 rounded-full px-4 py-2.5"
          style={{
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <button
            onClick={() => fileInputRef.current.click()}
            className="transition-colors shrink-0"
            style={{
              color: "rgba(200,190,255,0.45)",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
            aria-label="Attach"
          >
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
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
              />
            </svg>
          </button>

          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Type a message…"
            className="flex-1 bg-transparent text-sm outline-none border-none"
            style={{ color: "#f0f0ff" }}
          />

          <button
            onClick={() => setEmojisOpen((o) => !o)}
            className="transition-colors shrink-0"
            style={{
              color: "rgba(200,190,255,0.45)",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
            aria-label="Emoji"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>
        </div>

        <button
          onClick={handleSend}
          disabled={(!text.trim() && !backEndImage) || sending}
          className="w-9 h-9 rounded-full flex items-center justify-center text-white transition-colors shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: "linear-gradient(135deg, #7c3aed, #4f87e8)" }}
          aria-label="Send"
        >
          {sending ? (
            <svg
              className="w-4 h-4 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
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
                d="M4 12a8 8 0 018-8v8z"
              />
            </svg>
          ) : (
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
