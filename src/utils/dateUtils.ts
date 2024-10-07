import * as z from "zod/v4"
import { holidayDataSchema } from "./types"

export const dayIndices = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
export const equationOfTime = 9

export function toMinutes({ hour, minutes }: { hour: number, minutes: number }) {
  return hour * 60 + minutes
}

export function timeDifference({ nowInMinutes, busInMinutes }: { nowInMinutes: number, busInMinutes: number }) {
  return busInMinutes - nowInMinutes
}

// 日付が祝日かどうかを判定
export function isHoliday({ date, holidayData }: { date: Date, holidayData: z.infer<typeof holidayDataSchema> }) {
  const newDate = structuredClone(date)
  // 日本時間と標準時の差を足す。
  // 文字列としてみた際に日本の日付になるようにする。
  newDate.setHours(newDate.getHours() + equationOfTime)
  const formattedDate = newDate.toISOString().split('T')[0]
  if (!holidayData) {
    throw new Error("Holiday data is not provided")
  }
  return holidayData[formattedDate]
}

// 平日かどうかを判定
export function isWeekday(day: string) {
  return ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].includes(day)
}

// 次の曜日を取得する関数（祝日も「日曜日」として扱う）
export function getNextDay({ currentDay, currentDate, holidayData }: { currentDay: string, currentDate: Date, holidayData: z.infer<typeof holidayDataSchema> }) {
  const nextDate = new Date(currentDate)
  nextDate.setDate(nextDate.getDate() + 1)
  if (isHoliday({
    date: nextDate,
    holidayData
  })) {
    return "Sunday" // 祝日を日曜日と扱う
  }
  const nextDayIndex = (dayIndices.indexOf(currentDay) + 1) % 7
  return dayIndices[nextDayIndex]
}

export function getPreviousDay({ currentDay, currentDate, holidayData }: { currentDay: string, currentDate: Date, holidayData: z.infer<typeof holidayDataSchema> }) {
  const previousDate = new Date(currentDate)
  previousDate.setDate(previousDate.getDate() - 1)
  if (isHoliday({
    date: previousDate,
    holidayData
  })) {
    return "Sunday" // 祝日を日曜日と扱う
  }
  const previousDayIndex = (dayIndices.indexOf(currentDay) - 1 + 7) % 7
  return dayIndices[previousDayIndex]
}

// `hh:mm` を分単位に変換する関数
export function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number)
  return hours * 60 + minutes
}

// 分単位を `hh:mm` に戻す関数
export function minutesToTime(minutes: number) {
  const hours = String(Math.floor(minutes / 60))
  const mins = String(minutes % 60).padStart(2, "0")
  return `${hours}:${mins}`
}

export function getDateString(now: Date) {
  return `${now.getFullYear().toString().padStart(4, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getDate().toString().padStart(2, '0')}`
}

export function getTimeString(now: Date) {
  return `${now.getHours().toString()}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
}
