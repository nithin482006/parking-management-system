import { eq, and, gte, lte, between, desc, asc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, vehicles, parkingFacilities, parkingSlots, bookings, bookingHistory, analyticsData, pricingRules } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ==================== USER FUNCTIONS ====================

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod", "phone"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUser(userId: number, data: Partial<typeof users.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(users).set(data).where(eq(users.id, userId));
}

// ==================== VEHICLE FUNCTIONS ====================

export async function getUserVehicles(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(vehicles).where(eq(vehicles.userId, userId));
}

export async function getVehicleById(vehicleId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(vehicles).where(eq(vehicles.id, vehicleId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createVehicle(data: typeof vehicles.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(vehicles).values(data);
  return result;
}

export async function updateVehicle(vehicleId: number, data: Partial<typeof vehicles.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(vehicles).set(data).where(eq(vehicles.id, vehicleId));
}

export async function deleteVehicle(vehicleId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(vehicles).where(eq(vehicles.id, vehicleId));
}

// ==================== PARKING FACILITY FUNCTIONS ====================

export async function getAllFacilities() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(parkingFacilities);
}

export async function getFacilityById(facilityId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(parkingFacilities).where(eq(parkingFacilities.id, facilityId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createFacility(data: typeof parkingFacilities.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(parkingFacilities).values(data);
  return result;
}

export async function updateFacility(facilityId: number, data: Partial<typeof parkingFacilities.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(parkingFacilities).set(data).where(eq(parkingFacilities.id, facilityId));
}

// ==================== PARKING SLOT FUNCTIONS ====================

export async function getFacilitySlots(facilityId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(parkingSlots).where(eq(parkingSlots.facilityId, facilityId));
}

export async function getSlotById(slotId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(parkingSlots).where(eq(parkingSlots.id, slotId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAvailableSlots(facilityId: number, startTime: Date, endTime: Date) {
  const db = await getDb();
  if (!db) return [];
  
  // Get all slots in the facility
  const allSlots = await db.select().from(parkingSlots).where(eq(parkingSlots.facilityId, facilityId));
  
  // Get conflicting bookings
  const conflictingBookings = await db.select().from(bookings).where(
    and(
      eq(bookings.facilityId, facilityId),
      or(
        and(gte(bookings.startTime, startTime), lte(bookings.startTime, endTime)),
        and(gte(bookings.endTime, startTime), lte(bookings.endTime, endTime)),
        and(lte(bookings.startTime, startTime), gte(bookings.endTime, endTime))
      ),
      eq(bookings.status, 'confirmed')
    )
  );
  
  const bookedSlotIds = new Set(conflictingBookings.map(b => b.slotId));
  return allSlots.filter(slot => slot.isActive && !bookedSlotIds.has(slot.id));
}

export async function createSlot(data: typeof parkingSlots.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(parkingSlots).values(data);
}

export async function updateSlot(slotId: number, data: Partial<typeof parkingSlots.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(parkingSlots).set(data).where(eq(parkingSlots.id, slotId));
}

export async function deleteSlot(slotId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(parkingSlots).set({ isActive: false }).where(eq(parkingSlots.id, slotId));
}

// ==================== BOOKING FUNCTIONS ====================

export async function getUserBookings(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(bookings).where(eq(bookings.userId, userId)).orderBy(desc(bookings.createdAt));
}

export async function getBookingById(bookingId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(bookings).where(eq(bookings.id, bookingId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllBookings(facilityId?: number) {
  const db = await getDb();
  if (!db) return [];
  if (facilityId) {
    return db.select().from(bookings).where(eq(bookings.facilityId, facilityId)).orderBy(desc(bookings.createdAt));
  }
  return db.select().from(bookings).orderBy(desc(bookings.createdAt));
}

export async function createBooking(data: typeof bookings.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(bookings).values(data);
}

export async function updateBooking(bookingId: number, data: Partial<typeof bookings.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(bookings).set(data).where(eq(bookings.id, bookingId));
}

export async function cancelBooking(bookingId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(bookings).set({ status: 'cancelled' }).where(eq(bookings.id, bookingId));
}

// ==================== BOOKING HISTORY FUNCTIONS ====================

export async function createBookingHistory(data: typeof bookingHistory.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(bookingHistory).values(data);
}

export async function getBookingHistory(bookingId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(bookingHistory).where(eq(bookingHistory.bookingId, bookingId));
}

// ==================== ANALYTICS FUNCTIONS ====================

export async function getAnalyticsData(facilityId: number, startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(analyticsData).where(
    and(
      eq(analyticsData.facilityId, facilityId),
      between(analyticsData.date, startDate, endDate)
    )
  );
}

export async function createAnalyticsData(data: typeof analyticsData.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(analyticsData).values(data);
}

// ==================== PRICING RULES FUNCTIONS ====================

export async function getFacilityPricingRules(facilityId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(pricingRules).where(eq(pricingRules.facilityId, facilityId));
}

export async function createPricingRule(data: typeof pricingRules.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(pricingRules).values(data);
}

export async function updatePricingRule(ruleId: number, data: Partial<typeof pricingRules.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(pricingRules).set(data).where(eq(pricingRules.id, ruleId));
}

// Helper function for OR conditions
function or(...conditions: any[]) {
  return conditions.reduce((acc, cond) => acc || cond);
}

export async function deleteFacility(facilityId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(parkingFacilities).where(eq(parkingFacilities.id, facilityId));
}
