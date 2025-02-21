import { Link } from "react-router-dom";
// lazy load
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import { formatPrice } from "../../utils/formatPrice";

const OrderTable = ({ user, order }) => {
  return (
    <div className="overflow-x-auto">
      <table className="table table-compact w-full">
        <thead>
          <tr>
            <th className="text-sm md:text-lg">Product</th>
            <th className="text-sm md:text-lg">Price</th>
            <th className="text-sm md:text-lg">Quantity</th>
            <th className="text-sm md:text-lg">Total</th>
            {user && <th className="text-sm md:text-lg">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {(order?.items || []).map((item, index) => {
            const {
              id: productId = "",
              name = "Unnamed Product",
              price = 0,
              imageURL = "",
              qty = 0,
            } = item || {};

            return (
              <tr key={index} className="border-b">
                {/* Product Details */}
                <td className="py-2">
                  <Link to={`/product-details/${productId}`} className="flex items-center space-x-3">
                    <LazyLoadImage
                      src={imageURL || "https://storage.googleapis.com/proudcity/mebanenc/uploads/2021/03/placeholder-image.png"}
                      alt={name}
                      className="w-10 sm:w-24 object-fill"
                      placeholderSrc="https://www.slntechnologies.com/wp-content/uploads/2017/08/ef3-placeholder-image.jpg"
                      effect="blur"
                    />
                    <span className="md:text-lg">{name}</span>
                  </Link>
                </td>

                {/* Price */}
                <td className="md:text-lg font-medium">{formatPrice(Number(price))}</td>

                {/* Quantity */}
                <td className="md:text-lg font-medium">{qty}</td>

                {/* Total Price */}
                <td className="md:text-lg font-medium text-primary">
                  {formatPrice(Number(price) * Number(qty))}
                </td>

                {/* Actions */}
                {user && (
                  <td>
                    <Link
                      to={`/review-product/${productId}`}
                      className="border p-2 rounded-md md:text-lg text-blue-500 hover:underline"
                    >
                      Write a Review
                    </Link>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default OrderTable;
