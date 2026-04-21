# Journal Save Issue - Fixed

## Problem
User reported that after submitting journal form, data doesn't appear to be saved to database.

## Investigation Results

### Database Check
Ran `backend/check-latest-journal.js` and confirmed:
- ✅ Data IS being saved to database
- ✅ 13 journals exist (10 Draft, 3 Completed)
- ✅ Latest journal: "Chè búp" with 2 tables of data
- ❌ **BUG FOUND**: Status field was being saved incorrectly as individual characters instead of string

### Root Cause
In `frontend/src/pages/Journal/JournalEntry.jsx`, the `saveMutation` was including the `status` field inside the `entries` object:

```javascript
// BEFORE (WRONG)
const payload = {
    schemaId: activeSchemaId,
    status: values.status || 'Draft',
    entries: values  // ❌ This includes status field!
};
```

This caused the status to be saved as:
```javascript
entries: {
  status: {
    0: 'D',
    1: 'r', 
    2: 'a',
    3: 'f',
    4: 't'
  }
}
```

## Solution
Separated the `status` field from `entries` before constructing the payload:

```javascript
// AFTER (CORRECT)
const { status, ...entries } = values;

const payload = {
    schemaId: activeSchemaId,
    status: status || 'Draft',
    entries: entries  // ✅ Now excludes status field
};
```

## Files Modified
- `frontend/src/pages/Journal/JournalEntry.jsx` - Fixed payload construction in saveMutation

## Testing Steps
1. Navigate to any journal category (e.g., /vietgap/trong-trot)
2. Click "Tạo sổ nhật ký"
3. Select a schema type
4. Fill in at least one field in any tab
5. Select a status (Draft, Submitted, etc.)
6. Click "Lưu nhật ký"
7. Verify:
   - Success message appears
   - Redirected to journal list
   - New journal appears in the list with correct status badge
   - Run `node backend/check-latest-journal.js` to verify status is saved as string, not object

## Additional Notes
- The query invalidation (`queryClient.invalidateQueries({ queryKey: ['journals'] })`) is working correctly
- The navigation back to list page is working correctly
- The issue was purely in the payload structure, not in the save/fetch logic
