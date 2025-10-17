# Company Memory Timeline

A beautiful, mobile-first photo sharing platform for company events and memories. Built with Next.js 14, Supabase, and TypeScript.

## Features

- **🌊 Memory River Timeline**: Revolutionary timeline UI with 3D effects, animated gradients, and kinetic typography (NEW!)
- **Event-Based Organization**: Create and organize photos by company events
- **Photo Grid with Masonry Layout**: Beautiful responsive grid that adapts to all screen sizes
- **Lightbox Gallery**: Full-screen photo viewing with swipe gestures
- **Drag & Drop Upload**: Easy photo uploads with drag and drop support
- **Image Optimization**: Automatic compression, thumbnail generation, and blur hash
- **Magic Link Authentication**: Secure passwordless login via email
- **Real-time Updates**: Photos appear instantly after upload
- **Mobile-First Design**: Optimized for mobile devices with touch gestures
- **SSR & Performance**: Server-side rendering for fast initial loads

### ✨ Memory River Timeline Highlights

The new **Memory River Timeline** transforms the traditional timeline into an immersive visual experience:

- 🌀 **Curved Wave Path**: Organic flowing timeline instead of straight lines
- 🎯 **3D Floating Nodes**: 80x80px nodes with rotating gradient borders
- ✨ **Particle Effects**: 30+ floating particles creating depth
- 💳 **Glass Morphism Cards**: Enhanced cards with shimmer and glow effects
- 🎨 **Kinetic Typography**: Text that animates with gradients on hover
- 🔄 **Orbiting Particles**: Animated particles circling timeline nodes
- 💎 **Staggered Animations**: Smooth reveal animations with perfect timing
- 🎬 **Interactive Hover**: Multi-layer effects on card interactions

**[Quick Start Guide](docs/MEMORY_RIVER_QUICK_START.md)** | **[Full Documentation](docs/MEMORY_RIVER_TIMELINE.md)**

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: MongoDB Atlas (data storage), Supabase (auth & roles)
- **Storage**: Supabase Storage
- **Auth**: Supabase Auth (Magic Link)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Image Processing**: Sharp (server-side), browser-image-compression (client-side)
- **Photo Grid**: react-masonry-css
- **Lightbox**: yet-another-react-lightbox

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works) for authentication
- A MongoDB Atlas account (free tier works) for data storage
- npm or yarn package manager

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd timeline
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

1. Go to [https://supabase.com](https://supabase.com) and create a new project
2. Wait for the database to be provisioned
3. Go to **Project Settings > API** and copy:
   - Project URL
   - `anon` public key
   - `service_role` key

### 4. Configure environment variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your credentials:

```env
# Supabase Configuration (Auth, Storage, Roles)
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# MongoDB Configuration (Data Storage)
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/database?retryWrites=true&w=majority
```

**Important:** See [MongoDB Setup Guide](docs/MONGODB_ATLAS_SETUP.md) for MongoDB Atlas configuration.

### 5. Set up MongoDB Atlas

1. Go to [https://cloud.mongodb.com](https://cloud.mongodb.com) and create a cluster
2. Create a database user with **alphanumeric-only password** (avoid special characters)
3. Whitelist your IP address (or use 0.0.0.0/0 for development)
4. Get your connection string and add to `.env.local`
5. Test connection: `npm run test:mongodb`

**Troubleshooting:** If you get authentication errors, run `npm run fix:mongodb-auth`

For detailed setup instructions, see:
- [MongoDB Atlas Setup Guide](docs/MONGODB_ATLAS_SETUP.md)
- [MongoDB Authentication Troubleshooting](docs/MONGODB_AUTH_TROUBLESHOOTING.md)

### 6. Set up Supabase (Auth & Storage only)

1. Go to **SQL Editor** in your Supabase dashboard
2. Copy and run the contents of `supabase/schema.sql` (for user profiles only)
3. Copy and run the contents of `supabase/policies.sql`

### 7. Create storage buckets

1. Go to **Storage** in your Supabase dashboard
2. Create a bucket named `event-covers` and make it **public**
3. Create a bucket named `event-media` and make it **public**

### 8. Run migrations (MongoDB)

```bash
# Run migrations to create MongoDB collections
npm run migrate
```

### 9. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Troubleshooting

### MongoDB Connection Issues

If you see "MongoServerError: bad auth : Authentication failed":

1. **Quick diagnostic:**
   ```bash
   npm run fix:mongodb-auth
   ```

2. **Test connection:**
   ```bash
   npm run test:mongodb
   ```

3. **Common fixes:**
   - Reset database user password in MongoDB Atlas
   - Use alphanumeric-only password (no special characters)
   - Whitelist your IP in MongoDB Atlas Network Access
   - Wait 1-2 minutes after password reset

See [MongoDB Authentication Troubleshooting Guide](docs/MONGODB_AUTH_TROUBLESHOOTING.md) for detailed solutions.

## Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint

# Database
npm run migrate          # Run MongoDB migrations
npm run migrate:rollback # Rollback migrations
npm run verify-migration # Verify migration status

# Testing & Diagnostics
npm run test:mongodb        # Test MongoDB connection
npm run fix:mongodb-auth    # Diagnose MongoDB auth issues
```

## Project Structure

```
timeline/
├── app/                      # Next.js app router
│   ├── api/                  # API routes
│   │   └── upload/          # Upload endpoint
│   ├── auth/                # Auth pages
│   ├── events/              # Event pages
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Homepage
│   └── globals.css          # Global styles
├── components/              # React components
│   ├── auth/               # Authentication components
│   ├── events/             # Event components
│   ├── photos/             # Photo grid and lightbox
│   ├── timeline/           # Timeline components
│   │   ├── vertical-timeline.tsx        # Classic timeline
│   │   ├── memory-river-timeline.tsx    # NEW: 3D timeline with effects
│   │   ├── timeline-switcher.tsx        # Toggle between versions
│   │   └── timeline-nav.tsx            # Timeline navigation
│   ├── ui/                 # shadcn/ui components
│   └── upload/             # Upload components
├── lib/                    # Utilities and helpers
│   ├── supabase/          # Supabase clients
│   ├── mongodb/           # MongoDB connection & models
│   ├── types.ts           # TypeScript types
│   ├── utils.ts           # General utilities
│   ├── image-utils.ts     # Image processing
│   ├── date-utils.ts      # Date formatting
│   └── string-utils.ts    # String helpers
├── scripts/               # Utility scripts
│   ├── migrate.ts         # MongoDB migrations
│   └── fix-mongodb-auth.ts # MongoDB auth diagnostic
├── docs/                  # Documentation
│   ├── MONGODB_ATLAS_SETUP.md           # MongoDB setup guide
│   ├── MONGODB_AUTH_TROUBLESHOOTING.md  # Auth troubleshooting
│   ├── MEMORY_RIVER_TIMELINE.md         # NEW: Timeline documentation
│   └── MEMORY_RIVER_QUICK_START.md      # NEW: Timeline quick start
├── supabase/              # Supabase configuration
│   ├── schema.sql         # User profiles schema
│   ├── policies.sql       # Row Level Security
│   └── README.md          # Setup instructions
└── public/                # Static assets
```

## Usage

### Creating an Event

1. Sign in using magic link authentication
2. Click "Create Event" button
3. Fill in event details:
   - Title
   - Description
   - Event date
   - Upload settings
4. Save the event

### Uploading Photos

1. Navigate to an open event
2. Click "Upload Photos"
3. Drag and drop images or click to select
4. Add an optional message
5. Click upload

### Viewing Photos

- Browse events on the homepage
- Click an event to view its photos
- Click any photo to open the lightbox
- Swipe or use arrow keys to navigate

## Database Schema

### MongoDB Collections (Data Storage)

- **events**: Event information and metadata
- **posts**: Photo/media posts with metadata

### Supabase Tables (Authentication)

- **user_profiles**: User profile information (linked to Supabase Auth)

### Storage Buckets

- **event-covers**: Event cover images
- **event-media**: User-uploaded photos and videos

### Security

Row Level Security (RLS) is enabled on all tables:
- Users can only update their own profiles
- Only authenticated users can upload to open events
- Everyone can view approved posts

## API Routes

### POST `/api/upload`

Upload photos to an event.

**Body**: FormData
- `eventId`: Event UUID
- `wishText`: Optional message
- `files`: Array of image files

**Response**:
```json
{
  "message": "Upload successful",
  "posts": [...]
}
```

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Environment Variables

Make sure to set these in your deployment platform:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `MONGODB_URI`

## Performance Optimizations

- **Server-Side Rendering**: Fast initial page loads
- **Image Optimization**: Automatic WebP conversion and compression
- **Blur Placeholders**: Smooth image loading experience
- **Lazy Loading**: Images load as they enter viewport
- **Thumbnail Generation**: Smaller images for grid view
- **Edge Caching**: Static content served from CDN

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for your company events!

## Support

For issues and questions, please open an issue on GitHub.
