# ✅ Firebase Backend Integration Complete

## Deployment Status

### ✅ Successfully Deployed Functions

1. **API Function** (`api`)
   - **URL**: `https://api-azi6a7lafq-el.a.run.app`
   - **Region**: `asia-south1` (Mumbai)
   - **Status**: ✅ Live and Ready

2. **Scheduled Function** (`rebuildMetricsCron`)
   - **Schedule**: Every 1 hour
   - **Timezone**: Asia/Kolkata
   - **Status**: ✅ Deployed and Scheduled

### ✅ Configuration

- **Razorpay Test Credentials**: ✅ Configured
  - Key ID: `rzp_test_RbJ7cXBSE9NhfY`
  - Key Secret: ✅ Set
  - Webhook Secret: Optional (test mode - skipped)

### ✅ Frontend Integration

- **Next.js API Routes**: ✅ Wired to Firebase Functions
  - `/api/payment/create-order` → Firebase Function
  - `/api/payment/verify` → Firebase Function webhook handler

- **Checkout Page**: ✅ Updated
  - Uses saved addresses from user profile
  - Sends `shippingAddressId` instead of full address object
  - Gets Firebase ID token for authentication

- **Environment Variable**: 
  - Set `NEXT_PUBLIC_FIREBASE_FUNCTIONS_URL=https://api-azi6a7lafq-el.a.run.app` in `.env.local`

## API Endpoints (Live)

### 1. Create Payment Order
```
POST https://api-azi6a7lafq-el.a.run.app/api/create-payment-order
Authorization: Bearer <firebase-id-token>
Content-Type: application/json

Body:
{
  "items": [
    { "productId": "prod_123", "quantity": 2 }
  ],
  "shippingAddressId": "addr_123",
  "billingAddressId": "addr_123",
  "couponCode": "SAVE10" // optional
}

Response:
{
  "orderId": "order_abc",
  "orderNumber": "ORD-ABC123",
  "razorpayOrderId": "order_xyz",
  "razorpayKeyId": "rzp_test_RbJ7cXBSE9NhfY",
  "amount": 50000 // in paisa
}
```

### 2. Payment Webhook
```
POST https://api-azi6a7lafq-el.a.run.app/api/payment-webhook
Content-Type: application/json
X-Razorpay-Signature: <signature> // optional in test mode

Body: Razorpay webhook payload
```

### 3. Submit Review
```
POST https://api-azi6a7lafq-el.a.run.app/api/submit-review
Authorization: Bearer <firebase-id-token>

Body:
{
  "productId": "prod_123",
  "rating": 5,
  "comment": "Great product!"
}
```

### 4. Moderate Review (Admin)
```
POST https://api-azi6a7lafq-el.a.run.app/api/moderate-review
Authorization: Bearer <firebase-id-token> // must have admin role

Body:
{
  "reviewId": "rev_abc",
  "action": "approve" // or "reject"
}
```

### 5. Ensure Handle
```
POST https://api-azi6a7lafq-el.a.run.app/api/ensure-handle
Authorization: Bearer <firebase-id-token>

Body:
{
  "handle": "johndoe"
}
```

### 6. Health Check
```
GET https://api-azi6a7lafq-el.a.run.app/health

Response:
{
  "status": "ok",
  "timestamp": "2025-11-06T..."
}
```

## Frontend Flow

### Checkout Process:
1. User selects saved address → `shippingAddressId`
2. Frontend calls `/api/payment/create-order` (Next.js route)
3. Next.js route calls Firebase Function with Firebase ID token
4. Firebase Function:
   - Validates inventory
   - Creates order in Firestore
   - Creates Razorpay order
   - Returns Razorpay order ID and key
5. Frontend opens Razorpay checkout
6. User completes payment
7. Frontend calls `/api/payment/verify` (Next.js route)
8. Next.js route verifies signature and calls Firebase webhook
9. Firebase Function:
   - Finalizes order
   - Decrements inventory
   - Sends receipt email (if configured)
   - Mirrors order to user collection

## Testing

### Test Order Creation:
1. Go to `/checkout`
2. Ensure you have saved addresses in `/profile?tab=addresses`
3. Select address and proceed
4. Complete Razorpay test payment

### Test Health Endpoint:
```bash
curl https://api-azi6a7lafq-el.a.run.app/health
```

## Next Steps

1. ✅ **Deployment**: Complete
2. ✅ **Configuration**: Complete
3. ✅ **Frontend Integration**: Complete
4. ⏳ **Testing**: Ready for user testing
5. ⏳ **Production**: Switch to production Razorpay keys when ready

## Notes

- **Test Mode**: Webhook signature verification is skipped (test mode)
- **Environment**: All functions deployed to `asia-south1` for low latency in India
- **Scheduled Function**: Metrics rebuild runs hourly automatically
- **Error Handling**: All endpoints have proper error handling and user-friendly messages

## Status: ✅ **FULLY DEPLOYED AND INTEGRATED**

