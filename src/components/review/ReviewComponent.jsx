import React from "react";
import StarsRating from "react-star-rate";

const ReviewComponent = ({ review }) => {
   const { userName, rating, review: comments, reviewDate, profileImage } = review;

   return (
      <main className="p-2 w-full border-2 rounded-md ">
         <section className="flex justify-between mb-2 flex-col lg:flex-row">
            <div className="flex items-start gap-2">
               <img
                  src={profileImage || "https://placeimg.com/80/80/people"} // Fallback image
                  alt="dp"
                  className="rounded-full w-14"
               />
               <div>
                  <h1 className="md:text-lg font-semibold">
                     {userName || "Anonymous"}
                  </h1>
                  <p className="text-gray-400">{new Date(reviewDate).toLocaleDateString()}</p>
               </div>
            </div>
            <StarsRating disabled value={rating} />
         </section>
         <p className="md:text-lg">{comments}</p>
      </main>
   );
};

export default ReviewComponent;
