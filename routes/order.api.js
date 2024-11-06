const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const orderController = require("../controllers/order.controller")

router.post(
    "/", 
    authController.authenticate,
    orderController.createOrder
);

// router.get("/", productController.getProducts);

// router.get("/:id", productController.getProductDetail);

// router.put(
//     "/:id", 
//     authController.authenticate, 
//     authController.checkAdminPermission, 
//     productController.updateProduct
// );

// router.delete(
//     "/:id", 
//     authController.authenticate, 
//     authController.checkAdminPermission, 
//     productController.deleteProduct
// );


module.exports=router;