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

productController.checkStock = async(item) => {
    // 내가 사려는 아이템 재고 정보 가져오기
    const product = await Product.findById(item.productId);

    if (product.stock[item.size] < item.qty) {
        // 재고가 부족한 경우
        return { isVerify: false, message: `${product.name}의 ${item.size} 재고가 부족합니다` };
    }

    return { isVerify: true };
};

productController.checkItemListStock = async(itemList) => {
    const insufficientStockItems = [];

    // 모든 아이템의 재고 확인
    await Promise.all(
        itemList.map(async(item) => {
            const stockCheck = await productController.checkStock(item);
            if (!stockCheck.isVerify) {
                insufficientStockItems.push({ item, message: stockCheck.message });
            }
        })
    );

    return insufficientStockItemas;
};


module.exports = productController;