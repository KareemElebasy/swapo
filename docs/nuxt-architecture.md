# Nuxt 4 Architecture

Project context observed in repo:

| Area | Current state |
|---|---|
| Framework | Nuxt `^4.4.4` |
| Vue | Vue `^3.5.33` |
| Styling | Tailwind CSS `^4.3.0` via `@tailwindcss/vite` |
| Images | `@nuxt/image` installed |
| App code | Only `app/app.vue` exists today |
| i18n | No i18n module installed yet |
| State | No Pinia dependency installed yet |

## Recommended Structure

```text
app/
  assets/
    fonts/
    images/
    styles/
      tokens.css
      tailwind.css
  components/
    base/
    shared/
      address/
      catalog/
      chat/
      dialogs/
      feedback/
      filters/
      i18n/
      navigation/
      notifications/
      profile/
      reviews/
      status/
    auth/
    buyer/
      checkout/
      favorites/
      home/
      negotiations/
      orders/
      profile/
      sellers/
    seller/
      ads/
      messages/
      onboarding/
      products/
      profile/
      promotions/
      subscriptions/
      wallet/
  composables/
    useLocaleDirection.ts
    useMoney.ts
    useProductFilters.ts
    useRoleNavigation.ts
    useStatusLabel.ts
  layouts/
    auth.vue
    buyer.vue
    seller.vue
    app.vue
    public.vue
  middleware/
    auth.ts
    role.ts
    locale.ts
  pages/
    index.vue
    auth/
    buyer/
    seller/
    products/
    sellers/
    legal/
  plugins/
    i18n.ts
  stores/
    auth.ts
    cart.ts
    catalog.ts
    checkout.ts
    notifications.ts
    seller-products.ts
    user.ts
  types/
    address.ts
    auth.ts
    cart.ts
    money.ts
    negotiation.ts
    order.ts
    product.ts
    review.ts
    seller.ts
    status.ts
    user.ts
  utils/
    direction.ts
    format.ts
    status.ts
i18n/
  locales/
    ar.json
    en.json
public/
  images/
```

Note: `stores/` assumes Pinia will be added. If the project stays dependency-light, use Nuxt `useState` and composables first, then introduce Pinia when cross-page domain state becomes heavy.

## Layouts

| Layout | Suggested file | Structure | Header/sidebar/footer | Responsive behavior |
|---|---|---|---|---|
| Auth layout | `app/layouts/auth.vue` | Centered auth canvas with optional brand/illustration area and language toggle. | No app header; language toggle top. Browser chrome in Figma should be treated as mockup context, not real UI. | Desktop split/centered; mobile becomes single-column with compact logo and form. |
| Buyer layout | `app/layouts/buyer.vue` | App header, optional category/search area, main content, footer. | `AppHeader mode=buyer`, `AppFooter`; profile pages add `ProfileSidebar`. | Desktop 1512-ish centered content; tablet stacks; mobile uses drawer/search sheet and bottom-friendly filters. |
| Seller layout | `app/layouts/seller.vue` | Seller header, role navigation, main content, footer when marketing/profile pages require it. | `AppHeader mode=seller`; seller profile pages use `ProfileSidebar role=seller`. | Seller forms stay centered and constrained; management lists become cards on mobile. |
| Shared app layout | `app/layouts/app.vue` | Authenticated shared shell for chat, notifications, support, policies. | Shared header/footer as needed. | Direction-aware, role-neutral. |
| Public layout | `app/layouts/public.vue` | Landing/legal/404 shell. | Public nav, language toggle, footer. | Landing content stacks vertically on small screens; store badges remain visible. |

## Direction And Language

| Requirement | Architecture implication |
|---|---|
| Arabic and English | All copy should use translation keys; do not hard-code Arabic in components except fixtures/stories. |
| RTL and LTR | Set `dir` on the root HTML/body from locale. Use logical CSS classes/properties where possible. |
| Mixed numbers/currency | Use locale-aware number formatting for SAR and order/product identifiers. |
| Icon placement | Use logical `start` and `end` props instead of `left` and `right`. |
| Routes | Prefer locale-prefixed routes if using `@nuxtjs/i18n`; otherwise store locale in route params/middleware. |

## Domain Boundaries

| Domain | Owns |
|---|---|
| Auth | Login, signup, OTP, lockscreen, seller registration entry. |
| Catalog | Products, categories, product media, search, filters, favorites. |
| Checkout | Cart, address choice, shipping, payment, order placement. |
| Orders | Buyer purchases, seller orders, status transitions. |
| Negotiation | Offers, chat, statuses, role-specific actions. |
| Seller Products | Add/edit products, drafts, ad metrics, promotion/pin/boost. |
| Profile | User info, addresses, support, policies, seller business profile. |
| Wallet | Seller balances, fees, payouts. |
| Notifications | Notification list, unread counts, header panel. |
| Chatbot | Assistant messages, suggestions, product/seller context. |

## Token Setup

Create design tokens before component work:

| Token area | Notes |
|---|---|
| Colors | Mirror Foundation Blue/Grey/Green/Black and semantic status colors. |
| Typography | Define `Ping AR + LT` loading strategy and English fallback. |
| Radius | 4, 8, 12, 16, 24. |
| Shadow | `shadow-search` or `shadow-overlay` for `0 54px 60px rgba(0,0,0,0.07)`. |
| Spacing | Use Tailwind scale but document common app rhythm. |
| Direction | Add logical utility helpers where Tailwind physical utilities would duplicate RTL/LTR styles. |

## Data Types To Define Early

| Type | Why |
|---|---|
| `User`, `BuyerProfile`, `SellerProfile` | Role-aware navigation and profile pages. |
| `Product`, `ProductMedia`, `Category` | Product cards, details, seller add-product. |
| `Order`, `OrderItem`, `OrderStatus` | Checkout and buyer/seller orders. |
| `Negotiation`, `Offer`, `NegotiationStatus` | Shared negotiation domain. |
| `Address`, `GeoLocation` | Checkout/profile/business location. |
| `Money`, `CurrencyCode` | Price, fees, wallet, checkout. |
| `Review`, `RatingSummary` | Product/seller reviews. |
| `NotificationItem` | Header and notification panel. |

## Implementation Guardrails

| Guardrail | Reason |
|---|---|
| Build shared base components first. | The Figma file repeats the same primitive controls across roles. |
| Avoid creating Buyer/Seller duplicates of primitives. | Role differences are mainly data/actions, not visual atoms. |
| Do not implement MacOS browser chrome as production UI. | It appears in Figma as presentation context around screens. |
| Use slots for action areas. | Product cards, modals, profile rows, and headers need role-specific actions. |
| Keep tables deferred. | No clear table design was found; lists/cards dominate. |
| Normalize Figma naming. | Component names like `Component 10` should not leak into code. |
