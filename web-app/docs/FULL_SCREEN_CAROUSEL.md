# Full-Screen Photo Carousel Feature

## Overview
Added a full-screen photo carousel that opens when users click on photos in the PhotoGallery component. This provides an immersive viewing experience for coffee date photos.

## Features

### 🖼️ Full-Screen Display
- Opens photos in a full-screen modal overlay
- Dark background for better photo focus
- Responsive design that works on all screen sizes

### 🎮 Navigation Controls
- **Arrow Keys**: Navigate left/right between photos
- **Navigation Buttons**: Click left/right arrows to navigate
- **Touch Swipe**: Swipe left/right on mobile devices
- **ESC Key**: Close the carousel

### 🔍 Zoom Functionality
- **Zoom In/Out**: Toggle zoom with the zoom button
- **Click to Zoom**: Click on photo to zoom in when not zoomed
- **Smooth Transitions**: Animated zoom transitions

### 📱 Mobile Optimized
- Touch-friendly controls
- Swipe gesture support
- Responsive button sizes
- Optimized for mobile viewing

### 🎯 User Experience
- **Photo Counter**: Shows current position (e.g., "2 / 5")
- **Filename Display**: Shows photo filename at bottom
- **Keyboard Shortcuts**: Full keyboard navigation support
- **Smooth Animations**: Polished transitions and interactions

## Implementation

### Components Added
- `FullScreenCarousel` - Main carousel component
- Updated `PhotoGallery` - Integrated with carousel

### Files Modified
- `web-app/src/shared/components/full-screen-carousel.tsx` - New component
- `web-app/src/shared/components/photo-gallery.tsx` - Added carousel integration
- `web-app/src/shared/components/index.ts` - Added exports

### Usage
The feature is automatically available wherever PhotoGallery is used:
- Coffee date memory cards
- Photo upload previews
- Any other photo display components

Simply click on any photo to open the full-screen carousel.

## Technical Details

### Dependencies
- Uses existing Radix UI Dialog component
- Leverages Next.js Image optimization
- Built with Tailwind CSS for styling
- TypeScript for type safety

### Accessibility
- Proper ARIA labels for all interactive elements
- Keyboard navigation support
- Screen reader friendly
- Focus management

### Performance
- Lazy loading for non-priority images
- Optimized image sizes
- Smooth animations with CSS transforms
- Minimal re-renders

## Testing
- Unit tests included for core functionality
- Tested on desktop and mobile devices
- Keyboard navigation verified
- Touch gestures validated