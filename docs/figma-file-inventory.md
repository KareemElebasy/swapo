# Figma File Inventory

Source: `https://www.figma.com/design/JdU0wNZlHWEDCwgk9RY8qe/Swapo?node-id=2934-28255&m=dev`

Audit date: 2026-05-10

This inventory was produced from Figma MCP page metadata, targeted section metadata, local style extraction, and representative design-context samples. Very large sections such as some Seller/Profile and Landing/Legal trees timed out when requested as a single full XML subtree, so those areas are represented by their page/section inventory and sampled child sections.

## Pages

| Page | Figma ID | Top-level nodes | Classification | Notes |
|---|---:|---:|---|---|
| Cover | `0:1` | 1 | Shared | Logo cover frame `swapoo 2 1`. |
| ------------------------------------ | `7:2` | 0 | Unknown | Separator page. |
| Timeline | `7:4` | 0 | Unknown | Empty or not exposed by MCP. |
| Busniess | `7:5` | 1 | Unknown | BRD/business documentation section. |
| ------------------------ | `7:6` | 0 | Unknown | Separator page. |
| Sitemap | `7:7` | 0 | Shared | Empty or not exposed by MCP. |
| Colorstyle | `7:8` | 1 | Shared | Color palette section. Local paint styles are defined in file styles. |
| Iconset | `8:9` | 0 | Shared | Icon library page, not exposed as top-level nodes. |
| CustomComponents | `8:12` | 3 | Shared | Mobile input fields, keyboard layouts, examples. |
| Swapo Application UI | `8:11` | 33 | Mixed | Main mobile/app flow reference for buyer, seller, auth, components, assets. |
| Website | `2934:28255` | 3 | Mixed | Main Nuxt web product design. Contains Buyer, Seller, and components sections. |
| Landing Page | `1270:24219` | 3 | Shared | Public marketing landing, legal, 404 page. |
| --------------------------- | `8:13` | 0 | Unknown | Separator page. |
| Upload Screens | `8:14` | 4 | Shared | Device export/upload screens. |
| ------------------- | `8:16` | 0 | Unknown | Separator page. |
| Inspiration | `8:18` | 0 | Unknown | Empty or not exposed by MCP. |
| Drafts | `8:17` | 5 | Mixed | Drafted address, login, chatbot/product suggestion work. |

## Main Website Page

| Section | Figma ID | Classification | Major subsections |
|---|---:|---|---|
| مشتري | `4169:80451` | Buyer/Auth/Shared | Auth, negotiation, home, favorites/category, buying, checkout, negotiation chat, Swapo assistant, seller page view, order details, profile, negotiations. |
| compenents | `4169:80627` | Shared | Header, footer, search, category nav, buttons, product card, status badges, notification panels, profile menu, report/sent modal, chatbot, search components. |
| بائغ | `4169:80626` | Seller | Seller registration, negotiations, add product, my ads, edit ad, seller profile, orders, wallet, drafts, subscriptions, auto messages, business location. |

## Website Buyer Sections

| Section | Figma ID | Classification | Screens or flows observed |
|---|---:|---|---|
| إنشاء حساب / تسجيل الدخول | `3021:95754` | Auth | `تسجيل دخول`, OTP/code verification, signup-details step `خطوة بسيطة ونكون جاهزين`. |
| تفاوض | `3665:68942` | Buyer | Negotiation setup/offer flow. |
| Section 1 | `4311:60829` | Buyer | Home, logged-in home, favorites/category, purchase, checkout. |
| الرئيسية | `4311:51593` | Buyer | Homepage with hero, header, product sections, seller CTA, app download CTA, footer. |
| المفضلة - كاتجوري | `4268:51910` | Buyer | Favorite/category browsing. |
| شراء | `3665:67494` | Buyer | Product purchase/details. |
| اتمام الطلب | `3865:63903` | Buyer | Checkout, shipping method, address, notes, payment summary. |
| Negotiation chat1 | `3865:66759` | Buyer/Shared | Buyer negotiation chat flow. |
| مساعد سوابو | `3865:69857` | Shared | Assistant/chatbot screens. |
| Seller page | `3865:72569` | Buyer | Public seller storefront view. |
| تفاصيل الطلب | `3886:73640` | Buyer | Order details. |
| تفاصيل الطلب تفاوض | `4169:80418` | Buyer | Negotiated order details. |
| profile | `3921:50281` | Buyer/Shared | Delivery addresses, phone edit, usage policy, support, FAQ, profile side menu, status badge. |
| المفاوضات | `3999:46516` | Buyer | Negotiation cards with states: pending, in negotiation, agreed, ended. |

## Website Seller Sections

| Section | Figma ID | Classification | Screens or flows observed |
|---|---:|---|---|
| سجل كبائع على سواوبو | `3983:44055` | Seller/Auth | Seller onboarding/registration. Large subtree timed out, but section exists as seller entry. |
| المفاوضات | `3999:45936` | Seller | Seller-side negotiation list/flow. |
| Add Product | `3983:44112` | Seller | Multi-step add-product wizard, media upload, category selector, price/shipping/promotion plan, success/draft modals, tooltip. |
| إعلاناتي | `4053:79687` | Seller | My ads, product details, status controls, product metrics, reviews, edit ad, promotion controls, delete/end modals. |
| تعديل الإعلان | `4053:78486` | Seller | Edit product/ad flow under My Ads. |
| Profile | `4311:60185` | Seller | Orders, wallet, drafts, subscriptions, auto messages, business location, seller profile. Large subtree timed out as one request. |
| طلباتي | `4125:76775` | Seller | Seller orders. |
| المحفظة | `4125:76774` | Seller | Seller wallet. |
| المسودات | `4125:75508` | Seller | Draft ads/products. |
| profile الإشتراكات | `4125:80674` | Seller | Subscription management. |
| profile الرسائل التلقائية | `4125:83457` | Seller | Auto-reply/message settings. |
| موقعي التجاري | `4141:85162` | Seller | Business/commercial location. |
| profile | `4311:53839` | Seller/Shared | Seller profile shell. |

## Swapo Application UI Sections

| Section | Figma ID | Classification |
|---|---:|---|
| Home | `94:4404` | Buyer |
| Product with price | `160:7966` | Buyer |
| Vistor | `1626:47287` | Buyer/Unknown |
| Sold Items | `171:9124` | Buyer |
| Product photos view | `326:9853` | Buyer |
| Bidding with price | `160:7967` | Buyer |
| Negotiation Chat Flow | `267:12346` | Shared/Buyer |
| Negotiation Chat Flow | `929:21797` | Shared/Seller |
| Cart + Checkout | `450:12669` | Buyer |
| Seller Page | `450:15304` | Buyer |
| Location | `503:20769` | Shared |
| My Adresses + Add new one | `526:13598` | Shared/Buyer |
| My Adresses + Add new one | `990:24620` | Shared/Buyer |
| Chatbot - Product,Seller | `629:14474` | Shared |
| My purchase | `693:18063` | Buyer |
| Add Product | `700:15269` | Seller |
| Edit Product | `944:32280` | Seller |
| My Account | `812:28622` | Shared |
| Seller | `826:17245` | Seller |
| SignUp | `870:51324` | Auth |
| Login | `1019:25670` | Auth |
| Chatbot | `890:27062` | Shared |
| Product rate - view all page | `892:28693` | Shared |
| Subscription | `895:30159` | Seller |
| Sales - My Products | `929:20293` | Seller |
| Boosted | `935:31297` | Seller |
| Drafts | `973:23718` | Seller |
| Wallet | `990:24446` | Seller |
| Seller data | `1016:23177` | Seller |
| Lockscreen | `1096:27491` | Auth |
| Components + Assets | `1143:25682` | Shared |
| Buyer | `1426:37581` | Buyer/Auth |
| حساب طريقة الشحن... | `2211:39427` | Seller/Unknown |

## Landing Page

| Section | Figma ID | Classification | Notes |
|---|---:|---|---|
| Mobile App Landing Page | `1270:28810` | Shared/Public | Public marketing page with hero, navigation, benefits, app download CTAs, contact form, footer, success message. |
| Legal | `1270:29535` | Shared/Public | Legal content section. Timed out as one full subtree. |
| 405 | `1270:29794` | Shared/Public | Designed 404 page, named section `405`, screen frame named `404`. |

## Custom Components

| Section | Figma ID | Classification | Contents |
|---|---:|---|---|
| Input Fields | `202:12502` | Shared | `Mobile Number`, `Text Field`, `OTP Field`. |
| Keyboard Layout | `202:12538` | Shared/Auth | `Mobile Num Keyboard - iPhone`, `OTP Keyboard - iPhone`. |
| Example | `202:12587` | Auth/Shared | Mobile number screen and OTP screen examples. |

## Drafts And Upload Screens

| Page/Section | Figma ID | Classification | Notes |
|---|---:|---|---|
| Upload Screens / XR | `5949:29747` | Shared | Device export layout. |
| Upload Screens / iPhone 6 | `5949:29830` | Shared | Device export layout. |
| Upload Screens / Android | `5949:29907` | Shared | Device export layout. |
| Drafts / Location "Cart-checkout" | `463:15593` | Buyer/Shared | Draft checkout location screen. |
| Drafts / Add New Location | `463:16373` | Shared | Draft address screen. |
| Drafts / Address components | `463:16845` | Shared | Address component variants. |
| Drafts / Draft / Login | `1019:26238` / `870:51325` | Auth | Draft login. |
| Drafts / Chatbot - Product Suggestions | `663:16744` | Shared | Chatbot product suggestions. |
