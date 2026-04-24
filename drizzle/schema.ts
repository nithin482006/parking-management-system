import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, datetime } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extended with additional fields for parking management system.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Vehicle information for users
 */
export const vehicles = mysqlTable("vehicles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  licensePlate: varchar("licensePlate", { length: 20 }).notNull(),
  vehicleType: mysqlEnum("vehicleType", ["car", "motorcycle", "truck", "van"]).notNull(),
  color: varchar("color", { length: 50 }),
  model: varchar("model", { length: 100 }),
  isDefault: boolean("isDefault").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Vehicle = typeof vehicles.$inferSelect;
export type InsertVehicle = typeof vehicles.$inferInsert;

/**
 * Parking facility/location
 */
export const parkingFacilities = mysqlTable("parkingFacilities", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  zipCode: varchar("zipCode", { length: 20 }),
  totalSlots: int("totalSlots").notNull(),
  description: text("description"),
  amenities: text("amenities"), // JSON string
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ParkingFacility = typeof parkingFacilities.$inferSelect;
export type InsertParkingFacility = typeof parkingFacilities.$inferInsert;

/**
 * Individual parking slots
 */
export const parkingSlots = mysqlTable("parkingSlots", {
  id: int("id").autoincrement().primaryKey(),
  facilityId: int("facilityId").notNull(),
  slotNumber: varchar("slotNumber", { length: 50 }).notNull(),
  level: varchar("level", { length: 20 }), // e.g., "Ground", "Level 1", "Level 2"
  type: mysqlEnum("type", ["regular", "compact", "handicap", "premium"]).default("regular"),
  status: mysqlEnum("status", ["available", "occupied", "reserved", "maintenance"]).default("available"),
  pricePerHour: decimal("pricePerHour", { precision: 10, scale: 2 }).notNull(),
  pricePerDay: decimal("pricePerDay", { precision: 10, scale: 2 }),
  maxDuration: int("maxDuration"), // in hours, null = unlimited
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ParkingSlot = typeof parkingSlots.$inferSelect;
export type InsertParkingSlot = typeof parkingSlots.$inferInsert;

/**
 * Parking bookings
 */
export const bookings = mysqlTable("bookings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  slotId: int("slotId").notNull(),
  vehicleId: int("vehicleId").notNull(),
  facilityId: int("facilityId").notNull(),
  startTime: datetime("startTime").notNull(),
  endTime: datetime("endTime").notNull(),
  status: mysqlEnum("status", ["pending", "confirmed", "active", "completed", "cancelled"]).default("pending"),
  totalPrice: decimal("totalPrice", { precision: 10, scale: 2 }).notNull(),
  paymentStatus: mysqlEnum("paymentStatus", ["unpaid", "paid", "refunded"]).default("unpaid"),
  bookingReference: varchar("bookingReference", { length: 50 }).unique(),
  completionCode: varchar("completionCode", { length: 20 }).unique(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = typeof bookings.$inferInsert;

export function generateCompletionCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Booking history for tracking changes and extensions
 */
export const bookingHistory = mysqlTable("bookingHistory", {
  id: int("id").autoincrement().primaryKey(),
  bookingId: int("bookingId").notNull(),
  action: mysqlEnum("action", ["created", "extended", "cancelled", "completed", "modified"]).notNull(),
  previousEndTime: datetime("previousEndTime"),
  newEndTime: datetime("newEndTime"),
  priceAdjustment: decimal("priceAdjustment", { precision: 10, scale: 2 }),
  reason: text("reason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type BookingHistory = typeof bookingHistory.$inferSelect;
export type InsertBookingHistory = typeof bookingHistory.$inferInsert;

/**
 * Analytics and usage tracking
 */
export const analyticsData = mysqlTable("analyticsData", {
  id: int("id").autoincrement().primaryKey(),
  facilityId: int("facilityId").notNull(),
  date: datetime("date").notNull(),
  totalBookings: int("totalBookings").default(0),
  completedBookings: int("completedBookings").default(0),
  cancelledBookings: int("cancelledBookings").default(0),
  occupancyRate: decimal("occupancyRate", { precision: 5, scale: 2 }).default("0"),
  totalRevenue: decimal("totalRevenue", { precision: 12, scale: 2 }).default("0"),
  averageBookingDuration: int("averageBookingDuration"), // in minutes
  peakHour: varchar("peakHour", { length: 20 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AnalyticsData = typeof analyticsData.$inferSelect;
export type InsertAnalyticsData = typeof analyticsData.$inferInsert;

/**
 * Pricing rules for different time periods
 */
export const pricingRules = mysqlTable("pricingRules", {
  id: int("id").autoincrement().primaryKey(),
  facilityId: int("facilityId").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  dayOfWeek: varchar("dayOfWeek", { length: 20 }), // e.g., "Monday", "Weekend", "Holiday"
  startTime: varchar("startTime", { length: 10 }), // HH:MM format
  endTime: varchar("endTime", { length: 10 }), // HH:MM format
  pricePerHour: decimal("pricePerHour", { precision: 10, scale: 2 }).notNull(),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PricingRule = typeof pricingRules.$inferSelect;
export type InsertPricingRule = typeof pricingRules.$inferInsert;
