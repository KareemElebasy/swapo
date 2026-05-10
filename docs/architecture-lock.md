# Architecture Lock

This file locks the foundation decisions for the Nuxt 4 Swapo implementation. It should be updated only when a project-level architecture decision changes.

## Directory Ownership

| Path | Responsibility |
|---|---|
| `app/components/base` | Primitive UI components only. Buttons, inputs, selects, modals, drawers, tabs, and other role-neutral atoms live here. |
| `app/components/shared` | Reusable domain components shared by Buyer and Seller. Product cards, status badges, navigation, address forms, dialogs, filters, reviews, notifications, and chat surfaces live here. |
| `app/components/auth` | Auth forms and auth-specific blocks such as login, signup, OTP, and locked-account states. |
| `app/components/buyer` | Buyer-only workflows such as checkout, favorites, buyer home modules, buyer negotiations, orders, buyer profile wrappers, and public seller browsing. |
| `app/components/seller` | Seller-only workflows such as ads, product creation, seller messages, onboarding, seller profile, promotions, subscriptions, and wallet. |
| `app/layouts` | Nuxt layout shells. Layouts own route framing only; headers, footers, and sidebars are added later through shared components. |
| `app/pages` | Route pages only. Pages compose layouts, components, composables, and route data. |
| `app/composables` | Reusable Vue/Nuxt logic such as locale direction, role navigation, filters, and status labels. |
| `app/types` | TypeScript domain types and interfaces. |
| `app/utils` | Formatting, direction, status, and small pure helpers. |
| `i18n/locales` | Locale JSON files for Arabic and English copy. |

## Anti-Duplication Rules

- Build primitives once in `app/components/base`; never create buyer/seller versions of buttons, inputs, modals, or search fields.
- Put shared product, order, address, status, navigation, notification, review, and dialog patterns in `app/components/shared`.
- Use buyer/seller folders only when the workflow, data ownership, or allowed actions differ by role.
- Prefer slots for role-specific actions instead of forking shared components.
- Keep status metadata, money formatting, date formatting, and direction logic centralized in `app/utils`.
- Do not let Figma placeholder names such as `Component 10` or browser mockup chrome leak into code.

## I18n Rules

- Default locale is Arabic (`ar`), with English (`en`) as the secondary locale.
- Use translation keys for UI copy. Hard-coded copy is allowed only for temporary fixtures or brand names.
- Locale files live in `i18n/locales` and are lazy-loaded by `@nuxtjs/i18n`.
- Prefer stable keys grouped by domain, for example `common.save`, `auth.login`, and `roles.seller`.
- Format dates, numbers, and money through Intl helpers instead of string concatenation.

## RTL/LTR Rules

- Arabic renders as `lang="ar-SA"` and `dir="rtl"`.
- English renders as `lang="en-US"` and `dir="ltr"`.
- Root document direction is set from the active locale in `app/app.vue`.
- Use logical CSS properties and Tailwind logical utilities when possible.
- Component props should use `start` and `end` naming for icons/actions instead of `left` and `right`.
- Mixed numeric inputs, phone numbers, and product identifiers should use `dir="auto"` where a component accepts user text.

## Routing Rules

- Routes are localized with `prefix_except_default`: Arabic routes have no locale prefix, English routes use `/en`.
- Route pages live under `app/pages` and should stay thin.
- Auth pages belong under `app/pages/auth`.
- Buyer route groups use buyer layouts and buyer-specific components only where workflows are buyer-only.
- Seller route groups live under `app/pages/seller` and use seller-specific components only for seller workflows.
- Shared public routes such as legal, products, sellers, support, and future landing pages should compose shared components.

## Build Order

1. Design tokens, global CSS, i18n, direction helpers, and domain types.
2. Base UI primitives.
3. Shared domain components.
4. Layout shells and navigation components.
5. Auth screens.
6. Buyer workflows.
7. Seller workflows.
8. RTL/LTR, responsive, accessibility, and visual QA.

## Naming Conventions

- Vue components use PascalCase filenames, for example `BaseButton.vue` and `ProductCard.vue`.
- Composables use `use` prefixes, for example `useLocaleDirection.ts`.
- Utility files use camelCase or domain nouns, for example `direction.ts`, `format.ts`, and `status.ts`.
- Types export PascalCase interfaces and type aliases.
- Route folder names use kebab-case only when a multi-word URL segment is needed.
- Translation keys use lower camelCase for multi-word keys, for example `awaitingPayment`.
