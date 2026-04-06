# ParkHub - Parking Slot Management System

A comprehensive, elegant parking slot management system built with React, TypeScript, TailwindCSS, and tRPC. Features real-time slot availability, user bookings, and admin management capabilities.

## Features

### User Features
- **OAuth Authentication**: Seamless login via Manus OAuth
- **Slot Browsing**: Browse available parking slots with real-time status (available/occupied/reserved)
- **Advanced Filtering**: Filter slots by date, time, and facility
- **Booking Management**: 
  - Book parking slots with date/time selection
  - View booking history with status tracking
  - Cancel bookings with confirmation
  - Real-time price calculation
- **Vehicle Management**: Add and manage multiple vehicles with license plates and details
- **Profile Management**: Edit personal information and contact details
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

### Admin Features
- **Facility Management**: 
  - Create, edit, and delete parking facilities
  - Set facility details and total slot capacity
- **Slot Management**:
  - Create slots with pricing and configuration
  - Edit slot details (price, type, max duration)
  - Delete slots with confirmation
  - Support for multiple slot types (regular, compact, handicap, premium)
- **Booking Management**:
  - View all bookings across the system
  - Filter and search bookings
  - Track booking status and revenue
- **Analytics Dashboard**:
  - Total facilities and bookings overview
  - Revenue tracking
  - Occupancy rate calculation
  - Real-time statistics

## Tech Stack

- **Frontend**: React 19, TypeScript, TailwindCSS 4, shadcn/ui
- **Backend**: Express 4, tRPC 11
- **Database**: MySQL/TiDB with Drizzle ORM
- **Authentication**: Manus OAuth
- **UI Components**: Lucide React icons, Framer Motion animations
- **Styling**: Professional design system with elegant gradients and 3D effects

## Project Structure

```
client/
  src/
    pages/              # Page components (Home, UserDashboard, AdminDashboard)
    components/         # Reusable components (SlotBrowser, BookingForm, etc.)
    lib/               # tRPC client setup
    index.css          # Global styles and design tokens
    App.tsx            # Routes and layout

server/
  routers.ts           # tRPC procedure definitions
  db.ts                # Database query helpers
  _core/               # Framework infrastructure

drizzle/
  schema.ts            # Database schema definitions
  migrations/          # SQL migrations

shared/
  const.ts             # Shared constants
```

## Getting Started

### Prerequisites
- Node.js 22+
- pnpm package manager
- MySQL/TiDB database

### Installation

1. Install dependencies:
```bash
pnpm install
```

2. Set up environment variables:
```bash
# Database connection
DATABASE_URL=mysql://user:password@localhost:3306/parking_db

# OAuth configuration (auto-injected by Manus)
VITE_APP_ID=your_app_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im

# JWT for session management
JWT_SECRET=your_secret_key
```

3. Run database migrations:
```bash
pnpm db:push
```

4. Start development server:
```bash
pnpm dev
```

The application will be available at `http://localhost:3000`

## User Roles

### Regular User
- Browse and book parking slots
- Manage personal vehicles
- View and cancel bookings
- Edit profile information

### Admin
- Create and manage parking facilities
- Create, edit, and delete parking slots
- Set pricing and slot configurations
- View all bookings and user activity
- Monitor occupancy and revenue analytics

## Database Schema

### Core Tables
- **users**: User accounts with OAuth integration
- **vehicles**: User vehicle information
- **parkingFacilities**: Parking facility locations
- **parkingSlots**: Individual parking slots
- **bookings**: Parking reservations
- **bookingHistory**: Booking status changes and history
- **analyticsData**: Usage statistics and metrics
- **pricingRules**: Dynamic pricing configurations

## API Routes

All API endpoints are under `/api/trpc` and follow tRPC conventions:

### User Endpoints
- `user.getProfile` - Get current user profile
- `user.updateProfile` - Update profile information
- `user.getVehicles` - List user vehicles
- `user.addVehicle` - Add new vehicle
- `user.deleteVehicle` - Delete vehicle

### Booking Endpoints
- `bookings.getUserBookings` - Get user's bookings
- `bookings.create` - Create new booking
- `bookings.cancel` - Cancel booking
- `bookings.getAll` - Get all bookings (admin)

### Facility Endpoints
- `facilities.getAll` - List all facilities
- `facilities.getById` - Get facility details
- `facilities.create` - Create facility (admin)
- `facilities.update` - Update facility (admin)
- `facilities.delete` - Delete facility (admin)

### Slot Endpoints
- `slots.getAvailable` - Get available slots for date/time
- `slots.getFacilitySlots` - Get all slots in facility
- `slots.create` - Create slot (admin)
- `slots.update` - Update slot (admin)
- `slots.delete` - Delete slot (admin)

## Styling & Design

The application uses a professional, elegant design system:

- **Color Palette**: Blue (#2563eb), Slate, Cyan accents
- **Typography**: Clean sans-serif with clear hierarchy
- **Components**: shadcn/ui components with custom styling
- **Effects**: Gradient backgrounds, smooth transitions, 3D spotlight effects
- **Responsive**: Mobile-first design with breakpoints for tablet and desktop

## Key Features Implementation

### Real-time Slot Availability
Slots are filtered based on existing bookings. When a user selects a date/time range, the system:
1. Fetches all slots for the facility
2. Checks for conflicting bookings
3. Displays only available slots
4. Shows pricing and duration limits

### Booking Flow
1. User selects facility and date/time
2. System shows available slots
3. User clicks "Book Now" to open booking form
4. Form calculates total price based on duration
5. Booking is created and confirmed
6. Booking appears in user's history

### Admin Management
1. Admin creates parking facility
2. Admin adds slots to facility with pricing
3. Admin can edit slot pricing and configuration
4. Admin monitors bookings and revenue
5. Analytics dashboard shows occupancy rates

## Error Handling

The application includes comprehensive error handling:
- Form validation with user-friendly error messages
- Network error handling with retry logic
- Database error handling with proper logging
- User-facing toast notifications for all operations

## Accessibility

- Semantic HTML structure
- Keyboard-navigable forms and buttons
- Clear focus states for interactive elements
- Proper label associations
- ARIA attributes where needed

## Performance Optimizations

- Component memoization for frequently rendered lists
- Efficient database queries with proper indexing
- Lazy loading of components
- Optimized re-renders with React hooks
- CSS optimization with Tailwind purging

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Known Limitations

- Real-time updates require page refresh (WebSocket integration optional)
- Extend booking functionality is marked for future enhancement
- Advanced reporting features available in future versions
- Maximum booking duration limited by slot configuration

## Future Enhancements

- Real-time WebSocket updates for slot availability
- Payment gateway integration (Stripe)
- Email notifications for bookings
- SMS reminders
- Mobile app (React Native)
- Advanced analytics and reporting
- Dynamic pricing based on demand
- Loyalty program system
- Integration with parking sensors

## Support & Maintenance

For issues, feature requests, or support:
- Check the documentation
- Review the codebase comments
- Contact the development team

## License

MIT License - See LICENSE file for details

---

**Version**: 1.0.0  
**Last Updated**: April 2026  
**Built with ❤️ using Manus**
