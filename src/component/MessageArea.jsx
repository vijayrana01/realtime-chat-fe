import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedUser } from "../Redux/userSlice";
import EmojiPicker from "emoji-picker-react";
import ReceiverMessage from "./RecieverMessage";
import SenderMessage from "./SenderMessage";
import axios from "axios";
import { setMessages } from "../Redux/messagesSlice";
import { Socket } from "socket.io-client";
import { updateLastMessage, incrementUnread } from "../Redux/userSlice";
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

  // ✅ Real-time incoming message
useEffect(() => {
  if (!socket) return;

  socket.on("newMessage", (mess) => {
    dispatch(setMessages([...(Array.isArray(messages) ? messages : []), mess]));

    // ✅ normalize sender — could be object or string
    const senderId = mess.sender?._id ?? mess.sender;

    dispatch(updateLastMessage({
      senderId: senderId,
      message: mess.message,
    }));

    // ✅ compare normalized string IDs
    if (senderId !== selectedUser?._id) {
      dispatch(incrementUnread({ senderId: senderId }));
    }
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
      <div className="hidden lg:flex lg:w-[75%] h-full flex-col items-center justify-center bg-slate-50 gap-4">
        <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center">
          <svg
            className="w-7 h-7 text-slate-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-lg font-medium text-slate-700">
            Welcome to NexTalk
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Choose a chat from the sidebar to start messaging
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full lg:w-[75%] h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200">
        {/* Back — mobile only */}
        <button
          onClick={() => dispatch(setSelectedUser(null))}
          className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 transition-colors shrink-0"
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

        {/* Avatar + online dot */}
        <div className="relative shrink-0">
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-800 text-sm font-medium overflow-hidden">
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
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
          )}
        </div>

        <div className="flex-1">
          <p className="text-sm font-medium text-slate-800">
            {selectedUser?.userName || "Unknown"}
          </p>
          {isOnline ? (
            <p className="text-[11px] text-emerald-500 flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />{" "}
              Online
            </p>
          ) : (
            <p className="text-[11px] text-slate-400 mt-0.5">Offline</p>
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
              className="w-8 h-8 rounded-lg border border-slate-200 bg-transparent flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors"
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
      <div className="relative flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2.5 bg-slate-50 scrollbar-thin scrollbar-thumb-slate-200">
        {messages?.length === 0 && (
          <p className="text-center text-xs text-slate-400 mt-8">
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
            <EmojiPicker width={280} height={350} onEmojiClick={onEmojiClick} />
          </div>
        )}
      </div>

      {/* Image preview */}
      {frontEndImage && (
        <div className="px-4 py-2 border-t border-slate-100 bg-white flex items-center gap-3">
          <div className="relative w-14 h-14 shrink-0">
            <img
              src={frontEndImage}
              className="w-full h-full object-cover rounded-xl border border-slate-200"
            />
            <button
              onClick={() => {
                setBackEndImage(null);
                setFrontEndImage(null);
              }}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-slate-700 text-white flex items-center justify-center"
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
          <p className="text-xs text-slate-400">Image ready to send</p>
        </div>
      )}

      {/* Input bar */}
      <div className="px-4 py-3 border-t border-slate-200 bg-white flex items-center gap-2.5">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageChange}
        />

        <div className="flex-1 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full px-4 py-2.5">
          <button
            onClick={() => fileInputRef.current.click()}
            className="text-slate-400 hover:text-slate-600 transition-colors shrink-0"
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
            className="flex-1 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 outline-none border-none"
          />

          <button
            onClick={() => setEmojisOpen((o) => !o)}
            className="text-slate-400 hover:text-slate-600 transition-colors shrink-0"
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
          className="w-9 h-9 rounded-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-white transition-colors shrink-0"
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
