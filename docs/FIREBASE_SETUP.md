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
