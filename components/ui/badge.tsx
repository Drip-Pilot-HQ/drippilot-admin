type BadgeProps = {
  variant: "active" | "banned" | "admin" | "pending" | "suspended";
};

const styles: Record<BadgeProps["variant"], string> = {
  active: "bg-cyan-50 text-cyan-700 border border-cyan-200",
  banned: "bg-red-50 text-red-600 border border-red-200",
  admin: "bg-orange-50 text-orange-600 border border-orange-200",
  pending: "bg-amber-50 text-amber-600 border border-amber-200",
  suspended: "bg-red-50 text-red-600 border border-red-200",
};

const labels: Record<BadgeProps["variant"], string> = {
  active: "Active",
  banned: "Banned",
  admin: "Admin",
  pending: "Pending",
  suspended: "Suspended",
};

export function Badge({ variant }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${styles[variant]}`}
    >
      {labels[variant]}
    </span>
  );
}
