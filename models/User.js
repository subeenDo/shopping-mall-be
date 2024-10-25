const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const userSchema = Schema({
    email:{type:String, required:true,unique:true},
    password : {type:String, require:true},
    name : {type:String, require:true},
    level : {type:String, default:"customer"}, //2type:customer,admin
},
{timeStamps:true}
)
userSchema.methods.toJSON = function(){
    const obj = this._doc
    delete obj.password
    delete obj.__v
    delete obj.updateAt
    delete obj.createAt
    return obj
}

const User = mongoose.model("User", userSchema);
module.exports = User;