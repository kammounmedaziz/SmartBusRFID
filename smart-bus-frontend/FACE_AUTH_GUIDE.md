# 🔐 Face Authentication Integration

## Overview

Smart Bus now supports **Face Authentication** for secure, password-free login. Users can optionally register their face during sign-up or enable it later in settings.

---

## 🎯 Features

### 1. **Face Login**
- Quick, secure login without password
- Works on any device with a camera
- Falls back to password if face not recognized

### 2. **Optional Face Registration**
- Register face during account creation (optional)
- Add face auth anytime from Settings
- Remove face auth easily

### 3. **Dual Login Methods**
- **Password Login** - Traditional email/password
- **Face Login** - Scan face to authenticate

---

## 📡 API Endpoints

### Backend Endpoints

#### 1. **Register with Optional Face**
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "face_image": "<base64_image>" // Optional
}
```

**Response:**
```json
{
  "id": 123,
  "email": "john@example.com",
  "name": "John Doe",
  "role": "user",
  "face_registered": true
}
```

---

#### 2. **Login with Password**
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "method": "password"
}
```

---

#### 3. **Login with Face**
```http
POST /auth/login
Content-Type: application/json

{
  "loginMethod": "face",
  "image": "<base64_image>"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "method": "face",
  "matchedUserId": 123,
  "confidence": 0.95
}
```

**Error Response (Face Not Recognized):**
```json
{
  "error": "Face not recognized"
}
```

---

#### 4. **Enable Face Auth (Authenticated)**
```http
PUT /auth/me/settings/face
Authorization: Bearer <token>
Content-Type: application/json

{
  "action": "enable",
  "image": "<base64_image>"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Face authentication enabled"
}
```

---

#### 5. **Disable Face Auth (Authenticated)**
```http
PUT /auth/me/settings/face
Authorization: Bearer <token>
Content-Type: application/json

{
  "action": "disable"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Face authentication disabled"
}
```

---

## 🖥️ Frontend Usage

### Components

#### 1. **FaceCapture Component**
Reusable camera capture component.

```jsx
import FaceCapture from '../Components/faceAuth/FaceCapture';

// Usage
const [showCamera, setShowCamera] = useState(false);

const handleCapture = (base64Image) => {
  console.log('Captured:', base64Image);
  // Use base64Image for API calls
};

return (
  <>
    <button onClick={() => setShowCamera(true)}>
      Capture Face
    </button>
    
    {showCamera && (
      <FaceCapture
        onCapture={handleCapture}
        onCancel={() => setShowCamera(false)}
        title="Register Your Face"
      />
    )}
  </>
);
```

---

#### 2. **FaceAuthSettings Component**
User settings panel for enabling/disabling face auth.

```jsx
import FaceAuthSettings from '../Components/faceAuth/FaceAuthSettings';

// Usage in Dashboard
<FaceAuthSettings token={localStorage.getItem('token')} />
```

---

#### 3. **Updated Auth Page**
Login and registration with face auth support.

**Features:**
- **Login:** Toggle between Password and Face ID
- **Register:** Optional face registration checkbox
- **Auto-redirect:** Based on user role after login

---

### API Client Methods

```javascript
import api from './utils/apiClient';

// Login with password
const { token } = await api.login(email, password);

// Login with face
const { token } = await api.loginWithFace(base64Image);

// Register with optional face
const data = await api.register({
  name: "John Doe",
  email: "john@example.com",
  password: "password123",
  face_image: base64Image // Optional
});

// Enable face auth (authenticated)
await api.enableFaceAuth(token, base64Image);

// Disable face auth (authenticated)
await api.disableFaceAuth(token);
```

---

## 🔄 User Flow

### Registration Flow

```
1. User fills registration form
2. User toggles "Enable Face Login" (optional)
3. If enabled → Opens camera → Captures face
4. Submit form with user data + face_image
5. Backend creates user + registers face with AI service
6. Response includes face_registered: true/false
```

### Login Flow (Password)

```
1. User enters email/password
2. Click "Sign In"
3. Backend validates credentials
4. Returns JWT token
5. Frontend stores token and redirects
```

### Login Flow (Face)

```
1. User clicks "Face ID" tab
2. Click "Scan Face to Login"
3. Camera opens → Captures face
4. Frontend sends base64 image to backend
5. Backend calls AI service to verify face
6. If matched → Returns JWT token
7. If not matched → Error: "Face not recognized"
```

### Settings Flow (Enable Face Auth)

```
1. User navigates to Settings
2. Toggle "Enable Face Authentication"
3. Camera opens → Captures face
4. Frontend calls PUT /auth/me/settings/face
5. Backend registers face with AI service
6. Success message displayed
```

---

## 🛠️ Technical Details

### Image Format
- **Format:** JPEG (Base64 encoded)
- **Resolution:** 640x480 (ideal)
- **Quality:** 80%
- **Encoding:** Data URL stripped (only base64 data sent)

### Security
- Face embeddings stored securely in AI service
- Original images not persisted
- HTTPS required in production
- JWT tokens expire after 8 hours

### Browser Requirements
- Modern browser with `getUserMedia` API support
- Camera access permission required
- HTTPS required for camera access (production)

---

## 📱 User Dashboard Integration

### Settings Page

Located in: **Client Dashboard → Settings**

Features:
- Current face auth status (enabled/disabled)
- Toggle switch
- Instructions panel
- Enable/disable buttons
- Success/error messages

---

## 🧪 Testing

### Manual Testing Steps

#### Test 1: Register with Face
1. Go to sign-up page
2. Fill form
3. Enable "Face Login"
4. Capture face
5. Submit
6. Verify success message

#### Test 2: Face Login
1. Go to login page
2. Click "Face ID" tab
3. Click "Scan Face to Login"
4. Capture face
5. Verify redirect to dashboard

#### Test 3: Enable Face in Settings
1. Login with password
2. Go to Settings
3. Click "Enable Face Authentication"
4. Capture face
5. Verify success message

#### Test 4: Disable Face in Settings
1. Login (password or face)
2. Go to Settings
3. Click "Disable Face Authentication"
4. Confirm action
5. Verify success message

---

## 🐛 Troubleshooting

### Common Issues

#### Camera Not Working
- **Cause:** Permission denied
- **Solution:** Grant camera permission in browser settings

#### Face Not Recognized
- **Cause:** Poor lighting, face not registered, or angle issue
- **Solution:** Ensure good lighting, face the camera directly

#### "AI server not available"
- **Cause:** Python AI service not running
- **Solution:** Start AI service: `python smart-bus-ai/app.py`

---

## 📝 Notes

- Face embeddings stored by `user_id` in AI service
- Multiple face registrations per user not supported (overwrites)
- Face data automatically deleted when user disables face auth
- Password login always available as fallback

---

## 🚀 Deployment Checklist

- [ ] AI service running on port 8000
- [ ] Backend configured with AI_SERVER_URL
- [ ] HTTPS enabled (required for camera access)
- [ ] Camera permissions tested on target devices
- [ ] Face recognition accuracy tested with diverse users
- [ ] Error handling tested (AI service down, no face detected, etc.)

---

## 📚 Related Documentation

- [AI Service API](../smart-bus-ai/README.md)
- [Backend API](../smart-bus-backend/README.md)
- [Face Recognition Implementation](../smart-bus-ai/core/face_recognition.py)

---

**Last Updated:** October 28, 2025
