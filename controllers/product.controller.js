const Product = require("../models/Product");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
require('dotenv').config();

const productController = {};
const PAGE_SIZE = 5;

productController.createProduct = async(req, res)=>{
    try{
        const {sku, name, size, image, category, description, price, stock, status}= req.body;
        const product = new Product ({sku, name, size, image, category, description, price, stock, status});
        await product.save();
        return res.status(200).json({status:"success", product});
    }catch(error){
        res.status(400).json({status:"fail", error:error.message});
    }
};


productController.getProducts = async (req, res) => {
    try {
        const { page, name } = req.query;
        const cond = name ? { name: { $regex: name, $options: "i" } } : {};
        const response = { status: "success" };
        let query = Product.find(cond);
        
        const totalItemNum = await Product.find(cond).countDocuments(); 
        const totalPages = Math.ceil(totalItemNum / PAGE_SIZE);
        response.totalPageNum = totalPages; 
        
        if (page) {
            query = query.skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE);
        }

        const productList = await query.exec();
        response.products = productList;
        res.status(200).json(response);
        
    } catch (error) {
        res.status(400).json({ status: "fail", message: error.message });
    }
};

productController.getProductDetail = async (req, res) => {
    try {
      const productId = req.params.id;
      const product = await Product.findById(productId);
      if (!product) {
        throw new Error("Item doesn't exist");
      }
      res.status(200).json({ status: "success", product });
    } catch (error) {
      res.status(400).json({ status: "fail", error: error.message });
    }
  };
  

productController.updateProduct= async (req, res) => {
    try{
        const productId = req.params.id;
        const {sku, name, size, image, category, description, price, stock, status}= req.body;
        const product = await Product.findByIdAndUpdate (
            {_id:productId},
            {sku, name, size, image, category, description, price, stock, status},
            {new:true}
        );
        if(!product) throw new Error("item doesn't exist");
        res.status(200).json({status : "success", data : product });
        
    }catch(error){
        res.status(400).json({ status: "fail", message: error.message });
    }
}

productController.deleteProduct = async(req, res) =>{
    try{
        const productId = req.params.id;
        const product = await Product.findByIdAndDelete(productId);
        if(!product) throw new Error("item doesn't exist");
        res.status(200).json({ status: "success", message: "Item deleted success" });

    }catch(error){
        res.status(400).json({ status: "fail", message: error.message });
    }
}

productController.checkStock = async (item) => {
    const product = await Product.findById(item.productId);
    if (product && product.stock[item.size] < item.qty) {
      return { isVerify: false, message: `${product.name}의 ${item.size} 사이즈 재고가 부족합니다.` };
    }
    return { isVerify: true, product }; 
  };
  
  productController.checkItemListStock = async (orderList) => {
    const insufficientStockItems = [];
    const productsToUpdate = [];
  
    for (const item of orderList) {
      const stockCheck = await productController.checkStock(item);
      if (!stockCheck.isVerify) {
        insufficientStockItems.push({ productId: item.productId, message: stockCheck.message });
      } else {
        productsToUpdate.push({ product: stockCheck.product, size: item.size, qty: item.qty });
      }
    }
  
    if (insufficientStockItems.length > 0) {
      return insufficientStockItems;
    }
  
    for (const { product, size, qty } of productsToUpdate) {
      product.stock[size] -= qty;
      await product.save();
    }
  
    return insufficientStockItems; 
  };

module.exports = productController;