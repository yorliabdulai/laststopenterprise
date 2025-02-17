import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import  supabase  from "../supabase/supabase"; // Ensure the correct import path

const useFetchCollection = (collectionName) => {
	const [data, setData] = useState([]);
	const [isLoading, setIsLoading] = useState(false);

	const fetchProductCollection = async () => {
		setIsLoading(true);
		try {
			const { data: fetchedData, error } = await supabase
				.from(collectionName)
				.select("*")
				.order("createdAt", { ascending: false });

			if (error) throw error;

			setData(fetchedData);
		} catch (error) {
			toast.error(error.message);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchProductCollection();

		// Subscribe to real-time updates
		const subscription = supabase
			.channel(collectionName)
			.on("postgres_changes", { event: "*", schema: "public", table: collectionName }, fetchProductCollection)
			.subscribe();

		return () => {
			supabase.removeChannel(subscription);
		};
	}, []);

	return { data, isLoading };
};

export default useFetchCollection;
