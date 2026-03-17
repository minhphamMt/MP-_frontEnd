# Tổng hợp API

Tài liệu này được tổng hợp từ codebase hiện tại, dựa trên:

- `src/api/*.js`
- `src/components/player/AudioProvider.jsx`
- `src/components/album/ArtistAlbumCard.jsx`
- `src/store/player.store.js`
- `src/utils/firebase.js`
- `src/pages/artist/ArtistSongForm.jsx`

Không tìm thấy `fetch()` riêng trong `src`. Phần lớn request đang đi qua `src/api/axios.js`.

## 1. Cấu hình chung

### Axios instance

Nguồn: `src/api/axios.js`

- `baseURL`: `import.meta.env.VITE_API_URL`
- `withCredentials`: `true`
- Header mặc định: `Content-Type: application/json`
- Nếu request gửi `FormData`, code sẽ bỏ `Content-Type` để trình duyệt tự set `multipart/form-data`
- Nếu có `accessToken` trong auth store, request sẽ tự động thêm:
  - `Authorization: Bearer <token>`
- Nếu response trả `401`, app sẽ tự động gọi:
  - `POST /auth/refresh`
- Sau khi refresh thành công, request cũ sẽ được gửi lại

### Biến môi trường hiện tại

Lấy từ `.env`:

- `VITE_API_URL=https://mp3-back-0leb.onrender.com/api`
- `VITE_API_BASE_URL=https://mp3-back-0leb.onrender.com`
- Firebase dùng bộ biến `VITE_FIREBASE_*`

### URL media / asset

Nguồn: `src/utils/asset.js`, `src/utils/song.js`

- Media từ backend thường được ghép với `VITE_API_BASE_URL`
- Nếu file nằm trên Firebase Storage, app sẽ build URL dạng:
  - `https://storage.googleapis.com/<bucket>/<path>`

## 2. REST API theo từng module

### Auth API

Nguồn: `src/api/auth.api.js`

| Function | Method | Endpoint | Ghi chú |
| --- | --- | --- | --- |
| `loginApi` | `POST` | `/auth/login` | Đăng nhập user |
| `registerApi` | `POST` | `/auth/register` | Đăng ký user |
| `artistLoginApi` | `POST` | `/auth/artist/login` | Đăng nhập artist |
| `artistRegisterApi` | `POST` | `/auth/artist/register` | Đăng ký artist |
| `verifyEmailApi` | `POST` | `/auth/verify-email` | Xác minh email |
| `resendVerificationApi` | `POST` | `/auth/resend-verification` | Gửi lại mail xác minh |
| `firebaseLoginApi` | `POST` | `/auth/firebase` | Đăng nhập bằng Firebase ID token |
| `forgotPasswordApi` | `POST` | `/auth/forgot-password` | Quên mật khẩu |
| `resetPasswordApi` | `POST` | `/auth/reset-password` | Đặt lại mật khẩu |
| `refreshApi` | `POST` | `/auth/refresh` | Gửi `{ refreshToken }` |
| `logoutApi` | `POST` | `/auth/logout` | Gửi `{ refreshToken }` |
| `getMeApi` | `GET` | `/users/me` | Lấy thông tin user hiện tại |

### User API

Nguồn: `src/api/user.api.js`

| Function | Method | Endpoint | Ghi chú |
| --- | --- | --- | --- |
| `getMyLikedSongs` | `GET` | `/users/me/liked-songs` | Bài hát đã thích |
| `getCurrentUser` | `GET` | `/users/me` | Profile hiện tại |
| `updateUserProfile` | `PUT` | `/users/me` | Cập nhật profile |
| `updateUserPassword` | `PATCH` | `/users/me/password` | Đổi mật khẩu |
| `uploadUserAvatar` | `POST` | `/users/me/avatar` | `multipart/form-data` |

### Admin API

Nguồn: `src/api/admin.api.js`

#### Báo cáo và tìm kiếm

| Function | Method | Endpoint | Ghi chú |
| --- | --- | --- | --- |
| `getAdminOverview` | `GET` | `/admin/reports/overview` | Lấy overview, nhận `params` |
| `getReportCharts` | `GET` | `/admin/reports/charts` | Lấy chart admin, nhận `params` |
| `searchAdmin` | `GET` | `/admin/search` | Tìm kiếm trong admin |

#### Quản lý thể loại

| Function | Method | Endpoint | Ghi chú |
| --- | --- | --- | --- |
| `listGenres` | `GET` | `/admin/genres` | Danh sách genre |
| `createGenre` | `POST` | `/admin/genres` | Tạo genre |
| `updateGenre` | `PUT` | `/admin/genres/{id}` | Sửa genre |
| `deleteGenre` | `DELETE` | `/admin/genres/{id}` | Xóa genre |

#### Kiểm duyệt bài hát

| Function | Method | Endpoint | Ghi chú |
| --- | --- | --- | --- |
| `listAdminSongs` | `GET` | `/admin/songs` | Danh sách bài hát cho admin |
| `updateAdminSong` | `PUT` | `/admin/songs/{id}` | Sửa bài hát từ admin |
| `reviewSong` | `PATCH` | `/admin/songs/{id}/review` | Gửi `payload` review |
| `approveSong` | `PATCH` | `/admin/songs/{id}/approve` | Duyệt bài hát |
| `blockSong` | `PATCH` | `/admin/songs/{id}/block` | Chặn bài hát, có `payload` |

#### Quản lý người dùng

| Function | Method | Endpoint | Ghi chú |
| --- | --- | --- | --- |
| `toggleUserActive` | `PATCH` | `/users/{id}/active` | Bật/tắt active |
| `updateUserRole` | `PATCH` | `/users/{id}/role` | Đổi role |
| `listUsers` | `GET` | `/users` | Danh sách user |
| `getUserById` | `GET` | `/users/{id}` | Chi tiết user |
| `getAdminUserDetail` | `GET` | `/admin/users/{id}` | Chi tiết user bản admin, có normalize payload |
| `createUser` | `POST` | `/users` | Tạo user |
| `updateUser` | `PUT` | `/users/{id}` | Sửa user |
| `deleteUser` | `DELETE` | `/users/{id}` | Xóa user |
| `uploadUserAvatarByAdmin` | `POST` | `/users/{id}/avatar` | `multipart/form-data` |

#### Kiểm duyệt yêu cầu artist

| Function | Method | Endpoint | Ghi chú |
| --- | --- | --- | --- |
| `listArtistRequests` | `GET` | `/admin/artist-requests` | Danh sách request artist |
| `reviewArtistRequest` | `PATCH` | `/admin/artist-requests/{id}/review` | Review request |
| `approveArtistRequest` | `PATCH` | `/admin/artist-requests/{id}/approve` | Duyệt request |
| `rejectArtistRequest` | `PATCH` | `/admin/artist-requests/{id}/reject` | Từ chối request |

### Artist API

Nguồn: `src/api/artist.api.js`

| Function | Method | Endpoint | Ghi chú |
| --- | --- | --- | --- |
| `getArtistCollections` | `GET` | `/artists/collections` | Nhận `params` |
| `getArtists` | `GET` | `/artists` | Danh sách artist |
| `getArtistById` | `GET` | `/artists/{id}` | Chi tiết artist |
| `getMyArtistProfile` | `GET` | `/artists/me` | Profile artist đang đăng nhập |
| `createArtist` | `POST` | `/artists` | Tạo artist |
| `updateArtist` | `PUT` | `/artists/{id}` | Sửa artist |
| `deleteArtist` | `DELETE` | `/artists/{id}` | Xóa artist |
| `uploadArtistAvatar` | `POST` | `/artists/me/avatar` | `multipart/form-data` |
| `followArtist` | `POST` | `/artists/{artistId}/follow` | Follow artist |
| `unfollowArtist` | `DELETE` | `/artists/{artistId}/follow` | Unfollow artist |
| `getFollowedArtists` | `GET` | `/users/me/followed-artists` | Danh sách artist đã follow |

### Artist Request API

Nguồn: `src/api/artist-request.api.js`

| Function | Method | Endpoint | Ghi chú |
| --- | --- | --- | --- |
| `createArtistRequest` | `POST` | `/artist-requests` | Tạo request lên artist |
| `getMyArtistRequest` | `GET` | `/artist-requests/me` | Lấy request của tôi |
| `updateMyArtistRequest` | `PATCH` | `/artist-requests/me` | Cập nhật request của tôi |

### Album API

Nguồn: `src/api/album.api.js`

| Function | Method | Endpoint | Ghi chú |
| --- | --- | --- | --- |
| `getAlbums` | `GET` | `/albums` | Danh sách album, nhận `params` |
| `getAlbumById` | `GET` | `/albums/{id}` | Chi tiết album |
| `createAlbum` | `POST` | `/albums` | Tạo album |
| `updateAlbum` | `PUT` | `/albums/{id}` | Sửa album |
| `deleteAlbum` | `DELETE` | `/albums/{id}` | Xóa album |

### Song API

Nguồn: `src/api/song.api.js`

| Function | Method | Endpoint | Ghi chú |
| --- | --- | --- | --- |
| `getSongs` | `GET` | `/songs` | Danh sách bài hát |
| `getSongById` | `GET` | `/songs/{id}` | Chi tiết bài hát |
| `getArtistSongs` | `GET` | `/songs/art` | Query thêm `artist_id`, có thể thêm `params` khác |
| `createSong` | `POST` | `/songs` | Tạo bài hát |
| `updateSong` | `PUT` | `/songs/{id}` | Sửa bài hát |
| `deleteSong` | `DELETE` | `/songs/{id}` | Xóa bài hát |
| `uploadSongAudio` | `POST` | `/songs/{id}/audio` | Upload audio, `multipart/form-data` |
| `getSongLyrics` | `GET` | `/songs/{id}/lyrics` | Lấy lyric, nhận `params` |
| `recordSongPlay` | `POST` | `/songs/{id}/play` | Gửi `{ duration }` |
| `getLikedSongs` | `GET` | `/api/songs/liked` | Có khả năng bị dư `/api` vì `baseURL` đã kết thúc bằng `/api` |

### Like API

Nguồn: `src/api/like.api.js`

| Function | Method | Endpoint | Ghi chú |
| --- | --- | --- | --- |
| `likeSong` | `POST` | `/songs/{songId}/like` | Like bài hát |
| `unlikeSong` | `DELETE` | `/songs/{songId}/like` | Unlike bài hát |
| `getLikedSongs` | `GET` | `/songs/liked` | Danh sách bài hát đã like |
| `likeAlbum` | `POST` | `/albums/{albumId}/like` | Like album |
| `unlikeAlbum` | `DELETE` | `/albums/{albumId}/like` | Unlike album |
| `getLikedAlbums` | `GET` | `/users/me/liked-albums` | Danh sách album đã like |

### Playlist API

Nguồn: `src/api/playlist.api.js`

| Function | Method | Endpoint | Ghi chú |
| --- | --- | --- | --- |
| `getPlaylists` | `GET` | `/playlists` | Danh sách playlist |
| `getPlaylistById` | `GET` | `/playlists/{id}` | Chi tiết playlist |
| `createPlaylist` | `POST` | `/playlists` | Tạo playlist |
| `updatePlaylist` | `PUT` | `/playlists/{id}` | Sửa playlist |
| `deletePlaylist` | `DELETE` | `/playlists/{id}` | Xóa playlist |
| `addSongToPlaylist` | `POST` | `/playlists/{id}/songs` | Thêm bài hát vào playlist |
| `removeSongFromPlaylist` | `DELETE` | `/playlists/{id}/songs/{songId}` | Xóa bài hát khỏi playlist |
| `reorderSongInPlaylist` | `PATCH` | `/playlists/{id}/songs/{songId}/reorder` | Đổi vị trí bài hát |

### Search API

Nguồn: `src/api/search.api.js`

| Function | Method | Endpoint | Ghi chú |
| --- | --- | --- | --- |
| `searchEntities` | `GET` | `/search` | Có normalize `keyword` / `q` trước khi gửi |
| `getSearchHistory` | `GET` | `/search/history` | Query `page`, `limit`, `userId` |
| `saveSearchHistory` | `POST` | `/search/save-history` | Gửi `{ keyword, userId }` |

### History API

Nguồn: `src/api/history.api.js`

| Function | Method | Endpoint | Ghi chú |
| --- | --- | --- | --- |
| `addHistory` | `POST` | `/history` | Gửi `{ song_id }` |
| `getMyHistory` | `GET` | `/history/me` | Lịch sử nghe của tôi |

### Chart API

Nguồn: `src/api/chart.api.js`

| Function | Method | Endpoint | Ghi chú |
| --- | --- | --- | --- |
| `getZingChart` | `GET` | `/charts/zing` | Lấy Zing chart |
| `getZingChartSeries` | `GET` | `/charts/zing/series` | Series Zing chart |
| `getTop5Chart` | `GET` | `/charts/top5` | Top 5 |
| `getNewReleaseChart` | `GET` | `/charts/new-release` | Bài hát mới |
| `getTop100Chart` | `GET` | `/charts/top-100` | Top 100 |
| `getTop50ByGenres` | `GET` | `/charts/top-50/genres` | Top 50 theo genre |
| `getRegionCharts` | `GET` | `/charts/regions` | Chart theo khu vực |
| `getWeeklyTopSongs` | `GET` | `/charts/weekly/top5` | Top 5 tuần |
| `getWeeklyTopSeries` | `GET` | `/charts/weekly/series` | Series theo tuần |

### Recommendation API

Nguồn: `src/api/recommendation.api.js`

| Function | Method | Endpoint | Ghi chú |
| --- | --- | --- | --- |
| `getRecommendations` | `GET` | `/recommend/{songId}` | Gọi recommendation theo bài hát |
| `getColdStartRecommendations` | `GET` | `/recommendations/cold-start` | Query `limit` nếu có |
| `getColdStartRecommendations` fallback | `GET` | `/recommend/cold-start` | Fallback nếu endpoint trên trả `404` |

### Trash API

Nguồn: `src/api/trash.api.js`

| Function | Method | Endpoint | Ghi chú |
| --- | --- | --- | --- |
| `getDeletedItems` | `GET` | `/trash` | Danh sách item đã xóa mềm |
| `restoreSong` | `PATCH` | `/songs/{id}/restore` | Khôi phục song |
| `restoreAlbum` | `PATCH` | `/albums/{id}/restore` | Khôi phục album |
| `restoreArtist` | `PATCH` | `/artists/{id}/restore` | Khôi phục artist |
| `restoreGenre` | `PATCH` | `/admin/genres/{id}/restore` | Khôi phục genre |
| `hardDeleteSong` | `DELETE` | `/songs/{id}` | Xóa cứng song |
| `hardDeleteAlbum` | `DELETE` | `/albums/{id}` | Xóa cứng album |
| `hardDeleteArtist` | `DELETE` | `/artists/{id}` | Xóa cứng artist |
| `hardDeleteGenre` | `DELETE` | `/admin/genres/{id}` | Xóa cứng genre |

### Test API

Nguồn: `src/api/test.api.js`

| Function | Method | Endpoint | Ghi chú |
| --- | --- | --- | --- |
| `testAuth` | `GET` | `/users/me` | Endpoint test auth |

## 3. API gọi trực tiếp ngoài `src/api`

Ngoài các wrapper trên, codebase còn gọi trực tiếp một vài endpoint:

| File | Method | Endpoint | Ghi chú |
| --- | --- | --- | --- |
| `src/store/player.store.js` | `POST` / `DELETE` | `/songs/{targetId}/like` | Toggle like theo optimistic update |
| `src/components/player/AudioProvider.jsx` | `POST` | `/songs/{currentSong.id}/play` | Tăng play count, gọi không kèm `duration` |
| `src/components/album/ArtistAlbumCard.jsx` | `GET` | `/songs/art` | Lấy danh sách bài hát theo `artist_id` |

## 4. Dịch vụ ngoài REST backend

### Firebase Auth + Google Sign-In

Nguồn: `src/utils/firebase.js`, `src/pages/Login.jsx`

- Dùng `firebase/app` và `firebase/auth`
- Đăng nhập Google bằng `signInWithPopup`
- Sau khi đăng nhập, app lấy `idToken`
- `idToken` được gửi về backend qua:
  - `POST /auth/firebase`

### Firebase Storage

Nguồn: `src/pages/artist/ArtistSongForm.jsx`

- Dùng `firebase/storage`
- Upload file qua `uploadBytes`
- Lấy URL public qua `getDownloadURL`
- Đang dùng cho:
  - audio file
  - cover image

Lưu ý: đây là upload trực tiếp lên Firebase, không đi qua backend REST.

## 5. Nhận xét nhanh

- Toàn bộ HTTP request trong app đang tập trung quanh `src/api/axios.js`
- `POST /auth/refresh` được dùng cả trong wrapper auth và trong interceptor refresh token
- Có 2 cách lấy bài hát đã like:
  - `GET /songs/liked` trong `src/api/like.api.js`
  - `GET /api/songs/liked` trong `src/api/song.api.js`
- Route `GET /api/songs/liked` cần được kiểm tra lại vì `baseURL` đã là `.../api`, để tránh thành `.../api/api/songs/liked`
- Có một số endpoint bị lặp ở nhiều nơi, nhưng mục đích khác nhau:
  - `/songs/{id}/like`
  - `/songs/{id}/play`
  - `/songs/art`

## 6. Nếu bạn muốn mở rộng thêm

Mình có thể tiếp tục tạo thêm 1 trong 3 bản sau:

1. Bản "backend contract": thêm payload mẫu, query params mẫu, response mẫu cho từng endpoint
2. Bản "usage map": chỉ rõ mỗi endpoint đang được gọi ở trang/component nào
3. Bản "Postman/Swagger seed": chuyển danh sách này thành JSON để import
