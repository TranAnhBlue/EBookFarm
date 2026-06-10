# 🧪 Mobile App Testing Guide - JournalListScreen

## 📱 Quick Start Testing

### 1. Start the App
```bash
cd mobile
npm start
# or
npx expo start
```

### 2. Scan QR Code
- iOS: Use Camera app
- Android: Use Expo Go app

---

## ✅ Test Scenarios

### Scenario 1: Category Navigation
**Objective**: Verify all 8 categories are accessible

**Steps**:
1. Open JournalListScreen
2. Tap "VietGAP" tab (should be selected by default)
3. Verify chips show: [Trồng trọt] [Chăn nuôi] [Thủy sản]
4. Tap "Hữu cơ" tab
5. Verify chips change to: [Cây trồng] [Chăn nuôi] [Thủy sản]
6. Tap "Thông minh" tab
7. Verify chip shows: [Tất cả]

**Expected**:
- ✅ Tabs switch smoothly
- ✅ Chips update when tab changes
- ✅ Active tab shows colored underline
- ✅ Active chip shows colored border
- ✅ No errors in console

---

### Scenario 2: Category Filtering
**Objective**: Verify journals filter by category

**Steps**:
1. In VietGAP → Trồng trọt
2. Count journals displayed
3. Switch to VietGAP → Chăn nuôi
4. Verify journal list changes
5. Check if schemas in "Tạo sổ" modal are filtered

**Expected**:
- ✅ Different journals per category
- ✅ Schemas filtered in modal
- ✅ No duplicate journals
- ✅ Loading spinner shows during fetch

---

### Scenario 3: Status Filtering
**Objective**: Verify status filter works

**Steps**:
1. Tap "Lọc" button
2. Filter panel expands
3. Tap "Nháp" status
4. Verify only draft journals show
5. Tap "Đã duyệt" status
6. Verify only verified journals show
7. Tap "Tất cả"
8. Verify all journals show again

**Expected**:
- ✅ Filter panel animates smoothly
- ✅ Journals filter correctly
- ✅ Active status shows colored border
- ✅ Filter badge (●) appears when filter active
- ✅ API called with status param

---

### Scenario 4: Search Functionality
**Objective**: Verify search works

**Steps**:
1. Type in search box: "lúa"
2. Verify only matching journals show
3. Clear search
4. Type QR code if you know one
5. Verify journal appears

**Expected**:
- ✅ Search filters in real-time
- ✅ Matches journal name
- ✅ Matches QR code
- ✅ No results → empty state

---

### Scenario 5: Sorting
**Objective**: Verify sort cycles correctly

**Steps**:
1. Tap "Sắp xếp" button
2. Should show "Mới nhất"
3. Verify newest journals at top
4. Tap again → "Cũ nhất"
5. Verify oldest journals at top
6. Tap again → "Tên A-Z"
7. Verify alphabetical order
8. Tap again → "Tên Z-A"
9. Verify reverse alphabetical

**Expected**:
- ✅ Sort cycles through 4 options
- ✅ Button text updates
- ✅ Journal order changes
- ✅ API called with sortBy param

---

### Scenario 6: Create Journal with Category
**Objective**: Verify category context passed to create

**Steps**:
1. Select VietGAP → Chăn nuôi
2. Tap [+] button
3. Verify schemas shown are for Chăn nuôi
4. Select a schema (e.g., "Dê thịt")
5. Verify JournalEntryScreen opens
6. Check if category is preserved (console log or check API call)

**Expected**:
- ✅ Only relevant schemas shown
- ✅ Navigation includes category param
- ✅ JournalEntry receives category
- ✅ Schema colors match category group

---

### Scenario 7: Edit Journal Preserves Category
**Objective**: Verify edit maintains category

**Steps**:
1. Find a journal in Hữu cơ → Cây trồng
2. Tap "Viết" button
3. Verify JournalEntryScreen opens
4. Check if category is correct
5. Make a change and save
6. Return to list
7. Verify journal still in correct category

**Expected**:
- ✅ Edit button works
- ✅ Category preserved
- ✅ Journal updates correctly
- ✅ Returns to same category view

---

### Scenario 8: Visual Elements
**Objective**: Verify colors and icons correct

**Steps**:
1. Check VietGAP journals have green accent
2. Check Hữu cơ journals have darker green
3. Check Thông minh journals have teal
4. Verify icons match:
   - VietGAP → leaf icon
   - Hữu cơ → heart icon
   - Thông minh → zap icon
5. Check progress bars use category colors

**Expected**:
- ✅ Colors consistent throughout
- ✅ Icons display correctly
- ✅ Progress bar colored
- ✅ Category names show full text

---

### Scenario 9: Empty States
**Objective**: Verify empty states display

**Steps**:
1. Filter by a status with no journals
2. Verify empty state shows
3. Search for non-existent term
4. Verify "no results" message
5. Switch to category with no journals
6. Verify empty state

**Expected**:
- ✅ Empty state shows book icon
- ✅ Message: "Chưa có sổ nhật ký nào"
- ✅ Button: "Tạo sổ đầu tiên"
- ✅ Button works

---

### Scenario 10: Pull to Refresh
**Objective**: Verify refresh works

**Steps**:
1. Pull down on journal list
2. Verify spinner shows
3. Wait for refresh
4. Verify journals reload
5. Check if filters maintained

**Expected**:
- ✅ Pull-to-refresh activates
- ✅ Spinner shows
- ✅ Data reloads
- ✅ Filters stay active

---

## 🐛 Bug Report Template

If you find issues, report them like this:

```
**Bug**: [Short description]

**Category**: VietGAP / Hữu cơ / Thông minh
**Filter Active**: Yes/No (which filter?)
**Search Active**: Yes/No

**Steps to Reproduce**:
1. Step 1
2. Step 2
3. Step 3

**Expected**: What should happen
**Actual**: What actually happened

**Screenshots**: [If applicable]
**Console Errors**: [Copy any errors]
**Device**: iOS/Android
**Expo Version**: [Check app info]
```

---

## 📊 Performance Checklist

### Smooth UI:
- [ ] Tabs switch instantly
- [ ] Chips scroll smoothly
- [ ] Journal list scrolls at 60fps
- [ ] No lag when opening modals
- [ ] Refresh doesn't freeze UI

### Network:
- [ ] API calls complete in < 2s
- [ ] Loading states show immediately
- [ ] Error handling works
- [ ] Retry on failure works

### Memory:
- [ ] No memory leaks (check Expo DevTools)
- [ ] App doesn't crash after extended use
- [ ] Images load correctly
- [ ] Modals close properly

---

## 🎨 Visual Regression Checklist

### Colors:
- [ ] VietGAP green: `#22c55e`
- [ ] Hữu cơ green: `#16a34a`
- [ ] Thông minh teal: `#059669`
- [ ] All colors consistent

### Typography:
- [ ] Headers bold and readable
- [ ] Body text clear
- [ ] Status badges readable
- [ ] No text overflow

### Layout:
- [ ] Cards aligned properly
- [ ] Icons sized correctly
- [ ] Spacing consistent
- [ ] No elements overlapping

### Dark Mode (if supported):
- [ ] Colors adjust for dark mode
- [ ] Text readable
- [ ] Contrast sufficient

---

## ✅ Final Acceptance Criteria

Before marking as "DONE", verify:

- [ ] All 8 categories accessible
- [ ] All 5 status filters work
- [ ] All 4 sort options work
- [ ] Search works for name and QR
- [ ] Create journal with category works
- [ ] Edit journal preserves category
- [ ] Colors display correctly
- [ ] Icons display correctly
- [ ] No console errors
- [ ] No crashes
- [ ] Smooth performance
- [ ] Empty states work
- [ ] Pull-to-refresh works
- [ ] API integration correct
- [ ] User feedback positive

---

## 📞 Support

**Issues?** Report in this format:
- What you did
- What you expected
- What happened
- Screenshots/logs

**Questions?** Check:
- `MOBILE_JOURNALLIST_IMPLEMENTATION_COMPLETE.md`
- `MOBILE_PHASE0_VALIDATION.md`
- `MOBILE_WEB_SYNC_ROADMAP.md`

---

**Happy Testing! 🚀**
