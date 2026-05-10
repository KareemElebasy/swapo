# Implementation Plan

No implementation code should be written until this audit is reviewed. The plan below sequences work to avoid duplicated Buyer/Seller components.

## Component Priority Plan

| Priority | Build | Why |
|---|---|---|
| Build first | Design tokens: colors, typography, radius, shadow, direction helpers | Everything else depends on a stable token contract. |
| Build first | `BaseButton`, `BaseIconButton`, `BaseInput`, `BaseTextarea`, `BaseSelect`, `BaseSearchBar` | Most repeated primitives in Figma. |
| Build first | `StatusBadge`, `MoneyAmount`, `ProductImageCarousel` | High reuse and domain consistency. |
| Build second | `AppHeader`, `AppFooter`, `LanguageToggle`, `CategoryNav`, `Breadcrumbs` | Layout/navigation foundations for pages. |
| Build second | `BaseModal`, `ConfirmDialog`, `EmptyState`, `ProfileSidebar`, `ProfileNavItem` | Needed by auth/profile/seller flows. |
| Build second | `ProductCard`, `FilterSortSheet`, `NotificationPanel`, `ChatbotLauncher` | Buyer and seller product discovery/management. |
| Build later | `BuyerCheckoutFlow`, `BuyerNegotiationCard`, `BuyerOrderDetails` | Higher domain complexity after shared atoms exist. |
| Build later | `SellerAddProductWizard`, `ProductMediaUploader`, `ProductPricingOptions`, `BoostPlanSelector` | Seller flow is large and should reuse base/form primitives. |
| Build later | Wallet, subscriptions, auto-replies, business location | Role-specific profile modules after core seller product flow. |
| Defer | `BaseDataTable`, pagination | No strong table/pagination evidence in sampled designs. |

## Phase 1: Design Tokens

| Task | Output |
|---|---|
| Convert Foundation colors to CSS/Tailwind tokens. | Blue, Grey, Green, Black, semantic status palettes. |
| Resolve green token conflict. | Decide whether `foundation/green/normal` is `#10E6B4` or the sampled fallback `#37C5F3`. |
| Define typography tokens. | Arabic `Ping AR + LT`, English fallback, sizes, line heights. |
| Define radius/shadow tokens. | Radius 4/8/12/16/24 and `0 54px 60px rgba(0,0,0,0.07)`. |
| Define direction helpers. | Logical start/end utilities and root `dir` strategy. |
| Define icon rules. | One icon source and mapping for Figma/Vuesax/Heroicons names. |

## Phase 2: Base UI Components

| Task | Output |
|---|---|
| Build button primitives. | Base button/icon button with states and icon positions. |
| Build field primitives. | Input, textarea, select, search bar with labels/helper/error. |
| Build overlays. | Modal, drawer/sheet, tooltip. |
| Build feedback. | Status badge, empty/result state, loading skeleton. |
| Build formatting helpers. | Money amount, localized date/time, status label mapper. |

## Phase 3: Layouts

| Task | Output |
|---|---|
| Auth layout. | Login/signup/OTP shell. |
| Public layout. | Landing, legal, 404 shell. |
| Buyer layout. | Header, category/search area, footer, profile sidebar support. |
| Seller layout. | Seller header/profile nav and constrained work area. |
| Responsive direction pass. | Verify RTL/LTR alignment before page implementation. |

## Phase 4: Auth

| Task | Output |
|---|---|
| Login page. | Phone/login form and language toggle. |
| OTP page. | OTP field, resend timer, validation states. |
| Signup details page. | Signup details form. |
| Seller register entry. | Seller registration shell using auth primitives. |
| Lockscreen. | Locked state page. |

## Phase 5: Buyer

| Task | Output |
|---|---|
| Buyer home. | Hero, product sections, seller CTA, app download CTA. |
| Catalog/search/favorites. | Search/filter/category and product grid/list. |
| Product details. | Media, price, seller view, reviews, favorite/share actions. |
| Cart and checkout. | Address, shipping, payment, notes, order summary. |
| Orders and order details. | Status, tracking, rate experience. |
| Buyer negotiations. | Offer cards and negotiation chat. |
| Buyer profile. | Addresses, phone edit, policy, support/FAQ. |

## Phase 6: Seller

| Task | Output |
|---|---|
| Seller onboarding. | Registration and role activation. |
| Add product wizard. | Media, details, category, pricing, shipping, promotion, review. |
| My ads/products. | Seller product management list/detail. |
| Edit product. | Reuse add-product modules with existing data. |
| Promotions. | Pin/boost plans, unpin/end promotion dialogs. |
| Seller orders and negotiations. | Seller-specific actions on shared order/negotiation foundations. |
| Wallet/subscriptions/drafts/profile. | Seller account modules. |

## Phase 7: QA And Responsive Polishing

| Task | Output |
|---|---|
| RTL/LTR visual QA. | Arabic and English route screenshots for core flows. |
| Responsive QA. | Desktop, tablet, mobile breakpoints for layout-heavy pages. |
| Accessibility pass. | Keyboard focus, modal focus trap, aria labels for icon buttons. |
| i18n QA. | Long English/Arabic strings, numbers, SAR formatting. |
| Visual regression baseline. | Screenshots for base components and key pages. |
| Performance pass. | Nuxt image optimization and lazy-loaded product media. |

## Avoid Duplication Warnings

| Warning | Preventive action |
|---|---|
| Buyer and seller create separate headers. | One `AppHeader` with role/mode variants. |
| Product card forks too early. | Shared `ProductCard` with action slots and seller-management variant. |
| Add-product fields create custom inputs. | Compose wizard from base fields/selects/uploaders. |
| Address forms are copied into checkout/profile. | Shared `AddressForm` with delivery/business modes. |
| Status colors hard-coded per page. | Central status enum and `StatusBadge`. |
| Direction fixes added page by page. | Root `dir` plus logical utilities from Phase 1. |
| i18n added after pages. | Translation key strategy before Auth phase. |
