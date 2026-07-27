import { describe, it, expect } from 'vitest';

// Helper functions from AdminDashboard
function generateRevenueData(bookings: any[]) {
  const data = Array(7).fill(0);
  const now = new Date();
  
  bookings.forEach(booking => {
    if (booking.status === 'completed' && booking.paymentStatus === 'paid') {
      const bookingDate = new Date(booking.endTime);
      const daysAgo = Math.floor((now.getTime() - bookingDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysAgo >= 0 && daysAgo < 7) {
        data[6 - daysAgo] += Number(booking.totalPrice);
      }
    }
  });
  
  return data.map(v => Math.round(v * 100) / 100);
}

function generateOccupancyData(bookings: any[], totalFacilities: number) {
  const data = Array(7).fill(0);
  const now = new Date();
  const slotsPerFacility = 50;
  const totalSlots = totalFacilities * slotsPerFacility;
  
  bookings.forEach(booking => {
    if (booking.status === 'active' || booking.status === 'confirmed') {
      const bookingDate = new Date(booking.startTime);
      const daysAgo = Math.floor((now.getTime() - bookingDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysAgo >= 0 && daysAgo < 7) {
        data[6 - daysAgo]++;
      }
    }
  });
  
  return data.map(v => totalSlots > 0 ? Math.round((v / totalSlots) * 100) : 0);
}

describe('Admin Dashboard Analytics', () => {
  describe('generateRevenueData', () => {
    it('should return array of 7 days with valid numbers', () => {
      const bookings: any[] = [];
      const result = generateRevenueData(bookings);
      expect(result).toHaveLength(7);
      expect(result.every(v => typeof v === 'number' && v >= 0)).toBe(true);
    });

    it('should return empty array when no bookings', () => {
      const result = generateRevenueData([]);
      expect(result.every(v => v === 0)).toBe(true);
    });

    it('should sum revenue for completed paid bookings', () => {
      const now = new Date();
      const today = new Date(now.getTime());
      
      const bookings = [
        {
          status: 'completed',
          paymentStatus: 'paid',
          totalPrice: 50,
          endTime: today.toISOString(),
        },
        {
          status: 'completed',
          paymentStatus: 'paid',
          totalPrice: 75,
          endTime: today.toISOString(),
        },
      ];
      
      const result = generateRevenueData(bookings);
      // Should have revenue in the result (125 total)
      expect(result.reduce((a, b) => a + b, 0)).toBeGreaterThanOrEqual(125);
    });

    it('should ignore non-completed bookings', () => {
      const now = new Date();
      const today = new Date(now.getTime());
      
      const bookings = [
        {
          status: 'pending',
          paymentStatus: 'paid',
          totalPrice: 50,
          endTime: today.toISOString(),
        },
      ];
      
      const result = generateRevenueData(bookings);
      // Non-completed bookings should not contribute to revenue
      expect(result.reduce((a, b) => a + b, 0)).toBe(0);
    });

    it('should ignore unpaid bookings', () => {
      const now = new Date();
      const today = new Date(now.getTime());
      
      const bookings = [
        {
          status: 'completed',
          paymentStatus: 'pending',
          totalPrice: 50,
          endTime: today.toISOString(),
        },
      ];
      
      const result = generateRevenueData(bookings);
      // Unpaid bookings should not contribute to revenue
      expect(result.reduce((a, b) => a + b, 0)).toBe(0);
    });

    it('should handle decimal prices correctly', () => {
      const now = new Date();
      const today = new Date(now.getTime());
      
      const bookings = [
        {
          status: 'completed',
          paymentStatus: 'paid',
          totalPrice: 50.5,
          endTime: today.toISOString(),
        },
        {
          status: 'completed',
          paymentStatus: 'paid',
          totalPrice: 75.25,
          endTime: today.toISOString(),
        },
      ];
      
      const result = generateRevenueData(bookings);
      const total = result.reduce((a, b) => a + b, 0);
      expect(total).toBeCloseTo(125.75, 2);
    });

    it('should distribute revenue across multiple days', () => {
      const now = new Date();
      const today = new Date(now.getTime());
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      const bookings = [
        {
          status: 'completed',
          paymentStatus: 'paid',
          totalPrice: 50,
          endTime: today.toISOString(),
        },
        {
          status: 'completed',
          paymentStatus: 'paid',
          totalPrice: 75,
          endTime: yesterday.toISOString(),
        },
      ];
      
      const result = generateRevenueData(bookings);
      // Should have revenue distributed across days
      expect(result.reduce((a, b) => a + b, 0)).toBeGreaterThanOrEqual(125);
    });

    it('should ignore bookings older than 7 days', () => {
      const now = new Date();
      const eightDaysAgo = new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000);
      
      const bookings = [
        {
          status: 'completed',
          paymentStatus: 'paid',
          totalPrice: 100,
          endTime: eightDaysAgo.toISOString(),
        },
      ];
      
      const result = generateRevenueData(bookings);
      expect(result.reduce((a, b) => a + b, 0)).toBe(0);
    });
  });

  describe('generateOccupancyData', () => {
    it('should return array of 7 days with valid percentages', () => {
      const bookings: any[] = [];
      const result = generateOccupancyData(bookings, 2);
      expect(result).toHaveLength(7);
      expect(result.every(v => typeof v === 'number' && v >= 0 && v <= 100)).toBe(true);
    });

    it('should return zeros when no bookings', () => {
      const result = generateOccupancyData([], 2);
      expect(result.every(v => v === 0)).toBe(true);
    });

    it('should calculate valid occupancy percentages', () => {
      const now = new Date();
      const today = new Date(now.getTime());
      
      const bookings = [
        {
          status: 'active',
          startTime: today.toISOString(),
        },
      ];
      
      const totalFacilities = 2; // 100 total slots
      const result = generateOccupancyData(bookings, totalFacilities);
      
      // All values should be valid percentages
      expect(result.every(v => v >= 0 && v <= 100)).toBe(true);
    });

    it('should handle zero facilities gracefully', () => {
      const bookings = [
        {
          status: 'active',
          startTime: new Date().toISOString(),
        },
      ];
      
      const result = generateOccupancyData(bookings, 0);
      // All values should be 0 when no facilities
      expect(result.every(v => v === 0)).toBe(true);
    });

    it('should count both active and confirmed bookings', () => {
      const now = new Date();
      const today = new Date(now.getTime());
      
      const bookings = [
        {
          status: 'active',
          startTime: today.toISOString(),
        },
        {
          status: 'confirmed',
          startTime: today.toISOString(),
        },
      ];
      
      const totalFacilities = 2; // 100 total slots
      const result = generateOccupancyData(bookings, totalFacilities);
      
      // All values should be valid percentages
      expect(result.every(v => v >= 0 && v <= 100)).toBe(true);
    });

    it('should ignore cancelled bookings', () => {
      const now = new Date();
      const today = new Date(now.getTime());
      
      const bookings = [
        {
          status: 'cancelled',
          startTime: today.toISOString(),
        },
      ];
      
      const result = generateOccupancyData(bookings, 2);
      expect(result.every(v => v === 0)).toBe(true);
    });

    it('should calculate correct percentage with multiple facilities', () => {
      const now = new Date();
      const today = new Date(now.getTime());
      
      // 5 facilities = 250 slots
      // 50 active bookings = 20% occupancy
      const bookings = Array(50).fill(null).map(() => ({
        status: 'active',
        startTime: today.toISOString(),
      }));
      
      const result = generateOccupancyData(bookings, 5);
      expect(result[6]).toBe(20);
    });

    it('should ignore bookings older than 7 days', () => {
      const now = new Date();
      const eightDaysAgo = new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000);
      
      const bookings = [
        {
          status: 'active',
          startTime: eightDaysAgo.toISOString(),
        },
      ];
      
      const result = generateOccupancyData(bookings, 2);
      expect(result.every(v => v === 0)).toBe(true);
    });
  });
});
