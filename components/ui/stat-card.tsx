type StatCardProps = {
  label: string;
  value: number | string;
  accent?: "orange" | "cyan";
};

export function StatCard({ label, value, accent = "orange" }: StatCardProps) {
  const isOrange = accent === "orange";

  const bgColors = isOrange
    ? "bg-gradient-to-br from-white to-orange-50/30"
    : "bg-gradient-to-br from-white to-cyan-50/30";

  const textColors = isOrange ? "text-orange-600" : "text-cyan-600";
  const iconBg = isOrange
    ? "bg-orange-100/50 text-orange-500"
    : "bg-cyan-100/50 text-cyan-500";
  const ringHover = isOrange
    ? "group-hover:ring-orange-500/20"
    : "group-hover:ring-cyan-500/20";

  return (
    <div
      className={`relative overflow-hidden ${bgColors} border border-neutral-200/60 rounded-xl p-5 flex flex-col gap-2 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 group ring-1 ring-inset ring-transparent ${ringHover}`}
    >
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity duration-300 group-hover:scale-110 pointer-events-none">
        <div
          className={`w-16 h-16 rounded-full blur-xl ${isOrange ? "bg-orange-500" : "bg-cyan-500"}`}
        ></div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-[11px] text-neutral-500 uppercase tracking-[0.2em] font-semibold">
          {label}
        </span>
        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center ${iconBg}`}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
        </div>
      </div>

      <span className={`text-3xl font-bold tracking-tight ${textColors} mt-1`}>
        {value}
      </span>
    </div>
  );
}
