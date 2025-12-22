const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require("mongoose");
const { connectDB } = require("../src/config/db");
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

const deleteBusinessUsersFromUsers = async () => {
  try {
    await connectDB();
    
    console.log("\n=== Users 컬렉션에서 Business 유저 삭제 ===\n");
    
    const db = mongoose.connection.db;
    const usersCollection = db.collection("users");
    
    // 삭제 대상 유저 조회
    const businessUsers = await usersCollection.find({ role: "business" }).toArray();
    
    if (businessUsers.length === 0) {
      console.log("✅ Users 컬렉션에 role이 'business'인 유저가 없습니다.\n");
      process.exit(0);
    }
    
    console.log(`⚠️  삭제 대상 유저: ${businessUsers.length}명\n`);
    
    // 삭제 대상 유저 목록 출력
    businessUsers.forEach((user, index) => {
      console.log(`${index + 1}. 이메일: ${user.email || "N/A"}`);
      console.log(`   이름: ${user.name || user.username || "N/A"}`);
      console.log(`   전화번호: ${user.phoneNumber || "N/A"}`);
      console.log(`   사업자등록번호: ${user.businessNumber || "N/A"}`);
      console.log(`   ID: ${user._id}`);
      console.log("");
    });
    
    // 사용자 확인
    const answer = await question("정말로 이 유저들을 삭제하시겠습니까? (yes/no): ");
    
    if (answer.toLowerCase() !== 'yes' && answer.toLowerCase() !== 'y') {
      console.log("\n❌ 삭제가 취소되었습니다.\n");
      rl.close();
      process.exit(0);
    }
    
    // 삭제 실행
    console.log("\n🗑️  삭제 중...\n");
    const result = await usersCollection.deleteMany({ role: "business" });
    
    console.log("✅ 삭제 완료!");
    console.log(`   삭제된 문서 수: ${result.deletedCount}개\n`);
    
    // 삭제 후 확인
    const remainingCount = await usersCollection.countDocuments({ role: "business" });
    if (remainingCount === 0) {
      console.log("✅ Users 컬렉션에 role이 'business'인 유저가 모두 삭제되었습니다.\n");
    } else {
      console.log(`⚠️  아직 ${remainingCount}명의 business 유저가 남아있습니다.\n`);
    }
    
    rl.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ 삭제 실패:", error);
    rl.close();
    process.exit(1);
  }
};

deleteBusinessUsersFromUsers();

