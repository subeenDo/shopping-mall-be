const { OAuth2Client } = require('google-auth-library');
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

const authController = {};

// 로그인 with 이메일
authController.loginWithEmail = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (user) {
            const isMatch = await bcrypt.compare(password, user.password);
            if (isMatch) {
                // 유저가 로그인 성공 시 JWT 토큰 생성
                const token = await user.generateToken();
                return res.status(200).json({ status: "success", user, token });
            } else {
                throw new Error("Invalid email or password");
            }
        } else {
            throw new Error("User not found");
        }
    } catch (error) {
        res.status(400).json({ status: "fail", error: error.message });
    }
};

// 구글 로그인
authController.loginWithGoogle = async (req, res) => {
    try {
        const { token } = req.body;
        const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);
        const ticket = await googleClient.verifyIdToken({
            idToken: token,
            audience: GOOGLE_CLIENT_ID,
        });

        const { email, name } = ticket.getPayload();
        let user = await User.findOne({ email });

        if (!user) {
            // 새로운 유저를 생성
            const randomPassword = "" + Math.floor(Math.random() * 1000000000); // 비밀번호는 임의로 생성
            user = await User.create({
                name,
                email,
                password: randomPassword,  // 임시 비밀번호 설정
            });
        }

        // 로그인 후 JWT 토큰 발급
        const sessionToken = await user.generateToken();
        return res.status(200).json({ status: "success", user, token: sessionToken });
    } catch (error) {
        res.status(400).json({ status: "fail", error: error.message });
    }
};

// 토큰 인증 미들웨어
authController.authenticate = async (req, res, next) => {
    try {
        const tokenString = req.headers.authorization;
        if (!tokenString) throw new Error("Token not found");

        const token = tokenString.replace("Bearer ", "");
        const payload = await jwt.verify(token, JWT_SECRET_KEY);  // async/await로 변경

        req.userId = payload._id;
        next();
    } catch (error) {
        res.status(400).json({ status: "fail", error: error.message });
    }
};

// 관리자 권한 확인 미들웨어
authController.checkAdminPermission = async (req, res, next) => {
    try {
        const { userId } = req;
        const user = await User.findById(userId);

        if (user.level !== "admin") {
            throw new Error("No permission");
        }
        next();
    } catch (error) {
        res.status(400).json({ status: "fail", error: error.message });
    }
};

module.exports = authController;
