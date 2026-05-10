# Swapo — Figma to Page Prompt Template

استخدم الـ prompt ده مع Claude Code أو أي AI coding agent.
استبدل `<FIGMA_NODE_ID>` بالـ node ID الصح من Figma قبل ما تبعته.

---

## PROMPT

```
Use Figma MCP to inspect node <FIGMA_NODE_ID> from file:
https://www.figma.com/design/JdU0wNZlHWEDCwgk9RY8qe/Swapo

Then implement the screen shown. Follow all rules below exactly.

---

### STACK
- Nuxt 4 + Vue 3 SFC + TypeScript
- Tailwind CSS v4 (no arbitrary values unless zero alternatives)
- @nuxtjs/i18n (useI18n / $t only — no hardcoded Arabic or English strings)
- Pinia stores: useAuthStore, useCartStore, useNotificationsStore
- apiFetch from ~/composables/useApi for all API calls

---

### DESIGN TOKENS (from design-system-audit)
Colors:
  --navy:  #0B1A55   (primary buttons, header bg)
  --green: #10E6B4   (accent, success, confirmed)
  --surface: #F6F8F8 (page background)
  --border: #B3B8CA  (input/card borders)

Radius: 4 / 8 / 12 / 16 / 24 px
Shadow: 0 54px 60px rgba(0,0,0,0.07)  → use only on search/overlay surfaces
Font: Cairo (already loaded in tailwind.css)

Map to Tailwind:
  bg-navy      → #0B1A55
  bg-green     → #10E6B4
  bg-surface   → #F6F8F8
  border-border → #B3B8CA
  rounded-sm   → 4px
  rounded-lg   → 12px
  rounded-2xl  → 24px

---

### EXISTING COMPONENTS — USE, DON'T RECREATE
Base (app/components/base/):
  - BaseButton.vue     — props: variant, size, loading, disabled, fullWidth, icon, iconPosition
  - BaseInput.vue      — props: modelValue, label, placeholder, required, error, dir
  - BaseTextarea.vue
  - BaseSelect.vue
  - BaseModal.vue
  - BaseDrawer.vue

Shared (app/components/shared/):
  - AppHeader.vue      — props: mode ('buyer'|'seller'|'guest'), user, cartCount, notificationCount
  - AppFooter.vue
  - ProductCard.vue    — props: product, variant, favorite, showSeller, showStatus
  - StatusBadge.vue    — props: status, label, tone
  - MoneyAmount.vue    — props: amount, currency, locale
  - ProfileSidebar.vue
  - RatingStars.vue

Auth (app/components/auth/):
  - PhoneInput.vue     — v-model, emits update:modelValue
  - OtpInput.vue       — v-model, prop: length

If a needed component doesn't exist yet, create it as a shared or feature component — never inline complex UI inside a page.

---

### API — apiFetch rules
- All requests are FormData (NOT JSON) — apiFetch handles this automatically
- Auth header added automatically from authStore.token
- For seller registration only: pass { registrationToken: '...' } option
- Never set Content-Type manually

Services location: app/services/
Follow existing pattern in app/services/auth.service.ts

---

### FILE RULES
CREATE or UPDATE only the files needed for this screen.
Never touch:
  - nuxt.config.ts
  - app/composables/useApi.ts
  - app/stores/auth.ts
  - Any existing working file unless fixing a direct error in it

New pages → app/pages/
New components → app/components/{base|shared|buyer|seller|auth}/
New services → app/services/
New types → app/types/ (add to existing file if type belongs there)

---

### i18n RULES
- All user-visible strings → $t('namespace.key') or useI18n().t(...)
- Add keys to BOTH app/i18n/locales/ar.json AND app/i18n/locales/en.json
- Never hardcode Arabic or English text in .vue files
- RTL/LTR: use logical CSS classes (ms-*, me-*, ps-*, pe-*, start-*, end-*)
  Never use ml-*, mr-*, pl-*, pr-*, left-*, right-*

---

### LAYOUT & DIRECTION RULES
- Every page uses definePageMeta({ layout: '...' })
  - Auth pages → layout: 'auth', middleware: 'guest'
  - Protected pages → layout: 'default', middleware: 'auth'
  - Seller pages → layout: 'default', middleware: ['auth', 'seller']
  - Public pages → layout: 'public'
- Direction is set on the layout root from locale — don't add :dir on individual components
- Exception: inputs with mixed Arabic/numbers use dir="ltr" on the input element itself

---

### QUALITY RULES
1. Match Figma spacing, colors, typography, and radius exactly
2. Support RTL and LTR (test both directions mentally before finishing)
3. No hardcoded pixel values for spacing — use Tailwind scale
4. Loading states for all async actions (use composable loading ref)
5. Error display for all form fields (use fieldErrors from composable)
6. Empty states for lists
7. TypeScript — no `any`, no `@ts-ignore`
8. No console.log in final code

---

### AFTER IMPLEMENTATION
1. Run: npm run build
2. Fix ALL TypeScript and build errors
3. Run: npm run dev and verify no console errors
4. Report:
   - Files created
   - Files modified
   - i18n keys added
   - Any Figma values that couldn't be matched exactly (and why)
```
