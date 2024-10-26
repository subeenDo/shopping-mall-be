const User = require("../models/User");
const bcrypt = require("bcryptjs");

const userController = {};

userController.createUser = async (req, res) => {
    try {
        let { email, password, name, level } = req.body;
        
        // 이미 존재하는 유저인지 확인
        const user = await User.findOne({ email });
        if (user) {
            throw new Error("User already exists");
        }

        // 비밀번호 암호화
        const salt = await bcrypt.genSalt(10); // 비동기 사용 권장
        password = await bcrypt.hash(password, salt);

        // 새로운 유저 생성
        const newUser = new User({
            email,
            password,
            name,
            level: level ? level : 'customer'
        });
        
        await newUser.save();
        return res.status(200).json({ status: "success" });

    } catch (err) {
        res.status(400).json({ status: "fail", error: err.message });
    }
};

userController.getUser = async (req, res) => {
    try {
        const { userId } = req; 
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ status: "error", error: "User not found" });
        }

        return res.status(200).json({ status: "success", user });
    } catch (error) {
        return res.status(400).json({ status: "error", error: error.message });
    }
};


module.exports = userController;
