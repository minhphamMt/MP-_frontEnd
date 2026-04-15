# Khoaluan Music Frontend

Frontend React/Vite cho nền tảng nghe nhạc trực tuyến **Khoaluan Music**. Dự án hỗ trợ 3 không gian sử dụng riêng biệt cho người nghe, nghệ sĩ và quản trị viên; đồng thời tích hợp player riêng, PWA, SEO prerender, Firebase và backend REST API.

## Tổng quan

Khoaluan Music được xây dựng như một ứng dụng web nghe nhạc đa vai trò:

| Vai trò | Khu vực chính |
| --- | --- |
| `Guest` / `USER` | Khám phá bài hát, album, nghệ sĩ, chart, playlist, thư viện cá nhân, player, lời bài hát |
| `ARTIST` | Dashboard nghệ sĩ, quản lý hồ sơ, album, bài hát, thùng rác |
| `ADMIN` | Dashboard phân tích, duyệt nội dung, quản lý người dùng, nghệ sĩ, album, thể loại, yêu cầu nâng cấp nghệ sĩ |

## Tính năng nổi bật

### Dành cho người nghe

- Trang chủ gợi ý nhạc theo lịch sử nghe và dữ liệu recommendation.
- Hỗ trợ `MChart`, chart theo khu vực, nhạc mới, Top 50, album và trang chi tiết bài hát/nghệ sĩ.
- Tìm kiếm bài hát, album, nghệ sĩ; xem lịch sử tìm kiếm và lịch sử nghe.
- Quản lý playlist cá nhân, bài hát yêu thích, album yêu thích, nghệ sĩ đã theo dõi.
- Player riêng với queue, lời bài hát, tốc độ phát, sleep timer, khôi phục phiên nghe gần nhất và Media Session.
- Khách chưa đăng nhập vẫn có thể khám phá nội dung công khai, nhưng chỉ nghe preview 30 giây cho mỗi bài.

### Dành cho nghệ sĩ

- Đăng nhập/đăng ký qua cổng artist riêng.
- Dashboard thống kê nhanh bằng ECharts.
- Quản lý album, bài hát, hồ sơ nghệ sĩ.
- Theo dõi trạng thái duyệt nội dung và xử lý dữ liệu trong thùng rác.

### Dành cho quản trị viên

- Dashboard analytics với biểu đồ tổng quan người dùng, bài hát, album, top tuần, yêu cầu nghệ sĩ.
- Quản lý người dùng, nghệ sĩ, bài hát, album, thể loại.
- Duyệt bài hát và duyệt yêu cầu nâng cấp nghệ sĩ.
- Quản lý thùng rác cho các thực thể đã xóa mềm.

### Tính năng kỹ thuật

- Xác thực bằng email/password, xác thực email, quên mật khẩu, reset mật khẩu.
- Đăng nhập Google thông qua Firebase Auth.
- Upload media lên Firebase Storage.
- Axios interceptor tự refresh access token khi gặp `401`.
- PWA bằng `vite-plugin-pwa`.
- SEO prerender cho các route public, sinh `robots.txt` và `sitemap.xml` khi build.
- Cấu hình deploy phù hợp với Vercel qua [`vercel.json`](./vercel.json).

## Công nghệ sử dụng

- `React 19`
- `Vite 7`
- `React Router DOM 7`
- `Zustand`
- `Axios`
- `Tailwind CSS`
- `Framer Motion`
- `ECharts` + `echarts-for-react`
- `Firebase`
- `vite-plugin-pwa`

## Cấu trúc thư mục chính

```text
.
|-- public/                  # Icon, manifest, logo tĩnh
|-- src/
|   |-- api/                 # Wrapper gọi backend REST API
|   |-- components/          # UI components theo domain
|   |-- hooks/               # Custom hooks
|   |-- layouts/             # Layout chính của app
|   |-- pages/               # Trang cho user / artist / admin
|   |-- pwa/                 # Đăng ký service worker
|   |-- routes/              # Route config và route guard
|   |-- store/               # Zustand stores (auth, player, session...)
|   |-- utils/               # Hàm tiện ích, SEO, Firebase, asset...
|   |-- App.jsx
|   `-- main.jsx
|-- API_SUMMARY.md           # Tài liệu tổng hợp API hiện có của repo
|-- clean-seo-dist.mjs       # Xóa và chuẩn bị thư mục dist trước khi build
|-- seo-build.mjs            # Sinh HTML prerender, sitemap, robots
|-- vite.config.js           # Cấu hình Vite, PWA, proxy, manual chunks
`-- vercel.json              # Rewrite/redirect khi deploy Vercel
```

## Yêu cầu môi trường

- `Node.js ^20.19.0` hoặc `>=22.12.0`
- `npm`
- Backend API đang hoạt động
- Firebase project đã cấu hình Auth và Storage

## Cài đặt và chạy local

### 1. Cài dependencies

```bash
npm install
```

### 2. Tạo file môi trường

Sao chép `.env.example` thành `.env` và điền giá trị phù hợp:

```bash
cp .env.example .env
```

Trên Windows PowerShell có thể dùng:

```powershell
Copy-Item .env.example .env
```

### 3. Cấu hình biến môi trường

| Biến | Bắt buộc | Mô tả |
| --- | --- | --- |
| `VITE_API_URL` | Có | Base URL của backend API, thường bao gồm `/api` |
| `VITE_API_BASE_URL` | Có | Base URL backend dùng để resolve asset/media |
| `VITE_SITE_URL` | Nên có | Domain production để sinh canonical URL và sitemap |
| `VITE_GOOGLE_SITE_VERIFICATION` | Không | Mã xác minh Google Search Console |
| `VITE_FIREBASE_API_KEY` | Có | Firebase config |
| `VITE_FIREBASE_AUTH_DOMAIN` | Có | Firebase config |
| `VITE_FIREBASE_PROJECT_ID` | Có | Firebase config |
| `VITE_FIREBASE_STORAGE_BUCKET` | Có | Firebase config |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Có | Firebase config |
| `VITE_FIREBASE_APP_ID` | Có | Firebase config |
| `VITE_FIREBASE_MEASUREMENT_ID` | Không | Firebase config |

Lưu ý:

- App sẽ báo lỗi ngay khi chạy nếu thiếu nhóm biến `VITE_FIREBASE_*`.
- `VITE_SITE_URL` đặc biệt quan trọng cho luồng build SEO.

### 4. Chạy môi trường phát triển

```bash
npm run dev
```

Sau đó mở địa chỉ được Vite cung cấp, mặc định thường là `http://localhost:5173`.

## Scripts

| Lệnh | Mô tả |
| --- | --- |
| `npm run dev` | Chạy môi trường phát triển với Vite |
| `npm run build` | Xóa `dist`, build app và sinh output SEO prerender |
| `npm run preview` | Preview bản build local |
| `npm run lint` | Chạy ESLint |

## Build và deploy

Luồng `npm run build` của dự án không chỉ build frontend mà còn chạy thêm các bước SEO:

1. `clean-seo-dist.mjs` dọn thư mục `dist`.
2. `vite build` tạo bundle production.
3. `seo-build.mjs` sinh HTML prerender cho các route public, `robots.txt` và `sitemap.xml`.

Một số lưu ý khi deploy:

- Dự án đã có sẵn rewrite/redirect trong [`vercel.json`](./vercel.json).
- PWA được bật ở production và tự tắt trong môi trường `Vercel Preview`.
- Có proxy cho Firebase Storage qua đường dẫn `/__firebase-storage-proxy`.

## Tài liệu liên quan

- [`API_SUMMARY.md`](./API_SUMMARY.md): tổng hợp endpoint và luồng API hiện có trong codebase.
- [`src/routes/AppRoutes.jsx`](./src/routes/AppRoutes.jsx): toàn bộ route public, user, artist và admin.
- [`src/store/player.store.js`](./src/store/player.store.js): logic player, queue, lời bài hát, playback session.

## Ghi chú

- Repo hiện tại **chưa có test script tự động** trong `package.json`.
- Nếu backend chưa sẵn sàng hoặc Firebase chưa cấu hình đúng, các luồng đăng nhập, upload và phát nhạc sẽ không hoạt động đầy đủ.
