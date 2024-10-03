import * as z from "zod/v4";

// === 基础枚举 ===
export const DayTypeSchema = z.union([
  z.literal("Weekday"),
  z.literal("Saturday"),
  z.literal("Sunday"),
]);
export type DayType = z.infer<typeof DayTypeSchema>;

export const StationIdSchema = z.union([
  // 市ヶ谷キャンパス
  z.literal("ichigaya"),
  z.literal("iidabashi"),
  z.literal("kudanshita"),
  // 小金井キャンパス
  z.literal("higashikoganei"),
  z.literal("musashikoganei"),
  // 多摩キャンパス
  z.literal("aihara"),
  z.literal("mejirodai"),
  z.literal("nishihachioji"),
]);
export type StationId = z.infer<typeof StationIdSchema>;

export const EkitanStationSchema = z.union([
  // 市ヶ谷キャンパス
  z.literal("市ケ谷駅"),
  z.literal("飯田橋駅"),
  z.literal("九段下駅"),
  // 小金井キャンパス
  z.literal("武蔵小金井駅"),
  z.literal("東小金井駅"),
]);
export type EkitanStation = z.infer<typeof EkitanStationSchema>;

// === 巴士停靠站 ===
export const BusStopSchema = z.object({
  hour: z.number(),
  minute: z.number(),
  busStop: z.string(),
});
export type BusStop = z.infer<typeof BusStopSchema>;

export const BusStopWithDateSchema = BusStopSchema.extend({
  date: z.date(),
});
export type BusStopWithDate = z.infer<typeof BusStopWithDateSchema>;

// === 时刻表条目 ===
export const TimetableEntrySchema = z.object({
  id: z.string(),
  day: DayTypeSchema,
  isComingToHosei: z.boolean(),
  station: StationIdSchema,
  leaveHour: z.number(),
  leaveMinute: z.number(),
  arriveHour: z.number(),
  arriveMinute: z.number(),
  busStops: z.array(BusStopSchema),
});
export type TimetableEntry = z.infer<typeof TimetableEntrySchema>;

export const TimetableSchema = z.array(TimetableEntrySchema);
export type Timetable = z.infer<typeof TimetableSchema>;

// === 带日期的巴士数据（运行时使用）===
export const BusWithDateSchema = TimetableEntrySchema.extend({
  date: z.date(),
  busStops: z.array(BusStopWithDateSchema),
});
export type BusWithDate = z.infer<typeof BusWithDateSchema>;

// === 电车数据 ===
export const EkitanEntrySchema = z.object({
  day: DayTypeSchema,
  station: EkitanStationSchema,
  trainType: z.string(),
  destination: z.string(),
  direction: z.string(),
  line: z.string(),
  hour: z.number(),
  minute: z.number(),
});
export type EkitanEntry = z.infer<typeof EkitanEntrySchema>;

export const EkitanDataSchema = z.array(EkitanEntrySchema);
export type EkitanData = z.infer<typeof EkitanDataSchema>;

export const TrainWithDateSchema = EkitanEntrySchema.extend({
  date: z.date(),
});
export type TrainWithDate = z.infer<typeof TrainWithDateSchema>;

// === 节假日数据 ===
export const HolidayDataSchema = z.record(z.string(), z.string());
export type HolidayData = z.infer<typeof HolidayDataSchema>;

// === 用户状态 ===
export const UserStateSchema = z.object({
  station: StationIdSchema,
  isComingToHosei: z.boolean(),
});
export type UserState = z.infer<typeof UserStateSchema>;

// === 特殊日期配置 ===
export const SpecialDateConfigSchema = z.object({
  date: z.string(),
  affectedStations: z.array(StationIdSchema),
  rule: z.string(),
  description: z.string(),
  notificationStart: z.string().optional(),
  notificationEnd: z.string().optional(),
});
export type SpecialDateConfig = z.infer<typeof SpecialDateConfigSchema>;

// === 店铺数据 ===
export interface ShopData {
  id: string;
  name: string;
  image: string;
  description: string;
  shortDescription: string;
  discountContent: string[];
  discountMethod: string;
  businessHours: string[];
  paymentMethods: string;
  mapEmbedUrl: string;
  contactPhone: string;
  address: string;
  notes: string[];
  metaDescription: string;
}

// === 向后兼容别名 ===
// 旧的 schema 名称作为别名导出，保持现有代码不需要修改
export const holidayDataSchema = HolidayDataSchema;
export const timetableSchema = TimetableSchema;
export const stationSchema = StationIdSchema;
export const stateSchema = UserStateSchema;
export const ekitanSchema = EkitanDataSchema;
export const BusSchema = BusWithDateSchema;
