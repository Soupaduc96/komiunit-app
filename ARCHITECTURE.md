# KomiUnit Application Architecture

## Project Overview
KomiUnit is a comprehensive React Native mobile application built with Expo and TypeScript, featuring 5 core modules with Supabase backend integration, authentication flow, and a shared design system.

## Tech Stack
- **Framework**: React Native + Expo v56
- **Language**: TypeScript
- **Routing**: Expo Router (File-based routing)
- **State Management**: Context API + React Hooks
- **Backend**: Supabase (PostgreSQL + Auth)
- **Design System**: Shared theme + reusable components
- **Platforms**: iOS, Android, Web

## Approved Modules
1. **KomiSend** - Messaging/Transfer functionality
2. **KomiSol** - Solutions/Support module
3. **KomiMarché** - Marketplace features
4. **KomiLearn** - Learning/Educational content
5. **KomiVoix** - Voice/Communication features

## Project Structure

```
komiunit-app/
├── src/
│   ├── app/
│   │   ├── _layout.tsx                 # Root layout with theme provider
│   │   ├── index.tsx                   # Splash/Home screen
│   │   ├── (auth)/
│   │   │   ├── _layout.tsx             # Auth layout (no tabs)
│   │   │   ├── login.tsx               # Login screen
│   │   │   ├── signup.tsx              # Registration screen
│   │   │   ├── forgot-password.tsx     # Password recovery
│   │   │   └── verify-email.tsx        # Email verification
│   │   ├── (tabs)/
│   │   │   ├── _layout.tsx             # Tab layout with bottom navigation
│   │   │   ├── index.tsx               # Home/Dashboard
│   │   │   ├── komi-send.tsx           # KomiSend tab
│   │   │   ├── komi-sol.tsx            # KomiSol tab
│   │   │   ├── komi-marche.tsx         # KomiMarché tab
│   │   │   ├── komi-learn.tsx          # KomiLearn tab
│   │   │   └── komi-voix.tsx           # KomiVoix tab
│   │   ├── (modules)/
│   │   │   ├── komi-send/
│   │   │   │   ├── _layout.tsx
│   │   │   │   ├── index.tsx
│   │   │   │   ├── [id].tsx            # Detail screen
│   │   │   │   ├── create.tsx          # Create new
│   │   │   │   └── history.tsx
│   │   │   ├── komi-sol/
│   │   │   │   ├── _layout.tsx
│   │   │   │   ├── index.tsx
│   │   │   │   ├── [id].tsx
│   │   │   │   └── categories.tsx
│   │   │   ├── komi-marche/
│   │   │   │   ├── _layout.tsx
│   │   │   │   ├── index.tsx
│   │   │   │   ├── [id].tsx
│   │   │   │   ├── cart.tsx
│   │   │   │   └── orders.tsx
│   │   │   ├── komi-learn/
│   │   │   │   ├── _layout.tsx
│   │   │   │   ├── index.tsx
│   │   │   │   ├── [id].tsx
│   │   │   │   ├── courses.tsx
│   │   │   │   └── progress.tsx
│   │   │   └── komi-voix/
│   │   │       ├── _layout.tsx
│   │   │       ├── index.tsx
│   │   │       ├── [id].tsx
│   │   │       └── calls.tsx
│   │   └── settings/
│   │       ├── _layout.tsx
│   │       ├── index.tsx
│   │       ├── profile.tsx
│   │       ├── security.tsx
│   │       └── about.tsx
│   │
│   ├── components/
│   │   ├── common/                     # Shared across all modules
│   │   │   ├── button.tsx              # Primary button component
│   │   │   ├── input.tsx               # Text input component
│   │   │   ├── modal.tsx               # Modal dialog
│   │   │   ├── loading.tsx             # Loading spinner
│   │   │   ├── error-boundary.tsx      # Error handling
│   │   │   ├── empty-state.tsx         # Empty state UI
│   │   │   └── card.tsx                # Card component
│   │   ├── navigation/
│   │   │   ├── bottom-tabs.tsx         # Bottom tab navigation
│   │   │   ├── tab-bar-icon.tsx        # Tab bar icon
│   │   │   └── header.tsx              # Screen header
│   │   ├── auth/
│   │   │   ├── auth-form.tsx           # Base auth form
│   │   │   ├── login-form.tsx
│   │   │   └── signup-form.tsx
│   │   ├── komi-send/
│   │   │   ├── send-card.tsx
│   │   │   ├── recipient-list.tsx
│   │   │   └── send-form.tsx
│   │   ├── komi-sol/
│   │   │   ├── solution-card.tsx
│   │   │   ├── category-filter.tsx
│   │   │   └── solution-detail.tsx
│   │   ├── komi-marche/
│   │   │   ├── product-card.tsx
│   │   │   ├── product-grid.tsx
│   │   │   └── cart-item.tsx
│   │   ├── komi-learn/
│   │   │   ├── course-card.tsx
│   │   │   ├── progress-bar.tsx
│   │   │   └── lesson-viewer.tsx
│   │   ├── komi-voix/
│   │   │   ├── call-button.tsx
│   │   │   ├── call-list.tsx
│   │   │   └── contact-card.tsx
│   │   ├── themed-text.tsx
│   │   ├── themed-view.tsx
│   │   ├── animated-icon.tsx
│   │   ├── animated-icon.web.tsx
│   │   ├── app-tabs.tsx
│   │   └── external-link.tsx
│   │
│   ├── services/                       # Business logic layer
│   │   ├── supabase/
│   │   │   ├── client.ts               # Supabase client initialization
│   │   │   ├── auth.ts                 # Auth service
│   │   │   ├── database.ts             # Database queries
│   │   │   └── storage.ts              # File storage operations
│   │   ├── komi-send/
│   │   │   ├── send-service.ts         # KomiSend business logic
│   │   │   └── types.ts                # Type definitions
│   │   ├── komi-sol/
│   │   │   ├── solution-service.ts
│   │   │   └── types.ts
│   │   ├── komi-marche/
│   │   │   ├── product-service.ts
│   │   │   ├── cart-service.ts
│   │   │   ├── order-service.ts
│   │   │   └── types.ts
│   │   ├── komi-learn/
│   │   │   ├── course-service.ts
│   │   │   ├── progress-service.ts
│   │   │   └── types.ts
│   │   ├── komi-voix/
│   │   │   ├── call-service.ts
│   │   │   ├── contact-service.ts
│   │   │   └── types.ts
│   │   └── api/
│   │       ├── interceptors.ts         # API request/response handling
│   │       └── error-handler.ts        # Centralized error handling
│   │
│   ├── hooks/
│   │   ├── use-auth.ts                 # Auth context hook
│   │   ├── use-theme.ts                # Theme hook
│   │   ├── use-color-scheme.ts
│   │   ├── use-color-scheme.web.ts
│   │   ├── use-navigation.ts           # Navigation helpers
│   │   ├── use-async.ts                # Async operations
│   │   ├── use-komi-send.ts            # KomiSend module hook
│   │   ├── use-komi-sol.ts
│   │   ├── use-komi-marche.ts
│   │   ├── use-komi-learn.ts
│   │   └── use-komi-voix.ts
│   │
│   ├── context/
│   │   ├── auth-context.tsx            # Authentication state
│   │   ├── theme-context.tsx           # Theme state
│   │   └── module-context.tsx          # Module-specific state
│   │
│   ├── constants/
│   │   ├── theme.ts                    # Colors, spacing, sizes
│   │   ├── api.ts                      # API endpoints, config
│   │   ├── strings.ts                  # I18n strings
│   │   └── errors.ts                   # Error messages
│   │
│   ├── utils/
│   │   ├── validation.ts               # Form validation
│   │   ├── formatting.ts               # Date, currency formatting
│   │   ├── storage.ts                  # Local storage operations
│   │   ├── logger.ts                   # Logging utility
│   │   └── device.ts                   # Device detection
│   │
│   └── types/
│       ├── common.ts                   # Common types
│       ├── user.ts
│       ├── komi-send.ts
│       ├── komi-sol.ts
│       ├── komi-marche.ts
│       ├── komi-learn.ts
│       └── komi-voix.ts
│
├── assets/
│   ├── expo.icon/
│   ├── images/
│   │   ├── tabIcons/
│   │   ├── logos/
│   │   ├── placeholders/
│   │   └── illustrations/
│   └── fonts/
│
├── app.json                            # Expo config
├── tsconfig.json                       # TypeScript config
├── package.json                        # Dependencies
├── ARCHITECTURE.md                     # This file
└── README.md
```

## Authentication Flow

```
┌─────────────────┐
│   App Starts    │
└────────┬────────┘
         │
         ▼
┌──────────────────────┐
│  Check Auth State    │
│  (Supabase Session)  │
└────────┬─────────────┘
         │
    ┌────┴─────┐
    │           │
    ▼           ▼
┌────────┐  ┌─────────────────┐
│Logged  │  │  Not Logged In  │
│  In    │  │                 │
└───┬────┘  └────────┬────────┘
    │                │
    │                ▼
    │         ┌─────────────────┐
    │         │  Login Screen   │
    │         │  / Signup Flow  │
    │         └────────┬────────┘
    │                  │
    │         ┌────────┴─────────┐
    │         │                  │
    │         ▼                  ▼
    │    ┌──────────┐     ┌──────────────┐
    │    │  Login   │     │  Sign Up     │
    │    │  Form    │     │  Form        │
    │    └────┬─────┘     └──────┬───────┘
    │         │                  │
    │         └────────┬─────────┘
    │                  │
    │                  ▼
    │         ┌─────────────────┐
    │         │ Email Verify    │
    │         │ (if required)   │
    │         └────────┬────────┘
    │                  │
    ▼                  ▼
┌──────────────────────────────┐
│  Create Auth Context Session │
│  Store User in State         │
└──────────────┬───────────────┘
               │
               ▼
        ┌──────────────┐
        │ Tab Navigator│
        │  (Home + 5   │
        │  Modules)    │
        └──────────────┘
```

## State Management Architecture

### Auth Context (Global)
```typescript
interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn(email: string, password: string): Promise<void>;
  signUp(email: string, password: string, name: string): Promise<void>;
  signOut(): Promise<void>;
  resetPassword(email: string): Promise<void>;
  verifyEmail(token: string): Promise<void>;
}
```

### Module Contexts (Per-Module)
```typescript
// Each module has its own context for:
// - Loading states
// - Cached data
// - User preferences
// - Current selection/filtering
```

## Component Hierarchy

### Root Level
- `_layout.tsx` - Theme Provider + Auth Provider
  - `(auth)` - Authentication stack (isolated from tabs)
  - `(tabs)` - Main tab navigation
  - `(modules)` - Modal/detail screens
  - `settings` - Settings screens

### Tab Navigation (5 Main + Home)
```
┌─────────────────────────────────────────┐
│            Home/Dashboard               │
├─────────────────────────────────────────┤
│ KomiSend | KomiSol | KomiMarché | KomiLearn | KomiVoix
└─────────────────────────────────────────┘
```

## Design System

### Colors (Theme-aware - Light/Dark)
```typescript
Colors.primary: '#007AFF'        // KomiUnit brand
Colors.success: '#34C759'
Colors.warning: '#FF9500'
Colors.error: '#FF3B30'
Colors.background: '#FFF / #000'
Colors.surface: '#F2F2F7 / #1C1C1E'
Colors.text: '#000 / #FFF'
Colors.textSecondary: '#999 / #CCC'
```

### Spacing
```typescript
xs: 4px, sm: 8px, md: 16px, lg: 24px, xl: 32px, xxl: 48px
```

### Typography
```typescript
h1: 32px bold
h2: 28px semibold
h3: 24px semibold
body: 16px regular
small: 14px regular
caption: 12px regular
```

## Supabase Integration

### Database Schema
```
users
├── id (uuid, pk)
├── email (varchar, unique)
├── full_name (varchar)
├── avatar_url (varchar)
├── phone (varchar)
├── created_at (timestamp)
└── updated_at (timestamp)

komi_sends
├── id (uuid, pk)
├── sender_id (uuid, fk users)
├── recipient_id (uuid, fk users)
├── amount (decimal)
├── status (enum: pending, completed, failed)
├── created_at (timestamp)
└── updated_at (timestamp)

solutions
├── id (uuid, pk)
├── title (varchar)
├── description (text)
├── category (varchar)
├── status (enum: published, draft)
├── created_at (timestamp)
└── updated_at (timestamp)

products
├── id (uuid, pk)
├── name (varchar)
├── description (text)
├── price (decimal)
├── image_url (varchar)
├── stock (integer)
├── created_at (timestamp)
└── updated_at (timestamp)

orders
├── id (uuid, pk)
├── user_id (uuid, fk users)
├── items (jsonb)
├── total_amount (decimal)
├── status (enum: pending, confirmed, shipped, delivered)
├── created_at (timestamp)
└── updated_at (timestamp)

courses
├── id (uuid, pk)
├── title (varchar)
├── description (text)
├── instructor_id (uuid, fk users)
├── cover_image_url (varchar)
├── price (decimal)
├── duration (integer)
├── created_at (timestamp)
└── updated_at (timestamp)

lessons
├── id (uuid, pk)
├── course_id (uuid, fk courses)
├── title (varchar)
├── content (text)
├── order (integer)
├── created_at (timestamp)
└── updated_at (timestamp)

user_progress
├── id (uuid, pk)
├── user_id (uuid, fk users)
├── course_id (uuid, fk courses)
├── completed_lessons (integer array)
├── progress_percentage (decimal)
├── started_at (timestamp)
└── updated_at (timestamp)

contacts
├── id (uuid, pk)
├── user_id (uuid, fk users)
├── contact_user_id (uuid, fk users)
├── added_at (timestamp)
└── updated_at (timestamp)

call_logs
├── id (uuid, pk)
├── caller_id (uuid, fk users)
├── recipient_id (uuid, fk users)
├── duration (integer)
├── status (enum: completed, missed, rejected)
├── started_at (timestamp)
└── ended_at (timestamp)
```

## Key Dependencies to Add
```json
{
  "@supabase/supabase-js": "^2.39.0",
  "zustand": "^4.4.0",  // Optional: for state management
  "axios": "^1.6.0",     // HTTP client
  "@react-native-async-storage/async-storage": "^1.21.0",
  "react-native-uuid": "^2.0.0",
  "date-fns": "^2.30.0"
}
```

## Implementation Phases

### Phase 1: Foundation
1. ✅ Project structure setup
2. ✅ Authentication system (login, signup, verification)
3. ✅ Theme/Design system implementation
4. ✅ Core components (buttons, inputs, cards)
5. ✅ Bottom tab navigation

### Phase 2: Core Modules
1. ✅ KomiSend - Messaging/Transfer
2. ✅ KomiSol - Solutions/Support
3. ✅ KomiMarché - Marketplace
4. ✅ KomiLearn - Learning
5. ✅ KomiVoix - Voice/Calls

### Phase 3: Integration & Polish
1. ✅ Supabase backend integration
2. ✅ Error handling & validation
3. ✅ Loading states & skeleton screens
4. ✅ Offline support (where applicable)
5. ✅ Testing

## Best Practices

### Code Organization
- One component per file
- Services contain business logic
- Hooks for reusable logic
- Types in separate files
- Constants in centralized config

### State Management
- Use Context API for global state (auth)
- Use local state for component UI
- Use Supabase for persistent data
- Use local storage for user preferences

### Performance
- Lazy load module screens
- Memoize expensive components
- Virtual scroll for lists
- Image optimization
- Code splitting per module

### Error Handling
- Global error boundary
- API error interceptors
- User-friendly error messages
- Fallback UI for failures

## Platform-Specific Notes

### iOS
- Safe area consideration for notch
- Use native modals for file picker
- Handle permission requests (camera, contacts)

### Android
- Back button handling
- Hardware keyboard support
- Material design compliance

### Web
- Responsive design
- Desktop UX considerations
- Keyboard shortcuts
- Browser compatibility (Chrome, Safari, Firefox)

## Development Workflow

1. **Environment Setup**
   ```bash
   npm install
   # Create .env.local with Supabase credentials
   ```

2. **Development**
   ```bash
   npm start
   # Select platform: iOS, Android, Web, or Expo Go
   ```

3. **Testing**
   ```bash
   npm test
   ```

4. **Build**
   ```bash
   eas build --platform ios
   eas build --platform android
   ```

## Deployment

- **Development**: Use Expo Go
- **Testing**: EAS Build (iOS TestFlight, Android Google Play Internal Testing)
- **Production**: App Store & Google Play Store

---

## Next Steps
1. Install dependencies including Supabase
2. Set up environment variables
3. Create auth context and Supabase client
4. Build authentication screens
5. Implement tab navigation
6. Build module screens and services
