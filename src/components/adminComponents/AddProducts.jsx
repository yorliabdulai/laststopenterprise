import React, { useState } from "react";
import { toast } from "react-toastify";
import Loader from "../loader/Loader";
import { useNavigate, useParams } from "react-router-dom";
import { categories } from "../../utils/adminProductCategories";
import { defaultValues } from "../../utils/adminAddProductDefaultValues";
import { useSelector } from "react-redux";
import supabase from "../../supabase/supabase";

const AddProducts = () => {
  const navigate = useNavigate();
  const { id: paramsId } = useParams();
  const { products: reduxProducts } = useSelector((store) => store.product);
  const productEdit = reduxProducts.find((item) => item.id === paramsId);

  const [product, setProduct] = useState(() =>
    paramsId === "ADD" ? defaultValues : productEdit || defaultValues
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const filePath = `products/${Date.now()}_${file.name}`;
    setIsLoading(true);

    const { data, error } = await supabase.storage
      .from("product-images")
      .upload(filePath, file);

    if (error) {
      toast.error(error.message);
      setIsLoading(false);
      return;
    }

    const { data: urlData, error: urlError } = supabase.storage
      .from("product-images")
      .getPublicUrl(filePath);
    if (urlError) {
      toast.error(urlError.message);
      setIsLoading(false);
      return;
    }

    setProduct((prev) => ({ ...prev, imageURL: urlData.publicUrl }));
    toast.success("Image uploaded successfully");
    setIsLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (Object.values(product).some((field) => !field)) {
      toast.error("All fields are required");
      setIsLoading(false);
      return;
    }

    const productData = {
      ...product,
      price: Number(product.price),
      createdAt: new Date().toISOString(),
    };

    let error;
    if (paramsId === "ADD") {
      ({ error } = await supabase.from("products").insert([productData]));
    } else {
      ({ error } = await supabase.from("products").update(productData).eq("id", paramsId));
    }

    if (error) {
      toast.error("Something went wrong");
    } else {
      toast.success(
        paramsId === "ADD" ? "Product added successfully" : "Product updated successfully"
      );
      navigate("/admin/all-products");
    }

    setProduct(defaultValues);
    setIsLoading(false);
  };

  return (
    <>
      {isLoading && <Loader />}
      <main className="h-full border-r-2 p-1">
        <h1 className="text-xl md:text-3xl font-semibold pb-3">
          {paramsId === "ADD" ? "Add New Product" : "Edit Product"}
        </h1>
        <form className="form-control" onSubmit={handleSubmit}>
          <div className="py-2">
            <label className="label-text font-bold mb-2 block text-lg">Product Name:</label>
            <input
              className="input input-bordered max-w-lg w-full border-2"
              type="text"
              name="name"
              value={product.name || ""}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="py-2">
            <label className="label-text font-bold mb-2 block text-lg">Product Price:</label>
            <input
              className="input input-bordered max-w-lg w-full border-2"
              type="number"
              name="price"
              value={product.price || ""}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="py-2">
            <label className="label-text font-bold mb-2 block text-lg">Product Category:</label>
            <select
              className="select select-bordered w-full max-w-lg"
              name="category"
              value={product.category || ""}
              onChange={handleInputChange}
              required
            >
              <option disabled value="">-- Choose a Product Category --</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="py-2">
            <label className="label-text font-bold mb-2 block text-lg">Product Brand:</label>
            <input
              className="input input-bordered max-w-lg w-full border-2"
              type="text"
              name="brand"
              value={product.brand || ""}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="py-2">
            <label className="label-text font-bold mb-2 block text-lg">Product Description:</label>
            <textarea
              className="textarea textarea-bordered h-32 max-w-lg w-full"
              name="description"
              value={product.description || ""}
              onChange={handleInputChange}
              required
            ></textarea>
          </div>

          <div>
            <label className="label-text font-bold mb-2 block text-lg">Product Image:</label>
            <input
              className="max-w-lg w-full"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              required={!product.imageURL}
            />
            {product.imageURL && (
              <input
                className="input input-sm input-bordered max-w-lg w-full my-2"
                type="text"
                value={product.imageURL}
                disabled
              />
            )}
          </div>

          <button type="submit" className="btn btn-primary text-lg max-w-[200px] mt-2">
            {paramsId === "ADD" ? "Add Product" : "Update Product"}
          </button>
        </form>
      </main>
    </>
  );
};

export default AddProducts;
