import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { formatDistanceToNow, format, parseISO, isPast } from "date-fns"
import { Timestamp } from "firebase/firestore"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Helper function to convert various date formats to JavaScript Date
function convertToDate(dateValue: any): Date {
  if (!dateValue) {
    console.error("Invalid date value:", dateValue);
    return new Date();
  }
  
  if (dateValue instanceof Date) {
    return dateValue;
  }
  
  if (typeof dateValue === 'string') {
    try {
      return parseISO(dateValue);
    } catch (error) {
      console.error("Failed to parse date string:", dateValue);
      return new Date();
    }
  }
  
  if (dateValue instanceof Timestamp) {
    return dateValue.toDate();
  }
  
  if (dateValue.seconds && dateValue.nanoseconds) {
    // Handle Firestore timestamp object format
    return new Timestamp(dateValue.seconds, dateValue.nanoseconds).toDate();
  }
  
  console.error("Unknown date format:", dateValue);
  return new Date();
}

export function formatDateDistance(dateString: any): string {
  try {
    const date = convertToDate(dateString);
    if (isPast(date)) {
      return 'Campaign ended';
    }
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (error) {
    console.error("Error formatting date distance:", error);
    return "Date unknown";
  }
}

export function formatDate(dateString: any): string {
  try {
    const date = convertToDate(dateString);
    return format(date, 'MMM d, yyyy');
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Date unknown";
  }
}
