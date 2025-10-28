# Face Authentication Troubleshooting Guide

## Current Status

✅ **AI Server Running**: Port 8000, DeepFace loaded
✅ **Backend Running**: Port 5000, connected to AI server  
✅ **Face Registration Working**: User 58 registered successfully
❌ **Face Login Failing**: Similarity too low (0.29 vs required 0.7)

## Why Face Login is Failing (401 Unauthorized)

### The Issue
Your face was registered, but when you try to login:
- **Registration similarity**: 100% (your own face)
- **Login attempt similarity**: 29% (threshold is 70%)
- **Result**: Face not recognized → 401 Unauthorized

### Common Causes

1. **Different Lighting**
   - Registration: Good lighting
   - Login: Poor/different lighting
   - Solution: Use consistent lighting

2. **Different Camera Angle**
   - Registration: Face straight-on
   - Login: Face tilted or off-center
   - Solution: Position face same way

3. **Different Distance**
   - Registration: Close to camera
   - Login: Far from camera
   - Solution: Maintain same distance

4. **Different Image Quality**
   - Registration: High resolution
   - Login: Lower resolution/blurry
   - Solution: Ensure camera quality

5. **Glasses/Accessories**
   - Registration: Without glasses
   - Login: With glasses
   - Solution: Be consistent

## How Face Recognition Works

### Storage
- **Location**: `smart-bus-ai/face_db.pkl` (local pickle file)
- **NOT in MySQL database** - only face embeddings stored locally
- **Format**: `{user_id: {name, embeddings[], created_at, updated_at}}`

### Current Database
```
User 58: "kammoun mohamed aziz"
- 1 face embedding (128 dimensions)
- Registered: 2025-10-28T22:04:35
```

### Recognition Process
1. **Registration**:
   - Camera captures face → base64 image
   - AI server: DeepFace extracts 128-D embedding vector
   - Saved to `face_db.pkl` with user_id = 58

2. **Login**:
   - Camera captures face → base64 image
   - AI server: DeepFace extracts embedding from login image
   - Compare with ALL stored embeddings using cosine similarity
   - If similarity >= 0.7 (70%) → match found
   - If similarity < 0.7 → face not recognized

3. **Current Login Attempt**:
   - Best match: User 58 with 0.29 (29%) similarity
   - Threshold: 0.7 (70%)
   - Result: **FAILED** - Face not recognized

## Solutions

### Option 1: Register Multiple Face Images (Recommended)
Register your face multiple times from different angles:

1. Go to Settings → Face Authentication
2. Click "Enable Face Auth" 
3. Capture face straight-on
4. Go back to Settings, enable again (adds second image)
5. Capture face slightly left
6. Repeat for slightly right
7. Repeat for different lighting

Each registration adds an embedding. More embeddings = better accuracy!

### Option 2: Lower the Threshold (Quick Fix)
Change threshold from 0.7 to 0.5 (50% match required):

```python
# In smart-bus-ai/app.py, line ~216
threshold = 0.5  # Changed from 0.7
```

**Warning**: Lower threshold = less secure (more false positives)

### Option 3: Use Better Camera/Lighting
- Use laptop webcam (better than phone camera in browser)
- Ensure bright, even lighting
- Position face center of frame
- Keep same distance each time

### Option 4: Try Different Model
Change from Facenet to VGG-Face (higher accuracy but slower):

```python
# In smart-bus-ai/app.py
# Find all instances of model_name="Facenet"
# Replace with model_name="VGG-Face"
```

## Testing Commands

### Check Who's Registered
```powershell
cd "c:\Users\pc\Desktop\RFID PROJECT\smart-bus-ai"
python check_db.py
```

### Test AI Server
```powershell
cd "c:\Users\pc\Desktop\RFID PROJECT\smart-bus-ai"
python test_server.py
```

### Clear Face Database (Start Over)
```powershell
cd "c:\Users\pc\Desktop\RFID PROJECT\smart-bus-ai"
Remove-Item face_db.pkl
# Then re-register your face
```

### Check AI Server Logs
Look for:
```
INFO:__main__:Face matched: user_id=58, confidence=0.89  # Success!
INFO:__main__:No match found. Best score: 0.29  # Failed
```

## Best Practice: Register with Variations

For best results, register 3-5 face images:
1. **Straight-on** (neutral expression)
2. **Slight smile** (different expression)
3. **Slight angle left** (pose variation)
4. **Slight angle right** (pose variation)
5. **Different lighting** (if possible)

Each time you "enable face auth" in settings, it ADDS an embedding (doesn't replace).

## Current Threshold Settings

```python
# In app.py, verify_face function
threshold = 0.7  # 70% similarity required

# Options:
# 0.5 = Lenient (50% match) - Less secure
# 0.6 = Moderate (60% match) - Balanced
# 0.7 = Strict (70% match) - Current, most secure
# 0.8 = Very strict (80% match) - May reject real users
```

## Quick Fix: Add More Face Images

**Right now, do this:**

1. Open http://localhost:5173
2. Login with password (email/password)
3. Go to Settings → Face Authentication  
4. Notice it says face is already enabled (from previous registration)
5. Click "Disable Face Auth" (removes current embedding)
6. Click "Enable Face Auth"
7. **Make sure**:
   - Good lighting (bright, even)
   - Face centered in camera
   - Look directly at camera
   - Stay still for capture
8. After capture, go back to settings
9. Click "Enable Face Auth" AGAIN (adds 2nd image)
10. Capture from slightly different angle
11. Repeat 2-3 more times

Now you'll have 4-5 embeddings for user 58, improving accuracy!

## Understanding the 401 Error

```
POST /auth/login 401 449.382 ms - 31
```

This means:
- **Route**: POST /auth/login (face login endpoint)
- **Status**: 401 Unauthorized (face not recognized)
- **Time**: 449ms (includes AI server call)
- **Response**: 31 bytes (`{"error":"Face not recognized"}`)

The backend is working correctly - it's just that your login face image doesn't match the registered face image closely enough.

## Next Steps

1. **Immediate**: Register more face images (follow "Quick Fix" above)
2. **Alternative**: Lower threshold to 0.5 temporarily to test
3. **Long-term**: Use consistent lighting and camera angle

## Need Help?

If still not working after registering 3-5 images:
1. Check AI server logs for similarity scores
2. Try lowering threshold to 0.5
3. Clear database and re-register
4. Consider using VGG-Face model instead of Facenet
