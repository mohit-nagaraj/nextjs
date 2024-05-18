import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

//function to merge tailwind classes conditionally
//might consist of multiple classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
