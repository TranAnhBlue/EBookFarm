# 📦 Installation Guide - Mobile App Updates

## 🎯 Cài đặt Dependencies Mới

Sau khi hoàn thành Phase 1 và Phase 2, bạn cần cài đặt thư viện biểu đồ cho ReportsScreen.

---

## ⚡ Quick Installation

### Bước 1: Cài đặt Dependencies
```bash
cd mobile
npm install react-native-svg@15.10.2 react-native-chart-kit@^6.12.0
```

### Bước 2: Xóa Cache và Restart
```bash
npm start -- --clear
```

### Bước 3: Test App
```bash
# Quét QR code với Expo Go
# Mở app → Home → Tap "Báo cáo thống kê"
```

---

## 📋 Detailed Steps

### 1. Check Current Directory
```bash
pwd
# Should show: /path/to/your/project/mobile
```

### 2. Install SVG Support
```bash
npm install react-native-svg@15.10.2
```

**Why?** Chart library requires SVG for rendering

### 3. Install Chart Library
```bash
npm install react-native-chart-kit@^6.12.0
```

**What it provides:**
- LineChart (for activity timeline)
- PieChart (for status distribution)
- BarChart (for future use)
- ProgressChart (for future use)

### 4. Verify Installation
```bash
npm list react-native-svg react-native-chart-kit
```

**Expected output:**
```
mobile@1.0.0 /path/to/project/mobile
├── react-native-chart-kit@6.12.0
└── react-native-svg@15.10.2
```

### 5. Clear Metro Cache
```bash
# Stop any running Metro bundler (Ctrl+C)
npm start -- --clear
```

### 6. Rebuild (if needed)
```bash
# For iOS (if using iOS simulator)
npx expo run:ios

# For Android (if using Android emulator)
npx expo run:android
```

---

## ✅ Verification

### Check package.json
Open `mobile/package.json` and verify:

```json
{
  "dependencies": {
    "react-native-svg": "15.10.2",
    "react-native-chart-kit": "^6.12.0"
  }
}
```

### Test ReportsScreen
1. Start app: `npm start`
2. Open on device
3. Navigate: Home → "Báo cáo thống kê"
4. Should see:
   - Stats cards
   - Pie chart (status)
   - Line chart (activity)
   - No errors

---

## 🐛 Troubleshooting

### Issue 1: "Cannot find module 'react-native-svg'"
```bash
# Solution 1: Reinstall
npm uninstall react-native-svg
npm install react-native-svg@15.10.2

# Solution 2: Clear cache
rm -rf node_modules
npm install
npm start -- --clear
```

### Issue 2: "Cannot find module 'react-native-chart-kit'"
```bash
# Solution
npm install react-native-chart-kit@^6.12.0
npm start -- --clear
```

### Issue 3: Charts not displaying
```bash
# Solution 1: Check imports
# Open ReportsScreen.js and verify:
import { LineChart, PieChart } from 'react-native-chart-kit';

# Solution 2: Restart Metro
# Press 'r' in Metro terminal or
npm start -- --clear
```

### Issue 4: "Invariant Violation" or "Element type is invalid"
```bash
# Solution: Verify versions match
npm list react-native-svg
# Should be 15.10.2

npm list react-native-chart-kit
# Should be 6.12.0

# If different:
npm install react-native-svg@15.10.2 react-native-chart-kit@^6.12.0 --force
```

### Issue 5: Expo Go shows "Unable to resolve module"
```bash
# Solution: Clear Expo cache
expo start -c

# Or
npx expo start --clear
```

### Issue 6: iOS build fails
```bash
# Solution: Clean and rebuild
cd ios
pod install
cd ..
npx expo run:ios
```

### Issue 7: Android build fails
```bash
# Solution: Clean gradle
cd android
./gradlew clean
cd ..
npx expo run:android
```

---

## 📱 Platform-Specific Notes

### Expo Go (Development)
- ✅ No additional setup needed
- ✅ Works out of the box
- ✅ Just install npm packages

### iOS (Production Build)
```bash
# If building standalone app
npx expo prebuild
cd ios
pod install
cd ..
npx expo run:ios
```

### Android (Production Build)
```bash
# If building standalone app
npx expo prebuild
npx expo run:android
```

---

## 🔍 Verify Installation Success

### Run These Commands:
```bash
# 1. Check dependencies
npm list react-native-svg react-native-chart-kit

# 2. Check for errors
npm run lint

# 3. Start app
npm start
```

### Expected Results:
- ✅ Both packages listed in npm list
- ✅ No lint errors related to imports
- ✅ Metro bundler starts successfully
- ✅ App opens without crashes
- ✅ ReportsScreen loads with charts

---

## 📊 What Gets Installed:

### react-native-svg (15.10.2)
**Size**: ~2MB  
**Purpose**: SVG rendering for charts  
**Dependencies**: None  
**Platform**: iOS, Android, Web

### react-native-chart-kit (^6.12.0)
**Size**: ~500KB  
**Purpose**: Chart components  
**Dependencies**: react-native-svg  
**Platform**: iOS, Android, Web

**Total Added Size**: ~2.5MB

---

## ⚙️ Configuration (Optional)

### Custom Chart Colors
Edit `mobile/src/screens/ReportsScreen.js`:

```javascript
const chartConfig = {
  backgroundColor: '#ffffff',
  backgroundGradientFrom: '#ffffff',
  backgroundGradientTo: '#ffffff',
  color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`, // Change this
  labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`, // And this
};
```

### Chart Size
Edit `mobile/src/screens/ReportsScreen.js`:

```javascript
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 32; // Adjust padding here
```

---

## 🚀 Performance Tips

### 1. Optimize Bundle Size
```bash
# Use production build for smaller size
npx expo export
```

### 2. Lazy Load Charts
```javascript
// In ReportsScreen.js (future optimization)
const Charts = React.lazy(() => import('./Charts'));
```

### 3. Memoize Chart Data
```javascript
// Already implemented in ReportsScreen
const pieChartData = useMemo(() => ..., [statusData]);
```

---

## 📦 Alternative: Manual Installation

If npm install doesn't work:

### Step 1: Add to package.json
```json
{
  "dependencies": {
    "react-native-svg": "15.10.2",
    "react-native-chart-kit": "^6.12.0"
  }
}
```

### Step 2: Install
```bash
npm install
```

### Step 3: Link (if needed for older React Native)
```bash
# Usually not needed for Expo
npx react-native link react-native-svg
```

---

## ✅ Installation Complete Checklist

- [ ] Navigated to mobile directory
- [ ] Ran npm install commands
- [ ] No error messages
- [ ] Verified in package.json
- [ ] Cleared Metro cache
- [ ] Started app successfully
- [ ] Opened ReportsScreen
- [ ] Charts display correctly
- [ ] No console errors
- [ ] Pull-to-refresh works

**All checked?** Installation successful! ✅

---

## 🆘 Still Having Issues?

### Check These:
1. **Node version**: `node --version` (should be 16+)
2. **NPM version**: `npm --version` (should be 8+)
3. **Expo version**: `npx expo --version` (should be 50+)
4. **Internet connection**: Required for npm install
5. **Disk space**: Ensure enough space for node_modules

### Get Help:
1. Check error message carefully
2. Search error on Google/Stack Overflow
3. Check react-native-chart-kit GitHub issues
4. Ask in Expo Discord/Forums

---

## 📚 Documentation Links

- **react-native-svg**: https://github.com/software-mansion/react-native-svg
- **react-native-chart-kit**: https://github.com/indiespirit/react-native-chart-kit
- **Expo**: https://docs.expo.dev

---

**Installation complete! Continue to testing! 🚀**
