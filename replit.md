# Restaurant POS Demo

## Overview

This is a restaurant point-of-sale (POS) system built with React Native and Expo. The application enables restaurant staff to manage orders, tables, and sales through a mobile-friendly interface. The system supports multi-user workflows with role-based access, table management with merging capabilities, and sales reporting functionality.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Problem**: Need a cross-platform mobile application that works on iOS, Android, and web.

**Solution**: React Native with Expo framework and TypeScript for type safety.

The application uses:
- **Expo Router** for file-based navigation with tab-based routing structure
- **React Native components** for UI rendering across platforms
- **TypeScript** for static type checking and better developer experience
- **React hooks** (useState, useEffect, useMemo) for state management and side effects

**Rationale**: Expo provides a managed workflow that simplifies development and deployment across multiple platforms. File-based routing with expo-router reduces boilerplate and makes navigation more intuitive.

**Alternatives Considered**: Native development for each platform would provide better performance but at the cost of maintaining separate codebases.

**Pros**: 
- Single codebase for iOS, Android, and web
- Fast development iteration with hot reloading
- Strong TypeScript support for catching errors early

**Cons**: 
- Limited access to some native APIs without ejecting
- Slightly larger bundle size compared to native apps

### State Management Pattern

**Problem**: Managing complex application state across multiple screens (user selection, table selection, order management).

**Solution**: Local component state using React hooks without a global state management library.

The application manages state hierarchically:
- Screen-level state controls workflow progression (user-select → table-select → order)
- Entity data (users, tables, products, categories) stored in component state
- Order items maintained in local state before submission
- Modal states for auxiliary features (reports, discounts)

**Rationale**: For this application's scope, React's built-in state management is sufficient. Adding Redux or Context API would introduce unnecessary complexity.

**Pros**:
- Simple and straightforward
- No additional dependencies
- Easy to understand data flow

**Cons**:
- State doesn't persist across component unmounts
- Prop drilling may occur if component tree grows deeper

### User Authentication and Authorization

**Problem**: Multiple users need to access the POS system with role-based permissions.

**Solution**: PIN-based user selection system without traditional session management.

The application implements:
- User selection screen as entry point
- User roles stored in database (waiter, manager, etc.)
- PIN verification for user authentication
- Current user context maintained in component state

**Rationale**: PIN-based authentication is faster for POS scenarios where users frequently switch between different staff members during shifts.

**Pros**:
- Fast user switching
- No password complexity requirements
- Suitable for shared devices

**Cons**:
- Less secure than traditional authentication
- No persistent sessions across app restarts

### Data Flow and API Integration

**Problem**: Real-time access to restaurant data (products, tables, orders) from mobile devices.

**Solution**: Direct integration with Supabase client library for real-time database operations.

The application:
- Uses Supabase client SDK for all database operations
- Implements async/await pattern for data fetching
- Loads data on-demand based on user interactions
- Stores minimal data locally (AsyncStorage for Supabase auth tokens only)

**Rationale**: Supabase provides a simple PostgreSQL interface with real-time capabilities without requiring a custom backend.

**Pros**:
- No backend server to maintain
- Real-time updates through Supabase subscriptions (if implemented)
- Built-in authentication system

**Cons**:
- Business logic exposed in client code
- Potential security concerns with direct database access
- Limited offline functionality

## External Dependencies

### Backend as a Service (BaaS)

**Supabase** - PostgreSQL-based backend platform
- **URL**: `https://rspxxmrzgktejmaxnmlz.supabase.co`
- **Purpose**: Primary data storage and API layer
- **Integration**: Direct client-side integration via `@supabase/supabase-js` SDK
- **Authentication**: API key-based access with AsyncStorage for token persistence
- **Tables Used**:
  - `product_categories` - Product categorization
  - `products` - Menu items with pricing
  - `tables` - Restaurant table management
  - `sales` - Order transactions
  - `sale_items` - Line items for orders
  - `users` - Staff accounts with roles and PINs

### Local Storage

**AsyncStorage** (`@react-native-async-storage/async-storage`)
- **Purpose**: Persistent storage for Supabase authentication tokens
- **Scope**: Limited to auth session persistence, not used for business data caching

### Platform Polyfills

**react-native-url-polyfill**
- **Purpose**: URL API polyfill required for Supabase client on React Native
- **Integration**: Imported with `'react-native-url-polyfill/auto'` side effect

### Navigation Framework

**Expo Router** (`expo-router`)
- **Purpose**: File-based routing system
- **Pattern**: Tab-based navigation with nested screens
- **Configuration**: Configured via `app.json` plugins

### UI and Animation Libraries

**React Navigation** (`@react-navigation/native`)
- **Purpose**: Navigation primitives used by Expo Router

**React Native Reanimated** (`react-native-reanimated`)
- **Purpose**: High-performance animations (dependency of expo-router)

**React Native Screens** (`react-native-screens`)
- **Purpose**: Native screen primitives for better performance

### Development Tools

**TypeScript** - Static type checking with strict mode enabled
**Babel** - JavaScript transpilation for React Native
**Expo Development Tools** - Development server and build system