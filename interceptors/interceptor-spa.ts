import type { APIResponse, Endpoint } from "~/types";
import { type FetchOptions, type FetchRequest, $fetch } from "ofetch";

const API_ENDPOINT_PROD = "https://prod.example.com/";
const API_ENDPOINT_TEST = "https://test.example.com/";

const $api = <T>(
	url: Endpoint,
	callback: Function,
	options?: FetchOptions<"json">
) => {
	const fetch = $fetch.create({
		baseURL:
			process.env.NODE_ENV !== "production"
				? API_ENDPOINT_TEST
				: API_ENDPOINT_PROD,

		onRequest({ request, options }) {
			// Setting up Authorization headers, from store.
			const authStore = useAuthStore();
			if (authStore.accessToken) {
				options.headers.set(
					"Authorization",
					`Bearer ${authStore.accessToken}`
				);
			}
		},
		onRequestError({ response, error }) {
			// intercept error on request (occurs mostly when user is not connected to the internet)
		},
		async onResponseError({ request, response, options, error }) {
			// prevents the refresh logic from running if the failed request was already to /your-refresh-token-endpoint
			if (typeof request === "string" && request.includes("refresh/")) {
				// I store the logout function in authentication store
				const authStore = useAuthStore();
				authStore.logout();
				return;
			}
			// The Status of 401 means that the use is not connected or his session ended
			// In that case, we have to refresh his token or log him out if his refresh expired
			if (response.status === 401) {
				const { refreshTokenOrLogout } = useAuthApi();
				await refreshTokenOrLogout(callback);

				return;
			}

			throw response;
		},
	} as FetchOptions);

	return fetch<T>(url, options);
};

// ----------------------------------------------------------------

// My custom HTTP methods, tried to mimick Axios'
// Note that all of them must receive a callback function as a parameter to use as callback when refreshing the token

// A Get function that returns the data that are paginated (with DRF's style which I use mostly)
const get = async <T>(
	url: Endpoint,
	callback: Function,
	options?: FetchOptions<"json">
) => {
	return await $api<APIResponse<T>>(url, callback, options);
};

// A get function that returns unpaginated data, a raw array
const getUnpaginated = async <T>(
	url: Endpoint,
	callback: Function,
	options?: FetchOptions<"json">
) => {
	return await $api<T[]>(url, callback, options);
};

// Function to get on object
const getOne = async <T>(
	url: Endpoint,
	callback: Function,
	options?: FetchOptions<"json">
) => {
	return await $api<T>(url, callback, options);
};

// A function to post data
const post = async <T>(
	url: Endpoint,
	data: any,
	callback: Function,
	options?: FetchOptions<"json">
) => {
	return await $api<T>(url, callback, {
		method: "POST",
		body: data as any,
		...options,
	});
};

// function for put method
const put = async <T>(
	url: Endpoint,
	data: any,
	callback: Function,
	options?: FetchOptions<"json">
) => {
	return await $api<T>(url, callback, {
		method: "PUT",
		body: data as any,
		...options,
	});
};

// function for patch method
const patch = async <T>(
	url: Endpoint,
	data: any,
	callback: Function,
	options?: FetchOptions<"json">
) => {
	return await $api<T>(url, callback, {
		method: "PATCH",
		body: data as any,
		...options,
	});
};

// function to delete
const _delete = async <T>(
	url: Endpoint,
	callback: Function,
	options?: FetchOptions<"json">
) => {
	return await $api<T>(url, callback, {
		method: "DELETE",
		...options,
	});
};

// And we export them with name api
// with Nuxt's auto import feature, you don't really have to import this api object
// use can use it directly like: api.get(), api.post() or api.delete()
// for that to work, you have to add this code into your nuxt config file
/*
	imports: {
		dirs: ["interceptors"],
	},
*/
export const api = {
	get,
	getUnpaginated,
	getOne,
	post,
	put,
	patch,
	delete: _delete,
};
