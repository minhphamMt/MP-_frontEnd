# Khoaluan Music Frontend - Tech Stack Note

## Mô tả ngắn

Frontend của một nền tảng nghe nhạc đa vai trò (`USER` / `ARTIST` / `ADMIN`), hỗ trợ nghe nhạc, quản lý nội dung nghệ sĩ, dashboard quản trị, xác thực nhiều luồng và upload media.

## Tech stack cốt lõi

| Công nghệ | Dùng để làm gì | Kết quả đạt được |
| --- | --- | --- |
| `React 19` | Xây dựng SPA và tách UI theo component/page | Giao diện linh hoạt, dễ mở rộng cho nhiều vai trò người dùng |
| `Vite 7` | Dev server và build frontend | Khởi động nhanh, build production gọn và tối ưu hơn |
| `React Router DOM 7` | Điều hướng và chia route theo `USER` / `ARTIST` / `ADMIN` | Tách rõ khu vực người dùng, nghệ sĩ, quản trị |
| `Zustand` | Quản lý state như auth, player, session, library | Đồng bộ trạng thái nhẹ, dễ kiểm soát hơn Redux cho app này |
| `Axios` | Gọi REST API, gắn `Bearer token`, tự refresh khi `401` | Giữ phiên đăng nhập ổn định, giảm tình trạng văng đăng nhập |
| `Firebase Auth` | Đăng nhập Google | Bổ sung social login mà không phải tự xử lý OAuth từ đầu |
| `Firebase Storage` | Upload ảnh đại diện, ảnh bìa, file media | Frontend upload file trước, backend chỉ cần nhận/lưu URL và metadata |
| `Tailwind CSS` | Xây dựng UI responsive nhanh | Tăng tốc dựng giao diện và giữ style nhất quán |
| `Framer Motion` | Animation cho auth flow, intro, chuyển trạng thái UI | Trải nghiệm mượt hơn ở các luồng đăng nhập và điều hướng |
| `ECharts` | Biểu đồ cho dashboard artist/admin và chart nhạc | Hiển thị số liệu, xu hướng và thống kê trực quan |
| `vite-plugin-pwa` + SEO scripts | PWA, service worker, prerender route public | Tăng trải nghiệm cài app và cải thiện SEO cho phần public |

## Những gì backend nên nắm để viết tiếp

- Frontend gọi backend qua `VITE_API_URL` và đang theo hướng `REST API` trả `JSON`.
- Auth đang dùng cặp `accessToken` + `refreshToken`; khi API trả `401`, frontend tự gọi `/auth/refresh`.
- Sau khi có token, frontend gọi `/users/me` để bootstrap phiên và xác định `role`.
- Hệ thống có 3 role chính: `USER`, `ARTIST`, `ADMIN`; ngoài ra còn context `artist_request` cho user đang chờ duyệt lên nghệ sĩ.
- Luồng Google login: frontend lấy `idToken` từ Firebase rồi gửi backend qua `/auth/firebase`.
- Upload file hiện đi qua Firebase Storage; backend phù hợp nhất khi lưu URL file, metadata và quyền sở hữu bản ghi.
- Luồng artist request hiện dùng các field chính: `artist_name`, `bio`, `avatar_url`, `proof_link`, `status`, `reject_reason`.

## Tóm tắt kiểu A -> B -> C

- Dùng `React + Router` để tách rõ workspace người nghe, nghệ sĩ và admin, giúp hệ thống đa vai trò chạy trong một frontend thống nhất.
- Dùng `Zustand + Axios` để quản lý auth/session và tự refresh token, giúp trải nghiệm đăng nhập ổn định hơn.
- Dùng `Firebase Auth` để hoàn thành đăng nhập Google, giúp giảm phần việc OAuth phía hệ thống riêng.
- Dùng `Firebase Storage` để upload media trước, giúp backend tập trung vào nghiệp vụ lưu bản ghi, kiểm duyệt và phân quyền.
- Dùng `ECharts` để hiển thị analytics và chart nhạc, giúp artist/admin theo dõi dữ liệu trực quan.
