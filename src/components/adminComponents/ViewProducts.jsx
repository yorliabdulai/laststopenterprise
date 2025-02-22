import { useEffect, useState } from "react";
import Loader from "../loader/Loader";
import { toast } from "react-toastify";
import { formatPrice } from "../../utils/formatPrice";
import { BiEdit, BiTrash } from "react-icons/bi";
import { Link } from "react-router-dom";
import { Search } from "../../components";
import useFetchCollection from "../../hooks/useFetchCollection";
import supabase  from "../../supabase/supabase";
import { useDispatch, useSelector } from "react-redux";
import { storeProducts } from "../../redux/slice/productSlice";
import { filterBySearch } from "../../redux/slice/filterSlice";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";



const ViewProducts = () => {
  const [search, setSearch] = useState("");
  const dispatch = useDispatch();

  //! Fetching Products from collection using Custom Hook
  const { data, isLoading } = useFetchCollection("products");
  const { filteredProducts } = useSelector((store) => store.filter);
  const { products } = useSelector((store) => store.product);

  useEffect(() => {
    dispatch(storeProducts({ products: data }));
  }, [dispatch, data]);

  //! Search
  useEffect(() => {
    dispatch(filterBySearch({ products: data, search }));
  }, [dispatch, data, search]);

  //! Delete single product
  const deleteSingleProduct = async (id, imageURL) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }
  
    try {
      // Deleting product from Supabase database
      const { error: deleteError } = await supabase.from("products").delete().eq("id", id);
      if (deleteError) throw deleteError;
  
      // Extract file path from the imageURL
      const filePath = imageURL.split("/").pop(); // Get only the filename
      const { error: storageError } = await supabase.storage.from("products").remove([filePath]);
      if (storageError) throw storageError;
  
      // Fetch updated products after deletion
      const { data: updatedData, error: fetchError } = await supabase.from("products").select("*");
      if (fetchError) throw fetchError;
  
      // Dispatch updated data to Redux
      dispatch(storeProducts({ products: updatedData }));
  
      toast.success("Product deleted successfully");
    } catch (error) {
      toast.error(`Delete failed: ${error.message}`);
    }
  };
  
  

  return (
    <>
      {isLoading && <Loader />}
      <h1 className="text-xl md:text-3xl font-semibold ">All Products</h1>
      {products.length && (
        <div>
          <div className="underline">
            <span className="text-lg font-bold ">{filteredProducts.length} </span> products found
          </div>
        </div>
      )}
      <Search value={search} onChange={(e) => setSearch(e.target.value)} />
      <main className="md:max-w-[100vw] max-h-[70vh] py-4 overflow-y-scroll ">
        {filteredProducts.length === 0 ? (
          <h1 className="text-4xl font-bold text-red-500">NO PRODUCTS FOUND</h1>
        ) : (
          <div className="overflow-x-auto mt-2 w-full">
            <table className="table table-compact w-full">
              {/* TABLE HEAD */}
              <thead>
                <tr>
                  <th className="text-md sm:text-lg "></th>
                  <th className="text-md sm:text-lg">Image</th>
                  <th className="text-md sm:text-lg ">Name</th>
                  <th className="text-md sm:text-lg">Category</th>
                  <th className="text-md sm:text-lg">Price</th>
                  <th className="text-md sm:text-lg">Options</th>
                </tr>
              </thead>
              {/* TABLE BODY */}
              <tbody>
                {filteredProducts?.map((p, index) => {
                  const { id, name, category, price, imageURL } = p;
                  return (
                    <tr key={id} className="hover">
                      <td>{index + 1}</td>
                      <td>
                        <div>
                          <LazyLoadImage
                            src={
                              imageURL ||
                              `https://storage.googleapis.com/proudcity/mebanenc/uploads/2021/03/placeholder-image.png`
                            }
                            alt={name}
                            className="w-10 sm:w-16 object-fill"
                            placeholderSrc="https://www.slntechnologies.com/wp-content/uploads/2017/08/ef3-placeholder-image.jpg"
                            effect="blur"
                          />
                        </div>
                      </td>
                      <td className="text-lg font-light w-[200px] ">{name}</td>
                      <td className="text-lg font-light">{category}</td>
                      <td className="text-lg font-light">{formatPrice(price)}</td>
                      <td>
                        <div className="flex flex-col md:flex-row gap-2 ">
                          <Link to={`/admin/add-product/${id}`}>
                            <BiEdit size={24} color="blue" />
                          </Link>
                          <label htmlFor="my-modal-6" className="modal-button">
                            <BiTrash
                              size={24}
                              color="red"
                              className="cursor-pointer"
                              onClick={() => {
                                deleteSingleProduct(id, imageURL);
                              }}
                            />
                          </label>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  );
};

export default ViewProducts;
