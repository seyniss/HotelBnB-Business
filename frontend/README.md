# Hotelhub Business Frontend

Hotelhub 사업자 페이지 - React + Vite 기반

## 🚀 기술 스택

- **React 18** - UI 라이브러리
- **Vite** - 빌드 도구
- **React Router v6** - 라우팅
- **Context API + useReducer** - 상태 관리
- **Axios** - HTTP 클라이언트
- **SCSS** - 스타일링

## 📁 프로젝트 구조

```
src/
├── components/
│   ├── common/          # 공통 컴포넌트 (Button, Input, Card)
│   └── layout/          # 레이아웃 컴포넌트 (Header, Footer, Layout)
├── pages/
│   ├── auth/            # 인증 페이지 (Login, Signup, ForgotPassword)
│   ├── dashboard/       # 대시보드
│   ├── hotels/          # 호텔 관리
│   ├── rooms/           # 객실 관리
│   ├── statistics/      # 매출 통계
│   └── reviews/         # 리뷰 관리
├── context/             # Context API (AuthContext, HotelContext)
├── utils/               # 유틸리티 (api.js)
└── styles/              # 글로벌 스타일
```

## 🎨 디자인 시스템

### 컬러 팔레트
- **Primary**: `#7FD8BE` (민트 그린)
- **Secondary**: `#1A3A3F` (다크 블루그린)
- **Gradient**: 다크 블루그린 → 오렌지 → 옐로우

### 주요 컴포넌트
- Button (primary, secondary, danger, ghost)
- Input (텍스트, 이메일, 비밀번호 등)
- Card (섹션 컨테이너)
- Header (네비게이션 + 사용자 정보)
- Footer (사이트 정보)

## 🔧 시작하기

### 설치

```bash
npm install
```

### 개발 모드

```bash
npm run dev
```

브라우저에서 `http://localhost:5173` 접속

### 환경 변수 설정

백엔드 API와 연동하려면 `.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
VITE_API_URL=http://localhost:3000
VITE_API_BASE_PATH=/business/api
VITE_KAKAO_APP_KEY=your_kakao_app_key
VITE_S3_BUCKET_URL=https://your-bucket.s3.amazonaws.com
```

### 빌드

```bash
npm run build
```

### 프리뷰

```bash
npm run preview
```

## 📱 주요 기능

### 1. 인증
- 로그인 / 회원가입
- 카카오 소셜 로그인 (준비 중)
- 비밀번호 찾기

### 2. 대시보드
- 주요 통계 (호텔, 객실, 예약, 매출)
- 최근 예약 목록
- 빠른 액션 카드

### 3. 호텔 관리
- 호텔 목록 조회
- 호텔 등록
- 호텔 정보 수정
- 호텔 삭제

### 4. 객실 관리
- 객실 타입별 관리
- 가격 설정
- 재고 관리

### 5. 매출 통계
- 일/월/년 단위 통계
- 호텔별 매출 순위
- 예약 현황

### 6. 리뷰 관리
- 고객 리뷰 조회
- 리뷰 신고 처리
- 답글 작성

## 🔗 API 연동

백엔드 API와 연동하려면 `/src/utils/api.js`에서 Axios 인스턴스를 확인하세요.

모든 API 요청은 자동으로 JWT 토큰이 포함되며, 401 에러 시 로그인 페이지로 리다이렉트됩니다.

## 📝 개발 가이드

### 새 페이지 추가

1. `/src/pages/` 아래에 폴더 생성
2. 컴포넌트 파일 생성 (`.jsx`)
3. 스타일 파일 생성 (`.scss`)
4. `/src/App.jsx`에 라우트 추가

### Context 사용

```jsx
import { useAuth } from './context/AuthContext'

const MyComponent = () => {
  const { user, login, logout } = useAuth()
  // ...
}
```

### API 호출

```jsx
import api from './utils/api'

const fetchData = async () => {
  const response = await api.get('/endpoint')
  return response.data
}
```

## 🚢 배포

AWS S3 + CloudFront로 배포 예정

## 📄 라이선스

MIT License
