import { useEffect, useState } from "react";
import  supabase  from "../supabase/supabase"; // Ensure correct import path

const useFetchDocument = (collectionName, documentId) => {
    const [document, setDocument] = useState(null);

    const getDocument = async () => {
        try {
            const { data, error } = await supabase
                .from(collectionName)
                .select("*")
                .eq("id", documentId)
                .single(); // Fetch only one record

            if (error) throw error;
            
            setDocument(data);
        } catch (error) {
            console.error("Error fetching document:", error.message);
        }
    };

    useEffect(() => {
        if (documentId) {
            getDocument();
        }
    }, [documentId]); // Fetch when documentId changes

    return { document };
};

export default useFetchDocument;
