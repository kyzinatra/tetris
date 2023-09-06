export function numberFormatter(num: number): string {
	return Intl.NumberFormat("ru-RU", { notation: "standard", signDisplay: "never" }).format(num);
}
