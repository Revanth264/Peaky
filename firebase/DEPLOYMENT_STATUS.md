# Deployment Status ✅

## Successfully Deployed

### Functions Deployed:
1. **api** (HTTP Function)
   - URL: `https://api-azi6a7lafq-el.a.run.app`
   - Region: `asia-south1`
   - Endpoints:
     - `POST /api/create-payment-order`
     - `POST /api/payment-webhook`
     - `POST /api/submit-review`
     - `POST /api/moderate-review`
     - `POST /api/ensure-handle`
     - `GET /health`

2. **rebuildMetricsCron** (Scheduled Function)
   - Schedule: Every 1 hour
   - Timezone: Asia/Kolkata
   - Region: `asia-south1`
   - Status: ✅ Deployed

### Configuration:
- ✅ Razorpay Key ID: `rzp_test_RbJ7cXBSE9NhfY`
- ✅ Razorpay Key Secret: Configured
- ✅ Webhook Secret: Optional (test mode)

### Frontend Integration:
- ✅ Next.js API routes proxy to Firebase Functions
- ✅ Checkout page uses saved addresses
- ✅ Payment verification wired
- ✅ Environment variable set: `NEXT_PUBLIC_FIREBASE_FUNCTIONS_URL`

## Next Steps:

1. **Test Order Creation:**
   - Go to `/checkout`
   - Select address
   - Create order
   - Complete Razorpay payment

2. **Verify Functions:**
   - Check Firebase Console → Functions
   - View logs for any errors
   - Test health endpoint: `https://api-azi6a7lafq-el.a.run.app/health`

3. **Monitor Scheduled Function:**
   - Check Cloud Scheduler in GCP Console
   - Verify metrics rebuild runs hourly

## API Endpoints:

### Create Payment Order
```
POST https://api-azi6a7lafq-el.a.run.app/api/create-payment-order
Authorization: Bearer <firebase-id-token>
Body: {
  items: [{ productId: string, quantity: number }],
  shippingAddressId: string,
  billingAddressId?: string,
  couponCode?: string
}
```

### Payment Webhook
```
POST https://api-azi6a7lafq-el.a.run.app/api/payment-webhook
Body: Razorpay webhook payload
```

### Submit Review
```
POST https://api-azi6a7lafq-el.a.run.app/api/submit-review
Authorization: Bearer <firebase-id-token>
Body: {
  productId: string,
  rating: number,
  comment: string
}
```

### Ensure Handle
```
POST https://api-azi6a7lafq-el.a.run.app/api/ensure-handle
Authorization: Bearer <firebase-id-token>
Body: {
  handle: string
}
```

## Status: ✅ READY FOR TESTING

