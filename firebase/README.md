# Peakime E-commerce Store - Firebase Backend

Apple-grade Firebase backend for Peakime E-commerce Store with full payment processing, inventory management, and analytics.

## 🏗️ Architecture

- **Firebase Auth**: Google, Email/Password, Phone OTP
- **Cloud Firestore**: Product catalog, orders, user profiles, reviews
- **Cloud Functions v2**: TypeScript, region: `asia-south1`
- **Firebase Storage**: User uploads, product assets
- **Cloud Scheduler**: Hourly metrics rebuild
- **Razorpay**: INR payments (UPI/cards)

## 📁 Project Structure

```
firebase/
├── firebase.json          # Firebase project config
├── .firebaserc            # Project ID
├── firestore.rules        # Security rules
├── firestore.indexes.json # Composite indexes
├── storage.rules          # Storage security rules
└── functions/
    ├── package.json
    ├── tsconfig.json
    └── src/
        ├── index.ts       # Main entry point
        ├── config.ts      # Config management
        ├── auth.ts        # Custom claims
        ├── types.ts       # TypeScript types
        ├── validators.ts  # Zod validators
        ├── payments/      # Razorpay integration
        ├── orders/        # Order management
        ├── inventory/     # Stock management
        ├── reviews/       # Review system
        ├── metrics/       # Analytics & materialized lists
        ├── email/         # Receipt emails
        ├── search/        # Typesense hook (stub)
        ├── profile/       # User profiles
        └── utils/         # Shared utilities
```

## 🔐 Security Rules

### Firestore
- **Public read**: `/products/**`, `/materialized/**`
- **Owner only**: `/users/{uid}/**` (profile, addresses, cart, wishlist, orders)
- **Functions write only**: `/orders/**`, `/inventory/**`
- **Admin only**: `/inventory/**` read, `/coupons/**` write

### Storage
- **User uploads**: `/users/{uid}/**` (owner read/write, 10MB limit)
- **Public assets**: `/public/products/**` (public read, admin write, 20MB limit)

## 📡 API Endpoints

All endpoints are under `/api/` and require authentication unless specified.

### `POST /api/create-payment-order`
Create order and Razorpay payment order.

**Auth**: Required  
**Request**:
```json
{
  "items": [
    { "productId": "prod_123", "quantity": 2 }
  ],
  "couponCode": "SAVE10",
  "shippingAddressId": "addr_123",
  "billingAddressId": "addr_123"
}
```

**Response**:
```json
{
  "orderId": "order_abc",
  "orderNumber": "ORD-ABC123",
  "razorpayOrderId": "order_xyz",
  "razorpayKeyId": "rzp_test_...",
  "amount": 50000
}
```

### `POST /api/payment-webhook`
Razorpay webhook handler (public, signature verified).

**Auth**: Not required (signature verified)  
**Headers**: `X-Razorpay-Signature: <signature>`

### `POST /api/submit-review`
Submit product review (verified purchase only).

**Auth**: Required  
**Request**:
```json
{
  "productId": "prod_123",
  "rating": 5,
  "comment": "Great product!"
}
```

**Response**:
```json
{
  "reviewId": "rev_abc"
}
```

### `POST /api/moderate-review`
Approve/reject review (admin only).

**Auth**: Required (admin)  
**Request**:
```json
{
  "reviewId": "rev_abc",
  "action": "approve"
}
```

### `POST /api/ensure-handle`
Set unique @handle for user profile.

**Auth**: Required  
**Request**:
```json
{
  "handle": "johndoe"
}
```

**Response**:
```json
{
  "handle": "johndoe",
  "handleLower": "johndoe"
}
```

## 🗄️ Firestore Schema

### `/users/{uid}/profile`
```typescript
{
  uid: string;
  email: string;
  handle?: string;
  handleLower?: string;
  fullName?: string;
  avatarUrl?: string;
  createdAt: Timestamp;
}
```

### `/users/{uid}/addresses/{addrId}`
```typescript
{
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
  type?: 'home' | 'work' | 'other';
}
```

### `/orders/{orderId}`
```typescript
{
  orderId: string;
  uid: string;
  orderNumber: string;
  items: OrderItem[];
  shippingAddress: Address;
  billingAddress: Address;
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  couponCode?: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  orderStatus: 'created' | 'paid' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  createdAt: Timestamp;
}
```

### `/products/{productId}`
```typescript
{
  productId: string;
  name: string;
  description?: string;
  price: number;
  discountPrice?: number;
  category?: string;
  tags?: string[];
  images?: string[];
  ratingAvg?: number;
  ratingCount?: number;
  salesLast7?: number;
  salesLast30?: number;
  likes?: number;
  isLimited?: boolean;
  createdAt: Timestamp;
}
```

### `/materialized/home/{listName}/current`
```typescript
{
  ids: string[]; // Product IDs
  updatedAt: Timestamp;
}
```

Lists: `bestSellers`, `newArrivals`, `saleOffers`, `limitedEdition`

## 🔧 Configuration

### Required Secrets

Set these before deployment:

```bash
firebase functions:config:set \
  razorpay.key_id="YOUR_RAZORPAY_KEY_ID" \
  razorpay.key_secret="YOUR_RAZORPAY_KEY_SECRET" \
  razorpay.webhook_secret="YOUR_WEBHOOK_SECRET"
```

### Optional Secrets

```bash
# Email (SendGrid)
firebase functions:config:set email.sendgrid_key="YOUR_SENDGRID_KEY"

# Typesense (optional)
firebase functions:config:set \
  typesense.api_key="YOUR_API_KEY" \
  typesense.host="localhost" \
  typesense.port="8108" \
  typesense.protocol="http"
```

## 🚀 Deployment

### 1. Install Dependencies

```bash
cd firebase/functions
npm install
```

### 2. Build

```bash
npm run build
```

### 3. Deploy

```bash
cd ..
firebase deploy --only functions,firestore,storage,hosting
```

### 4. Set Up Cloud Scheduler

The `rebuildMetricsCron` function is automatically scheduled to run hourly. If you need to create it manually:

```bash
gcloud scheduler jobs create http rebuild-metrics \
  --schedule="0 * * * *" \
  --uri="https://asia-south1-peakime.cloudfunctions.net/rebuildMetricsCron" \
  --http-method=POST \
  --time-zone="Asia/Kolkata"
```

## 🔗 Razorpay Webhook URL

After deployment, configure this URL in Razorpay Dashboard:

```
https://asia-south1-peakime.cloudfunctions.net/api/payment-webhook
```

## ✅ Acceptance Tests

1. **Handle Creation**: Create user → call `/api/ensure-handle` → verify unique handle saved
2. **Order Creation**: Create order with 2 SKUs + coupon → receive Razorpay order ID
3. **Payment Webhook**: Simulate webhook → order becomes paid, inventory decremented
4. **Review Submission**: Submit review for purchased product → status pending
5. **Review Moderation**: Admin approves review → product `ratingAvg` updated
6. **Metrics Cron**: Hourly cron writes 4 materialized docs with product IDs

## 📝 Notes

- All write operations to `/orders`, `/inventory` are Functions-only
- Materialized lists are rebuilt hourly from `/events` collection
- Reviews require verified purchase (paid order containing product)
- Inventory uses transactions for atomic stock operations
- Coupons support percent/flat discounts with usage limits

## 🔒 Admin Access

Set admin role via custom claims:

```typescript
import { setAdminRole } from './functions/src/auth';
await setAdminRole('user_uid', true);
```

Or use Firebase Console → Authentication → User → Custom Claims → Add `role: "admin"`

