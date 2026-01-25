# Hotel Termal Peshkopi 🏨♨️

A premium, multi-language hotel management system with a nature-inspired Emerald/Forest Green design aesthetic.

## Project Overview

- **Name**: Hotel Termal Peshkopi
- **Goal**: Complete hotel website with booking system, multilingual support, and full CMS admin panel
- **Tech Stack**: Hono + TypeScript + Tailwind CSS (Cloudflare Workers compatible)
- **Design**: Clean, minimalist with Emerald Green primary color palette

## Live URLs

- **Production Preview**: https://3000-iwelspmjsob28jqohndcc-5c13a017.sandbox.novita.ai
- **Admin Panel**: https://3000-iwelspmjsob28jqohndcc-5c13a017.sandbox.novita.ai/admin
- **Login**: https://3000-iwelspmjsob28jqohndcc-5c13a017.sandbox.novita.ai/login

### Admin Credentials
- **Username**: `admin`
- **Password**: `peshkopi2026`

## Features

### Frontend (Customer Experience)

✅ **Navigation & Header**
- Language selector (AL, EN, DE, IT, FR) on the left
- Hamburger menu with dropdown for all sections
- Floating WhatsApp and Viber buttons (bottom-right)

✅ **Hero Section**
- High-quality background image
- Booking availability widget (check dates → show availability)
- Animated fade-in effects

✅ **Rooms Section (Akomodimi)**
- Card-based layout with image carousels
- Price displayed per person
- WhatsApp booking button with pre-filled message
- Amenities display with icons

✅ **Wellness & Thermal Waters**
- Hot thermal baths (38-42°C) information
- Cold medical waters description
- Auto-playing image carousel

✅ **Physiotherapy**
- Complete service list
- WhatsApp contact integration

✅ **Gastronomy (Kuzhina)**
- Traditional Dibran cuisine showcase
- Food image carousel

✅ **Reviews**
- Google Maps style reviews
- Auto-scrolling card carousel

✅ **Contact & Footer**
- Embedded Google Maps
- Contact information (phone, email)
- Social media links (Facebook, Instagram)

### Admin Panel (CMS & Business Logic)

✅ **Authentication**
- Login page at /login
- Session-based authentication

✅ **Dashboard**
- Total Revenue KPI
- Website Clicks (mock counter)
- Occupancy Rate percentage
- Monthly Revenue Chart (Chart.js)
- Recent bookings list

✅ **Calendar/Booking Engine**
- Interactive calendar view
- Add/Edit/Delete bookings
- Booking status management (pending/confirmed/cancelled)
- **iCal Sync Feature** - Copy link for Booking.com integration

✅ **Room CMS**
- Edit room photos, names, prices
- Manage amenities and descriptions
- Multi-language support

✅ **Content CMS**
- Edit Hero section
- Edit Wellness section
- Edit Gastronomy section

✅ **Reviews CMS**
- Add/Edit/Delete reviews
- Multi-language review text

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/rooms` | GET | Get all rooms |
| `/api/rooms/:id` | GET/PUT | Get/Update single room |
| `/api/bookings` | GET/POST | List/Create bookings |
| `/api/bookings/:id` | PUT/DELETE | Update/Delete booking |
| `/api/content` | GET/PUT | Get/Update website content |
| `/api/reviews` | GET/POST | List/Create reviews |
| `/api/reviews/:id` | PUT/DELETE | Update/Delete review |
| `/api/check-availability` | POST | Check room availability |
| `/api/ical` | GET | Download iCal (.ics) file |
| `/api/admin/login` | POST | Admin authentication |
| `/api/admin/stats` | GET | Dashboard statistics |

## Languages Supported

- 🇦🇱 Albanian (Primary)
- 🇬🇧 English
- 🇩🇪 German
- 🇮🇹 Italian
- 🇫🇷 French

## Contact Information

- **Phone**: +355 68 434 0580
- **Email**: hotel.termal.peshkopi@gmail.com
- **WhatsApp**: https://wa.me/355684340580
- **Viber**: viber://chat?number=%2B355684340580
- **Facebook**: https://www.facebook.com/hoteltermal/?locale=sq_AL
- **Instagram**: https://www.instagram.com/hotel_termal/?hl=en

## Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Start development server
npm run dev:sandbox

# Deploy to Cloudflare Pages
npm run deploy
```

## Deployment Status

- **Platform**: Cloudflare Pages
- **Status**: ✅ Ready for deployment
- **Last Updated**: January 2026

## Color Palette

- **Primary (Emerald)**: #059669 (600), #047857 (700), #065f46 (800)
- **Background**: #fdfbf7 (Beige-50)
- **Text**: #1f2937 (Gray-800)

---

Built with ❤️ for Hotel Termal Peshkopi
