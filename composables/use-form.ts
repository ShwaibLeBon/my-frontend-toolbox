export const useForm = <T extends Record<string, any>>(initialValues: T) => {
	const form = ref<T>({ ...initialValues });
	const reset = () => {
		form.value = { ...initialValues };
	};

	return { form, reset };
};
