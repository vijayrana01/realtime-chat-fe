export default function ReceiverMessage({ msg, selectedUser }) {
  const initials = (name) =>
    name?.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "?";

  return (
    <div className="flex items-end gap-2">
      <div
        className="w-[30px] h-[30px] rounded-full flex items-center justify-center text-[11px] font-semibold shrink-0 overflow-hidden"
        style={{ background: "rgba(167,139,250,0.2)", color: "#c4b5fd" }}
      >
        {selectedUser?.image ? (
          <img src={selectedUser.image} className="w-full h-full rounded-full object-cover" alt={selectedUser?.userName} />
        ) : (
          initials(selectedUser?.userName)
        )}
      </div>

      <div className="flex flex-col items-start max-w-[68%]">
        <div
          className="px-3.5 py-2.5 text-sm leading-relaxed rounded-[18px] rounded-bl-[4px] break-words"
          style={{
            background: "rgba(255,255,255,0.09)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#f0f0ff",
          }}
        >
          {msg?.image && (
            <img src={msg.image} className="max-w-[200px] max-h-[200px] w-full rounded-xl mb-1.5 block object-cover cursor-pointer" alt="attachment" />
          )}
          {msg?.message}
        </div>
        <span className="text-[10px] mt-1 px-0.5" style={{ color: "rgba(200,190,255,0.35)" }}>
          {msg.time || new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </div>
  );
}