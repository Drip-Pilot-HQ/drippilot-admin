type StatCardProps = {
  label: string;
  value: number | string;
  accent?: "orange" | "cyan";
};

export function StatCard({ label, value, accent = "orange" }: StatCardProps) {
  const border = accent === "orange" ? "border-orange-400" : "border-cyan-400";
  const text = accent === "orange" ? "text-orange-400" : "text-orange-500";

  return (
    <div
      className={`bg-white border border-neutral-200 border-l-4 ${border} rounded-xl p-5 flex flex-col gap-1 shadow-sm`}
    >
      <span className="text-xs text-neutral-400 uppercase tracking-widest font-medium">
        {label}
      </span>
      <span className={`text-3xl font-bold ${text}`}>{value}</span>
    </div>
  );
}
