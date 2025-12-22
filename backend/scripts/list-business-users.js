const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require("mongoose");
const { connectDB } = require("../src/config/db");

const listBusinessUsers = async () => {
  try {
    await connectDB();
    
    console.log("\n=== Business Users 조회 ===\n");
    
    // BusinessUser 모델 사용 (businessusers 컬렉션)
    const BusinessUser = require("../src/auth/model");
    const businessUsers = await BusinessUser.find({ role: "business" })
      .select("-passwordHash")
      .lean();
    
    console.log(`📊 BusinessUsers 컬렉션 (role: business) - 총 ${businessUsers.length}명\n`);
    
    if (businessUsers.length > 0) {
      businessUsers.forEach((user, index) => {
        console.log(`${index + 1}. 이메일: ${user.email}`);
        console.log(`   이름: ${user.name || "N/A"}`);
        console.log(`   전화번호: ${user.phoneNumber || "N/A"}`);
        console.log(`   사업자명: ${user.businessName || "N/A"}`);
        console.log(`   사업자등록번호: ${user.businessNumber || "N/A"}`);
        console.log(`   활성화: ${user.isActive ? "✅" : "❌"}`);
        console.log(`   생성일: ${user.createdAt || "N/A"}`);
        console.log(`   ID: ${user._id}`);
        console.log("");
      });
    } else {
      console.log("   BusinessUsers 컬렉션에 role이 'business'인 유저가 없습니다.\n");
    }
    
    // users 컬렉션 직접 조회 (다른 모델일 수 있음)
    const db = mongoose.connection.db;
    const usersCollection = db.collection("users");
    const usersCount = await usersCollection.countDocuments({ role: "business" });
    
    console.log(`📊 Users 컬렉션 (role: business) - 총 ${usersCount}명\n`);
    
    if (usersCount > 0) {
      const users = await usersCollection.find({ role: "business" }).toArray();
      users.forEach((user, index) => {
        console.log(`${index + 1}. 이메일: ${user.email || "N/A"}`);
        console.log(`   이름: ${user.name || user.username || "N/A"}`);
        console.log(`   전화번호: ${user.phoneNumber || "N/A"}`);
        console.log(`   사업자명: ${user.businessName || "N/A"}`);
        console.log(`   사업자등록번호: ${user.businessNumber || "N/A"}`);
        console.log(`   활성화: ${user.isActive !== false ? "✅" : "❌"}`);
        console.log(`   생성일: ${user.createdAt || user.created || "N/A"}`);
        console.log(`   ID: ${user._id}`);
        console.log("");
      });
    } else {
      console.log("   Users 컬렉션에 role이 'business'인 유저가 없습니다.\n");
    }
    
    // 요약
    console.log("=== 요약 ===");
    console.log(`BusinessUsers 컬렉션: ${businessUsers.length}명`);
    console.log(`Users 컬렉션: ${usersCount}명`);
    console.log(`총합: ${businessUsers.length + usersCount}명\n`);
    
    process.exit(0);
  } catch (error) {
    console.error("❌ 조회 실패:", error);
    process.exit(1);
  }
};

listBusinessUsers();

