import React, { useState } from "react";
import { toast } from "react-toastify";
import Loader from "../loader/Loader";
import { useNavigate, useParams } from "react-router-dom";
import { categories } from "../../utils/adminProductCategories";
import { defaultValues } from "../../utils/adminAddProductDefaultValues";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { collection, addDoc, Timestamp, setDoc, doc } from "firebase/firestore";
import { storage, db } from "../../firebase/config";
import { useSelector } from "react-redux";


/**
 * Component for adding or editing a product
 * @description Handles the form fields for adding or editing a product
 * @param {string} paramsId - The ID of the product to edit
 * @returns {React.ReactElement} - The form elements for adding or editing a product
 */
const AddProducts = () => {
  const navigate = useNavigate();
  const { id: paramsId } = useParams();
  const { products: reduxProducts } = useSelector((store) => store.product);
  const productEdit = reduxProducts.find((item) => item.id === paramsId);
  const [product, setProduct] = useState(() => {
    return detectForm(paramsId, defaultValues, productEdit);
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  
  /**
   * Detects whether the product is being added or edited, and returns the appropriate values.
   * @param {string} paramsId - The ID of the product to edit
   * @param {Object} func1 - The default values for adding a product
   * @param {Object} func2 - The product to edit
   * @returns {Object} - The values to use for the form
   */
  function detectForm(paramsId, func1, func2) {
    if (paramsId === "ADD") return func1;
    return func2;
  }

  /**
   * Handle Input Changes
   * @param {React.ChangeEvent<HTMLInputElement>} e Change Event
   * @description Updates the product state with the new value
   * @example
   * const inputEvent = {
   *  target: {
   *    name: "name",
   *    value: "Product Name"
   *  }
   * }
   * handleInputChange(inputEvent)
   */
  function handleInputChange(e) {
    const { name, value } = e.target;
    setProduct({ ...product, [name]: value });
  }
  
  /**
   * Handles image uploads to Firebase Storage
   * @param {React.ChangeEvent<HTMLInputElement>} e Change Event
   * @description Uploads the selected image file to Firebase Storage,
   * sets the product state with the new image URL and shows upload progress
   * @example
   * const inputEvent = {
   *  target: {
   *    files: [File]
   *  }
   * }
   * handleImageChange(inputEvent)
   */
  function handleImageChange(e) {
    const file = e.target.files[0];
    const storageRef = ref(storage, `images/${Date.now()}${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        toast.error(error.code, error.message);
      },
      () => {
        // Handle successful uploads on complete
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setProduct({ ...product, imageURL: downloadURL });
          toast.success("File Uploaded Successfully");
        });
      }
    );
  }
  
/**
 * Adds a new product to the Firestore database.
 * @param {React.FormEvent<HTMLFormElement>} e - The form submission event.
 * @description This function prevents the default form submission behavior,
 * shows a loading state, and adds a new product document to the "products"
 * collection in Firestore with the current product details. After successful
 * addition, it resets the product form and navigates to the "all-products" admin page.
 * Displays a success message on successful operation or an error message on failure.
 */
  async function addProduct(e) {
    e.preventDefault();
    setIsLoading(true);
    try {
      const docRef = await addDoc(collection(db, "products"), {
        name: product.name,
        imageURL: product.imageURL,
        price: Number(product.price),
        category: product.category,
        brand: product.brand,
        description: product.description,
        createdAt: Timestamp.now().toDate(),
      });
      setUploadProgress(0);
      setProduct(defaultValues);
      setIsLoading(false);
      toast.success("Product added to Database Successfully");
      navigate("/admin/all-products");
    } catch (error) {
      
      toast.error("Something Went Wrong , Check Console");
      setIsLoading(false);
    }
  }
  
/**
 * Edits an existing product in the Firestore database.
 * @param {React.FormEvent<HTMLFormElement>} e - The form submission event.
 * @description This function prevents the default form submission behavior,
 * shows a loading state, and updates the product document in the "products"
 * collection in Firestore with the current product details. If the product's
 * image has been updated, the old image is deleted from storage. After successful
 * update, it resets the product form and navigates to the "all-products" admin page.
 * Displays a success message on successful operation or an error message on failure.
 */
  async function editProduct(e) {
    e.preventDefault();
    setIsLoading(true);
    // Check if the image is updated
    if (product.imageURL !== productEdit.imageURL) {
      // deleting image from database storage
      const storageRef = ref(storage, productEdit.imageURL);
      await deleteObject(storageRef);
    }
    try {
      await setDoc(doc(db, "products", paramsId), {
        name: product.name,
        imageURL: product.imageURL,
        price: Number(product.price),
        category: product.category,
        brand: product.brand,
        description: product.description,
        // Preserving created at
        createdAt: productEdit.createdAt,
        editedAt: Timestamp.now().toDate(),
      });
      
      setUploadProgress(0);
      setProduct(defaultValues);
      setIsLoading(false);
      toast.success("Product Updated Successfully");
      navigate("/admin/all-products");
    } catch (error) {
      
      toast.error("Something Went Wrong , Check Console");
      setIsLoading(false);
    }
  }

  //! Disable button until everything added to input fields
  const AllFieldsRequired =
    Boolean(product.brand) &&
    Boolean(product.category) &&
    Boolean(product.description) &&
    Boolean(product.imageURL) &&
    Boolean(product.name) &&
    Boolean(product.name);

  return (
    <>
      {isLoading && <Loader />}

      <main className="h-full border-r-2 p-1">
        <h1 className="text-xl md:text-3xl font-semibold pb-3">
          {detectForm(paramsId, "Add New Product", "Edit Product")}
        </h1>
        <form className="form-control" onSubmit={detectForm(paramsId, addProduct, editProduct)}>
          <div className="py-2">
            <label className="label-text font-bold mb-2 block text-lg">Product Name:</label>
            <input
              className="input input-bordered max-w-lg w-full border-2"
              type="text"
              placeholder="Product Name"
              required
              name="name"
              value={product.name}
              onChange={handleInputChange}
            />
          </div>

          <div className="py-2">
            <label className="label-text font-bold mb-2 block text-lg">Product Price: </label>
            <input
              className="input input-bordered max-w-lg w-full border-2"
              type="number"
              placeholder="Product Price"
              required
              name="price"
              value={product.price}
              onChange={handleInputChange}
            />
          </div>
          <div className="py-2">
            <label className="label-text font-bold mb-2 block text-lg">Product Category:</label>
            <select
              className="select select-bordered w-full max-w-lg"
              required
              name="category"
              value={product.category}
              onChange={handleInputChange}
            >
              <option disabled value="">
                -- Choose a Product Category --
              </option>
              {categories.map((c) => {
                return (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                );
              })}
            </select>
          </div>
          <div className="py-2">
            <label className="label-text font-bold mb-2 block text-lg">Product Brand: </label>
            <input
              className="input input-bordered max-w-lg w-full border-2"
              type="text"
              placeholder="Product Brand"
              required
              name="brand"
              value={product.brand}
              onChange={handleInputChange}
            />
          </div>
          <div className="py-2">
            <label className="label-text font-bold mb-2 block text-lg">Product Description: </label>
            <textarea
              className="textarea textarea-bordered h-32 max-w-lg w-full"
              type="text"
              placeholder="Product Description"
              required
              name="description"
              value={product.description}
              onChange={handleInputChange}
            ></textarea>
          </div>
          <div>
            <label className="label-text font-bold mb-2 block text-lg">Product Image: </label>
            <div className="border-2 rounded-sm  max-w-xl w-full px-4 pb-2">
              <div>
                <progress
                  className="progress progress-primary w-44 md:w-72 xl:w-full"
                  value={uploadProgress}
                  max="100"
                ></progress>
              </div>
              <input
                className="max-w-lg w-full"
                accept="image/all"
                type="file"
                placeholder="IMAGE URL"
                name="image"
                onChange={handleImageChange}
              />
              {product.imageURL === "" ? null : (
                <input
                  className="input input-sm input-bordered max-w-lg w-full my-2"
                  type="text"
                  value={product.imageURL}
                  required
                  placeholder="Image URL"
                  disabled
                />
              )}
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary text-lg max-w-[200px]  mt-2"
            disabled={!AllFieldsRequired}
          >
            {detectForm(paramsId, "Add Product", "Update Product")}
          </button>
        </form>
      </main>
    </>
  );
};

export default AddProducts;
