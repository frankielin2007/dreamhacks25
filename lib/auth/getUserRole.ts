import { currentUser } from "@clerk/nextjs/server";

export type UserRole = "doctor" | "patient";

/**
 * Get the current user's role from Clerk publicMetadata
 * Defaults to "patient" if no role is set
 */
export async function getUserRole(): Promise<UserRole> {
  const user = await currentUser();
  
  if (!user) {
    return "patient"; // Default for unauthenticated
  }

  const role = user.publicMetadata?.role as UserRole | undefined;
  return role === "doctor" ? "doctor" : "patient";
}

/**
 * Check if the current user is a doctor
 */
export async function isDoctor(): Promise<boolean> {
  const role = await getUserRole();
  return role === "doctor";
}

/**
 * Check if the current user is a patient
 */
export async function isPatient(): Promise<boolean> {
  const role = await getUserRole();
  return role === "patient";
}
