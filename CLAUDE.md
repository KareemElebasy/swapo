# Swapo — Project Guide for Claude Code

> اقرأ الملف ده كامل قبل ما تكتب أي سطر كود.
> هو المرجع الوحيد للمشروع — مش محتاج تسأل عن أي حاجة فيه.

---

## ما هو Swapo

منصة بيع وشراء (C2C marketplace) للسوق السعودي.
- المستخدم ممكن يكون **buyer** أو **seller** أو الاثنين بنفس الأكونت.
- اللغة الأساسية **عربي** (RTL) مع دعم إنجليزي (LTR).
- Mobile-first web app — الـ design مبني على iPhone frame.

---

## Stack

| | |
|---|---|
| Framework | Nuxt 4 (`^4.4.4`) |
| Vue | Vue 3 SFC + Composition API |
| Language | TypeScript — لا `any`، لا `@ts-ignore` |
| Styling | Tailwind CSS v4 via `@tailwindcss/vite` |
| State | Pinia (`@pinia/nuxt`) |
| i18n | `@nuxtjs/i18n` v10 |
| Images | `@nuxt/image` |
| Font | Cairo (Google Fonts — محملة في `tailwind.css`) |

---

## Project Structure

```
app/
  assets/
    css/tailwind.css          ← الـ CSS الوحيد — لا تعمل ملف تاني
    images/
  components/
    auth/                     ← PhoneInput.vue, OtpInput.vue
    base/                     ← BaseButton, BaseInput, BaseModal... (primitives)
    shared/                   ← AppHeader, ProductCard, StatusBadge...
    buyer/                    ← buyer-only features
    seller/                   ← seller-only features
  composables/
    useApi.ts                 ← HTTP client — لا تعدله
    useAuth.ts                ← auth flow composable
  i18n/locales/
    ar.json                   ← المصدر الوحيد للترجمة العربية
    en.json                   ← المصدر الوحيد للترجمة الإنجليزية
  layouts/
    auth.vue                  ← login/register/verify/complete-data
    default.vue               ← الـ app الرئيسي (header + bottom nav)
    public.vue                ← landing/legal/404
  middleware/
    auth.ts                   ← يتحقق من isAuthenticated
    guest.ts                  ← يمنع الـ logged-in user من صفحات الـ auth
    seller.ts                 ← يتحقق من isSeller
  pages/
    index.vue                 ← home (buyer)
    auth/
      register.vue            ← ✅ done
      verify.vue              ← ✅ done
      complete-data.vue       ← ✅ done
  services/
    auth.service.ts           ← auth API calls
  stores/
    auth.ts                   ← token (cookie) + user
    cart.ts                   ← cart items + count
    notifications.ts          ← unread count
  types/
    api.ts                    ← ApiResponse, PaginatedResponse, ApiError
    auth.ts                   ← RegisterPayload, VerifyPayload...
    cart.ts                   ← CartItem, Cart, CheckoutPayload
    negotiation.ts
    notification.ts
    order.ts
    product.ts                ← Product, Category, ProductFilters...
    user.ts                   ← User, ProfileUpdatePayload
    wallet.ts

i18n/locales/                 ← IGNORE — مش بيستخدمهم الـ i18n module
                                 الصح في app/i18n/locales/
nuxt.config.ts
package.json
```

---

## API — القواعد الأساسية

### Base URLs
```
APP:     https://swapo.hajar.aait-d.com/api/client/
GENERAL: https://swapo.hajar.aait-d.com/api/general/
```

في `runtimeConfig.public` في `nuxt.config.ts`:
- `apiBase`    → APP
- `apiGeneral` → GENERAL

### كيف تعمل API call

```ts
// في service file
import { apiFetch } from '~/composables/useApi'

// GET
const data = await apiFetch<Product>('product/123')

// POST (FormData تلقائياً)
const result = await apiFetch<Order>('cart/checkout', {
  method: 'POST',
  body: { address_id: 5, notes: 'test' },
})

// PUT/PATCH/DELETE — بيتحول لـ POST + _method تلقائياً
await apiFetch('cart/update/19', {
  method: 'PATCH',
  body: { quantity: 2 },
})

// General endpoint (بدون auth)
const cities = await apiFetch('list/cities', { useGeneral: true })
```

### قواعد لا تكسرها أبداً

1. **كل requests FormData** — مش JSON. `apiFetch` بيعمل ده تلقائياً.
2. **لا `Content-Type` header** — browser يحدده مع FormData.
3. **`_method` override** — `apiFetch` بيضيفه تلقائياً لـ PUT/PATCH/DELETE.
4. **Auth header** تلقائي من `authStore.token`.
5. للـ `complete-data` فقط: بعّت `{ registrationToken: '...' }` كـ option.

### Auth Flow (مهم)

```
POST auth/register   → بيبعت OTP
        ↓
POST auth/verify     → بيرجع { data: { registration_token } }   ← مؤقت
        ↓
POST auth/complete-data  (Bearer: registration_token)
                     → بيرجع { data: { access_token, user } }   ← الدائم
```

الـ `access_token` بيتخزن في cookie اسمها `swapo_token` عمرها 30 يوم.

### Endpoints المهمة

| Domain | Endpoint | Method | Auth |
|---|---|---|---|
| Register | `auth/register` | POST | ❌ |
| Verify OTP | `auth/verify` | POST | ❌ |
| Resend OTP | `auth/resend-code` | POST | ❌ |
| Complete Data | `auth/complete-data` | POST | registration_token |
| Logout | `auth/logout` | POST | ✅ |
| Seller Register | `auth/seller-registration` | POST | registration_token |
| Products list | `product` | GET | optional |
| Product show | `product/{id}` | GET | optional |
| Product reviews | `product/{id}/reviews` | GET | optional |
| My ads | `my-product` | GET | ✅ |
| Add product step 1 | `add-product/step-1` | POST | ✅ |
| Add product step 2 | `add-product/step-2` | POST | ✅ |
| Add product step 3 | `add-product/step-3` | POST | ✅ |
| Add product step 4 | `add-product/step-4` | POST | ✅ |
| Commission calc | `add-product/commission/{catId}` | POST | ✅ |
| Cart | `cart` | GET | ✅ |
| Cart add | `cart/add` | POST | ✅ |
| Cart update | `cart/update/{id}` | PATCH | ✅ |
| Cart delete | `cart/delete` | DELETE | ✅ |
| Cart checkout | `cart/checkout` | POST | ✅ |
| Buyer orders | `order` | GET | ✅ |
| Seller orders | `seller-order` | GET | ✅ |
| Negotiation start | `negotiation` | POST | ✅ |
| Negotiation list | `negotiation` | GET | ✅ |
| Send offer | `negotiation/{id}/offers` | POST | ✅ |
| Accept offer | `negotiation/{negId}/accept/{offerId}` | POST | ✅ |
| Wallet | `wallet` | GET | ✅ |
| Wallet transactions | `wallet/transactions` | GET | ✅ |
| Notifications | `notification` | GET | ✅ |
| Cities | `list/cities` | GET | ❌ (general) |
| Categories | `list/categories` | GET | ❌ (general) |
| Plans | `list/subscription-plans` | GET | ❌ (general) |

---

## Design System

### Colors (من Figma local styles)

```
Primary (Navy):  #0B1A55   → bg-navy, text-navy
Accent (Green):  #10E6B4   → bg-green, text-green  ← مش #37C5F3
Surface:         #F6F8F8   → bg-surface
Border:          #B3B8CA   → border-border
```

في `tailwind.css` لازم تضيفهم كـ CSS variables لو مش موجودين:
```css
@theme {
  --color-navy:    #0B1A55;
  --color-green:   #10E6B4;
  --color-surface: #F6F8F8;
  --color-border:  #B3B8CA;
}
```

### Status Colors

| Status | Background | Text |
|---|---|---|
| pending | `#FFFBE6` | `#F3C800` |
| confirmed | `#E7FDF8` | `#10E6B4` |
| shipped | `#F6F8F8` | `#565757` |
| completed | `#F8FFF5` | `#004850` |
| canceled | `#FFF5F5` | `#500001` |

### Typography

```
Font: Cairo
Sizes: 12 / 14 / 16 / 20 / 24 / 32px
Weights: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)
```

### Radius

```
4px  → rounded-[4px]  — badges, inputs focused
8px  → rounded-lg     — buttons, inputs, search
12px → rounded-xl     — cards
16px → rounded-2xl    — modals, sheets
24px → rounded-3xl    — pill indicators
```

### Shadow

```
0 54px 60px rgba(0,0,0,0.07) → search overlay فقط
```

---

## Components — القواعد

### لا تعمل primitive جديد لو موجود

قبل ما تعمل أي component، دور الأول في:
- `app/components/base/` — primitives
- `app/components/shared/` — shared patterns
- `app/components/auth/` — auth-specific

### Existing Base Components

```
BaseButton    — variant: primary|secondary|ghost|danger, size, loading, disabled, fullWidth
BaseInput     — modelValue, label, placeholder, required, optional, error, dir
BaseTextarea  — modelValue, label, placeholder, rows, maxLength, error
BaseSelect    — modelValue, options, label, placeholder, searchable, error
BaseModal     — open, title, description, size, closable
BaseDrawer    — open, side, title, snapPoints
```

### Existing Shared Components

```
AppHeader     — mode: 'buyer'|'seller'|'guest', user, cartCount, notificationCount
AppFooter     — links, socials, locale, variant
ProductCard   — product, variant: 'grid'|'compact'|'sellerManage', favorite, showSeller
StatusBadge   — status, label, tone, size
MoneyAmount   — amount, currency: 'SAR', locale, compact
ProfileSidebar — items, activeKey, role: 'buyer'|'seller', user
RatingStars   — value, max, size, readonly
```

### Existing Auth Components

```
PhoneInput  — v-model (string) → strips non-digits, fixed +966 prefix
OtpInput    — v-model (string), length: 4, auto-advance, paste support
```

---

## i18n — القواعد

- **لا نص عربي أو إنجليزي مباشرة في الـ .vue files** — كل حاجة في i18n.
- Keys path: `app/i18n/locales/ar.json` و `app/i18n/locales/en.json`.
- Namespaces الموجودة: `common`, `nav`, `auth`, `product`, `cart`, `order`, `profile`, `seller`, `errors`.
- لما تضيف keys جديدة، ضيفهم في الملفين مع بعض.

### RTL/LTR — لازم تعمل كده

```html
<!-- ✅ صح — logical properties -->
<div class="ms-4 me-2 ps-3 pe-2">
<div class="start-0 end-auto">

<!-- ❌ غلط — physical properties -->
<div class="ml-4 mr-2 pl-3 pr-2">
<div class="left-0 right-auto">
```

الاستثناء الوحيد: `<input dir="ltr">` للأرقام والإيميل والـ phone number.

---

## Layouts

| Layout | متى تستخدمه |
|---|---|
| `auth` | register, verify, complete-data, seller-register |
| `default` | كل الصفحات المحمية (home, products, orders, profile...) |
| `public` | landing, legal, 404 |

كل صفحة لازم فيها:
```ts
definePageMeta({
  layout: 'default',
  middleware: 'auth',  // أو ['auth', 'seller'] للـ seller pages
})
```

---

## Stores

### useAuthStore
```ts
token          // string | null — من cookie
user           // User | null
isAuthenticated // computed
isSeller       // computed ← من user.is_seller
setToken(token)
setUser(user)
logout()       // بيمسح token وuser
```

### useCartStore
```ts
items          // CartItem[]
count          // computed — عدد الـ items
total          // computed — المجموع
setCart(items)
updateItem(id, quantity)
removeItems(ids[])
clearCart()
```

### useNotificationsStore
```ts
list           // Notification[]
unreadCount    // computed
setNotifications(notifications)
markRead(uuid)
markAllRead()
```

---

## Order Statuses

```
Buyer orders:  pending_approval | pending_payment | pending_shipment | shipped | completed | cancelled | rejected
Seller orders: نفس القيم
Negotiation:   pending | negotiating | agreed | finished
Wallet tx:     commission | pending | completed
Withdrawal:    pending | accepted | rejected
```

---

## ما لا تعمله أبداً

```
❌ لا تعدل nuxt.config.ts
❌ لا تعدل app/composables/useApi.ts
❌ لا تعدل app/stores/auth.ts
❌ لا تضيف Content-Type header يدوياً
❌ لا تستخدم axios أو fetch مباشرة — استخدم apiFetch فقط
❌ لا تكتب نص عربي في الـ .vue files
❌ لا تستخدم ml- mr- pl- pr- left- right- في الـ CSS
❌ لا تعمل duplicate لأي base component موجود
❌ لا تحط ملفات locales في app/locales/ — المكان الصح app/i18n/locales/
```

---

## بعد كل تغيير

```bash
npm run build    # لازم يخلص بدون errors
npm run dev      # تأكد مفيش console errors
```

لو في TypeScript error — صلحه، لا تستخدم `@ts-ignore`.
