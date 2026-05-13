<script setup lang="ts">
import type { Map, Marker } from 'leaflet'

interface Coords { lat: number; lng: number }

const props = withDefaults(defineProps<{
  modelValue: Coords
  zoom?: number
}>(), { zoom: 14 })

const emit = defineEmits<{
  'update:modelValue': [coords: Coords]
  'update:address':    [address: string]
}>()

const { locale } = useI18n()

const mapEl        = ref<HTMLElement | null>(null)
const address      = ref('')
const geocoding    = ref(false)
const locating     = ref(false)

let mapInstance:    Map    | null = null
let markerInstance: Marker | null = null

const DEFAULT_CENTER: Coords = { lat: 24.7136, lng: 46.6753 } // Riyadh

// ─── custom pin HTML ─────────────────────────────────────────────────────────
const PIN_HTML = `
<div class="swapo-pin">
  <div class="swapo-pin__ring"></div>
  <div class="swapo-pin__body">
    <svg viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 0C7.163 0 0 7.163 0 16c0 10.627 14.148 24.648 15.204 25.677a1.1 1.1 0 0 0 1.592 0C17.852 40.648 32 26.627 32 16 32 7.163 24.837 0 16 0Z" fill="#0B1A55"/>
      <circle cx="16" cy="16" r="6" fill="#10E6B4"/>
    </svg>
  </div>
</div>`

// ─── init ────────────────────────────────────────────────────────────────────
async function initMap() {
  if (!mapEl.value) return

  const L = await import('leaflet')

  const center: [number, number] = [
    props.modelValue.lat || DEFAULT_CENTER.lat,
    props.modelValue.lng || DEFAULT_CENTER.lng,
  ]

  mapInstance = L.map(mapEl.value, {
    center,
    zoom: props.zoom,
    zoomControl: false,
    attributionControl: true,
  })

  // Premium CartoDB Voyager tiles (free, no API key)
  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> © <a href="https://carto.com/attributions" target="_blank">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20,
  }).addTo(mapInstance)

  // Zoom control — bottom-start corner
  L.control.zoom({ position: 'bottomleft' }).addTo(mapInstance)

  // Custom pin
  const icon = L.divIcon({
    html:      PIN_HTML,
    className: '',
    iconSize:  [40, 52],
    iconAnchor:[20, 52],
  })

  markerInstance = L.marker(center, { draggable: true, icon }).addTo(mapInstance)

  markerInstance.on('dragend', onMarkerMove)
  mapInstance.on('click', (e) => {
    markerInstance?.setLatLng(e.latlng)
    onMarkerMove()
  })

  // Initial reverse geocode
  reverseGeocode(center[0], center[1])
}

function onMarkerMove() {
  if (!markerInstance) return
  const pos = markerInstance.getLatLng()
  emit('update:modelValue', { lat: pos.lat, lng: pos.lng })
  reverseGeocode(pos.lat, pos.lng)
}

// ─── reverse geocode ─────────────────────────────────────────────────────────
async function reverseGeocode(lat: number, lng: number) {
  geocoding.value = true
  try {
    const lang = locale.value === 'ar' ? 'ar' : 'en'
    const res = await $fetch<{ display_name?: string }>(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { 'Accept-Language': lang } },
    )
    if (res.display_name) {
      address.value = res.display_name
      emit('update:address', res.display_name)
    }
  } catch {
    // best-effort
  } finally {
    geocoding.value = false
  }
}

// ─── locate me ───────────────────────────────────────────────────────────────
function locateMe() {
  if (!navigator.geolocation || !mapInstance || !markerInstance) return
  locating.value = true
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude: lat, longitude: lng } = pos.coords
      markerInstance!.setLatLng([lat, lng])
      mapInstance!.flyTo([lat, lng], 16, { duration: 1.2 })
      emit('update:modelValue', { lat, lng })
      reverseGeocode(lat, lng)
      locating.value = false
    },
    () => { locating.value = false },
    { timeout: 8000 },
  )
}

onMounted(() => { initMap() })
onBeforeUnmount(() => {
  markerInstance?.remove()
  mapInstance?.remove()
  mapInstance = null
})
</script>

<template>
  <div class="flex flex-col gap-2">
    <!-- Map container -->
    <div class="relative overflow-hidden rounded-2xl shadow-[0_8px_32px_rgba(11,26,85,0.12)]">
      <!-- Tile map -->
      <div ref="mapEl" class="h-64 w-full" />

      <!-- Locate me button -->
      <button
        type="button"
        :disabled="locating"
        class="absolute bottom-3 inset-e-3 z-1000 flex size-10 items-center justify-center rounded-xl bg-white shadow-[0_2px_12px_rgba(11,26,85,0.18)] transition-transform active:scale-95 disabled:opacity-60"
        @click="locateMe"
      >
        <svg
          v-if="!locating"
          class="size-5 text-navy"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
          <path d="M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" fill="#10E6B4" stroke="none" />
          <circle cx="12" cy="12" r="9" />
        </svg>
        <!-- Loading spinner -->
        <svg v-else class="size-5 animate-spin text-navy" viewBox="0 0 24 24" fill="none">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      </button>
    </div>

    <!-- Address chip -->
    <div class="flex min-h-10 items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2">
      <svg class="size-4 shrink-0 text-green" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C8.134 2 5 5.134 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.866-3.134-7-7-7Zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z" />
      </svg>
      <p class="flex-1 truncate text-xs leading-5 text-grey-darker">
        <span v-if="geocoding" class="animate-pulse">…</span>
        <span v-else-if="address">{{ address }}</span>
      </p>
    </div>
  </div>
</template>

<style>
/* Leaflet base styles */
@import 'leaflet/dist/leaflet.css';

/* Custom premium pin */
.swapo-pin {
  position: relative;
  width: 40px;
  height: 52px;
}

.swapo-pin__ring {
  position: absolute;
  inset: 50% auto auto 50%;
  transform: translate(-50%, -50%);
  width: 56px;
  height: 56px;
  border-radius: 9999px;
  background: rgba(16, 230, 180, 0.25);
  animation: swapo-pulse 2s ease-out infinite;
}

.swapo-pin__body {
  position: absolute;
  inset: 0;
}

.swapo-pin__body svg {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 4px 8px rgba(11, 26, 85, 0.35));
}

@keyframes swapo-pulse {
  0%   { transform: translate(-50%, -50%) scale(0.6); opacity: 0.8; }
  70%  { transform: translate(-50%, -50%) scale(1.4); opacity: 0; }
  100% { transform: translate(-50%, -50%) scale(1.4); opacity: 0; }
}

/* Clean up Leaflet attribution */
.leaflet-control-attribution {
  font-size: 10px !important;
  background: rgba(255,255,255,0.7) !important;
  backdrop-filter: blur(4px);
  border-radius: 6px 0 0 0;
}
</style>
