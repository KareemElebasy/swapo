# Buyer And Seller Differences

## Product Role Model

| Area | Buyer | Seller | Shared foundation |
|---|---|---|---|
| Home/dashboard | Product discovery homepage, recommended sections, recently viewed. | Seller account/product management dashboards. | Header, footer, product card, status badge, notifications. |
| Product detail | View, photos, seller info, price, negotiate, buy. | Manage own ad, edit status, see metrics, promotion, reviews. | Product media, price display, rating/reviews, breadcrumbs. |
| Checkout/order | Cart, delivery address, shipping method, payment, rate experience. | Incoming orders, order fulfillment, wallet proceeds. | Order card, status badge, address display, money formatting. |
| Negotiation | Buyer sends/accepts offers and views negotiation order. | Seller reviews/responds to negotiation requests. | Negotiation card, chat, offer status. |
| Profile | Addresses, purchases, policy, support, phone edit. | Orders, wallet, drafts, subscriptions, auto replies, business location. | Profile sidebar shell, nav item, support/legal pages, address form. |
| Product creation | Not applicable. | Add/edit product wizard, media, category, pricing, shipping cost responsibility, boost/pin. | Base inputs, selects, uploader primitives, modal. |
| Monetization | Payment and checkout. | Wallet, fees, service/VAT tooltip, boost plans. | MoneyAmount, fee summary, tooltip. |

## Buyer-Only Components

| Component | Used screens | Suggested path | Props | States | Notes |
|---|---|---|---|---|---|
| `BuyerHomeHero` | Website Buyer home | `app/components/buyer/home/BuyerHomeHero.vue` | `slides`, `cta`, `user` | guest, loggedIn | Should use shared header nearby, not duplicate nav. |
| `BuyerProductSection` | Home rows | `app/components/buyer/home/BuyerProductSection.vue` | `title`, `products`, `loading`, `trackingKey` | loading, empty, populated | Wraps shared product card. |
| `BuyerSellerCta` | Home seller registration banner | `app/components/buyer/home/BuyerSellerCta.vue` | `benefits`, `to` | default | Buyer-facing seller acquisition. |
| `BuyerFavoritesGrid` | Favorites/category | `app/components/buyer/favorites/BuyerFavoritesGrid.vue` | `items`, `categoryId`, `filters` | empty, loading, filtered | Buyer only. |
| `BuyerCheckoutFlow` | Checkout | `app/components/buyer/checkout/BuyerCheckoutFlow.vue` | `cart`, `address`, `shipping`, `payment` | address, shipping, payment, review | Can be route shell for nested pages. |
| `ShippingMethodCard` | Checkout shipping | `app/components/buyer/checkout/ShippingMethodCard.vue` | `method`, `selected`, `price` | selected, unavailable | Contains ordinary/express options. |
| `BuyerOrderDetails` | Order details, negotiated order detail | `app/components/buyer/orders/BuyerOrderDetails.vue` | `order`, `negotiation` | standard, negotiated, canceled | Shared atoms inside. |
| `BuyerNegotiationCard` | Buyer negotiation list | `app/components/buyer/negotiations/BuyerNegotiationCard.vue` | `negotiation` | pending, active, agreed, ended | Figma states are Arabic labels. |
| `SellerStorefront` | Seller page viewed by buyer | `app/components/buyer/sellers/SellerStorefront.vue` | `seller`, `products`, `reviews` | loading, empty, populated | Buyer view only; seller manages elsewhere. |
| `RateExperiencePrompt` | Purchase/rate flow | `app/components/buyer/orders/RateExperiencePrompt.vue` | `order`, `rating`, `comment` | unrated, submitting, submitted | App UI has rating references. |

## Seller-Only Components

| Component | Used screens | Suggested path | Props | States | Notes |
|---|---|---|---|---|---|
| `SellerRegistrationPanel` | Seller signup/register | `app/components/seller/onboarding/SellerRegistrationPanel.vue` | `modelValue`, `step`, `errors` | draft, submitting, completed | Separate from generic auth. |
| `SellerAddProductWizard` | Add Product | `app/components/seller/products/SellerAddProductWizard.vue` | `draft`, `step`, `categories`, `plans` | details, media, pricing, boost, review | Core seller workflow. |
| `ProductMediaUploader` | Add/Edit Product | `app/components/seller/products/ProductMediaUploader.vue` | `files`, `coverId`, `maxFiles`, `accept` | empty, uploading, uploaded, error | Cover plus gallery slots. |
| `ProductCategorySelector` | Add/Edit Product | `app/components/seller/products/ProductCategorySelector.vue` | `categories`, `selectedPath` | root, expanded, selected | Use shared category option primitives. |
| `ProductPricingOptions` | Add/Edit Product | `app/components/seller/products/ProductPricingOptions.vue` | `price`, `type`, `shippingCostBy`, `fees` | fixed, negotiable, sharedShipping | Includes net payout summary. |
| `BoostPlanSelector` | Add Product, My Ads | `app/components/seller/promotions/BoostPlanSelector.vue` | `plans`, `selectedPlan`, `currentPlan` | none, pin, boost, active | Promotion-specific. |
| `SellerAdCard` | My Ads | `app/components/seller/ads/SellerAdCard.vue` | `ad`, `metrics`, `actions` | active, sold, boosted, draft | Seller management variant of product summary. |
| `SellerAdDetails` | My Ads product details | `app/components/seller/ads/SellerAdDetails.vue` | `ad`, `reviews`, `metrics` | editable, promoted, ended | Uses breadcrumb and reviews. |
| `SellerWalletSummary` | Wallet | `app/components/seller/wallet/SellerWalletSummary.vue` | `balance`, `transactions`, `filters` | loading, empty, populated | Seller-only finance view. |
| `SellerSubscriptionCard` | Subscriptions | `app/components/seller/subscriptions/SellerSubscriptionCard.vue` | `subscription`, `features`, `cta` | active, expired, upgrade | Seller-only. |
| `SellerAutoReplySettings` | Auto messages | `app/components/seller/messages/SellerAutoReplySettings.vue` | `rules`, `enabled` | on, off, editing | Seller-only automation. |
| `SellerBusinessLocationForm` | Business location | `app/components/seller/profile/SellerBusinessLocationForm.vue` | `location`, `coverage`, `mode` | edit, saved, unavailable | Similar fields to address but different domain. |
| `SellerConfirmAdDialog` | Delete, unpin, end boost, save draft | `app/components/seller/ads/SellerConfirmAdDialog.vue` | `type`, `ad`, `open` | delete, unpin, endBoost, saveDraft | Domain copy/action logic only. |

## Difference-Driven Architecture Notes

| Decision | Reason |
|---|---|
| Keep base UI role-neutral. | Buttons, inputs, modals, badges, search, money, and layout primitives are identical between roles. |
| Use role-specific feature folders only for behavior. | Buyer checkout and seller add-product are different workflows and should not be forced into one generic component. |
| Share profile shell, split menu config. | Buyer and seller both use profile navigation, but menu entries and content differ. |
| Share product display atoms, split management actions. | Buyer sees product purchase actions; seller sees edit/promote/delete/metrics actions. |
| Model negotiation as a shared domain with role-specific cards/actions. | State vocabulary overlaps; permissions/actions differ. |
