#!/bin/bash
# Supplier Settlement API Test Suite
# Usage: bash test_supplier_api.sh

BASE_URL="http://localhost:5000/api"
TOKEN="your_auth_token_here"  # Get from login

echo "=== SUPPLIER SETTLEMENT API TESTS ==="
echo ""

# 1. Get all suppliers (requires at least one expense with supplierName)
echo "1. GET /suppliers - List all suppliers"
curl -s -X GET "$BASE_URL/suppliers" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

# 2. Get supplier summary with optional filter
echo "2. GET /suppliers/summary - Supplier summary (all)"
curl -s -X GET "$BASE_URL/suppliers/summary" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

echo "3. GET /suppliers/summary?supplierName=Rounak%20Enterprise - Summary for one supplier"
curl -s -X GET "$BASE_URL/suppliers/summary?supplierName=Rounak%20Enterprise" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

# 3. Get full ledger for supplier
echo "4. GET /suppliers/ledger/Rounak%20Enterprise - Full ledger"
curl -s -X GET "$BASE_URL/suppliers/ledger/Rounak%20Enterprise" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

# 4. Record a settlement
echo "5. POST /suppliers/settle - Record settlement"
curl -s -X POST "$BASE_URL/suppliers/settle" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "supplierName": "Rounak Enterprise",
    "settledAmount": 10000,
    "paymentDate": "2024-01-15",
    "paymentMethod": "bank",
    "referenceNumber": "TXN-12345",
    "notes": "First partial payment"
  }' | jq .
echo ""

# 5. Get settlement history for supplier
echo "6. GET /suppliers/Rounak%20Enterprise/settlements - Settlement history"
curl -s -X GET "$BASE_URL/suppliers/Rounak%20Enterprise/settlements" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

# 6. Delete settlement (if you got the ID from above)
echo "7. DELETE /suppliers/settlements/{settlementId} - Delete settlement"
echo "   (Replace {settlementId} with actual ID from settlement history)"
# curl -s -X DELETE "$BASE_URL/suppliers/settlements/{settlementId}" \
#   -H "Authorization: Bearer $TOKEN" | jq .
echo ""

echo "=== TEST COMPLETE ==="
echo "Replace '$TOKEN' with actual auth token from login response"
echo "Test sequence:"
echo "  1. Create expense(s) with supplierName='Rounak Enterprise'"
echo "  2. Run GET /suppliers to verify supplier appears"
echo "  3. Run POST /suppliers/settle to record payment"
echo "  4. Run GET /suppliers/ledger to see updated balance"
