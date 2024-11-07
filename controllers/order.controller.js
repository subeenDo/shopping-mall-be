const Order = require('../models/Order');
const { randomStringGenerator } = require('../utils/randomStringGenerator');
const productController = require('./product.controller');


const orderController = {};

orderController.createOrder = async (req, res, next) => {
    try {
        const {userId} = req;
        const {shipTo, contact, orderList, totalPrice} = req.body;
        const insufficientStockItems = await productController.checkItemListStock(orderList);

        if(insufficientStockItems.length > 0) {
            const errorMessage = insufficientStockItems.reduce((total, item) => total += item.message, '');
            const error = new Error(errorMessage);
            error.status = 400;
            return next(error);
        } else {
            const orderNum = randomStringGenerator();

            const newOrder = new Order({
                userId,
                shipTo,
                contact,
                items: orderList,
                totalPrice,
                orderNum
            });
            await newOrder.save();
            res.status(200).json({state: 'success', orderNum: orderNum});
        }

    } catch(error) {
        console.log(error);
        next(error);
    }
}

orderController.getOders = async (req, res, next) => {
    try {
        const { userId } = req;
        const { page, ordernum, limit = 3} = req.query;

        const query = { userId };
        if (ordernum) {
            query.orderNum = { $regex: ordernum, $options: 'i' };
        }
        
        const totalOrders = await Order.countDocuments(query);
        let orders; 

        if(page) {
            const totalPageNum = Math.ceil(totalOrders / limit);
            orders = await Order.find(query).populate('userId', 'name email').populate({
                path: 'items.productId',
            })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .exec();


            res.status(200).json({
                status: 'success',
                orders,
                total: totalOrders,
                pages: totalPageNum
            });
        } else {
            orders = await Order.find(query).populate({
                path: 'items.productId',
            }).sort({ createdAt: -1 }).exec();
            res.status(200).json({
                status: 'success',
                orders,
                total: totalOrders
            });
        }
    } catch(error) {
        console.log(error);
        next(error);
    }
}

orderController.updateOrder = async (req, res, next) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;
        const order = await Order.findByIdAndUpdate(orderId, { status }, { new: true });

        if(!order) {
            const error = new Error('주문이 없습니다.');
            error.status = 404;
            return next(error);
        }   
        res.status(200).json({ status: 'success', order });

    } catch(error) {
        console.log(error);
        next(error);
    }
}

module.exports = orderController;