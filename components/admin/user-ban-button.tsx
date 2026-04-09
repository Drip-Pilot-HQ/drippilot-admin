"use client";

import { ActionButton } from "@/components/ui/action-button";
import { banUserAction, unbanUserAction } from "@/app/actions/users";

export function UserBanButton({
  userId,
  isBanned,
  size = "sm",
}: {
  userId: string;
  isBanned: boolean;
  size?: "sm" | "md";
}) {
  if (isBanned) {
    return (
      <ActionButton
        onAction={() => unbanUserAction(userId)}
        label="Unban"
        pendingLabel="Unbanning…"
        successMessage="User has been unbanned."
        errorMessage="Failed to unban user."
        variant="success"
        size={size}
      />
    );
  }

  return (
    <ActionButton
      onAction={() => banUserAction(userId)}
      label="Ban"
      pendingLabel="Banning…"
      successMessage="User has been banned."
      errorMessage="Failed to ban user."
      variant="danger"
      size={size}
    />
  );
}
