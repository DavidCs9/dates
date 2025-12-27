# Map Feature Documentation

## Overview
The map feature allows users to visualize all their coffee date locations on an interactive Google Map with clickable markers showing detailed information about each café visit.

## Features

### 🗺️ Interactive Map View
- **Toggle View**: Switch between grid and map view using the view toggle buttons
- **Location Markers**: Each coffee date appears as an amber-colored pin on the map
- **Auto-fit Bounds**: Map automatically adjusts to show all coffee date locations
- **Responsive Design**: Map adapts to different screen sizes (400px mobile, 500px tablet, 600px desktop)

### 📍 Smart Markers
- **Custom Styling**: Amber-colored circular markers with white borders
- **Click Interaction**: Click any marker to see detailed information
- **Info Windows**: Rich popup content showing:
  - Primary photo (if available)
  - Café name and address
  - Coffee rating (☕ 1-5 stars)
  - Dessert rating (🧁 1-5 stars, if rated)
  - Visit date in Spanish format

### 🎯 User Experience
- **Loading State**: Smooth loading animation while map initializes
- **Error Handling**: Graceful fallback if map fails to load
- **Location Counter**: Shows total number of locations in bottom-left corner
- **Single Info Window**: Only one info window open at a time for clean UX

## Technical Implementation

### Components
- **MapView**: Main map component (`/features/locations/components/map-view.tsx`)
- **ViewToggle**: Grid/Map toggle buttons (`/features/coffee-dates/components/view-toggle.tsx`)
- **Updated HomeContent**: Integrated map view into main page

### Google Maps Integration
- Uses Google Maps JavaScript API
- Dynamic script loading for optimal performance
- Proper cleanup of markers and event listeners
- Responsive to coffee date data changes

### Styling
- Consistent with existing Tailwind CSS theme
- Matches warm amber/orange color palette
- Supports dark mode (info windows use light theme for readability)
- Mobile-first responsive design

## Usage

1. **View Toggle**: Click the Map button in the top-right controls to switch to map view
2. **Explore Locations**: Pan and zoom around the map to see all coffee date locations
3. **Get Details**: Click any marker to see photos, ratings, and visit information
4. **Switch Back**: Click Grid button to return to the traditional card view

## Requirements
- Google Maps API key must be configured in `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- Coffee dates must have valid coordinates in `cafeInfo.coordinates`
- Internet connection required for map tiles and functionality

## Future Enhancements
- Marker clustering for areas with many coffee dates
- Custom marker icons based on ratings
- Map-based filtering and search
- Directions integration
- Street View integration