export function formatMoney(
	amount: number | string | null | undefined
): string {
	const formatter = new Intl.NumberFormat("fr-FR", {
		style: "currency",
		currency: "FBu",
	});
	return amount ? formatter.format(Number(amount)) : formatter.format(0);
}
