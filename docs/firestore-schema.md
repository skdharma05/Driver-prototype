# Firestore Schema — KKP Logistics Driver App

Database: **`kkp-logistic`** (named, region `asia-south1`), project `project-2cd679d7-f0e2-4deb-9df`.

Derived from the data the app actually uses. Timestamps should be Firestore
`Timestamp` (server time), not ISO strings, for sortable queries — the current
code uses ISO strings, which works but doesn't sort/range-query as cleanly.

Collections:
1. `drivers/{uid}` — driver profile (+ `documents` subcollection)
2. `loads/{loadId}` — postable shipments drivers bid on
3. `bids/{bidId}` — a driver's bid on a load
4. `assignments/{assignmentId}` — an accepted load → the trip lifecycle (+ POD)
5. `payments/{paymentId}` — advance/balance per assignment
6. `drivers/{uid}/notifications/{notifId}` — per-driver notifications

Relationships:
```
drivers ──< bids >── loads
   │                   │
   └──< assignments >──┘──< payments
```

---

## 1. `drivers/{uid}`
Doc ID = Firebase Auth UID. Written by [AuthContext.js](../src/context/AuthContext.js#L126) via `setDoc(..., {merge:true})`.

| Field | Type | Example | Notes |
|---|---|---|---|
| `fullName` | string | `"Raj Kumar"` | as per Aadhaar |
| `phone` | string | `"+919000000001"` | from auth phoneNumber |
| `userType` | enum | `"SOLO_DRIVER"` | `SOLO_DRIVER` \| `TRANSPORTER` |
| `homeCity` | string | `"Chennai"` | |
| `homeState` | string | `"TN"` | |
| `upiId` | string | `"rajkumar@ybl"` | for payouts |
| `vehicles` | array<Vehicle> | see below | min 1 |
| `isProfileComplete` | boolean | `true` | |
| `status` | enum | `"VERIFIED"` | `PENDING_VERIFICATION` \| `UNDER_REVIEW` \| `VERIFIED` \| `REJECTED` |
| `createdAt` | timestamp | | server time |
| `updatedAt` | timestamp | | server time |

**Vehicle** (item in `vehicles[]`):
| Field | Type | Example | Notes |
|---|---|---|---|
| `vehicleType` | string | `"16ft_open"` | key from vehicleFleet |
| `vehicleRegNo` | string | `"TN38CD5678"` | uppercase |
| `driverName` | string | `"Suresh"` | required only for TRANSPORTER |
| `driverPhone` | string | `"9000000003"` | required only for TRANSPORTER |

### 1a. `drivers/{uid}/documents/{docType}` (subcollection)
KYC docs. `docType` = `drivingLicense` \| `vehicleRC` \| `insurance` \| `aadhaar` \| `permit` \| `fitnessCertificate`.

| Field | Type | Example | Notes |
|---|---|---|---|
| `storagePath` | string | `"drivers/{uid}/docs/drivingLicense.pdf"` | Firebase Storage path (NOT the local `file://` uri) |
| `fileName` | string | `"dl.pdf"` | |
| `status` | enum | `"UPLOADED"` | `UPLOADED` \| `VERIFIED` \| `REJECTED` |
| `expiryDate` | timestamp? | | for DL, insurance, permit, fitness |
| `uploadedAt` | timestamp | | |

> ⚠️ The app currently keeps document `uri` in local state only ([document-upload.js](../app/(auth)/document-upload.js)). To persist, upload the file to Storage and save the `storagePath` here.

---

## 2. `loads/{loadId}`  ← CANONICAL (reconciles the two shapes)
Doc ID = `loadId` (e.g. `CL001`). Read by [src/services/loads.js](../src/services/loads.js). Seeded by [scripts/seedLoads.mjs](../scripts/seedLoads.mjs).

| Field | Type | Example | Notes |
|---|---|---|---|
| `loadId` | string | `"CL001"` | = doc id |
| `status` | enum | `"OPEN"` | `OPEN` \| `BIDDING_CLOSED` \| `ASSIGNED` \| `CANCELLED` |
| `pickupCity` | string | `"Chennai, TN"` | display |
| `pickupCityName` | string | `"Chennai"` | normalized, for `where()` queries (added by seed) |
| `dropCity` | string | `"Bengaluru, KA"` | |
| `pickupFullAddress` | string | `"Plot 45, SIPCOT..."` | |
| `dropFullAddress` | string | `"Warehouse 12, Bommasandra..."` | |
| `pickupLat` / `pickupLng` | number | `13.0827` / `80.2707` | for map (used by trip screen) |
| `dropLat` / `dropLng` | number | `12.9716` / `77.5946` | |
| `pickupContactName` / `pickupContactPhone` | string | | needed by active trip |
| `dropContactName` / `dropContactPhone` | string | | |
| `pickupDate` | string/timestamp | `"28 Apr, 10:00 AM"` | |
| `expectedDelivery` | string/timestamp | `"16 Oct, 08:00 PM"` | |
| `vehicleCategory` | enum | `"open"` | open\|container\|lcv\|mini\|trailer\|industrial |
| `vehicleType` | string | `"Open Body"` | |
| `vehicleSize` | string | `"22ft"` | |
| `axle` | string | `"6 Wheeler"` | |
| `weight` | number | `13` | tons |
| `distance` | number | `346` | km |
| `goodsType` | string | `"Industrial Parts"` | |
| `instructions` | string | `"Requires secure covering."` | |
| `paymentTerms` | string | `"80% Advance"` | |
| `paymentGuaranteed` | boolean | `true` | |
| `budgetMin` / `budgetMax` | number | `20000` / `24000` | |
| `bidsCount` | number | `12` | denormalized counter |
| `bidCloseAt` | timestamp | | replaces `timeRemaining` (compute client-side) |
| `postedBy` | string | shipper/admin id | who created the load |
| `createdAt` | timestamp | | |

> ⚠️ **Action needed:** [loads/[id].js](../app/(tabs)/loads/[id].js) reads the OLD shape (`id`, `pickup`, `drop`, `vehicle`, `goods`, `distanceText`). Update it to fetch `doc(db,'loads',loadId)` and use these field names, or it won't display real loads.

---

## 3. `bids/{bidId}`
Doc ID = auto or `bid_{timestamp}`. Created in [loads/[id].js](../app/(tabs)/loads/[id].js#L58).

| Field | Type | Example | Notes |
|---|---|---|---|
| `bidId` | string | `"bid_1697200000000"` | = doc id |
| `loadId` | string | `"CL001"` | ref → loads |
| `driverId` | string | `"<uid>"` | ref → drivers |
| `amount` | number | `22000` | ₹ |
| `status` | enum | `"PENDING"` | `PENDING` \| `ACCEPTED` \| `REJECTED` \| `WITHDRAWN` |
| `submittedAt` | timestamp | | |
| `load` | map | `{pickupCity, dropCity, pickupDate, vehicleType, distanceText}` | denormalized snapshot for the driver's "My Bids" list (avoids a join) |

Suggested composite index: `driverId == ? ORDER BY submittedAt DESC`.

---

## 4. `assignments/{assignmentId}`  (the "trip")
Created when a bid is accepted. Drives [active.js](../app/(trip)/active.js). Cached locally as `activeTrip`.

| Field | Type | Example | Notes |
|---|---|---|---|
| `assignmentId` | string | `"T001"` | = doc id |
| `loadId` | string | `"CL001"` | ref |
| `driverId` | string | `"<uid>"` | ref |
| `bidId` | string | `"bid_..."` | ref |
| `agreedAmount` | number | `22000` | from accepted bid |
| `status` | enum | `"IN_TRANSIT"` | see flow below |
| `acceptedAt` | timestamp | | |
| `pickup` / `drop` | map | city, fullAddress, lat, lng, contactName, contactPhone, date | denormalized from load |
| `vehicleType` / `weight` / `goodsType` / `distance` | — | | denormalized from load |
| `specialInstructions` | string | | |
| `routeCoordinates` | array<{lat,lng}> | | polyline (from ORS API / cached) |
| `pickupEPOD` | map \| null | see POD below | |
| `dropEPOD` | map \| null | see POD below | |

**Status flow** (from `src/utils/constants.js`):
`DRIVER_ACCEPTED → HEADING_TO_PICKUP → PICKUP_POD_SUBMITTED → ADVANCE_PAID → IN_TRANSIT → DELIVERY_POD_SUBMITTED → BALANCE_PAID → COMPLETED`

**EPOD map** (`pickupEPOD` / `dropEPOD`) — captured in [pod-capture.js](../app/(trip)/pod-capture.js) + [signature.js](../app/(trip)/signature.js):
| Field | Type | Notes |
|---|---|---|
| `type` | `"pickup"` \| `"delivery"` | |
| `photoPaths` | array<string> | Storage paths (upload the camera `uri`s, store paths) |
| `otp` | string | 4-digit confirmation |
| `lat` / `lng` | number | GPS at capture |
| `signaturePath` | string | Storage path of base64 signature PNG (delivery only) |
| `receiverName` | string | |
| `submittedAt` | timestamp | |

---

## 5. `payments/{paymentId}`
One per assignment (80/20 split). Shown in [payments.js](../app/(tabs)/payments.js).

| Field | Type | Example | Notes |
|---|---|---|---|
| `paymentId` | string | `"p1"` | = doc id |
| `assignmentId` | string | `"T001"` | ref |
| `driverId` | string | `"<uid>"` | ref |
| `route` | string | `"Chennai → Bengaluru"` | display |
| `total` | number | `23500` | |
| `advance` | map | `{amount, paidAt, method, status}` | 80%; method `UPI`\|`BANK`\|`CASH`; status `PENDING`\|`PAID` |
| `balance` | map | `{amount, paidAt, method, status}` | 20% |
| `paymentStatus` | enum | `"Balance Pending"` | `Advance Pending`\|`Balance Pending`\|`Fully Paid` |
| `createdAt` | timestamp | | |

---

## 6. `drivers/{uid}/notifications/{notifId}`
Per-driver subcollection. Shown in [notifications.js](../app/notifications.js).

| Field | Type | Example | Notes |
|---|---|---|---|
| `title` | string | `"Bid Accepted"` | |
| `message` | string | `"Your bid of ₹22,500 was accepted for CL003."` | |
| `type` | enum | `"BID_ACCEPTED"` | see `NOTIFICATION_TYPES` in constants |
| `unread` | boolean | `true` | |
| `loadId` / `bidId` / `assignmentId` | string? | | optional deep-link refs |
| `createdAt` | timestamp | | order by this |

---

## Firebase Storage layout (for images/PDFs)
```
drivers/{uid}/docs/{docType}.pdf          ← KYC documents
assignments/{assignmentId}/pickup/{n}.jpg ← pickup POD photos
assignments/{assignmentId}/delivery/{n}.jpg
assignments/{assignmentId}/signature.png  ← receiver signature
```
Firestore stores the **path**; get a download URL at read time (or make rules allow authed reads).

---

## Security rules (production sketch — replace the open test rules)
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function signedIn() { return request.auth != null; }
    function isOwner(uid) { return signedIn() && request.auth.uid == uid; }

    match /drivers/{uid} {
      allow read, write: if isOwner(uid);
      match /documents/{doc}     { allow read, write: if isOwner(uid); }
      match /notifications/{n}   { allow read, write: if isOwner(uid); }
    }
    match /loads/{loadId} {
      allow read: if signedIn();           // drivers browse loads
      allow write: if false;               // only backend/admin posts loads
    }
    match /bids/{bidId} {
      allow read:  if signedIn() && resource.data.driverId == request.auth.uid;
      allow create: if signedIn() && request.resource.data.driverId == request.auth.uid;
      allow update, delete: if false;      // status changes server-side
    }
    match /assignments/{id} {
      allow read:  if signedIn() && resource.data.driverId == request.auth.uid;
      allow update: if signedIn() && resource.data.driverId == request.auth.uid;  // POD submit
    }
    match /payments/{id} {
      allow read: if signedIn() && resource.data.driverId == request.auth.uid;
      allow write: if false;               // backend-managed
    }
  }
}
```
> These require a **real Firebase Auth user**. The app currently runs as a non-Firebase dummy user, so wire up real Auth before switching off the open test rules.
