# Swapo — Order API Documentation

> **Collection:** Swapo - Server  
> **Base URL:** `{{app}}` *(configured as an environment variable)*  
> **Authentication:** Bearer Token — passed via the `Authorization` header on every request  
> **Content Negotiation:** All requests must include `Accept: application/json`  
> **Method Spoofing:** PATCH operations are submitted as `POST` requests with a `_method=patch` field in the `form-data` body (Laravel-style method spoofing)

---

## Table of Contents

- [Order Statuses](#order-statuses)
- [Buyer Endpoints](#buyer-endpoints)
  - [List Buyer Orders](#1-list-buyer-orders)
  - [Get Buyer Order Details](#2-get-buyer-order-details)
  - [Cancel Buyer Order](#3-cancel-buyer-order)
  - [Pre-Pay Update](#4-pre-pay-update)
  - [Pay for Order](#5-pay-for-order)
- [Seller Endpoints](#seller-endpoints)
  - [List Seller Orders](#1-list-seller-orders)
  - [Get Seller Order Details](#2-get-seller-order-details)
  - [Cancel Seller Order](#3-cancel-seller-order)
  - [Complete Seller Order](#4-complete-seller-order)
  - [Accept Seller Order](#5-accept-seller-order)
  - [Reject Seller Order](#6-reject-seller-order)
  - [Make Shipment](#7-make-shipment)
- [Error Responses](#error-responses)

---

## Order Statuses

| Status | Description |
|---|---|
| `pending_approval` | Order submitted, awaiting seller approval |
| `pending_payment` | Order approved, awaiting buyer payment |
| `pending_shipment` | Payment received, awaiting shipment |
| `shipped` | Order has been shipped |
| `completed` | Order successfully completed |
| `cancelled` | Order was cancelled |
| `rejected` | Order was rejected by the seller |

---

## Buyer Endpoints

Base path: `{{app}}buyer-order`

---

### 1. List Buyer Orders

Retrieve a paginated list of all orders placed by the authenticated buyer. Supports optional filtering by status and date range.

| Property | Value |
|---|---|
| **Method** | `GET` |
| **URL** | `{{app}}buyer-order` |

#### Headers

| Key | Value | Required |
|---|---|---|
| `Accept` | `application/json` | ✅ Yes |
| `Authorization` | `Bearer {token}` | ✅ Yes |

#### Query Parameters

| Parameter | Type | Required | Description | Example |
|---|---|---|---|---|
| `status` | `string` | ❌ No | Filter orders by status | `cancelled` |
| `start_date` | `date` | ❌ No | Start of date range filter (`YYYY-MM-DD`) | `2026-01-24` |
| `end_date` | `date` | ❌ No | End of date range filter (`YYYY-MM-DD`) | `2026-01-25` |

**Allowed `status` values:** `pending_approval` · `pending_payment` · `pending_shipment` · `shipped` · `completed` · `cancelled` · `rejected`

#### Sample Request

```
GET {{app}}buyer-order?status=cancelled&start_date=2026-01-24&end_date=2026-01-25
Authorization: Bearer {token}
Accept: application/json
```

#### Sample Response `200 OK`

```json
{
    "data": [
        {
            "id": 212,
            "code": "ORD-212-1747",
            "created_at": 1779094925,
            "total_price": 50.5,
            "total_quantity": 1,
            "status": "cancelled",
            "status_trans": "ملغي",
            "products_data": [
                {
                    "cover": "https://swapo.hajar.aait-d.com/storage/images/products/44dg0zbMNqAHWDoWLtakYSKiSiLj0ctc5RXrl6NK.webp",
                    "product_name": "سرير طابقين موردن للاطفال"
                }
            ]
        }
    ],
    "links": {
        "first": "https://swapo.hajar.aait-d.com/api/client/seller-order?page=1",
        "last": "https://swapo.hajar.aait-d.com/api/client/seller-order?page=1",
        "prev": null,
        "next": null
    },
    "meta": {
        "current_page": 1,
        "from": 1,
        "last_page": 1,
        "links": [
            {
                "url": null,
                "label": "&laquo; السابق",
                "active": false
            },
            {
                "url": "https://swapo.hajar.aait-d.com/api/client/seller-order?page=1",
                "label": "1",
                "active": true
            },
            {
                "url": null,
                "label": "التالي &raquo;",
                "active": false
            }
        ],
        "path": "https://swapo.hajar.aait-d.com/api/client/seller-order",
        "per_page": 15,
        "to": 1,
        "total": 1
    },
    "status": "success",
    "message": ""
}
```

---

### 2. Get Buyer Order Details

Retrieve full details of a single buyer order by its ID.

| Property | Value |
|---|---|
| **Method** | `GET` |
| **URL** | `{{app}}buyer-order/{id}` |

#### Headers

| Key | Value | Required |
|---|---|---|
| `Accept` | `application/json` | ✅ Yes |
| `Authorization` | `Bearer {token}` | ✅ Yes |

#### URL Parameters

| Parameter | Type | Required | Description | Example |
|---|---|---|---|---|
| `id` | `integer` | ✅ Yes | The unique ID of the order | `2` |

#### Sample Request

```
GET {{app}}buyer-order/2
Authorization: Bearer {token}
Accept: application/json
```

#### Sample Response `200 OK`

```json
{
    "data": {
        "id": 212,
        "code": "ORD-212-1747",
        "status": "cancelled",
        "status_trans": "ملغي",
        "notes": null,
        "created_at": 1779094925,
        "shipping_label_url": null,
        "address_data": null,
        "buyer_data": {
            "id": 155,
            "full_name": "first name updated second name",
            "phone": "966555444888"
        },
        "items_data": [
            {
                "id": 241,
                "quantity": 1,
                "price": 50.5,
                "product_name": "سرير طابقين موردن للاطفال",
                "cover": "https://swapo.hajar.aait-d.com/storage/images/products/44dg0zbMNqAHWDoWLtakYSKiSiLj0ctc5RXrl6NK.webp",
                "weight": 35,
                "weight_type": "kg",
                "weight_type_trans": "كيلوجرام",
                "status": "used",
                "status_trans": "مستعمل",
                "item_status": "accepted",
                "item_status_trans": "مقبول"
            }
        ],
        "brief_data": {
            "total_product_count": 1,
            "shipping_price": 0,
            "seller_shipping_price": 0,
            "commission": 3.54000000000000003552713678800500929355621337890625,
            "net_price": 46.96000000000000085265128291212022304534912109375
        }
    },
    "status": "success",
    "message": ""
}
```

---

### 3. Cancel Buyer Order

Cancel an existing buyer order. Uses `POST` with `_method=patch` for method spoofing.

| Property | Value |
|---|---|
| **Method** | `POST` *(PATCH via method spoofing)* |
| **URL** | `{{app}}buyer-order/cancel/{id}` |

#### Headers

| Key | Value | Required |
|---|---|---|
| `Accept` | `application/json` | ✅ Yes |
| `Authorization` | `Bearer {token}` | ✅ Yes |

#### URL Parameters

| Parameter | Type | Required | Description | Example |
|---|---|---|---|---|
| `id` | `integer` | ✅ Yes | The unique ID of the order to cancel | `1` |

#### Request Body (`form-data`)

| Field | Type | Required | Description | Value |
|---|---|---|---|---|
| `_method` | `string` | ✅ Yes | Method spoofing for PATCH | `patch` |

#### Sample Request

```
POST {{app}}buyer-order/cancel/1
Authorization: Bearer {token}
Accept: application/json
Content-Type: multipart/form-data

_method=patch
```

#### Sample Response `200 OK`

```json
{
  "success": true,
  "message": "Order cancelled successfully."
}
```

---

### 4. Pre-Pay Update

Update pre-payment details for a buyer order before proceeding to payment. Allows setting the delivery option, delivery address, and optional notes.

| Property | Value |
|---|---|
| **Method** | `POST` *(PATCH via method spoofing)* |
| **URL** | `{{app}}buyer-order/{id}/pre-pay` |

#### Headers

| Key | Value | Required |
|---|---|---|
| `Accept` | `application/json` | ✅ Yes |
| `Authorization` | `Bearer {token}` | ✅ Yes |

#### URL Parameters

| Parameter | Type | Required | Description | Example |
|---|---|---|---|---|
| `id` | `integer` | ✅ Yes | The unique ID of the order | `199` |

#### Request Body (`form-data`)

| Field | Type | Required | Description | Example |
|---|---|---|---|---|
| `_method` | `string` | ✅ Yes | Method spoofing for PATCH | `patch` |
| `delivery_option_id` | `integer` | ✅ Yes | ID of the selected delivery option | `2266` |
| `address_id` | `integer` | ❌ No | ID of the delivery address | `88` |
| `notes` | `string` | ❌ No | Optional notes for the order | `test note` |

#### Sample Request

```
POST {{app}}buyer-order/199/pre-pay
Authorization: Bearer {token}
Accept: application/json
Content-Type: multipart/form-data

_method=patch
delivery_option_id=2266
address_id=88
notes=test note
```

#### Sample Response `200 OK`

```json
{
  "success": true,
  "message": "Pre-payment details updated successfully.",
  "data": {
    "id": 199,
    "status": "pending_payment",
    "delivery_option_id": 2266,
    "address_id": 88,
    "notes": "test note"
  }
}
```

---

### 5. Pay for Order

Process payment for a buyer order. Supports both online and cash payment methods.

| Property | Value |
|---|---|
| **Method** | `POST` *(PATCH via method spoofing)* |
| **URL** | `{{app}}buyer-order/{id}/pay` |

#### Headers

| Key | Value | Required |
|---|---|---|
| `Accept` | `application/json` | ✅ Yes |
| `Authorization` | `Bearer {token}` | ✅ Yes |

#### URL Parameters

| Parameter | Type | Required | Description | Example |
|---|---|---|---|---|
| `id` | `integer` | ✅ Yes | The unique ID of the order | `199` |

#### Request Body (`form-data`)

| Field | Type | Required | Description | Example |
|---|---|---|---|---|
| `_method` | `string` | ✅ Yes | Method spoofing for PATCH | `patch` |
| `payment_method` | `string` | ✅ Yes | Payment method: `online` or `cash` | `online` |
| `transaction_id` | `string` | ✅ Yes | Transaction ID returned by the payment gateway | `1326590666` |

#### Sample Request

```
POST {{app}}buyer-order/199/pay
Authorization: Bearer {token}
Accept: application/json
Content-Type: multipart/form-data

_method=patch
payment_method=online
transaction_id=1326590666
```

#### Sample Response `200 OK`

```json
{
  "success": true,
  "message": "Payment processed successfully.",
  "data": {
    "id": 199,
    "status": "pending_shipment",
    "payment_method": "online",
    "transaction_id": "1326590666",
    "paid_at": "2026-01-25T14:30:00.000000Z"
  }
}
```

---

## Seller Endpoints

Base path: `{{app}}seller-order`

---

### 1. List Seller Orders

Retrieve a paginated list of all orders received by the authenticated seller. Supports optional filtering by status and date range.

| Property | Value |
|---|---|
| **Method** | `GET` |
| **URL** | `{{app}}seller-order` |

#### Headers

| Key | Value | Required |
|---|---|---|
| `Accept` | `application/json` | ✅ Yes |
| `Authorization` | `Bearer {token}` | ✅ Yes |

#### Query Parameters

| Parameter | Type | Required | Description | Example |
|---|---|---|---|---|
| `status` | `string` | ❌ No | Filter orders by status | `pending_approval` |
| `start_date` | `date` | ❌ No | Start of date range filter (`YYYY-MM-DD`) | `2026-12-28` |
| `end_date` | `date` | ❌ No | End of date range filter (`YYYY-MM-DD`) | `2026-12-28` |

**Allowed `status` values:** `pending_approval` · `pending_payment` · `pending_shipment` · `shipped` · `completed` · `cancelled` · `rejected`

#### Sample Request

```
GET {{app}}seller-order?status=pending_approval&start_date=2026-12-28&end_date=2026-12-28
Authorization: Bearer {token}
Accept: application/json
```

#### Sample Response `200 OK`

```json
{
    "data": [
        {
            "id": 212,
            "code": "ORD-212-1747",
            "created_at": 1779094925,
            "total_price": 50.5,
            "total_quantity": 1,
            "status": "cancelled",
            "status_trans": "ملغي",
            "products_data": [
                {
                    "cover": "https://swapo.hajar.aait-d.com/storage/images/products/44dg0zbMNqAHWDoWLtakYSKiSiLj0ctc5RXrl6NK.webp",
                    "product_name": "سرير طابقين موردن للاطفال"
                }
            ]
        }
    ],
    "links": {
        "first": "https://swapo.hajar.aait-d.com/api/client/seller-order?page=1",
        "last": "https://swapo.hajar.aait-d.com/api/client/seller-order?page=1",
        "prev": null,
        "next": null
    },
    "meta": {
        "current_page": 1,
        "from": 1,
        "last_page": 1,
        "links": [
            {
                "url": null,
                "label": "&laquo; السابق",
                "active": false
            },
            {
                "url": "https://swapo.hajar.aait-d.com/api/client/seller-order?page=1",
                "label": "1",
                "active": true
            },
            {
                "url": null,
                "label": "التالي &raquo;",
                "active": false
            }
        ],
        "path": "https://swapo.hajar.aait-d.com/api/client/seller-order",
        "per_page": 15,
        "to": 1,
        "total": 1
    },
    "status": "success",
    "message": ""
}
```

---

### 2. Get Seller Order Details

Retrieve full details of a single seller order by its ID.

| Property | Value |
|---|---|
| **Method** | `GET` |
| **URL** | `{{app}}seller-order/{id}` |

#### Headers

| Key | Value | Required |
|---|---|---|
| `Accept` | `application/json` | ✅ Yes |
| `Authorization` | `Bearer {token}` | ✅ Yes |

#### URL Parameters

| Parameter | Type | Required | Description | Example |
|---|---|---|---|---|
| `id` | `integer` | ✅ Yes | The unique ID of the order | `122` |

#### Sample Request

```
GET {{app}}seller-order/122
Authorization: Bearer {token}
Accept: application/json
```

#### Sample Response `200 OK`

```json
{
    "data": {
        "id": 212,
        "code": "ORD-212-1747",
        "status": "cancelled",
        "status_trans": "ملغي",
        "notes": null,
        "created_at": 1779094925,
        "shipping_label_url": null,
        "address_data": null,
        "buyer_data": {
            "id": 155,
            "full_name": "first name updated second name",
            "phone": "966555444888"
        },
        "items_data": [
            {
                "id": 241,
                "quantity": 1,
                "price": 50.5,
                "product_name": "سرير طابقين موردن للاطفال",
                "cover": "https://swapo.hajar.aait-d.com/storage/images/products/44dg0zbMNqAHWDoWLtakYSKiSiLj0ctc5RXrl6NK.webp",
                "weight": 35,
                "weight_type": "kg",
                "weight_type_trans": "كيلوجرام",
                "status": "used",
                "status_trans": "مستعمل",
                "item_status": "accepted",
                "item_status_trans": "مقبول"
            }
        ],
        "brief_data": {
            "total_product_count": 1,
            "shipping_price": 0,
            "seller_shipping_price": 0,
            "commission": 3.54000000000000003552713678800500929355621337890625,
            "net_price": 46.96000000000000085265128291212022304534912109375
        }
    },
    "status": "success",
    "message": ""
}
```

---

### 3. Cancel Seller Order

Cancel an existing seller order. Uses `POST` with `_method=patch` for method spoofing.

| Property | Value |
|---|---|
| **Method** | `POST` *(PATCH via method spoofing)* |
| **URL** | `{{app}}seller-order/cancel/{id}` |

#### Headers

| Key | Value | Required |
|---|---|---|
| `Accept` | `application/json` | ✅ Yes |
| `Authorization` | `Bearer {token}` | ✅ Yes |

#### URL Parameters

| Parameter | Type | Required | Description | Example |
|---|---|---|---|---|
| `id` | `integer` | ✅ Yes | The unique ID of the order to cancel | `123` |

#### Request Body (`form-data`)

| Field | Type | Required | Description | Value |
|---|---|---|---|---|
| `_method` | `string` | ✅ Yes | Method spoofing for PATCH | `patch` |

#### Sample Request

```
POST {{app}}seller-order/cancel/123
Authorization: Bearer {token}
Accept: application/json
Content-Type: multipart/form-data

_method=patch
```

#### Sample Response `200 OK`

```json
{
  "success": true,
  "message": "Order cancelled successfully."
}
```

---

### 4. Complete Seller Order

Mark a seller order as completed after delivery confirmation.

| Property | Value |
|---|---|
| **Method** | `POST` *(PATCH via method spoofing)* |
| **URL** | `{{app}}seller-order/complete/{id}` |

#### Headers

| Key | Value | Required |
|---|---|---|
| `Accept` | `application/json` | ✅ Yes |
| `Authorization` | `Bearer {token}` | ✅ Yes |

#### URL Parameters

| Parameter | Type | Required | Description | Example |
|---|---|---|---|---|
| `id` | `integer` | ✅ Yes | The unique ID of the order to complete | `8` |

#### Request Body (`form-data`)

| Field | Type | Required | Description | Value |
|---|---|---|---|---|
| `_method` | `string` | ✅ Yes | Method spoofing for PATCH | `patch` |

#### Sample Request

```
POST {{app}}seller-order/complete/8
Authorization: Bearer {token}
Accept: application/json
Content-Type: multipart/form-data

_method=patch
```

#### Sample Response `200 OK`

```json
{
  "success": true,
  "message": "Order marked as completed.",
  "data": {
    "id": 8,
    "status": "completed",
    "completed_at": "2026-01-25T16:00:00.000000Z"
  }
}
```

---

### 5. Accept Seller Order

Accept a seller order — either all items at once or a specific subset of items.

| Property | Value |
|---|---|
| **Method** | `POST` *(PATCH via method spoofing)* |
| **URL** | `{{app}}seller-order/accept/{id}` |

#### Headers

| Key | Value | Required |
|---|---|---|
| `Accept` | `application/json` | ✅ Yes |
| `Authorization` | `Bearer {token}` | ✅ Yes |

#### URL Parameters

| Parameter | Type | Required | Description | Example |
|---|---|---|---|---|
| `id` | `integer` | ✅ Yes | The unique ID of the order to accept | `50` |

#### Request Body (`form-data`)

| Field | Type | Required | Description | Example |
|---|---|---|---|---|
| `_method` | `string` | ✅ Yes | Method spoofing for PATCH | `patch` |
| `type` | `string` | ✅ Yes | Accept type: `accept_all` or `accept_some` | `accept_all` |
| `items_ids[0]` | `integer` | ❌ Conditional | Item ID(s) to accept — **required only when `type` is `accept_some`** | `8` |
| `items_ids[1]` | `integer` | ❌ Conditional | Additional item IDs (array notation) | `9` |

> **Note:** When using `accept_some`, provide item IDs as an array using indexed keys: `items_ids[0]`, `items_ids[1]`, etc.

#### Sample Request — Accept All

```
POST {{app}}seller-order/accept/50
Authorization: Bearer {token}
Accept: application/json
Content-Type: multipart/form-data

_method=patch
type=accept_all
```

#### Sample Request — Accept Some

```
POST {{app}}seller-order/accept/50
Authorization: Bearer {token}
Accept: application/json
Content-Type: multipart/form-data

_method=patch
type=accept_some
items_ids[0]=8
items_ids[1]=9
```

#### Sample Response `200 OK`

```json
{
  "success": true,
  "message": "Order accepted successfully.",
  "data": {
    "id": 50,
    "status": "pending_payment",
    "accepted_items": [8, 9]
  }
}
```

---

### 6. Reject Seller Order

Reject an incoming seller order.

| Property | Value |
|---|---|
| **Method** | `POST` *(PATCH via method spoofing)* |
| **URL** | `{{app}}seller-order/reject/{id}` |

#### Headers

| Key | Value | Required |
|---|---|---|
| `Accept` | `application/json` | ✅ Yes |
| `Authorization` | `Bearer {token}` | ✅ Yes |

#### URL Parameters

| Parameter | Type | Required | Description | Example |
|---|---|---|---|---|
| `id` | `integer` | ✅ Yes | The unique ID of the order to reject | `8` |

#### Request Body (`form-data`)

| Field | Type | Required | Description | Value |
|---|---|---|---|---|
| `_method` | `string` | ✅ Yes | Method spoofing for PATCH | `patch` |

#### Sample Request

```
POST {{app}}seller-order/reject/8
Authorization: Bearer {token}
Accept: application/json
Content-Type: multipart/form-data

_method=patch
```

#### Sample Response `200 OK`

```json
{
  "success": true,
  "message": "Order rejected successfully.",
  "data": {
    "id": 8,
    "status": "rejected"
  }
}
```

---

### 7. Make Shipment

Mark a seller order as shipped after dispatching the items.

| Property | Value |
|---|---|
| **Method** | `POST` *(PATCH via method spoofing)* |
| **URL** | `{{app}}seller-order/make-shipment/{id}` |

#### Headers

| Key | Value | Required |
|---|---|---|
| `Accept` | `application/json` | ✅ Yes |
| `Authorization` | `Bearer {token}` | ✅ Yes |

#### URL Parameters

| Parameter | Type | Required | Description | Example |
|---|---|---|---|---|
| `id` | `integer` | ✅ Yes | The unique ID of the order to ship | `8` |

#### Request Body (`form-data`)

| Field | Type | Required | Description | Value |
|---|---|---|---|---|
| `_method` | `string` | ✅ Yes | Method spoofing for PATCH | `patch` |

#### Sample Request

```
POST {{app}}seller-order/make-shipment/8
Authorization: Bearer {token}
Accept: application/json
Content-Type: multipart/form-data

_method=patch
```

#### Sample Response `200 OK`

```json
{
  "success": true,
  "message": "Order marked as shipped.",
  "data": {
    "id": 8,
    "status": "shipped",
    "shipped_at": "2026-01-25T18:00:00.000000Z"
  }
}
```

---

## Error Responses

All endpoints follow a consistent error response format.

#### `401 Unauthorized` — Missing or invalid token

```json
{
  "message": "Unauthenticated."
}
```

#### `403 Forbidden` — Action not permitted for this user/role

```json
{
  "success": false,
  "message": "You are not authorized to perform this action."
}
```

#### `404 Not Found` — Order does not exist

```json
{
  "success": false,
  "message": "Order not found."
}
```

#### `422 Unprocessable Entity` — Validation error

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "payment_method": [
      "The payment method field is required."
    ]
  }
}
```

#### `500 Internal Server Error`

```json
{
  "success": false,
  "message": "An unexpected error occurred. Please try again later."
}
```

---

## Order Lifecycle

The typical order flow through statuses is illustrated below:

```
[Buyer Places Order]
        │
        ▼
 pending_approval  ──── (Seller rejects) ──▶  rejected
        │
  (Seller accepts)
        │
        ▼
 pending_payment   ──── (Buyer/Seller cancels) ──▶  cancelled
        │
   (Buyer pays)
        │
        ▼
 pending_shipment
        │
  (Seller ships)
        │
        ▼
    shipped
        │
 (Seller completes)
        │
        ▼
   completed
```

---

*Documentation generated for the **Swapo - Server** Postman collection.*
