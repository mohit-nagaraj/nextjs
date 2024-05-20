import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

//function to merge tailwind classes conditionally
//might consist of multiple classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function absoluteUrl(path: string) {
  if (typeof window !== 'undefined') return path
  if (process.env.VERCEL_URL)
    return `https://${process.env.VERCEL_URL}${path}`
  return `http://localhost:${
    process.env.PORT ?? 3000
  }${path}`
}
