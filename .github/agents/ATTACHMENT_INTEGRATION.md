# Attachment System Integration Guide

## Overview
A polymorphic document attachment system for tracking invoices, deposit slips, and other financial records tied to expenses and investments.

## Backend Setup (COMPLETE ✓)
All backend files are in place and syntax-validated:
- `Backend/models/Attachment.js` — MongoDB schema with soft-delete
- `Backend/controllers/attachmentController.js` — upload/list/download/delete handlers
- `Backend/routes/attachments.js` — REST API routes
- Routes mounted in `Backend/server.js` at `/api/attachments`

No additional backend setup needed.

## Frontend Setup

### 1. Install Dependencies
```bash
cd Frontend
npm install react-dropzone
```

### 2. Import Components
```jsx
import AttachmentUpload from '@/components/common/AttachmentUpload';
import AttachmentList from '@/components/common/AttachmentList';
```

### 3. Add Upload to Expense Create Form

In `Frontend/src/pages/AddExpense.jsx`, after the expense is created:

```jsx
// After successful expense creation
const [createdExpenseId, setCreatedExpenseId] = useState(null);

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const response = await api.post('/expenses', formData);
    const expenseId = response.data.data._id;
    setCreatedExpenseId(expenseId);
    
    // Show upload form instead of immediate redirect
    // User can upload invoice, then confirm
    toast.success('Expense created! Now you can upload an invoice.');
  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed to add expense');
  }
};

// After form submission, show upload component
{createdExpenseId ? (
  <div className="mt-6 p-4 border rounded-lg bg-blue-50">
    <h3 className="text-lg font-semibold mb-4">Upload Invoice (Optional)</h3>
    <AttachmentUpload
      relatedModel="Expense"
      relatedId={createdExpenseId}
      category="purchase_invoice"
      onUploadSuccess={() => {
        setTimeout(() => navigate('/expenses'), 1000);
      }}
    />
  </div>
) : (
  // ... form JSX ...
)}
```

### 4. Add List to Expense Detail Page

In `Frontend/src/pages/ExpenseList.jsx` or a new `ExpenseDetail.jsx`:

```jsx
import AttachmentList from '@/components/common/AttachmentList';

export default function ExpenseDetail({ expenseId }) {
  const [expense, setExpense] = useState(null);

  // ... fetch expense ...

  return (
    <div className="space-y-6">
      {/* Expense details ... */}
      
      <div>
        <h3 className="text-lg font-semibold mb-3">Attachments</h3>
        <AttachmentList 
          relatedModel="Expense" 
          relatedId={expenseId} 
        />
      </div>

      {/* Show upload form if payment status is being moved to paid */}
      {expense.paymentStatus === 'pending' && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Upload Deposit Slip</h3>
          <AttachmentUpload
            relatedModel="Expense"
            relatedId={expenseId}
            category="deposit_slip"
            onUploadSuccess={() => {
              // Refetch expense or attachments
            }}
          />
        </div>
      )}
    </div>
  );
}
```

## API Usage Examples

### Upload a File
```bash
curl -X POST http://localhost:5000/api/attachments \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@invoice.pdf" \
  -F "relatedModel=Expense" \
  -F "relatedId=EXPENSE_ID" \
  -F "category=purchase_invoice"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "attachment-id",
    "relatedModel": "Expense",
    "relatedId": "expense-id",
    "category": "purchase_invoice",
    "originalName": "invoice.pdf",
    "storagePath": "/uploads/1234567890-invoice.pdf",
    "sizeBytes": 125000,
    "uploadedAt": "2026-07-04T10:30:00Z"
  }
}
```

### List Attachments
```bash
curl http://localhost:5000/api/attachments/Expense/EXPENSE_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Download a File
```bash
curl -X GET http://localhost:5000/api/attachments/ATTACHMENT_ID/download \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o downloaded_file.pdf
```

### Delete Attachment
```bash
curl -X DELETE http://localhost:5000/api/attachments/ATTACHMENT_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Component Props Reference

### AttachmentUpload
```tsx
<AttachmentUpload
  relatedModel="Expense" | "Transaction"  // required
  relatedId={string}                      // required (ObjectId)
  category="purchase_invoice" | "deposit_slip" | "other"  // optional, default: "purchase_invoice"
  onUploadSuccess={(attachment) => {}}    // optional callback after successful upload
/>
```

### AttachmentList
```tsx
<AttachmentList
  relatedModel="Expense" | "Transaction"  // required
  relatedId={string}                      // required (ObjectId)
/>
```

## File Constraints
- **Max Size**: 10 MB per file
- **Allowed Types**: JPEG, PNG, GIF, WebP, PDF
- **Storage**: Local disk under `Backend/uploads/`
- **Access**: User-restricted (can only see own expense attachments)

## Data Flow

### Upload Flow
1. User selects file via drag-drop or file picker
2. Frontend validates type/size
3. POST to `/api/attachments` with FormData (file + metadata)
4. Backend validates ownership, creates DB record, stores file
5. Response includes attachment metadata
6. Frontend displays success toast

### Download Flow
1. User clicks download button on attachment row
2. Frontend fetches `/api/attachments/:id/download`
3. Backend validates ownership, streams file with proper headers
4. Browser triggers download with original filename

### Delete Flow
1. User clicks delete, confirms
2. Backend marks `isDeleted: true` (soft delete)
3. File remains on disk (for audit trail)
4. Frontend removes from list
5. Future queries exclude deleted records

## Testing Checklist

- [ ] Upload invoice PDF to a created expense
- [ ] Upload deposit slip (if payment status allows)
- [ ] List shows both upload categories
- [ ] Download works with correct filename
- [ ] Delete marks as deleted (soft)
- [ ] Refresh page, attachments still show
- [ ] Multiple files per expense work
- [ ] Reject oversized/wrong format files
- [ ] Only user's own expenses can be accessed

## Future Enhancements
- Cloud storage backend (S3, etc.)
- OCR to auto-extract amounts
- File versioning/history
- Batch upload
- Multi-user access/approvals
- Archive/retention policies
