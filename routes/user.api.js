const express = require("express");
const userController = require("../controllers/user.controller");
const authController = require("../controllers/auth.controller");
const router = express.Router();


//회원가입
router.post("/", userController.createUser)

//토큰 로그인
//1.토큰이 vailid한 토큰인지 
//2.이 token을 가지고 유저를 찾아서 리턴
router.get("/me",authController.authenticate, userController.getUser) 

module.exports=router;