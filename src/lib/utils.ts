import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Extracts initials from a user's name
 * @param name - The user's full name
 * @returns A string containing the user's initials
 */
export function getUserInitials(name: string): string {
  // Handle empty input
  if (!name || name.trim() === "") {
    return "";
  }

  // Split the name into parts
  const nameParts = name.trim().split(/\s+/);

  // Handle single-word names (like "Isomeg")
  if (nameParts.length === 1) {
    const singleName = nameParts[0];
    // Take first two letters for single words, or just one if it's a single character
    return singleName.length >= 2
      ? singleName.substring(0, 2).toUpperCase()
      : singleName.toUpperCase();
  }

  // For multi-word names, take first letter of first name and first letter of last name
  const firstInitial = nameParts[0].charAt(0);
  const lastInitial = nameParts[nameParts.length - 1].charAt(0);

  return (firstInitial + lastInitial).toUpperCase();
}
