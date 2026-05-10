# Design System Audit

The file has local paint styles and one local effect style. No local text styles were returned by Figma MCP, so typography should be formalized before implementation.

## Color Styles

| Token group | Token | Hex |
|---|---|---:|
| Blue | Light | `#E7E8EE` |
| Blue | Light hover | `#DADDE6` |
| Blue | Light active | `#B3B8CA` |
| Blue | Normal | `#0B1A55` |
| Blue | Normal hover | `#0A174D` |
| Blue | Normal active | `#091544` |
| Blue | Dark | `#081440` |
| Blue | Dark hover | `#071033` |
| Blue | Dark active | `#050C26` |
| Blue | Darker | `#04091E` |
| Grey | Light | `#FEFEFE` |
| Grey | Light active | `#FCFDFD` |
| Grey | Normal | `#F6F8F8` |
| Grey | Normal hover | `#DDDFDF` |
| Grey | Normal active | `#C5C6C6` |
| Grey | Dark | `#B9BABA` |
| Grey | Dark hover | `#949595` |
| Grey | Dark active | `#6F7070` |
| Grey | Darker | `#565757` |
| Green | Light | `#E7FDF8` |
| Green | Light hover | `#DBFBF4` |
| Green | Light active | `#B5F7E8` |
| Green | Normal | `#10E6B4` |
| Green | Normal hover | `#0ECFA2` |
| Green | Normal active | `#0DB890` |
| Green | Dark | `#0CAD87` |
| Green | Dark hover | `#0A8A6C` |
| Green | Dark active | `#076751` |
| Green | Darker | `#06513F` |
| Black | Lighter | `#9D9D9D` |
| Black | Light hover | `#8A8A8A` |
| Black | Light active | `#727272` |
| Black | Normal | `#262626` |
| Black | Normal hover | `#202020` |
| Black | Normal active | `#1C1C1C` |
| Black | Dark | `#0D0D0D` |
| Black | Dark hover | `#0A0A0A` |
| Black | Dark active | `#040404` |

## Semantic Colors

| Use | Background | Text |
|---|---:|---:|
| Pending | `#FFFBE6` | `#F3C800` |
| Awaiting payment | `#FAFEE5` | `#475800` |
| Confirmed | `#E7FDF8` | `#10E6B4` |
| Shipped | `#F6F8F8` | `#565757` |
| Completed | `#F8FFF5` | `#004850` |
| Canceled | `#FFF5F5` | `#500001` |

Important token issue: sampled component output sometimes used a fallback of `#37C5F3` for `foundation/green/normal`, while the local Figma paint style says `#10E6B4`. Resolve this before creating Tailwind tokens.

## Typography

| Attribute | Observed value |
|---|---|
| Primary Arabic font | `Ping AR + LT` |
| Weights observed | Regular, Medium |
| Common sizes | 12, 14, 16, 20, 24, 32 |
| Landing/marketing sizes | 42, 48, 52, 56, 60, 72 class of display sizes |
| Common line heights | 16, 20, 22, 24, 26, 32, 40 |
| Text alignment | Arabic screens are RTL and mostly right-aligned; component code uses `dir="auto"` in samples. |
| Letter spacing | Some compact labels show `-0.15px`; avoid carrying this globally until verified for Arabic rendering. |

Recommended typography tokens:

| Token | Size | Weight | Line height | Use |
|---|---:|---|---:|---|
| `text-caption` | 12 | Regular | 16 | Status badges, metadata, small helper text. |
| `text-body-sm` | 14 | Regular | 20 or 22 | Search placeholder, secondary descriptions. |
| `text-body` | 16 | Regular | 24 | Form values, navigation, profile rows. |
| `text-body-medium` | 16 | Medium | 24 | Buttons and emphasized labels. |
| `text-title-sm` | 20 | Medium | 28 or 32 | Section headings and card titles. |
| `text-title` | 24 | Medium | 32 | Modal headings and profile page titles. |
| `text-display` | 48+ | Medium | 1.15 | Landing page hero only. |

## Spacing

Observed spacing values: `2`, `3`, `4`, `5`, `7`, `8`, `10`, `12`, `14`, `16`, `20`, `24`, `28`, `32`, `36`, `40`, `44`, `48`, `52`, `56`, `60`, `64`, `72`, `80`, `88`, `92`, `96`, `100`, `112`, `120`, `128`.

Recommended Tailwind scale usage:

| Token class | Use |
|---|---|
| 2, 4, 8 | Icon padding, badge padding, micro gaps. |
| 10, 12, 16 | Button/input padding, card internals. |
| 20, 24, 32 | Header groups, form groups, grid gutters. |
| 40, 48, 56, 64 | Page section rhythm, large controls, modal spacing. |
| 80+ | Desktop section spacing and landing page blocks. |

## Radius

| Radius | Use |
|---:|---|
| 4 | Inputs in focused profile/menu states, status badges. |
| 8 | Primary buttons, product image inner frames, search input backgrounds. |
| 12 | Product cards and larger cards. |
| 16 | Pill/dot indicators and soft selected states. |
| 24 | Circular indicators and icon controls. |

## Shadows

| Style | Value | Use |
|---|---|---|
| `shadow` | `0 54px 60px rgba(0,0,0,0.07)` | Search/top overlay surfaces. |

Recommendation: create a named shadow token, but avoid applying it to every card. Most product and form surfaces are flat or lightly bordered.

## Borders

| Pattern | Use |
|---|---|
| 1px solid `#B3B8CA` | Secondary/default button border. |
| 1px top border `rgba(0,0,0,0.06)` | Search surface/top separator. |
| 0.5px green-light-active | Carousel selected-dot outline and small selected controls. |
| Grey normal background `#F6F8F8` | Inputs, search bars, neutral selection blocks. |

## Icon Style

| Source/style | Use |
|---|---|
| Vuesax linear | Main product icons: search, arrows, cart/bag, notes, status actions. |
| Vuesax bulk | Active profile menu icon state. |
| Heroicons | Landing page and legal/public marketing assets. |
| Social logos | Footer/support/social rows. |
| Sizes | 14, 16, 20, 24, 30, 32, 40. |

Recommendation: normalize web app icons around one Vue-compatible icon source before implementation. Keep Vuesax-like stroke weight if using a different package.

## Image Style

| Pattern | Use |
|---|---|
| Product image on white card | Product cards and ad cards; image object-fit is mostly contain. |
| Rounded media containers | Inner radius 8, card radius 12. |
| Phone mockups | Landing page hero and feature sections. |
| Product carousel dots | Product image cards use vertical/rotated dot indicator in Figma, should become logical horizontal dots in web unless exact visual is required. |

## Buttons

| Variant | Observed style |
|---|---|
| Default/secondary | 40px high, radius 8, padding 16 x 12, blue-light-active border, blue-normal text. |
| Hover/primary | 40px high, radius 8, blue-normal background, green token text. |
| Wide form button | 48px high, full-width inside 568px/812px form containers. |
| Modal action buttons | 48px high, paired 215px buttons inside 474px modal. |
| Landing button | 56px high, public landing style, arrow icon support. |

## Inputs

| Pattern | Observed style |
|---|---|
| Search bar | 78px outer surface, white background, top border, shadow, 46px grey input body, search icon at logical end. |
| Form field | 48px or 56px high, label above, optional/required marker, error/helper row below. |
| Text area | 128px/145px body in landing and product description flows. |
| Mobile custom auth fields | `Mobile Number`, `Text Field`, `OTP Field`, iPhone keyboard examples in CustomComponents. |
| Dropdown field | Arrow-down icon, selected label/value, used for city, district, product status, categories. |

## Cards

| Pattern | Observed style |
|---|---|
| Product card | White, radius 12, image container radius 8, product image carousel state. |
| Offer/boost card | Larger product promotion card with image, title, description, button. |
| Profile menu row | 302 x 50, focused state has pale blue background and green text/icon. |
| Order/status card | Uses status badge, product summary, price, date, action buttons. |
| Review card | Star rating, author/date, comment, repeated in seller ad detail. |

## Tables

No classic data table was observed in sampled web sections. Seller lists and orders are card/list based. If tabular views appear later, build `BaseDataTable` only after a designed table is found.

## Navigation

| Pattern | Variants |
|---|---|
| Header | Default, profile buyer, seller. Desktop width 1512. |
| Footer | Shared footer component, used across home, profile, support, policy, ad detail. |
| Category nav | Horizontal category row with dividers. |
| Breadcrumb | Seller product/ad details use `MDS-Public-TW-Breadcrumb`. |
| Profile side nav | `profile` card and `Component 13` menu item with default/focused states. |
| Language switch | EN/Ar toggle in auth and landing. |
