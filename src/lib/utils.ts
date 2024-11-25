import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const mapUrl = "https://maps.app.goo.gl/wMSAPhbnzKqrcQhY8"

export const whatsappUrl = "https://api.whatsapp.com/send?phone=584246248690"