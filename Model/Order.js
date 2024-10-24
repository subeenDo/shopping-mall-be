const mongoose = require('mongoose');
const User = require("./User");
const Product = require("./Product");
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    userId: { type: mongoose.ObjectId, ref: 'User' }, 
    items: [{
        productId: { type: mongoose.ObjectId, ref: 'Product' }, 
        qty: { type: Number, default: 1, required: true },
        size: { type: String, required: true }, 
        price: { type: Number, required: true }
    }],
    contact:{ type: String, required: true },
    shipTo: { type: String, required: true },
    totalPrice:{ type: Number, required: true },
    status: { type: String, default: "active" },
}, 
{ timestamps: true }
);

orderSchema.methods.toJSON = function() {
    const obj = this.toObject();
    delete obj.__v;
    delete obj.updatedAt;
    delete obj.createdAt;
    return obj;
};

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;