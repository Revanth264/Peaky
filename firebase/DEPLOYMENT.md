# Deployment Checklist

## ✅ Completed
- [x] Firebase project structure created
- [x] Firestore rules and indexes configured
- [x] Storage rules configured
- [x] Cloud Functions v2 (TypeScript) implemented
- [x] All API endpoints created
- [x] TypeScript compilation successful

## 🔐 Required Secrets (MUST SET BEFORE DEPLOYMENT)

### Razorpay (Required)
```bash
firebase functions:config:set \
  razorpay.key_id="YOUR_RAZORPAY_KEY_ID" \
  razorpay.key_secret="YOUR_RAZORPAY_KEY_SECRET" \
  razorpay.webhook_secret="YOUR_WEBHOOK_SECRET"
```

**Get these from**: Razorpay Dashboard → Settings → API Keys

### Optional Secrets

#### SendGrid (Email Receipts)
```bash
firebase functions:config:set email.sendgrid_key="YOUR_SENDGRID_API_KEY"
```
**Note**: If not set, receipts will be logged to console instead of sent via email.

#### Typesense (Search)
```bash
firebase functions:config:set \
  typesense.api_key="YOUR_API_KEY" \
  typesense.host="localhost" \
  typesense.port="8108" \
  typesense.protocol="http"
```
**Note**: If not set, Typesense indexing will be skipped (no-op).

## 🚀 Deployment Steps

### 1. Set Secrets (REQUIRED)
```bash
cd firebase
firebase functions:config:set \
  razorpay.key_id="YOUR_KEY" \
  razorpay.key_secret="YOUR_SECRET" \
  razorpay.webhook_secret="YOUR_WEBHOOK_SECRET"
```

### 2. Deploy
```bash
firebase deploy --only functions,firestore,storage,hosting
```

### 3. Configure Razorpay Webhook
After deployment, get your webhook URL:
```
https://asia-south1-peakime.cloudfunctions.net/api/payment-webhook
```

Add this URL in Razorpay Dashboard:
- Settings → Webhooks → Add Webhook
- URL: `https://asia-south1-peakime.cloudfunctions.net/api/payment-webhook`
- Events: `payment.captured`, `payment.failed`

### 4. Verify Scheduled Function
The `rebuildMetricsCron` function should be automatically scheduled. Verify in:
- Firebase Console → Functions → Scheduled Functions

## 📋 Post-Deployment Checklist

- [ ] Razorpay webhook URL configured
- [ ] Test order creation
- [ ] Test payment webhook (use Razorpay test mode)
- [ ] Verify metrics cron is running (check logs)
- [ ] Set admin role for test user (if needed)

## 🧪 Testing

### Test Order Creation
```bash
curl -X POST https://asia-south1-peakime.cloudfunctions.net/api/create-payment-order \
  -H "Authorization: Bearer YOUR_ID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{"productId": "prod_123", "quantity": 1}],
    "shippingAddressId": "addr_123"
  }'
```

### Test Handle Creation
```bash
curl -X POST https://asia-south1-peakime.cloudfunctions.net/api/ensure-handle \
  -H "Authorization: Bearer YOUR_ID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"handle": "testuser"}'
```

## ⚠️ Important Notes

1. **Razorpay Keys**: Use test keys for development, production keys for production
2. **Webhook Secret**: Must match the secret configured in Razorpay Dashboard
3. **Region**: Functions are deployed to `asia-south1` (Mumbai) for low latency in India
4. **Admin Access**: Set admin role via custom claims in Firebase Console

## 🆘 Troubleshooting

### Functions not deploying
- Check Firebase CLI is authenticated: `firebase login`
- Check project ID matches: `firebase projects:list`

### Config errors
- Verify config is set: `firebase functions:config:get`
- Re-set if needed: `firebase functions:config:set ...`

### Webhook not working
- Verify signature secret matches Razorpay Dashboard
- Check function logs: `firebase functions:log`

