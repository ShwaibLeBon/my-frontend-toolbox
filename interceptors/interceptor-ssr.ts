import { $fetch, type FetchOptions } from "ofetch";
import type { InternalApi } from "nitropack/types";

// Internal API path and method types
type ApiPath = keyof InternalApi;
type ApiMethod<P extends ApiPath> = keyof InternalApi[P];

// The core API function with interceptors and type-safe method
export function $api<P extends ApiPath, M extends ApiMethod<P>>(
	url: P,
	callback: Function,
	options?: FetchOptions,
	method?: M
): Promise<InternalApi[P][M]> {
	const fetch = $fetch.create({
		...options,
		onRequest({ options }) {},
		onRequestError({ response }) {
			// intercept error on request (occurs mostly when user is not connected to the internet)
		},
		async onResponseError({ request, response, error }) {
			// prevents the refresh logic from running if the failed request was already to /your-refresh-token-endpoint
			if (
				typeof request === "string" &&
				request.includes("/api/auth/refresh-token")
			) {
				// I store the logout function in authentication store
				const authStore = useAuthStore();
				authStore.logout();
				return;
			}

			// The Status of 401 means that the use is not connected or his session ended
			// In that case, we have to refresh his token or log him out if his refresh expired
			if (response.status === 401) {
				const { refreshTokenOrLogout } = useAuth();
				await refreshTokenOrLogout(callback);
			}
		},
	});
	return fetch(url, { ...options, method } as FetchOptions<"json">);
}

// GET helper: Only valid for endpoints supporting the "default"/GET method
export function get<P extends ApiPath>(
	url: P,
	callback: Function,
	options?: FetchOptions
): P extends ApiPath
	? Promise<
			"default" extends keyof InternalApi[P]
				? InternalApi[P]["default"]
				: never
	  >
	: never {
	return $api(url, callback, options, "get" as ApiMethod<P>) as any;
}

// POST helper: Only valid for endpoints supporting the "post" method
export function post<P extends ApiPath>(
	url: P,
	data: any,
	callback: Function,
	options?: FetchOptions
): P extends ApiPath
	? Promise<
			"post" extends keyof InternalApi[P] ? InternalApi[P]["post"] : never
	  >
	: never {
	return $api(
		url,
		callback,
		{ ...options, body: data },
		"post" as ApiMethod<P>
	) as any;
}

// PATCH helper: Only valid for endpoints supporting the "patch" method
export function patch<P extends ApiPath>(
	url: P,
	data: any,
	callback: Function,
	options?: FetchOptions
): P extends ApiPath
	? Promise<
			"patch" extends keyof InternalApi[P]
				? InternalApi[P]["patch"]
				: never
	  >
	: never {
	return $api(
		url,
		callback,
		{ ...options, body: data },
		"patch" as ApiMethod<P>
	) as any;
}

// GET ONE helper (same as GET, could be specialized if you want)
export function getOne<P extends ApiPath>(
	url: P,
	callback: Function,
	options?: FetchOptions
): P extends ApiPath
	? Promise<
			"default" extends keyof InternalApi[P]
				? InternalApi[P]["default"]
				: never
	  >
	: never {
	return $api(url, callback, options, "default" as ApiMethod<P>) as any;
}

export function _delete<P extends ApiPath>(
	url: P,
	callback: Function,
	options?: FetchOptions
): P extends ApiPath
	? Promise<
			"delete" extends keyof InternalApi[P]
				? InternalApi[P]["delete"]
				: never
	  >
	: never {
	return $api(url, callback, options, "delete" as ApiMethod<P>) as any;
}

// Export helpers as an object for easy import
export const api = { get, post, patch, getOne, delete: _delete };
