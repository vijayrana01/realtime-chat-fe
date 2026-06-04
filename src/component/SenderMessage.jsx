export default function SenderMessage({ msg, userData }) {
  const initials = (name) =>
    name
      ?.split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?";

  const isRead = msg?.isRead; // true = blue ticks, false = grey ticks

  return (
    <div className="flex items-end gap-2 flex-row-reverse">
      {/* Avatar */}
      <div className="w-[30px] h-[30px] rounded-full bg-blue-100 flex items-center justify-center text-blue-800 text-[11px] font-medium shrink-0 overflow-hidden">
        {userData?.image ? (
          <img
            src={userData.image}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          initials(userData?.userName)
        )}{" "}
        {/* ✅ was: uuserName (typo, undefined) */}
      </div>

      {/* Bubble */}
      <div className="flex flex-col items-end max-w-[68%]">
        <div className="px-3.5 py-2.5 text-sm leading-relaxed rounded-[18px] rounded-br-[4px] bg-blue-600 text-white break-words">
          {msg?.image && (
            <img
              src={msg.image}
              className="max-w-[200px] max-h-[200px] w-full rounded-xl mb-1.5 block object-cover cursor-pointer"
            />
          )}
          {msg?.message} {/* ✅ was: message (separate prop) */}
        </div>

        {/* Time + ticks */}
        <div className="flex items-center gap-1 mt-1 px-0.5">
          <span className="text-[10px] text-slate-400">
            {msg?.time ||
              new Date(msg?.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
            {/* ✅ was: msg.time but msg wasn't a prop */}
          </span>
          <svg
            className="w-3.5 h-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke={isRead ? "#3B82F6" : "#94A3B8"}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 12l5 5L20 6" />
            <path d="M9 17l5-5" />
          </svg>
        </div>
      </div>
    </div>
  );
}
