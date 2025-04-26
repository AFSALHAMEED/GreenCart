import { v2 as cloudinary } from "cloudinary";
import Product from "../model/Product.js";

export const addProduct = async (req, res) => {
  try {
    let productData = JSON.parse(req.body.productData);
    const img = req.files;
    let imageUrl = await Promise.all(
      img.map(async (item) => {
        let result = cloudinary.uploader.upload(item.path, {
          resource_type: "image",
        });
        return (await result).secure_url;
      })
    );
    await Product.create({ ...productData, image: imageUrl });
    res.json({ success: true, message: "Product Added" });
  } catch (error) {
    console.log("error: ", error);
    return res.json({ success: false, message: error.message });
  }
};

export const productList = async (req, res) => {
  try {
    const products = await Product.find({});
    res.json({
      success: true,
      products,
    });
  } catch (error) {
    console.log("error: ", error);
    return res.json({ success: false, message: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.body;
    const product = await Product.findById(id);
    res.json({
      success: true,
      product,
    });
  } catch (error) {
    console.log("error: ", error);
    return res.json({ success: false, message: error.message });
  }
};

export const changeStock = async (req, res) => {
  try {
    const { id, inStock } = req.body;
    await Product.findByIdAndUpdate(id, { inStock });
    res.json({ success: true, message: "Stock Updated" });
  } catch (error) {
    console.log("error: ", error);
    return res.json({ success: false, message: error.message });
  }
};
