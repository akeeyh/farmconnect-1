import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return `₹${price.toLocaleString("en-IN")}`;
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function generateOrderNumber(): string {
  const prefix = "FC";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}${timestamp}${random}`;
}

export const CATEGORIES = [
  { name: "Vegetables", icon: "🥦" },
  { name: "Fruits", icon: "🍎" },
  { name: "Grains", icon: "🌾" },
  { name: "Spices", icon: "🌶️" },
  { name: "Dairy", icon: "🥛" },
  { name: "Eggs", icon: "🥚" },
  { name: "Honey", icon: "🍯" },
  { name: "Organic Produce", icon: "🌱" },
];

export const ORDER_STATUSES = [
  "PLACED",
  "ACCEPTED",
  "PREPARING",
  "READY",
  "PICKED_UP",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
] as const;

export const ROLES = [
  { value: "CONSUMER", label: "Consumer" },
  { value: "FARMER", label: "Farmer" },
  { value: "RETAILER", label: "Retailer" },
  { value: "RESTAURANT", label: "Restaurant" },
  { value: "INSTITUTION", label: "Institution" },
] as const;

export const UNITS = ["kg", "g", "dozen", "litre", "piece", "bunch", "quintal"] as const;

export const FARMING_TYPES = ["Conventional", "Organic", "Natural"] as const;
