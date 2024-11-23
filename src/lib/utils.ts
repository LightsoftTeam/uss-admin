import { DateTime } from "luxon";
import { Category } from "@/services/posts";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const OPTIONS_CATEGORY = [
  { value: Category.NEWS, label: "Noticias" },
  { value: Category.BITS, label: "Bits" },
  { value: Category.READS, label: "Reads" },
  { value: Category.TUBES, label: "Tubes" },
  { value: Category.PODCAST, label: "Podcast" },
  { value: Category.EDITORIAL, label: "Editorial" },
];

export function formatHour(date: string) {
  return DateTime.fromISO(date).toFormat("HH:mm");
}

export function formatDateLong(date: string) {
  return DateTime.fromISO(date, { locale: "es" }).toFormat(
    "dd 'de' MMMM 'del' yyyy"
  );
}

// export function formatDateTimeRange(from: string, to: string) {
//   return `${formatDateLong(from)}, ${formatHour(from)} - ${formatHour(to)}`;
// }
export function formatDateTimeRange(from: string, to: string) {
  const date = formatDateLong(from);

  const time = `${formatHour(from)} - ${formatHour(to)}`;

  return { date, time };
}

export function getQrLink(link: string) {
  // return `https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=${link}`;
  return `https://quickchart.io/qr?text=${link}&size=600`;
}
