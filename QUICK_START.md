# 🚀 Quick Start - Testing Multi-Category JournalList

## ⚡ Fastest Way to Test

### 1. Start App (30 seconds)
```bash
cd mobile
npm start
```

### 2. Open on Device
- **Scan QR code** with Expo Go app
- Wait for app to load

### 3. Navigate to Journals
- Login with test user: `nongdan@gmail.com` / `22062004`
- Tap "Sổ nhật ký" from bottom nav

### 4. Quick Verification (2 minutes)

#### ✅ Test 1: Tabs Work
- Tap **VietGAP** → See green underline
- Tap **Hữu cơ** → See darker green underline
- Tap **Thông minh** → See teal underline

#### ✅ Test 2: Chips Change
- Under VietGAP → See [Trồng trọt] [Chăn nuôi] [Thủy sản]
- Under Hữu cơ → See [Cây trồng] [Chăn nuôi] [Thủy sản]
- Under Thông minh → See [Tất cả]

#### ✅ Test 3: Filtering Works
- Tap **Lọc** button
- Panel expands showing status chips
- Tap **Nháp** → Only draft journals show
- Badge (●) appears on Lọc button

#### ✅ Test 4: Sorting Works
- Tap **Sắp xếp** button
- Text changes: Mới nhất → Cũ nhất → Tên A-Z → Tên Z-A

#### ✅ Test 5: Cards Look Good
- Journal cards show colored icon on left
- Category name shows below journal name
- Progress bar is colored
- Status badge displays correctly

---

## ✅ If Everything Works

**You're done! Move to Phase 2:**
- Create ReportsScreen
- Add charts
- See `MOBILE_WEB_SYNC_ROADMAP.md` for details

---

## ❌ If Something's Wrong

### Check Console
```bash
# In terminal where you ran npm start
# Look for errors
```

### Common Issues:

**Issue**: "Cannot find module '../constants/categories'"
```bash
# Solution: Make sure file was created
ls mobile/src/constants/categories.js
```

**Issue**: Tabs don't appear
```bash
# Solution: Check if CATEGORY_GROUPS is imported
# Open JournalListScreen.js and verify line 9-16
```

**Issue**: API errors
```bash
# Solution: Check backend is running
# Check .env.local has correct API URL
```

**Issue**: Nothing changes when tapping tabs
```bash
# Solution: Check handleGroupChange function exists
# Check activeGroup state is being set
```

---

## 📸 What Success Looks Like

```
┌─────────────────────────────────────┐
│  Sổ nhật ký sản xuất          [+]   │
├─────────────────────────────────────┤
│ [VietGAP] [Hữu cơ] [Thông minh]    │ ← Should see these tabs
│         ══════                       │ ← Active tab has underline
├─────────────────────────────────────┤
│ [Trồng trọt] [Chăn nuôi] [Thủy sản]│ ← Should see these chips
│  ═══════════                         │ ← Active chip has border
├─────────────────────────────────────┤
│ 🔍 Tìm kiếm...                      │
│ [Lọc]  [Mới nhất ↓]                │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │●│[📖] Nhật ký dê thịt      [Nháp]│ │
│ │ │    VietGAP - Chăn nuôi         │ │ ← Should show category
│ │ │    👤 Sổ cá nhân · 📅 05/12   │ │
│ │ │    ▓▓▓▓▓▓░░░░ 60%             │ │
│ │ │    [Viết] [Gửi duyệt] [Xem]   │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

---

## 📋 Full Testing (If You Have Time)

See `MOBILE_TESTING_GUIDE.md` for:
- 10 detailed test scenarios
- Performance checklist
- Bug report template
- Acceptance criteria

---

## 📚 Documentation

### Quick Reference:
- **Implementation**: `MOBILE_JOURNALLIST_IMPLEMENTATION_COMPLETE.md`
- **Testing**: `MOBILE_TESTING_GUIDE.md`
- **Summary**: `SESSION_SUMMARY.md`

### Roadmap:
- **Overall Plan**: `MOBILE_WEB_SYNC_ROADMAP.md`
- **Executive Summary**: `MOBILE_SYNC_SUMMARY.md`
- **Backend Validation**: `MOBILE_PHASE0_VALIDATION.md`

---

## 🎯 Success Criteria (Quick Check)

- [ ] Tabs visible and clickable
- [ ] Chips change when tab changes
- [ ] Journals filter by category
- [ ] Lọc button opens filter panel
- [ ] Status filter works
- [ ] Sắp xếp button cycles sorts
- [ ] Cards show category name
- [ ] Cards show colored icons
- [ ] No console errors
- [ ] No crashes

**8/10 passing = Good to go!** ✅

---

## 🆘 Need Help?

1. **Check console** for errors
2. **Read error message** carefully
3. **Check file exists**: `mobile/src/constants/categories.js`
4. **Verify imports** in JournalListScreen.js
5. **Restart Metro bundler**: Ctrl+C then `npm start`
6. **Clear cache**: `npm start -- --clear`

---

## 🎉 Ready to Test?

```bash
cd mobile
npm start
# Scan QR → Open app → Go to Journals → Test 5 things above → Done!
```

**Time needed**: 5 minutes  
**Difficulty**: Easy  
**Coffee required**: Optional ☕

**Let's go! 🚀**
