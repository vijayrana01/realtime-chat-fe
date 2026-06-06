export default function SenderMessage({ msg, userData }) {
  const initials = (name) =>
    name
      ?.split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?";

  const isRead = msg?.isRead;

  return (
    <div className="flex items-end gap-2 flex-row-reverse">
      <div
        className="w-[30px] h-[30px] rounded-full flex items-center justify-center text-[11px] font-semibold shrink-0 overflow-hidden"
        style={{ background: "rgba(96,165,250,0.2)", color: "#93c5fd" }}
      >
        {userData?.image ? (
          <img
            src={userData.image}
            className="w-full h-full rounded-full object-cover"
            alt={userData?.userName}
          />
        ) : (
          initials(userData?.userName)
        )}
      </div>

      <div className="flex flex-col items-end max-w-[68%]">
        <div
          className="px-3.5 py-2.5 text-sm leading-relaxed rounded-[18px] rounded-br-[4px] break-words text-white"
          style={{ background: "linear-gradient(135deg, #7c3aed, #4f87e8)" }}
        >
          {msg?.image && (
            <img
              src={msg.image}
              className="max-w-[200px] max-h-[200px] w-full rounded-xl mb-1.5 block object-cover cursor-pointer"
              alt="attachment"
            />
          )}
          {msg?.message}
        </div>

        <div className="flex items-center gap-1 mt-1 px-0.5">
          <span
            className="text-[10px]"
            style={{ color: "rgba(200,190,255,0.35)" }}
          >
            {msg?.time ||
              new Date(msg?.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
          </span>
          <svg
            className="w-3.5 h-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke={isRead ? "#a78bfa" : "rgba(200,190,255,0.35)"}
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
