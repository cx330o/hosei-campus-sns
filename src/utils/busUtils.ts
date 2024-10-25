import * as z from "zod/v4"
import { holidayDataSchema, timetableSchema } from "./types"
import type { SpecialDateConfig } from "./types"
import { toMinutes, timeDifference, isHoliday, isWeekday, getNextDay, getPreviousDay, dayIndices } from "./dateUtils"
import specialDatesConfig from "./specialDates.json"

// 特殊日期の設定を取得する
export function getSpecialDateConfig(date: Date, station: string): SpecialDateConfig | null {
  const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  return (specialDatesConfig as SpecialDateConfig[]).find(
    config => config.date === dateStr && config.affectedStations.includes(station as SpecialDateConfig["affectedStations"][number])
  ) ?? null
}

// 特殊日期のルールに基づいてバスをフィルタリングする
function applySpecialDateRule(buses: z.infer<typeof timetableSchema>, rule: string): z.infer<typeof timetableSchema> {
  switch (rule) {
    case "holiday_local_plus_weekday_express":
      return buses.filter(bus =>
        bus.day === "Sunday" || (bus.busStops.length <= 5 && bus.day === "Weekday")
      )
    default:
      return buses
  }
}

// 次のバスを検索
export function findNextBuses({
  timetable, holidayData, currentDate, length, isComingToHosei, station }: {
    timetable: z.infer<typeof timetableSchema>, holidayData: z.infer<typeof holidayDataSchema>, currentDate: Date, length: number, isComingToHosei: boolean, station: string
  }) {
    const currentHour=currentDate.getHours()
    const currentMinutes=currentDate.getMinutes()
    const currentDay=dayIndices[currentDate.getDay()]
    const nowInMinutes = toMinutes({
      hour: currentHour,
      minutes: currentMinutes
    })
    const returnBuses = []
  // 現在の曜日のバスを取得
  let newTimetable = timetable.slice()
  newTimetable = newTimetable.filter(item => item.station === station && item.isComingToHosei === isComingToHosei)
  newTimetable = newTimetable.sort((a, b) => {
    if (a.leaveHour * 60 + a.leaveMinute > b.leaveHour * 60 + b.leaveMinute) {
      return 1
    } else {
      return -1
    }
  })
  if (length <= -1) {
    newTimetable.reverse()
  }
  let dayToCheck: string
  if (isHoliday({
    date: currentDate,
    holidayData
  })) {
    dayToCheck = "Sunday"
  } else {
    dayToCheck = currentDay
  }
  const dateToCheck = structuredClone(currentDate)
  // バスが見つかるまで次の日に進む
  for (let i = 0; i < 7; i++) {
    let busesForDay = newTimetable.slice().filter(bus =>
    bus.day === dayToCheck || (isWeekday(dayToCheck) && bus.day === "Weekday")
    )
    // 特殊日期の設定に基づいてバスをフィルタリング
    const specialConfig = getSpecialDateConfig(dateToCheck, station)
    if (specialConfig) {
      busesForDay = applySpecialDateRule(newTimetable.slice(), specialConfig.rule)
    }

    for (const bus of busesForDay) {
      const busLeaveTime = toMinutes({
        hour: bus.leaveHour,
        minutes: bus.leaveMinute
      })
      if (length >= 1) {
        if (i > 0 || timeDifference({
          nowInMinutes,
          busInMinutes: busLeaveTime
        }) >= 0) {
          let newBus
          returnBuses.push({
            date: (() => {
              const newDate = new Date(dateToCheck)
              newDate.setHours(bus.leaveHour, bus.leaveMinute, 0, 0)
              newBus = {
                ...bus, busStops: bus.busStops.map(stop => {
                  const stopDate = new Date(newDate)
                  stopDate.setHours(stop.hour, stop.minute, 0, 0)
                  return {
                    date: stopDate,
                    hour: stopDate.getHours(),
                    minute: stopDate.getMinutes(),
                    busStop: stop.busStop
                  }
                })
              }
              return newDate
            })(), ...newBus
          })
        }
      } else {
        if (i > 0 || timeDifference({
          nowInMinutes,
          busInMinutes: busLeaveTime
        }) < 0) {
          let newBus
          returnBuses.push({
            date: (() => {
              const newDate = new Date(dateToCheck)
              newDate.setHours(bus.leaveHour, bus.leaveMinute, 0, 0)
              newBus = {
                ...bus, busStops: bus.busStops.map(stop => {
                  const stopDate = new Date(newDate)
                  stopDate.setHours(stop.hour, stop.minute, 0, 0)
                  return {
                    date: stopDate,
                    hour: stopDate.getHours(),
                    minute: stopDate.getMinutes(),
                    busStop: stop.busStop
                  }
                })
              }
              return newDate
            })(), ...newBus
          })
        }
      }
      if (returnBuses.length >= Math.abs(length)) {
        if (length >= 0) {
          return returnBuses
        } else {
          return returnBuses.reverse()
        }
      }
    }
    if (length >= 1) {
      dayToCheck = getNextDay({
        currentDay: dayToCheck,
        currentDate: dateToCheck,
        holidayData
      })
      dateToCheck.setDate(dateToCheck.getDate() + 1)
    } else {
      dayToCheck = getPreviousDay({
        currentDay: dayToCheck,
        currentDate: dateToCheck,
        holidayData
      })
      dateToCheck.setDate(dateToCheck.getDate() - 1)
    }
  }
  return returnBuses
}
