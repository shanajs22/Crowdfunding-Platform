# Crowdfunding Web App with React and Firebase

A full-stack crowdfunding web application built with React and Firebase, allowing users to create campaigns and accept donations.

## Features

- User authentication (signup, login, logout)
- Create and manage crowdfunding campaigns
- View campaigns and campaign details
- Make donations to campaigns
- Real-time data updates using Firebase

## Tech Stack

- **Frontend**: React with TypeScript
- **UI Components**: Shadcn UI
- **Backend**: Firebase (Authentication & Firestore)
- **Routing**: React Router
- **State Management**: React Context API

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- A Firebase account

## Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Set up Authentication with Email/Password provider
4. Create a Firestore database
5. Register a new web app in your project to get your Firebase configuration
6. Deploy the Firestore security rules from `firestore.rules`

## Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory with your Firebase configuration:

```
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

4. Start the development server:

```bash
npm run dev
```

## Project Structure

```
src/
├── components/        # Reusable UI components
├── context/           # React context providers
│   ├── AuthContext.tsx       # Authentication state management
│   └── CrowdfundingContext.tsx # Campaign and donation state management
├── lib/               # Utility functions and services
│   └── firebase.ts    # Firebase configuration and service functions
├── pages/             # Application pages
└── main.tsx           # Entry point
```

## Firebase Structure

### Firestore Collections

1. **users**
   - `uid`: User ID (from Firebase Auth)
   - `name`: User's display name
   - `email`: User's email address
   - `createdAt`: Timestamp of account creation

2. **campaigns**
   - `title`: Campaign title
   - `description`: Campaign description
   - `ownerUid`: UID of the campaign creator
   - `ownerName`: Name of the campaign creator
   - `goalAmount`: Funding goal amount
   - `amountRaised`: Current amount raised
   - `deadline`: Campaign end date
   - `createdAt`: Timestamp of campaign creation
   - `imageUrl`: URL of the campaign image

3. **donations**
   - `campaignId`: ID of the campaign
   - `donorUid`: UID of the donor
   - `donorName`: Name of the donor
   - `amount`: Donation amount
   - `message`: Optional message from the donor
   - `createdAt`: Timestamp of donation

## Security

The application uses Firebase Authentication for user management and Firestore security rules to ensure:

- Only authenticated users can create campaigns
- Only campaign owners can update their campaigns
- Anyone can view campaigns and donations
- Only authenticated users can make donations
- Users cannot modify or delete donations

## License

MIT