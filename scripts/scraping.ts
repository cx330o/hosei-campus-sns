import { JSDOM } from "jsdom"
import * as z from "zod"
import fs from "fs"

async function getEkitan({ url }: { url: string }) {
    const days = ["Weekday", "Saturday", "Sunday"]
    const result: { hour: number, minute: number, trainType: string, destination: string, direction: string, station: string, line: string, day: string }[] = []
    await Promise.all(days.map(async (day, idx) => {
        const dom = await JSDOM.fromURL(`${url}?view=list&dw=${idx}`, {
            referrer: "https://ekitan.com/",
            userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3"
        })
        const document = dom.window.document
        const directions = document.querySelectorAll("li.ek-direction_tab > a")
        const line = z.string().parse(document.querySelector("li.line-name a")?.textContent)
        const station = z.string().parse(document.querySelector("div.station-name a")?.textContent?.replace(/\(神奈川\)/, ""));
        [...document.querySelectorAll("div.tab-content-inner")].map((d, idx) => {
            for (const el of d.querySelectorAll("li.ek-narrow")) {
                let time = ""
                try {
                    time = z.string().parse(el.querySelector("span.dep-time")?.textContent)
                } catch {
                    break
                }
                const [hour, minute] = time.split(":").map(item => parseInt(item))
                const trainType = z.string().parse(el.querySelector("span.train-type")?.textContent)
                const destination = z.string().parse(el.querySelector("span.destination")?.textContent)
                const direction = z.string().parse(directions[idx]?.textContent)
                result.push({ hour, minute, trainType, destination, direction, station, line, day })
            }
        })
    }))
    return result;
}

async function getAllEkitan() {
    const urls = [
        // 市ケ谷駅
        "https://ekitan.com/timetable/railway/line-station/180-29/d1",  // JR中央線各停
        "https://ekitan.com/timetable/railway/line-station/223-3/d1",   // 都営新宿線
        "https://ekitan.com/timetable/railway/line-station/274-10/d1",  // メトロ南北線
        // 飯田橋駅
        "https://ekitan.com/timetable/railway/line-station/180-28/d1",  // JR中央線各停
        "https://ekitan.com/timetable/railway/line-station/225-19/d1",  // 都営大江戸線
        "https://ekitan.com/timetable/railway/line-station/274-9/d1",   // メトロ南北線
        "https://ekitan.com/timetable/railway/line-station/275-5/d1",   // メトロ東西線
        // 九段下駅
        "https://ekitan.com/timetable/railway/line-station/223-4/d1",   // 都営新宿線
        "https://ekitan.com/timetable/railway/line-station/272-5/d1",   // メトロ半蔵門線
        "https://ekitan.com/timetable/railway/line-station/275-6/d1",   // メトロ東西線
    ]
    const result: {
        hour: number;
        minute: number;
        trainType: string;
        destination: string;
        direction: string;
        station: string;
        line: string;
        day: string;
    }[] = []
    for (const url of urls) {
        try {
            const data = await getEkitan({ url })
            result.push(...data)
            console.log(`OK: ${url} (${data.length} entries)`)
        } catch (e) {
            console.error(`FAIL: ${url}`, e)
        }
    }
    // 駅名の正規化
    result.forEach(item => {
        if (item.station === "市ヶ谷駅") item.station = "市ケ谷駅"
    })
    fs.writeFileSync("src/utils/ekitan.json", JSON.stringify(result, null, 2))
    console.log(`Total: ${result.length} entries written`)
}

getAllEkitan()
