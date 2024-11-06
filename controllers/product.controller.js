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

productController.checkStock = async(item)=>{
    //내가 사려는 아이템 재고 정보 들고오기
    const product = await Product.findById(item.productId);
    //내가 사려는 아이쳄 qty, 재고 비교
    if(product.stock[item.size]<item.qty){
        //재고가 불충분하면 불충분메세지와 함께 데이터 반환
        return { isVerify:false, message: `${product.name}의 ${item.size}재고가 부족합니다`};
    }
    const newStock = {...product.stock};
    newStock[item.size] -= item.qty;
    
    await product.save();
    //충분하다면, 재고에서 - qty 성공
    return { isVerify:true};

}

productController.checkItemListStock = async(itemList) =>{
    const insufficientStockItems = [] //재고가 불충분한 아이템 저장 예정
    //재고확인 로직
    await Promise.all( //비동기처리 한번에
        itemList.map(async(item) => {
            const stockCheck = await productController.checkStock(item);
            if(!stockCheck.isVerify){
                insufficientStockItems.push({item, message : stockCheck.message});
            }
            return stockCheck;
        })
    );
    return insufficientStockItems
}
module.exports = productController;