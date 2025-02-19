import { Link } from "react-router-dom";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import { formatPrice } from "../../utils/formatPrice";
import { useSelector } from "react-redux";

const OrderTable = () => {
  const orderedProducts = useSelector((state) => state.orders.orderedProducts);
  return (
    <div className="overflow-x-auto">
      <table className="table table-compact w-full">
        <thead>
          <tr>
            <th className="text-sm md:text-lg">Product</th>
            {user && <th className="text-sm md:text-lg">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {/* Use order.items instead of order.cartItems */}
          {orderedProducts.map((product, index) => {
            // Destructure values safely
            const { id: productId, name, price, imageURL, qty } = product || {};

            return (
              <tr key={index}>
                <td>
                  <Link to={`/product-details`}>
                    <LazyLoadImage
                      src={
                        product.imageURL ||
                        `https://storage.googleapis.com/proudcity/mebanenc/uploads/2021/03/placeholder-image.png`
                      }
                      alt={product.name || "Product"}
                      className="w-10 sm:w-24 object-fill"
                      placeholderSrc="https://www.slntechnologies.com/wp-content/uploads/2017/08/ef3-placeholder-image.jpg"
                      effect="blur"
                    />
                    <div className="md:text-lg">{name || "Unnamed Product"}</div>
                    <div className="md:text-lg font-medium">
                      Qty:{" "}
                      <span className="md:text-lg font-medium text-primary">
                        {product.qty || 0}
                      </span>
                    </div>
                    <div className="md:text-lg font-medium">
                      Total:{" "}
                      <span className="md:text-lg font-medium text-primary">
                        {formatPrice((product.price || 0) * (qty || 0))}
                      </span>
                    </div>
                  </Link>
                </td>
                {user && (
                  <td>
                    <Link
                      to={`/review-product/${productId}`}
                      className="border p-2 rounded-md md:text-lg"
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
