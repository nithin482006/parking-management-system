import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import * as db from "./db";
import { nanoid } from "nanoid";
import { generateCompletionCode } from "../drizzle/schema";

// Helper to ensure admin access
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ==================== USER PROFILE ====================
  user: router({
    getProfile: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserById(ctx.user.id);
    }),

    updateProfile: protectedProcedure
      .input(z.object({
        name: z.string().optional(),
        phone: z.string().optional(),
        profileCompleted: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // If trying to mark profile as completed, validate required fields
        if (input.profileCompleted === true) {
          if (!input.name || !input.name.trim()) {
            throw new TRPCError({ code: 'BAD_REQUEST', message: 'Name is required to complete profile' });
          }
          if (!input.phone || !input.phone.trim()) {
            throw new TRPCError({ code: 'BAD_REQUEST', message: 'Phone number is required to complete profile' });
          }
          if (input.phone.trim().length < 10) {
            throw new TRPCError({ code: 'BAD_REQUEST', message: 'Phone number must be at least 10 digits' });
          }
        }
        await db.updateUser(ctx.user.id, input);
        return { success: true };
      }),

    getVehicles: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserVehicles(ctx.user.id);
    }),

    addVehicle: protectedProcedure
      .input(z.object({
        licensePlate: z.string(),
        vehicleType: z.enum(['car', 'motorcycle', 'truck', 'van']),
        color: z.string().optional(),
        model: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.createVehicle({
          userId: ctx.user.id,
          ...input,
        });
        return { success: true };
      }),

    updateVehicle: protectedProcedure
      .input(z.object({
        vehicleId: z.number(),
        licensePlate: z.string().optional(),
        color: z.string().optional(),
        model: z.string().optional(),
        isDefault: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const vehicle = await db.getVehicleById(input.vehicleId);
        if (!vehicle || vehicle.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }
        await db.updateVehicle(input.vehicleId, input);
        return { success: true };
      }),

    deleteVehicle: protectedProcedure
      .input(z.object({ vehicleId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const vehicle = await db.getVehicleById(input.vehicleId);
        if (!vehicle || vehicle.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }
        await db.deleteVehicle(input.vehicleId);
        return { success: true };
      }),
  }),

  // ==================== PARKING FACILITIES ====================
  facilities: router({
    getAll: publicProcedure.query(async () => {
      return await db.getAllFacilities();
    }),

    getById: publicProcedure
      .input(z.object({ facilityId: z.number() }))
      .query(async ({ input }) => {
        return await db.getFacilityById(input.facilityId);
      }),

    create: adminProcedure
      .input(z.object({
        name: z.string(),
        address: z.string(),
        city: z.string(),
        zipCode: z.string(),
        totalSlots: z.number(),
        description: z.string().optional(),
        amenities: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.createFacility(input);
        return { success: true };
      }),

    update: adminProcedure
      .input(z.object({
        facilityId: z.number(),
        name: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        zipCode: z.string().optional(),
        totalSlots: z.number().optional(),
        description: z.string().optional(),
        amenities: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { facilityId, ...updateData } = input;
        await db.updateFacility(facilityId, updateData);
        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({ facilityId: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteFacility(input.facilityId);
        return { success: true };
      }),
  }),

  // ==================== PARKING SLOTS ====================
  slots: router({
    getFacilitySlots: publicProcedure
      .input(z.object({ facilityId: z.number() }))
      .query(async ({ input }) => {
        return await db.getFacilitySlots(input.facilityId);
      }),

    getById: publicProcedure
      .input(z.object({ slotId: z.number() }))
      .query(async ({ input }) => {
        return await db.getSlotById(input.slotId);
      }),

    getAvailable: publicProcedure
      .input(z.object({
        facilityId: z.number(),
        startTime: z.date(),
        endTime: z.date(),
      }))
      .query(async ({ input }) => {
        return await db.getAvailableSlots(input.facilityId, input.startTime, input.endTime);
      }),

    create: adminProcedure
      .input(z.object({
        facilityId: z.number(),
        slotNumber: z.string(),
        level: z.string().optional(),
        type: z.enum(['regular', 'compact', 'handicap', 'premium']).optional(),
        pricePerHour: z.string(),
        pricePerDay: z.string().optional(),
        maxDuration: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.createSlot({
          ...input,
          status: 'available',
          isActive: true,
        } as any);
        return { success: true };
      }),

    update: adminProcedure
      .input(z.object({
        slotId: z.number(),
        slotNumber: z.string().optional(),
        level: z.string().optional(),
        type: z.enum(['regular', 'compact', 'handicap', 'premium']).optional(),
        status: z.enum(['available', 'occupied', 'reserved', 'maintenance']).optional(),
        pricePerHour: z.string().optional(),
        pricePerDay: z.string().optional(),
        maxDuration: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { slotId, ...updateData } = input;
        await db.updateSlot(slotId, updateData as any);
        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({ slotId: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteSlot(input.slotId);
        return { success: true };
      }),
  }),

  // ==================== BOOKINGS ====================
  bookings: router({
    getUserBookings: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserBookings(ctx.user.id);
    }),

    getById: protectedProcedure
      .input(z.object({ bookingId: z.number() }))
      .query(async ({ ctx, input }) => {
        const booking = await db.getBookingById(input.bookingId);
        if (!booking || (booking.userId !== ctx.user.id && ctx.user.role !== 'admin')) {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }
        return booking;
      }),

    getAllBookings: adminProcedure
      .input(z.object({ facilityId: z.number().optional() }))
      .query(async ({ input }) => {
        return await db.getAllBookings(input.facilityId);
      }),

    create: protectedProcedure
      .input(z.object({
        slotId: z.number(),
        vehicleId: z.number(),
        facilityId: z.number(),
        startTime: z.date(),
        endTime: z.date(),
        totalPrice: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Verify vehicle belongs to user
        const vehicle = await db.getVehicleById(input.vehicleId);
        if (!vehicle || vehicle.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }

        // Check slot availability
        const availableSlots = await db.getAvailableSlots(input.facilityId, input.startTime, input.endTime);
        if (!availableSlots.find(s => s.id === input.slotId)) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Slot not available for selected time' });
        }

        const bookingReference = `BK-${nanoid(10).toUpperCase()}`;
        const completionCode = generateCompletionCode();
        await db.createBooking({
          ...input,
          userId: ctx.user.id,
          status: 'confirmed',
          paymentStatus: 'paid',
          bookingReference,
          completionCode,
        });

        // Update slot status
        await db.updateSlot(input.slotId, { status: 'reserved' });

        // Create booking history
        await db.createBookingHistory({
          bookingId: ctx.user.id,
          action: 'created',
          reason: 'Initial booking',
        });

        return { success: true, bookingReference, completionCode };
      }),

    extend: protectedProcedure
      .input(z.object({
        bookingId: z.number(),
        newEndTime: z.date(),
        additionalPrice: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const booking = await db.getBookingById(input.bookingId);
        if (!booking || booking.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }

        const previousEndTime = booking.endTime;
        const newTotalPrice = (Number(booking.totalPrice) + Number(input.additionalPrice)).toString();

        await db.updateBooking(input.bookingId, {
          endTime: input.newEndTime,
          totalPrice: newTotalPrice as any,
        });

        await db.createBookingHistory({
          bookingId: input.bookingId,
          action: 'extended',
          previousEndTime,
          newEndTime: input.newEndTime,
          priceAdjustment: input.additionalPrice,
        });

        return { success: true };
      }),

    cancel: protectedProcedure
      .input(z.object({ bookingId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const booking = await db.getBookingById(input.bookingId);
        if (!booking || booking.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }

        await db.cancelBooking(input.bookingId);
        await db.updateSlot(booking.slotId, { status: 'available' });

        await db.createBookingHistory({
          bookingId: input.bookingId,
          action: 'cancelled',
          reason: 'User cancelled',
        });

        return { success: true };
      }),

    updateStatus: adminProcedure
      .input(z.object({
        bookingId: z.number(),
        status: z.enum(['pending', 'confirmed', 'active', 'completed', 'cancelled']),
      }))
      .mutation(async ({ input }) => {
        await db.updateBooking(input.bookingId, { status: input.status });
        return { success: true };
      }),

    verifyCompletionCode: adminProcedure
      .input(z.object({
        bookingId: z.number(),
        completionCode: z.string(),
      }))
      .mutation(async ({ input }) => {
        const booking = await db.getBookingById(input.bookingId);
        if (!booking) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Booking not found' });
        }

        if (booking.completionCode !== input.completionCode.toUpperCase()) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid completion code' });
        }

        await db.updateBooking(input.bookingId, { status: 'completed' });
        await db.updateSlot(booking.slotId, { status: 'available' });

        await db.createBookingHistory({
          bookingId: input.bookingId,
          action: 'completed',
          reason: 'Admin verified completion code',
        });

        return { success: true, message: 'Booking completed successfully' };
      }),
  }),

  // ==================== ANALYTICS ====================
  analytics: router({
    getOccupancyData: adminProcedure
      .input(z.object({
        facilityId: z.number(),
        startDate: z.date(),
        endDate: z.date(),
      }))
      .query(async ({ input }) => {
        return await db.getAnalyticsData(input.facilityId, input.startDate, input.endDate);
      }),

    getRevenueSummary: adminProcedure
      .input(z.object({ facilityId: z.number() }))
      .query(async ({ input }) => {
        const bookings = await db.getAllBookings(input.facilityId);
        const totalRevenue = bookings
          .filter(b => b.status === 'completed' && b.paymentStatus === 'paid')
          .reduce((sum, b) => sum + Number(b.totalPrice), 0);
        
        return {
          totalRevenue,
          totalBookings: bookings.length,
          completedBookings: bookings.filter(b => b.status === 'completed').length,
          cancelledBookings: bookings.filter(b => b.status === 'cancelled').length,
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
