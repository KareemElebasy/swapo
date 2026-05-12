/**
 * useApi — Swapo HTTP client
 *
 * القواعد المبنية على الـ Postman collection:
 * - كل requests FormData حتى اللي مفيهاش files
 * - الـ backend بيستخدم _method override بدل PUT / PATCH / DELETE
 * - مفيش Content-Type header — browser يحدده تلقائياً مع FormData
 */

import type { UseFetchOptions } from "nuxt/app";
import type { ApiError } from "~/types/api";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
type ApiBody = Record<string, unknown> | object | FormData;

interface UseApiOptions<T> extends Omit<
  UseFetchOptions<T>,
  "method" | "baseURL" | "body"
> {
  method?: HttpMethod;
  useGeneral?: boolean;
  body?: ApiBody;
}

// ─── buildFormData ─────────────────────────────────────────────────────────────
// يحوّل أي object لـ FormData ويضيف _method override لو محتاج
function buildFormData(
  body: ApiBody,
  methodOverride?: string,
): FormData {
  if (body instanceof FormData) {
    if (methodOverride && !["GET", "POST"].includes(methodOverride)) {
      body.set("_method", methodOverride.toLowerCase());
    }
    return body;
  }

  const fd = new FormData();

  for (const [key, value] of Object.entries(body as Record<string, unknown>)) {
    if (value === undefined || value === null) continue;

    if (Array.isArray(value)) {
      // مثال: cart_items_id[0], draft_ids[0]
      value.forEach((item, i) => {
        if (item instanceof File) fd.append(`${key}[${i}]`, item);
        else fd.append(`${key}[${i}]`, String(item));
      });
    } else if (value instanceof File) {
      fd.append(key, value);
    } else if (typeof value === "object") {
      fd.append(key, JSON.stringify(value));
    } else {
      fd.append(key, String(value));
    }
  }

  // _method override للـ PUT / PATCH / DELETE
  if (methodOverride && !["GET", "POST"].includes(methodOverride)) {
    fd.set("_method", methodOverride.toLowerCase());
  }

  return fd;
}

// ─── useApi (useFetch wrapper — للـ SSR وال reactivity) ───────────────────────
export function useApi<T = unknown>(
  path: string,
  options: UseApiOptions<T> = {},
) {
  const config = useRuntimeConfig();
  const { $i18n } = useNuxtApp();
  const authStore = useAuthStore();

  const { useGeneral = false, method = "GET", body, ...fetchOptions } = options;
  const baseURL = useGeneral ? config.public.apiGeneral : config.public.apiBase;

  const headers: Record<string, string> = {
    Accept: "application/json",
    "Accept-Language": ($i18n?.locale?.value as string) ?? "ar",
  };
  if (authStore.token) headers.Authorization = `Bearer ${authStore.token}`;

  // لو POST/PUT/PATCH/DELETE — حوّل body لـ FormData
  const isWrite = method !== "GET";
  const formBody =
    isWrite && body
      ? buildFormData(body, method !== "POST" ? method : undefined)
      : undefined;

  return useFetch<T>(path, {
    baseURL,
    headers,
    method: isWrite ? "post" : "get",
    body: formBody,
    onResponseError({ response }: { response: { status: number } }) {
      if (response.status === 401) {
        authStore.logout();
        navigateTo("/auth/login");
      }
    },
    ...fetchOptions,
  } as unknown as Parameters<typeof useFetch<T>>[1]);
}

// ─── apiFetch (one-shot async — للـ actions في composables) ───────────────────
export async function apiFetch<T = unknown>(
  path: string,
  options: {
    method?: HttpMethod;
    body?: ApiBody;
    query?: Record<string, unknown>;
    useGeneral?: boolean;
    registrationToken?: string; // للـ complete-data فقط
  } = {},
): Promise<T> {
  const config = useRuntimeConfig();
  const { $i18n } = useNuxtApp();
  const authStore = useAuthStore();

  const {
    useGeneral = false,
    method = "GET",
    body,
    query,
    registrationToken,
  } = options;
  const baseURL = useGeneral ? config.public.apiGeneral : config.public.apiBase;

  const headers: Record<string, string> = {
    Accept: "application/json",
    "Accept-Language": ($i18n?.locale?.value as string) ?? "ar",
  };

  const token = registrationToken ?? authStore.token;
  if (token) headers.Authorization = `Bearer ${token}`;

  // لو write request — حوّل لـ FormData (مش JSON)
  const isWrite = method !== "GET";
  const formBody = isWrite
    ? buildFormData(body ?? {}, method !== "POST" ? method : undefined)
    : undefined;

  try {
    return await $fetch<T>(`${baseURL}${path}`, {
      method: isWrite ? "post" : "get",
      headers,
      body: formBody,
      params: query,
      onResponseError({ response }) {
        if (response.status === 401) {
          authStore.logout();
          navigateTo("/auth/login");
        }
      },
    });
  } catch (error: unknown) {
    const fetchError = error as { data?: ApiError; status?: number };
    if (fetchError.data?.errors || fetchError.data?.message) {
      throw fetchError.data;
    }
    throw error;
  }
}
