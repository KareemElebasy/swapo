# Route Map

Routes are proposed for Nuxt 4 and should be localized. If `@nuxtjs/i18n` is added, each route can be generated under `/ar` and `/en` or use the module's default-locale strategy.

## Auth Routes

| Route | Classification | Figma source | Notes |
|---|---|---|---|
| `/auth/login` | Auth | Website `تسجيل دخول`, App UI `Login` | Phone/login form. |
| `/auth/verify` | Auth | OTP/code verification in auth section, CustomComponents OTP | OTP entry and resend timer. |
| `/auth/signup` | Auth | `SignUp`, `خطوة بسيطة ونكون جاهزين` | Buyer/general signup details. |
| `/auth/lock` | Auth | `Lockscreen` | Locked/blocked state. |
| `/seller/register` | Seller/Auth | `سجل كبائع على سواوبو`, home seller CTA | Seller onboarding entry. |

## Buyer Routes

| Route | Classification | Dynamic | Figma source |
|---|---|---|---|
| `/` | Buyer/Public | No | Buyer home `الرئيسية`. |
| `/home` | Buyer | No | Logged-in home variant. |
| `/products` | Buyer | No | Product discovery/search. |
| `/products/[productId]` | Buyer | Yes | Product with price, buying flow. |
| `/products/[productId]/photos` | Buyer | Yes | Product photos view. |
| `/products/[productId]/reviews` | Shared/Buyer | Yes | Product rate view all page. |
| `/categories/[categoryId]` | Buyer | Yes | Favorites/category and category browsing. |
| `/favorites` | Buyer | No | المفضلة - كاتجوري. |
| `/sellers/[sellerId]` | Buyer | Yes | Seller page viewed by buyer. |
| `/cart` | Buyer | No | Cart + Checkout. |
| `/checkout` | Buyer | No | Checkout shell. |
| `/checkout/address` | Buyer | No | Address selection/edit. |
| `/checkout/shipping` | Buyer | No | Shipping method section. |
| `/checkout/payment` | Buyer | No | Payment/review. |
| `/orders` | Buyer | No | My purchase. |
| `/orders/[orderId]` | Buyer | Yes | Order details. |
| `/orders/[orderId]/rate` | Buyer | Yes | Rate experience. |
| `/orders/[orderId]/negotiation` | Buyer | Yes | Negotiated order details. |
| `/negotiations` | Buyer | No | Buyer negotiations list. |
| `/negotiations/[negotiationId]` | Buyer/Shared | Yes | Negotiation chat. |
| `/profile` | Buyer/Shared | No | Buyer profile. |
| `/profile/addresses` | Buyer/Shared | No | Delivery addresses. |
| `/profile/addresses/new` | Buyer/Shared | No | Add address. |
| `/profile/addresses/[addressId]/edit` | Buyer/Shared | Yes | Edit address. |
| `/profile/phone` | Buyer/Shared | No | Edit phone. |
| `/profile/support` | Buyer/Shared | No | Technical support/FAQ. |
| `/profile/policy` | Buyer/Shared | No | Usage policy. |

## Seller Routes

| Route | Classification | Dynamic | Figma source |
|---|---|---|---|
| `/seller` | Seller | No | Seller landing/dashboard. |
| `/seller/products` | Seller | No | Sales - My Products, My Ads. |
| `/seller/products/new` | Seller | No | Add Product wizard. |
| `/seller/products/[productId]` | Seller | Yes | Seller product detail/ad detail. |
| `/seller/products/[productId]/edit` | Seller | Yes | Edit Product / تعديل الإعلان. |
| `/seller/products/[productId]/boost` | Seller | Yes | Boosted and promotion plan. |
| `/seller/drafts` | Seller | No | Drafts / المسودات. |
| `/seller/orders` | Seller | No | طلباتي. |
| `/seller/orders/[orderId]` | Seller | Yes | Seller order detail. |
| `/seller/negotiations` | Seller | No | Seller negotiations. |
| `/seller/negotiations/[negotiationId]` | Seller/Shared | Yes | Negotiation chat. |
| `/seller/wallet` | Seller | No | Wallet / المحفظة. |
| `/seller/subscriptions` | Seller | No | Subscription / profile الإشتراكات. |
| `/seller/auto-replies` | Seller | No | profile الرسائل التلقائية. |
| `/seller/business-location` | Seller | No | موقعي التجاري. |
| `/seller/profile` | Seller | No | Seller profile shell. |
| `/seller/data` | Seller | No | Seller data. |

## Shared/Public Routes

| Route | Classification | Dynamic | Figma source |
|---|---|---|---|
| `/landing` | Shared/Public | No | Mobile App Landing Page. |
| `/legal/terms` | Shared/Public | No | Legal, profile usage policy. |
| `/legal/privacy` | Shared/Public | No | Landing footer legal link. |
| `/support` | Shared/Public | No | Support/FAQ. |
| `/chatbot` | Shared | No | Chatbot, Swapo assistant. |
| `/404` | Shared/Public | No | Section named `405`, frame named `404`. |

## Dynamic Route Parameters

| Param | Applies to | Type idea |
|---|---|---|
| `productId` | Product detail, seller product detail/edit/boost | string |
| `sellerId` | Public seller storefront | string |
| `orderId` | Buyer/seller order details | string |
| `negotiationId` | Negotiation detail/chat | string |
| `categoryId` | Category/favorites browsing | string |
| `addressId` | Address edit | string |

## Route Middleware

| Middleware | Applies to | Responsibility |
|---|---|---|
| `locale` | All routes | Set locale and `dir`. |
| `auth` | Buyer/seller protected routes | Require signed-in user. |
| `role` | Seller routes, buyer-only profile/order routes | Enforce buyer/seller access. |
| `guest` | Auth routes | Redirect signed-in users where appropriate. |
