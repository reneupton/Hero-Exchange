import Image from "next/image";

type ProgressPayload = {
  username: string;
  balanceDelta?: number;
  xpDelta?: number;
  level?: number;
  updatedBy?: string;
  reason?: string;
};

type AvatarPayload = {
  username: string;
  avatarUrl?: string;
  updatedBy?: string;
};

type CooldownPayload = {
  username: string;
  updatedBy?: string;
};

type StatusPayload = {
  auctionId: string;
  title?: string;
  brand?: string;
  status: string;
  changedBy?: string;
};

type Props =
  | { type: "progress"; payload: ProgressPayload }
  | { type: "avatar"; payload: AvatarPayload }
  | { type: "status"; payload: StatusPayload }
  | { type: "cooldown"; payload: CooldownPayload };

const toastStyle = {
  background: 'var(--card)',
  border: '1px solid var(--card-border)'
};

function badge(text: string) {
  return (
    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold text-slate-200" style={{background: 'rgba(123, 97, 255, 0.25)', border: '1px solid var(--card-border)'}}>
      {text}
    </span>
  );
}

export default function AdminActionToast(props: Props) {
  if (props.type === "progress") {
    const { payload } = props;
    const parts: string[] = [];
    if (payload.balanceDelta) {
      parts.push(`${payload.balanceDelta > 0 ? "+" : ""}${payload.balanceDelta} Gold`);
    }
    if (payload.xpDelta) {
      parts.push(`${payload.xpDelta > 0 ? "+" : ""}${payload.xpDelta} XP`);
    }
    if (payload.level) {
      parts.push(`Lv ${payload.level}`);
    }
    return (
      <div className="flex items-center gap-3 px-3 py-2 rounded-2xl shadow-lg" style={toastStyle}>
        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-600 to-violet-700 flex items-center justify-center text-xl shadow-inner">🔔</div>
        <div className="flex flex-col text-slate-100">
          <span className="font-semibold">Admin updated your progress</span>
          <span className="text-sm text-slate-300">{parts.join(" • ") || "Changes applied"}</span>
          <div className="flex gap-2 mt-1">
            {badge(payload.updatedBy ? `By ${payload.updatedBy}` : "Admin action")}
            {payload.reason ? badge(payload.reason) : null}
          </div>
        </div>
      </div>
    );
  }

  if (props.type === "avatar") {
    const { payload } = props;
    return (
      <div className="flex items-center gap-3 px-3 py-2 rounded-2xl shadow-lg" style={toastStyle}>
        {payload.avatarUrl ? (
          <div className="h-12 w-12 relative rounded-2xl overflow-hidden shadow" style={{border: '1px solid var(--card-border)'}}>
            <Image src={payload.avatarUrl} alt="New avatar" fill className="object-cover" />
          </div>
        ) : (
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-600 via-rose-600 to-amber-600 flex items-center justify-center text-xl shadow-inner">🪄</div>
        )}
        <div className="flex flex-col text-slate-100">
          <span className="font-semibold">Avatar updated</span>
          <span className="text-sm text-slate-300">Changed by {payload.updatedBy ?? "admin"}</span>
        </div>
      </div>
    );
  }

  if (props.type === "status") {
    const { payload } = props;
    return (
      <div className="flex items-center gap-3 px-3 py-2 rounded-2xl shadow-lg" style={toastStyle}>
        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 flex items-center justify-center text-xl shadow-inner">📜</div>
        <div className="flex flex-col text-slate-100">
          <span className="font-semibold">Auction status updated</span>
          <span className="text-sm text-slate-300">
            {payload.status} • {payload.title ?? payload.auctionId}
          </span>
          <div className="flex gap-2 mt-1">
            {badge(payload.changedBy ? `By ${payload.changedBy}` : "Admin action")}
          </div>
        </div>
      </div>
    );
  }

  if (props.type === "cooldown") {
    const { payload } = props;
    return (
      <div className="flex items-center gap-3 px-3 py-2 rounded-2xl shadow-lg" style={toastStyle}>
        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-700 flex items-center justify-center text-xl shadow-inner">⏱️</div>
        <div className="flex flex-col text-slate-100">
          <span className="font-semibold">Cooldown reset</span>
          <span className="text-sm text-slate-300">For {payload.username}</span>
          <div className="flex gap-2 mt-1">
            {badge(payload.updatedBy ? `By ${payload.updatedBy}` : "Admin action")}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
