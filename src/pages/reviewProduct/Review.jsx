import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "../../components";
import { formatPrice } from "../../utils/formatPrice";
import { toast } from "react-toastify";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import StarsRating from "react-star-rate";
import { useSelector } from "react-redux";
import supabase from "../../supabase/supabase";

const Review = () => {
    const [rating, setRating] = useState(0);
    const [review, setReview] = useState("");
    const [profileImage, setProfileImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { id } = useParams();
    const { products } = useSelector((store) => store.product);
    const { userId, userName } = useSelector((store) => store.auth);

    const filteredProduct = products.find((item) => item.id === id);

    // Upload Profile Image to Supabase
    const uploadProfileImage = async (file) => {
        if (!file) return null;
        const fileName = `profile-${userId}-${Date.now()}`;
        const { data, error } = await supabase.storage
            .from("profile-images")
            .upload(fileName, file);

        if (error) {
            toast.error("Error uploading image");
            return null;
        }

        // Get Public URL
        const { data: urlData } = supabase.storage
            .from("profile-images")
            .getPublicUrl(fileName);

        return urlData.publicUrl;
    };

    async function submitReview(e) {
        e.preventDefault();

        if (rating === 0 || !review.trim()) {
            toast.error("Please add a rating and write a review.");
            return;
        }

        setLoading(true);
        try {
            let profileImageUrl = await uploadProfileImage(profileImage);

            const reviewConfig = {
                user_id: userId,
                user_name: userName,
                product_id: id,
                review,
                rating,
                review_date: new Date().toISOString(),
                profile_image: profileImageUrl || null, // Store image URL or null
                createdAt: new Date().toISOString(),
            };

            const { error } = await supabase.from("reviews").insert([reviewConfig]);
            if (error) throw error;

            toast.success("Thanks for sharing your feedback!");
            setRating(0);
            setReview("");
            setProfileImage(null);
            navigate(`/product-details/${id}`);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <Header text="Review" />
            {filteredProduct === null ? (
                <h1 className="text-2xl font-bold"> No product Found </h1>
            ) : (
                <main className="w-full mx-auto px-2 md:w-9/12 md:px-6 mt-6">
                    <section className="flex justify-evenly items-center flex-col lg:flex-row p-6">
                        <div className="flex flex-col gap-5">
                            <h1 className="font-light text-primary text-xl">
                                {filteredProduct.name}
                            </h1>
                            <div className="flex gap-4 items-center">
                                <LazyLoadImage
                                    src={filteredProduct.imageURL}
                                    alt="image"
                                    className="w-10 sm:w-32 object-fill"
                                    placeholderSrc="https://www.slntechnologies.com/wp-content/uploads/2017/08/ef3-placeholder-image.jpg"
                                    effect="blur"
                                />
                                <div>
                                    <p className="font-semibold">{filteredProduct.brand}</p>
                                    <p className="font-semibold">
                                        {formatPrice(filteredProduct.price)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <form
                            onSubmit={submitReview}
                            className="p-4 w-full md:w-[30rem] rounded-md shadow-lg flex flex-col"
                        >
                            <h1 className="font-semibold">Rating: </h1>
                            <StarsRating
                                value={rating}
                                onChange={(rating) => setRating(rating)}
                            />
                            <textarea
                                className="textarea textarea-secondary mt-2 max-w-[100%] w-full"
                                placeholder="Write your review..."
                                rows={5}
                                value={review}
                                onChange={(e) => setReview(e.target.value)}
                            ></textarea>

                            <label className="mt-3 text-sm font-semibold">
                                Upload Profile Image (Optional):
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="mt-1"
                                    onChange={(e) => setProfileImage(e.target.files[0])}
                                />
                            </label>

                            <button type="submit" className="btn btn-primary mt-3" disabled={loading}>
                                {loading ? "Submitting..." : "Submit Review"}
                            </button>
                        </form>
                    </section>
                </main>
            )}
        </>
    );
};

export default Review;
