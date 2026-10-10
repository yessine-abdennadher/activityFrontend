# Technical Documentation — ActivityTN Architecture & Developer Guide

## 1. Overview
ActivityTN is a modern React Native & Expo mobile application created to help Tunisians discover local activities based on their budget, available time, location, and group size.

## 2. Technical Stack
- **Framework**: React Native with Expo
- **Backend**: Node.js / Express / MongoDB Mongoose
- **Language**: TypeScript (App) / JavaScript ES Modules (Backend)
- **Icons**: `@expo/vector-icons` (Ionicons)
- **State & Theme**: React Context API (`AppPreferencesContext`, `LocationContext`)
- **Direct Hub**: Direct Call (`tel:`), WhatsApp reservation (`wa.me`), GPS navigation (`geo:`)
- **Styling**: Native StyleSheet API with Dark/Light design system tokens

## 3. Key Components & Screens
- **Unified App**: `App.tsx` handles state-based navigation, auto-session restore, bottom navigation.
- **HomeScreenTab**: Sfax-first launch view with dynamic GPS calculation, categories, and direct action hubs.
- **ActivityDetailsScreen**: Comprehensive details, interactive gallery, reviews, and reservation CTA.
- **RecommendationFlow**: 3-step recommendation engine.
- **FloatingTabBar**: Pill-shaped floating navigation bar.
