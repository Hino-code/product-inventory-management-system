import axios from "axios";

export const updateProduct = async (id, productData) => {
  const payload = {};

  if (productData.name !== undefined) payload.name = productData.name;
  if (productData.price !== undefined) payload.price = productData.price;
  if (productData.stock !== undefined) payload.stock = productData.stock;

  // ✅ Send null if no category selected
  if (productData.category_id !== undefined) {
    payload.category_id = productData.category_id || null;
  }

  const res = await axios.patch(`/products/${id}`, payload);
  return res.data;
};
