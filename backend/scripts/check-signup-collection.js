const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require("mongoose");
const { connectDB } = require("../src/config/db");
const BusinessUser = require("../src/auth/model");

const checkSignupCollection = async () => {
  try {
    await connectDB();
    
    console.log("\n=== 회원가입 컬렉션 확인 ===\n");
    
    // 모델의 컬렉션 이름 확인
    const collectionName = BusinessUser.collection.name;
    console.log(`📦 사용되는 컬렉션 이름: ${collectionName}`);
    
    // 실제 컬렉션 존재 여부 확인
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    const collectionExists = collections.some(col => col.name === collectionName);
    
    console.log(`📊 컬렉션 존재 여부: ${collectionExists ? "✅ 존재" : "❌ 없음"}`);
    
    // 컬렉션의 문서 수 확인
    if (collectionExists) {
      const count = await BusinessUser.countDocuments();
      console.log(`📈 현재 저장된 문서 수: ${count}개`);
      
      if (count > 0) {
        console.log("\n=== 최근 가입한 유저 (최대 5명) ===\n");
        const recentUsers = await BusinessUser.find()
          .sort({ createdAt: -1 })
          .limit(5)
          .select("-passwordHash")
          .lean();
        
        recentUsers.forEach((user, index) => {
          console.log(`${index + 1}. 이메일: ${user.email}`);
          console.log(`   이름: ${user.name}`);
          console.log(`   사업자등록번호: ${user.businessNumber}`);
          console.log(`   가입일: ${user.createdAt}`);
          console.log(`   ID: ${user._id}`);
          console.log("");
        });
      }
    }
    
    // Mongoose 모델 정보
    console.log("=== 모델 정보 ===");
    console.log(`모델 이름: ${BusinessUser.modelName}`);
    console.log(`컬렉션 이름: ${collectionName}`);
    console.log(`스키마 필드: ${Object.keys(BusinessUser.schema.paths).join(", ")}\n`);
    
    process.exit(0);
  } catch (error) {
    console.error("❌ 확인 실패:", error);
    process.exit(1);
  }
};

checkSignupCollection();

