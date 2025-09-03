import type { H3Event } from "h3";
import { type FetchOptions, $fetch } from "ofetch";

const API_ENDPOINT = "https://your.api.endpoint.com/";

export const $api = <T>(
	event: H3Event,
	url: string,
	options?: FetchOptions<"json">
) => {
	const fetch = $fetch.create({
		baseURL: API_ENDPOINT,
		credentials: "include",
		throwHttpErrors: true,
		onRequest({ request, options }) {
			const cookie = getCookie(event, "access");
			options.headers.set(
				"Authorization",
				cookie ? `Bearer ${cookie}` : ""
			);
		},
		onResponse({ response }) {
			if (response.status === 401) {
				throw createError({
					status: 401,
					message: "Token is invalid or expired",
					statusMessage: "Unauthorized",
				});
			}
		},
		onResponseError({ error }) {
			console.log("ON RESPONSE ERROR", error);
			// throw error
		},
	} as FetchOptions);

	return fetch<T>(url, options);
};

const get = <T>(
	event: H3Event,
	url: string,
	options?: FetchOptions<"json">
): Promise<T> => {
	return $api<T>(event, url, options);
};
const post = <T>(
	event: H3Event,
	url: string,
	data: any,
	options?: FetchOptions<"json">
): Promise<T> => {
	return $api<T>(event, url, {
		body: data,
		method: "POST",
		...options,
	});
};
const patch = <T>(
	event: H3Event,
	url: string,
	data: any,
	options: FetchOptions<"json">
): Promise<T> => {
	return $api<T>(event, url, { ...options, body: data, method: "PATCH" });
};
const getOne = <T>(
	event: H3Event,
	url: string,
	options?: FetchOptions<"json">
): Promise<T> => {
	return $api<T>(event, url, options);
};

const _delete = (
	event: H3Event,
	url: string,
	options?: FetchOptions<"json">
) => {
	return $api(event, url, { ...options, method: "DELETE" });
};

export const server = { get, post, patch, delete: _delete, getOne };
