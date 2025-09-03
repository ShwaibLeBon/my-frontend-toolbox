export interface APIResponse<T> {
	count: number;
	next: string | null;
	previous: string | null;
	results: Array<T>;
}

export type Endpoint = "";
