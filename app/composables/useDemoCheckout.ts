import type { Money } from '~/types/money'

export type DemoShippingMethodId = 'standard' | 'express'

export interface DemoCheckoutAddress {
  id: string
  fullName: string
  phone: string
  city: string
  district: string
  line1: string
  details?: string
}

export interface DemoShippingMethod {
  id: DemoShippingMethodId
  price: Money
  icon: string
}

export interface DemoCheckoutAddressDraft {
  fullName: string
  phone: string
  city: string
  district: string
  line1: string
  details: string
}

const shippingMethods: DemoShippingMethod[] = [
  {
    id: 'standard',
    icon: '🚚',
    price: {
      amount: 120,
      currency: 'SAR',
    },
  },
  {
    id: 'express',
    icon: '⚡',
    price: {
      amount: 220,
      currency: 'SAR',
    },
  },
]

const emptyAddressDraft: DemoCheckoutAddressDraft = {
  fullName: '',
  phone: '',
  city: '',
  district: '',
  line1: '',
  details: '',
}

const demoAddress: DemoCheckoutAddress = {
  id: 'demo-address-primary',
  fullName: 'Swapo Buyer',
  phone: '+966 500 000 000',
  city: 'Riyadh',
  district: 'Al Nakheel',
  line1:
    'Al Nakheel District, Prince Turki Bin Abdulaziz Street, Riyadh, Southern Region, Saudi Arabia',
}

function draftFromAddress(address: DemoCheckoutAddress): DemoCheckoutAddressDraft {
  return {
    fullName: address.fullName,
    phone: address.phone,
    city: address.city,
    district: address.district,
    line1: address.line1,
    details: address.details ?? '',
  }
}

export function useDemoCheckout() {
  const address = useState<DemoCheckoutAddress | null>(
    'demo-checkout-address',
    () => null,
  )
  const addressDraft = useState<DemoCheckoutAddressDraft>(
    'demo-checkout-address-draft',
    () => ({ ...emptyAddressDraft }),
  )
  const selectedShippingId = useState<DemoShippingMethodId | null>(
    'demo-checkout-shipping-method',
    () => null,
  )
  const notes = useState<string>('demo-checkout-notes', () => '')
  const submitted = useState<boolean>('demo-checkout-submitted', () => false)

  const selectedShippingMethod = computed(() =>
    shippingMethods.find((method) => method.id === selectedShippingId.value),
  )

  function startAddressEdit() {
    addressDraft.value = address.value
      ? draftFromAddress(address.value)
      : { ...emptyAddressDraft }
  }

  function useSampleAddress() {
    address.value = { ...demoAddress }
    addressDraft.value = draftFromAddress(demoAddress)
    selectedShippingId.value = 'express'
  }

  function saveAddress() {
    const draft = addressDraft.value

    address.value = {
      id: address.value?.id ?? 'demo-address-primary',
      fullName: draft.fullName.trim(),
      phone: draft.phone.trim(),
      city: draft.city.trim(),
      district: draft.district.trim(),
      line1: draft.line1.trim(),
      details: draft.details.trim() || undefined,
    }

    if (!selectedShippingId.value) {
      selectedShippingId.value = 'express'
    }
  }

  function selectShippingMethod(methodId: DemoShippingMethodId) {
    selectedShippingId.value = methodId
  }

  function submitCheckout() {
    submitted.value = true
  }

  return {
    address,
    addressDraft,
    notes,
    selectedShippingId,
    selectedShippingMethod,
    shippingMethods,
    submitted,
    saveAddress,
    selectShippingMethod,
    startAddressEdit,
    submitCheckout,
    useSampleAddress,
  }
}
