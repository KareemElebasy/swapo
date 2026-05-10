# Component Inventory

This inventory groups repeated Figma patterns into Nuxt/Vue component candidates. It does not define implementation code.

## Repeated UI Patterns

| Pattern | Evidence in Figma | Component candidate | Notes |
|---|---|---|---|
| Buttons | `Button` component sets: `3125:58717`, `3541:65575`, `3567:66388`; wide form buttons in add-product and modals. | `BaseButton` | Needs size, tone, icon, loading, disabled, full-width. |
| Inputs | CustomComponents Input Fields, add-product form, address forms, landing contact form. | `BaseInput`, `BaseTextarea`, `BaseSelect` | Need required/optional markers and error state. |
| Search bars | `search` component, city/district search overlays. | `BaseSearchBar` | RTL icon placement and placeholder i18n. |
| Headers | `header` component set with default, profile buyer, seller. | `AppHeader` | One shared component with mode variants. |
| Footers | `Footers` component instances across home/profile/support/landing. | `AppFooter` | Shared public/app footer. |
| Sidebars/profile nav | `profile`, `Component 13`, buyer/seller profile sections. | `ProfileSidebar`, `ProfileNavItem` | User role affects menu entries. |
| Product cards | Product Card instances in homepage rows and component library. | `ProductCard`, `ProductImageCarousel` | Web card likely needs title, price, seller, status, actions. |
| Category cards/nav | `category`, category rows in add-product and header. | `CategoryNav`, `CategoryOption` | Used in buyer discovery and seller add-product. |
| Order cards | Buyer order details, seller orders, purchase screens. | `OrderCard`, `OrderSummary` | Status badge and action slots. |
| Tables | None confirmed. | Defer | Build only if future Figma frame has a table. |
| Status badges | `Product status` variants. | `StatusBadge` | Shared across buyer/seller orders and ads. |
| Modals | Report sent, delete product, end promotion, draft/save confirmations. | `BaseModal`, `ConfirmDialog`, `ResultDialog` | Uses 474px centered modal pattern. |
| Drawers/sheets | Filter + sort bottom sheet, filter bottom list. | `BaseDrawer`, `FilterSortSheet` | Mobile-first pattern in app UI. |
| Filters | Home filters, seller sales filters, sorting list. | `FilterPanel`, `SortMenu` | Shared with role-specific options. |
| Empty states | Success/result message, 404, ad published/draft states. | `EmptyState`, `ResultState` | Icon/illustration plus actions. |
| Pagination | Not clearly exposed. | Defer | Use infinite/slider patterns first. |
| Tabs | Profile/settings sections, add-product steps, category chips. | `BaseTabs`, `SegmentedControl` | Need RTL ordering. |
| Forms | Auth, address, add-product, contact, seller registration. | Form sections composed from base inputs | Use typed form models per domain. |
| Breadcrumbs | Seller product/ad detail. | `Breadcrumbs` | Shared public/app navigation. |
| Notifications | Notification panels in app/UI and website components. | `NotificationPanel`, `NotificationItem` | Header badge count state. |
| Chatbot | Chatbot product/seller, assistant, draft suggestions. | `ChatbotLauncher`, `ChatbotPanel` | Shared across buyer/seller. |
| Rating/reviews | Product rating view, seller ad reviews. | `RatingStars`, `ReviewList` | Shared product/seller surfaces. |

## Shared Components

| Component | Suggested path | Primary props | Slots | States/variants |
|---|---|---|---|---|
| `BaseButton` | `app/components/base/BaseButton.vue` | `variant`, `size`, `type`, `disabled`, `loading`, `icon`, `iconPosition`, `fullWidth` | default, icon | default, hover, active, disabled, loading; primary, secondary, ghost, danger. |
| `BaseIconButton` | `app/components/base/BaseIconButton.vue` | `icon`, `size`, `variant`, `ariaLabel`, `disabled` | icon | default, hover, active, selected. |
| `BaseInput` | `app/components/base/BaseInput.vue` | `modelValue`, `label`, `placeholder`, `required`, `optional`, `error`, `disabled`, `dir`, `startIcon`, `endIcon` | prefix, suffix, helper | default, focused, error, disabled. |
| `BaseTextarea` | `app/components/base/BaseTextarea.vue` | `modelValue`, `label`, `placeholder`, `rows`, `maxLength`, `error` | helper | default, focused, error, disabled. |
| `BaseSelect` | `app/components/base/BaseSelect.vue` | `modelValue`, `options`, `label`, `placeholder`, `error`, `searchable` | option, empty | closed, open, selected, error. |
| `BaseSearchBar` | `app/components/base/BaseSearchBar.vue` | `modelValue`, `placeholder`, `showFilter`, `clearable`, `loading` | leading, trailing | empty, filled, focused, loading. |
| `BaseModal` | `app/components/base/BaseModal.vue` | `open`, `size`, `closable`, `title`, `description` | header, default, footer, icon | small result, confirm, form, destructive. |
| `BaseDrawer` | `app/components/base/BaseDrawer.vue` | `open`, `side`, `title`, `snapPoints` | header, default, footer | bottom sheet, side drawer. |
| `StatusBadge` | `app/components/shared/status/StatusBadge.vue` | `status`, `label`, `tone`, `size` | default | pending, awaitingPayment, confirmed, shipped, completed, canceled. |
| `MoneyAmount` | `app/components/shared/MoneyAmount.vue` | `amount`, `currency`, `locale`, `compact` | currencyIcon | SAR symbol handling and Arabic numerals. |
| `AppHeader` | `app/components/shared/navigation/AppHeader.vue` | `mode`, `user`, `role`, `cartCount`, `notificationCount`, `locale`, `categories` | actions, search, categoryNav | public, buyer, seller, profileBuyer. |
| `AppFooter` | `app/components/shared/navigation/AppFooter.vue` | `locale`, `links`, `socials` | before, after | public/app footer variants. |
| `LanguageToggle` | `app/components/shared/i18n/LanguageToggle.vue` | `modelValue`, `availableLocales` | none | ar active, en active. |
| `CategoryNav` | `app/components/shared/catalog/CategoryNav.vue` | `categories`, `activeId`, `divided`, `scrollable` | item | default, active, overflow. |
| `ProductCard` | `app/components/shared/catalog/ProductCard.vue` | `product`, `variant`, `favorite`, `showSeller`, `showStatus`, `actions` | image, badge, actions | grid, carousel, compact, sellerManage. |
| `ProductImageCarousel` | `app/components/shared/catalog/ProductImageCarousel.vue` | `images`, `activeIndex`, `ratio`, `contain` | controls | single, multi, loading, error. |
| `Breadcrumbs` | `app/components/shared/navigation/Breadcrumbs.vue` | `items`, `current` | item | compact, full. |
| `ProfileSidebar` | `app/components/shared/profile/ProfileSidebar.vue` | `items`, `activeKey`, `role`, `user` | header, item, footer | buyer, seller, collapsed. |
| `ProfileNavItem` | `app/components/shared/profile/ProfileNavItem.vue` | `label`, `icon`, `active`, `to`, `badge` | icon | default, focused/active. |
| `NotificationPanel` | `app/components/shared/notifications/NotificationPanel.vue` | `items`, `unreadCount`, `loading` | item, empty | empty, list, unread. |
| `ChatbotLauncher` | `app/components/shared/chat/ChatbotLauncher.vue` | `open`, `variant`, `context` | none | icon, expanded CTA. |
| `ChatbotPanel` | `app/components/shared/chat/ChatbotPanel.vue` | `messages`, `suggestions`, `context` | message, input, suggestions | buyer, seller, product. |
| `RatingStars` | `app/components/shared/reviews/RatingStars.vue` | `value`, `max`, `size`, `readonly` | none | readonly, interactive. |
| `ReviewList` | `app/components/shared/reviews/ReviewList.vue` | `reviews`, `sort`, `loading` | item, empty | compact, full. |
| `FilterSortSheet` | `app/components/shared/filters/FilterSortSheet.vue` | `open`, `filters`, `sortOptions`, `modelValue` | filter, footer | buyerCatalog, sellerProducts. |

## Buyer-Only Components

| Component | Suggested path | Used screens | Props | States | Notes |
|---|---|---|---|---|---|
| `BuyerHomeHero` | `app/components/buyer/home/BuyerHomeHero.vue` | Website Buyer home | `slides`, `cta`, `user` | guest, loggedIn | Includes public header adjacency and hero content. |
| `BuyerProductSection` | `app/components/buyer/home/BuyerProductSection.vue` | Home rows: best products, used, suggested, recently viewed | `title`, `products`, `loading` | loading, empty, populated | Wraps shared `ProductCard`. |
| `BuyerSellerCta` | `app/components/buyer/home/BuyerSellerCta.vue` | Home seller CTA band | `to`, `benefits` | default | CTA to seller registration. |
| `BuyerCheckoutFlow` | `app/components/buyer/checkout/BuyerCheckoutFlow.vue` | Checkout | `cart`, `address`, `shipping`, `payment` | cart, address, shipping, payment, review | Use route-level pages for each step. |
| `ShippingMethodCard` | `app/components/buyer/checkout/ShippingMethodCard.vue` | Checkout shipping method | `method`, `selected`, `price` | selected, disabled | Buyer-specific shipping decision. |
| `BuyerOrderDetails` | `app/components/buyer/orders/BuyerOrderDetails.vue` | Order details and negotiated order details | `order` | normal, negotiated, canceled | Shares status badge and order summary. |
| `BuyerNegotiationCard` | `app/components/buyer/negotiations/BuyerNegotiationCard.vue` | Negotiation list | `negotiation`, `status` | pending, active, agreed, ended | Mirrors component states in `المفاوضات`. |
| `SellerStorefront` | `app/components/buyer/sellers/SellerStorefront.vue` | Seller page viewed by buyer | `seller`, `products`, `reviews` | loading, emptyProducts | Buyer-only presentation of seller. |
| `BuyerAddressBook` | `app/components/buyer/profile/BuyerAddressBook.vue` | Profile address pages | `addresses`, `selectedId` | empty, list, edit | May share address form. |
| `BuyerFavoritesGrid` | `app/components/buyer/favorites/BuyerFavoritesGrid.vue` | Favorites/category | `items`, `category` | empty, filtered | Buyer discovery only. |
| `RateExperiencePrompt` | `app/components/buyer/orders/RateExperiencePrompt.vue` | Rate experience | `order`, `value` | unrated, submitted | Appears in app UI checkout/purchase flow. |

## Seller-Only Components

| Component | Suggested path | Used screens | Props | States | Notes |
|---|---|---|---|---|---|
| `SellerRegistrationPanel` | `app/components/seller/onboarding/SellerRegistrationPanel.vue` | Seller registration | `modelValue`, `steps` | incomplete, submitting, complete | Seller onboarding distinct from buyer auth. |
| `SellerAddProductWizard` | `app/components/seller/products/SellerAddProductWizard.vue` | Add Product | `step`, `draft`, `categories`, `plans` | media, details, pricing, promotion, review | Central seller flow. |
| `ProductMediaUploader` | `app/components/seller/products/ProductMediaUploader.vue` | Add/Edit Product | `files`, `coverId`, `maxFiles` | empty, uploading, uploaded, error | Cover plus product photos/videos. |
| `ProductCategorySelector` | `app/components/seller/products/ProductCategorySelector.vue` | Add Product | `categories`, `selectedPath` | root, expanded, selected | Horizontal chips plus category list. |
| `ProductPricingOptions` | `app/components/seller/products/ProductPricingOptions.vue` | Add/Edit Product | `price`, `type`, `shippingPaymentBy` | fixed, negotiable, shippingOptions | Includes net proceeds summary. |
| `BoostPlanSelector` | `app/components/seller/promotions/BoostPlanSelector.vue` | Add Product, My Ads | `plans`, `selectedPlan` | none, pin, boost | Promotion/pinning choices. |
| `SellerAdCard` | `app/components/seller/ads/SellerAdCard.vue` | My Ads | `ad`, `metrics`, `actions` | active, boosted, draft, sold, deleted | Seller management card/list item. |
| `SellerAdDetails` | `app/components/seller/ads/SellerAdDetails.vue` | My Ads product detail | `ad`, `reviews`, `metrics` | editable, promoted, ended | Includes breadcrumbs and review section. |
| `SellerWalletSummary` | `app/components/seller/wallet/SellerWalletSummary.vue` | Wallet | `balance`, `transactions` | loading, empty, populated | Seller profile only. |
| `SellerSubscriptionCard` | `app/components/seller/subscriptions/SellerSubscriptionCard.vue` | Subscriptions | `subscription`, `features` | active, expired, upgrade | Seller-only. |
| `SellerAutoReplySettings` | `app/components/seller/messages/SellerAutoReplySettings.vue` | Auto messages | `rules`, `enabled` | enabled, disabled, editing | Seller profile section. |
| `SellerBusinessLocationForm` | `app/components/seller/profile/SellerBusinessLocationForm.vue` | Business location | `location`, `coverage` | edit, saved | Seller commercial address differs from buyer delivery address. |
| `SellerConfirmAdDialog` | `app/components/seller/ads/SellerConfirmAdDialog.vue` | Delete/end promotion/unpin dialogs | `type`, `ad` | delete, unpin, endBoost, saveDraft | Seller-specific dialog copy/actions. |

## Avoid Duplication Warnings

| Risk | Recommendation |
|---|---|
| Separate buyer/seller buttons | Keep one `BaseButton`; only copy/content changes per role. |
| Separate buyer/seller headers | Use one `AppHeader` with `mode` and role-specific slots. |
| Product cards duplicated across catalog and seller ads | Shared `ProductCard` with `sellerManage` variant and action slot. |
| Address forms duplicated in checkout/profile | Shared `AddressForm`; use buyer-specific wrappers for route state. |
| Status badges copied for orders/products | Shared `StatusBadge` with semantic status map. |
| Modals implemented per feature | Shared `BaseModal` plus domain-specific wrappers. |
| Search fields per page | Shared `BaseSearchBar`, pass placeholder/filter behavior. |
