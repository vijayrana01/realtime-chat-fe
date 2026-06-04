export default function ReceiverMessage({ msg, selectedUser, image }) {
  const initials = (name) =>
    name
      ?.split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?";

  return (
    <div className="flex items-end gap-2">
      {/* Avatar */}
      <div className="w-[30px] h-[30px] rounded-full bg-purple-100 flex items-center justify-center text-purple-800 text-[11px] font-medium shrink-0">
        {selectedUser?.image ? (
          <img
            src={selectedUser.image}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          initials(selectedUser?.userName)
        )}
      </div>

      {/* Bubble */}
      <div className="flex flex-col items-start max-w-[68%]">
        <div className="px-3.5 py-2.5 text-sm leading-relaxed rounded-[18px] rounded-bl-[4px] bg-white border border-slate-200 text-slate-800 break-words">
          {msg?.image && (
            <img
              src={msg.image}
              className="max-w-[200px] max-h-[200px] w-full rounded-xl mb-1.5 block object-cover cursor-pointer"
            />
          )}
          {msg?.message} {/* ✅ was: hardcoded "hello from receiver" */}
        </div>

        {/* Time */}
        <span className="text-[10px] text-slate-400 mt-1 px-0.5">
          {msg.time ||
            new Date(msg.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
        </span>
      </div>
    </div>
  );
}
