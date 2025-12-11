# Business Backend

호텔 예약 시스템 - 사업자 백엔드 API

## 환경 변수 설정

`.env` 파일을 생성하고 다음 환경 변수를 설정하세요:

```env
# MongoDB 연결 정보
MONGODB_URI=your_mongodb_connection_string

# 서버 포트
PORT=3000

# 프론트엔드 Origin (여러 개는 쉼표로 구분)
# 예: FRONT_ORIGIN=http://localhost:5173,http://localhost:3001
# 설정하지 않으면 개발 환경에서 모든 origin 허용
FRONT_ORIGIN=http://localhost:5173

# JWT Secret (인증 토큰)
JWT_SECRET=your_jwt_secret_key

# AWS S3 설정 (파일 업로드)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_aws_region
AWS_S3_BUCKET=your_s3_bucket_name
```

## 주요 기능

- 호텔/숙소 등록 및 관리
- 객실 관리
- 예약 관리
- 리뷰 관리
- 통계 대시보드

## API 명세서

자세한 API 명세는 `API_SPECIFICATION.md` 파일을 참조하세요.
