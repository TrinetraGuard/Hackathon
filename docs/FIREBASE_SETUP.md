# Firebase setup for Trinetra

## 1. Create a Firebase project

1. Go to [Firebase Console](https://console.firebase.google.com/) and create a new project (e.g. "trinetra").
2. Enable **Authentication** → Sign-in method → **Email/Password**.
3. Create a **Firestore Database** (start in test mode for development; lock down with rules for production).

## 2. Environment variables

1. In Firebase Console: Project Settings → General → Your apps → Add app (Web).
2. Copy the config object and create a `.env` file in the project root (see `.env.example`):

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

3. Restart the dev server after changing `.env`.

## 3. Firestore structure

- **users** (collection)  
  Document ID = Firebase Auth UID.  
  Fields: `uid`, `email`, `displayName`, `role` (`"user"` | `"admin"`), `createdAt`.

- **places** (collection)  
  Auto-generated IDs.  
  Fields: `name`, `description`, `address?`, `imageUrl?`, `isPopular?`, `categoryId?`, `placeType?` (e.g. Medical, Toilets, Hospitals — matches essential category for “places nearby”), `createdAt`, `updatedAt`.

- **essentials** (collection)  
  Auto-generated IDs.  
  Fields: `name`, `category`, `description`, `locationLabel?`, `createdAt`, `updatedAt`.

- **categories** (collection)  
  Auto-generated IDs.  
  Fields: `name`, `slug`, `icon?`, `sortOrder?`, `createdAt`.

- **itineraries** (collection)  
  Auto-generated IDs.  
  Fields: `userId`, `title`, `items` (array of `{ placeId, placeName, dayOrder?, notes? }`), `createdAt`, `updatedAt`.

- **emergency** (collection)  
  Auto-generated IDs.  
  Fields: `title`, `number`, `type` (`"police"` | `"hospital"` | `"helpline"` | `"other"`), `description?`, `createdAt`.

- **familyContacts** (collection)  
  Auto-generated IDs.  
  Fields: `userId`, `name`, `phone`, `relation?`, `createdAt`.

- **userSelectedEssentials** (collection)  
  Document ID: `{userId}_selected`.  
  Fields: `userId`, `essentialIds` (array of strings), `updatedAt`.

- **featureImages** (collection)  
  Auto-generated IDs. Shown in the scrolling section on the website home.  
  Fields: `imageUrl`, `title?`, `caption?`, `sortOrder?`, `createdAt`.

- **familyCircles** (collection)  
  Document ID = 6-character family code (e.g. `ABC123`). Used for Family Connect: one user creates a code, others join with it to see each other’s locations.  
  Fields: `code`, `createdBy` (userId), `memberIds` (array of userIds), `createdAt`.

## 4. Admin login

**Default admin credentials** (for first-time setup):

- **Email:** `admin@trinetra.site`
- **Password:** `Admin@123`

To create the admin account:

1. Go to the app’s **Register** page.
2. Sign up with the email `admin@trinetra.site`, password `Admin@123`, and any display name (e.g. “Admin”).
3. The app automatically assigns the **admin** role to this email. After registration you’ll be redirected to the Admin area.
4. For later logins, use the **Sign in** page with the same email and password.

Alternatively, you can make any existing user an admin by editing their document in Firestore (**users** → select user by UID → set **role** to `admin`).

## 5. Firestore security rules (example)

Use rules that allow only authenticated users to read places/essentials, and only admins to write.

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAdmin() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /places/{id} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && isAdmin();
    }
    match /essentials/{id} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && isAdmin();
    }
    match /userLocations/{userId} {
      allow read: if request.auth != null && (request.auth.uid == userId || isAdmin());
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    match /familyCircles/{code} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
    }
    match /lostFound/{id} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null && isAdmin();
    }
  }
}
```

## 6. Install dependencies

If you haven’t already:

```bash
npm install
```

Then run the app:

```bash
npm start
```

## 7. Google Places API (Essential Needs – nearby places)

When there are no essentials in Firestore, the app shows default categories (Medical, Hospitals, Pharmacies, Toilets). Tapping “Show places nearby” fetches nearby places using the **Google Places API**.

1. Create a file `.env` in the project root (if it doesn’t exist).
2. Add your Google Places API key:
   ```env
   VITE_GOOGLE_PLACES_API_KEY=your_api_key_here
   ```
3. In [Google Cloud Console](https://console.cloud.google.com/), enable **Places API** (or “Places API (New)”) for your project and restrict the key (e.g. to Places API and your app’s domain).
4. Restart the dev server after changing `.env`.

If you see “No places found” or CORS errors in the browser, the Legacy Nearby Search may be blocked from the front end. In that case you’ll need a small backend or serverless function that calls the API and returns results to the app.

## 8. Family Connect (optional)

Family Connect lets users create a **family code** and share it so others can join the same circle. Everyone in the circle can see each other's **live location on a map** and how far each person is from the current user.

- The Family Connect map uses the same **Maps JavaScript API** key as Essential Needs (`VITE_GOOGLE_PLACES_API_KEY`). Ensure that API is enabled in Google Cloud.
- Each user's location is stored in **userLocations** and updated in real time while the app is open. Family members' locations are read from that collection.

## 9. AI Assistant (Gemini) and Lost & Found

- **AI Assistant**: Add `VITE_GEMINI_API_KEY` to `.env` (get a key from [Google AI Studio](https://aistudio.google.com/apikey) or enable **Generative Language API** in Google Cloud). The assistant uses Gemini for chat and can suggest nearby places; place cards show name, image, lat/lng, and an “Open in Maps” link.
- **Lost & Found**: Reports are stored in the **lostFound** collection. The Firestore rules above allow authenticated users to read and create documents. No extra setup is required beyond the rules.
