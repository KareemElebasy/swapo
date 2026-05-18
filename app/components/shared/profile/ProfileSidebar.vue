<script setup lang="ts">
type ProfileRole = "buyer" | "seller";

interface ProfileNavItemConfig {
  to: string;
  labelKey?: string;
  label?: string;
  icon?: string;
  exact?: boolean;
  badge?: string | number;
}

interface ProfileNavSection {
  labelKey?: string;
  label?: string;
  items: ProfileNavItemConfig[];
}

interface Props {
  role: ProfileRole;
  sections?: ProfileNavSection[];
  showLogout?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  sections: undefined,
  showLogout: true,
});

const emit = defineEmits<{
  logout: [];
}>();

const { t } = useI18n();

const defaultSections: Record<ProfileRole, ProfileNavSection[]> = {
  buyer: [
    {
      items: [
        { to: "/orders", labelKey: "profile.nav.purchases", icon: "orders" },
        {
          to: "/profile/addresses",
          labelKey: "profile.nav.addresses",
          icon: "addresses",
        },
        {
          to: "/profile/account",
          labelKey: "profile.nav.profile",
          icon: "user",
          exact: true,
        },
        {
          to: "/profile/settings",
          labelKey: "profile.nav.settings",
          icon: "settings",
        },
        {
          to: "/profile/about",
          labelKey: "profile.nav.about",
          icon: "info",
        },
        {
          to: "/profile/policy",
          labelKey: "profile.nav.policy",
          icon: "policy",
        },
        {
          to: "/profile/support",
          labelKey: "profile.nav.support",
          icon: "support",
        },
      ],
    },
  ],
  seller: [
    {
      labelKey: "profile.sections.account",
      items: [
        {
          to: "/seller/account",
          labelKey: "profile.nav.profile",
          icon: "user",
          exact: true,
        },
        {
          to: "/seller/orders",
          labelKey: "profile.nav.incomingOrders",
          icon: "orders",
        },
        {
          to: "/seller/purchases",
          labelKey: "profile.nav.purchases",
          icon: "purchases",
        },
        {
          to: "/seller/addresses",
          labelKey: "profile.nav.addresses",
          icon: "addresses",
        },
        {
          to: "/seller/wallet",
          labelKey: "profile.nav.wallet",
          icon: "wallet",
        },
      ],
    },
    {
      labelKey: "profile.sections.management",
      items: [
        {
          to: "/seller/data",
          labelKey: "profile.nav.bankAccount",
          icon: "bankAccount",
        },
        {
          to: "/seller/drafts",
          labelKey: "profile.nav.drafts",
          icon: "drafts",
        },
        {
          to: "/seller/subscriptions",
          labelKey: "profile.nav.subscriptions",
          icon: "subscriptions",
        },
        {
          to: "/seller/auto-replies",
          labelKey: "profile.nav.autoReplies",
          icon: "autoReplies",
        },
        {
          to: "/seller/business-location",
          labelKey: "profile.nav.businessLocation",
          icon: "location",
        },
      ],
    },
    {
      labelKey: "profile.sections.settings",
      items: [
        {
          to: "/seller/settings",
          labelKey: "profile.nav.settings",
          icon: "settings",
        },
        {
          to: "/seller/about",
          labelKey: "profile.nav.about",
          icon: "info",
        },
        {
          to: "/seller/policy",
          labelKey: "profile.nav.policy",
          icon: "policy",
        },
        {
          to: "/seller/support",
          labelKey: "profile.nav.support",
          icon: "support",
        },
      ],
    },
  ],
};

const navSections = computed(
  () => props.sections ?? defaultSections[props.role],
);

function labelFor(item: ProfileNavItemConfig) {
  return item.label ?? (item.labelKey ? t(item.labelKey) : "");
}

function sectionLabel(section: ProfileNavSection) {
  return section.label ?? (section.labelKey ? t(section.labelKey) : "");
}
</script>

<template>
  <aside
    class="w-full md:max-w-79.5 shrink-0 rounded-sm bg-grey-light-active p-2"
  >
    <nav class="flex flex-col gap-2" :aria-label="t('profile.navLabel')">
      <section
        v-for="(section, sectionIndex) in navSections"
        :key="section.labelKey ?? section.label ?? sectionIndex"
        :class="[
          'flex flex-col',
          sectionIndex > 0 ? 'border-t border-blue-light pt-2' : '',
        ]"
      >
        <p
          v-if="sectionLabel(section)"
          class="px-4 pb-1 text-end text-xs font-medium leading-5 text-grey-dark-hover"
        >
          {{ sectionLabel(section) }}
        </p>

        <div class="flex flex-col">
          <SharedProfileNavItem
            v-for="item in section.items"
            :key="item.to"
            :to="item.to"
            :label="labelFor(item)"
            :exact="item.exact"
            :badge="item.badge"
          >
            <template #icon>
              <SharedProfileNavIcon :name="item.icon" />
            </template>
          </SharedProfileNavItem>
        </div>
      </section>

      <button
        v-if="showLogout"
        type="button"
        class="flex min-h-12.5 items-center rounded-xs p-3 gap-2 text-base font-normal tracking-[-0.15px] text-black-normal transition-colors hover:bg-grey-normal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-normal"
        @click="emit('logout')"
      >
        <span
          class="flex size-5 shrink-0 items-center rtl:rotate-180 justify-center"
          aria-hidden="true"
        >
          <SharedProfileNavIcon name="logout" />
        </span>
        <span class="min-w-0 truncate">{{ t("profile.nav.logout") }}</span>
      </button>
    </nav>
  </aside>
</template>
