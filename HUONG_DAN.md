# HƯỚNG DẪN CÀI ĐẶT VÀ VẬN HÀNH DỰ ÁN GIA PHẢ WEB

Ứng dụng web quản lý và hiển thị Gia phả dòng họ, hỗ trợ xem cây phả hệ, tìm kiếm thành viên, gửi góp ý chỉnh sửa và bảng điều khiển quản trị (Tộc trưởng / Quản trị viên).

---

## 1. Yêu Cầu Môi Trường

- **Node.js**: Phiên bản 20 trở lên (khuyến nghị Node 22 hoặc 24).
- **Trình quản lý gói**: `pnpm` (phiên bản 9 trở lên).
  - Cài đặt pnpm nếu chưa có:
    ```bash
    npm install -g pnpm
    ```

---

## 2. Cài Đặt Thư Viện (Dependencies)

Mở terminal tại thư mục gốc của dự án (`d:\MY PRO\applications\GiaPha\web`) và chạy lệnh:

```bash
pnpm install
```

---

## 3. Khởi Chạy Dự Án

### 3.1. Chạy môi trường phát triển (Development)

```bash
pnpm dev
```

- Mặc định ứng dụng sẽ chạy tại địa chỉ: **[http://localhost:8443](http://localhost:8443)**
- Hỗ trợ Hot Module Replacement (HMR): Mọi thay đổi trong mã nguồn sẽ được cập nhật tức thì trên trình duyệt.

> **Mẹo**: Nếu muốn đổi cổng khác (ví dụ cổng 3000), bạn có thể chạy:
> ```bash
> # Trên Windows PowerShell
> $env:PORT="3000"; pnpm dev
> 
> # Trên Linux/macOS
> PORT=3000 pnpm dev
> ```

### 3.2. Kiểm tra lỗi Type (TypeScript Check)

```bash
pnpm exec tsc --noEmit
```

### 3.3. Build sản phẩm (Production Build)

```bash
pnpm build
```
Kết quả biên dịch sẽ được tạo trong thư mục `dist/`.

### 3.4. Xem trước bản build (Preview)

```bash
pnpm preview
```

---

## 4. Cấu Trúc Mã Nguồn

Dự án được tái cấu trúc theo mô hình phân tầng module rõ ràng, tách biệt giữa Types, Data, Utils, Components và Pages:

```
web/
├── src/
│   ├── types/                     # Định nghĩa TypeScript Interfaces & Types
│   │   ├── member.ts              # Kiểu dữ liệu Thành viên, Quan hệ (Unit, Member)
│   │   ├── feedback.ts            # Kiểu dữ liệu Góp ý (Feedback, Status, Type)
│   │   ├── user.ts                # Kiểu dữ liệu Người dùng, Vai trò, Nhật ký (User, Role, Log)
│   │   └── index.ts               # Barrel export
│   │
│   ├── constants/                 # Hằng số & Dữ liệu mẫu (Seed Data)
│   │   ├── genealogy.ts           # Hằng số dòng họ (HOME, FOUNDED, MAXGEN, Labels)
│   │   ├── seeds.ts               # Dữ liệu khởi tạo (Thành viên 20 đời, Users, Góp ý, Logs)
│   │   └── index.ts
│   │
│   ├── utils/                     # Hàm tiện ích & Xử lý định dạng
│   │   ├── text.ts                # Chuẩn hóa tiếng Việt tìm kiếm không dấu (norm)
│   │   ├── format.ts              # Định dạng thông tin sinh/mất/ngày giỗ, thời gian
│   │   └── index.ts
│   │
│   ├── context/                   # Quản lý State toàn cục & Điều hướng
│   │   ├── AppContext.tsx         # React Context lưu trữ & thao tác dữ liệu
│   │   ├── useRouter.ts           # Hook điều hướng theo hash URL (#/, #/tree...)
│   │   └── index.ts
│   │
│   ├── components/                # Các thành phần giao diện tái sử dụng
│   │   ├── common/                # UI components chung (Button, Badge, Modal, Empty, Skeleton)
│   │   ├── layout/                # Layout & Điều hướng chung (TopBar)
│   │   ├── ornaments/             # Họa tiết truyền thống (Khung phôi Board, Rồng, Phượng, Hoa sen, Cuốn thư)
│   │   ├── member/                # Thẻ thành viên (MemberCard) & Ngăn chi tiết (MemberDrawer)
│   │   └── index.ts
│   │
│   ├── pages/                     # Giao diện các trang nghiệp vụ
│   │   ├── auth/                  # Trang đăng nhập (LoginPage)
│   │   ├── home/                  # Trang chủ & Tìm kiếm (HomePage)
│   │   ├── tree/                  # Cây gia phả trực quan (TreePage, RootPicker)
│   │   ├── feedback/              # Gửi góp ý (FeedbackFormPage) & Góp ý của tôi (MyFeedbackPage)
│   │   ├── admin/                 # Cổng quản trị phân quyền (AdminPage, Dashboard, Members, Feedbacks, Users, Logs)
│   │   └── index.ts
│   │
│   ├── App.tsx                    # Component gốc & Router Shell
│   ├── main.tsx                   # React 19 entrypoint, gắn vào #root
│   ├── index.css                  # CSS chính tích hợp Tailwind CSS v4 & hình nền phôi
│   └── vite-env.d.ts              # Khai báo môi trường Vite
│
├── public/                        # Tài nguyên tĩnh (ảnh nền phôi 4x, favicon...)
├── index.html                     # Shell HTML chính
├── vite.config.ts                 # Cấu hình Vite & Tailwind CSS v4
├── package.json                   # Khai báo dependencies & scripts
└── tsconfig.json                  # Cấu hình TypeScript & path alias (@/*)
```

---

## 5. Tính Năng & Các Vai Trò Người Dùng

Hệ thống hỗ trợ 3 vai trò (chuyển đổi nhanh ở góc trên giao diện):

1. **Người xem (Viewer)**:
   - Xem danh sách thành viên qua các đời, tìm kiếm theo tên/quê quán/nghề nghiệp.
   - Xem cây gia phả tương tác đa thế hệ (`#/tree`).
   - Gửi yêu cầu góp ý chỉnh sửa thông tin hoặc bổ sung thành viên.
   - Theo dõi trạng thái góp ý của chính mình (`#/my`).

2. **Tộc trưởng (Chief)**:
   - Tiếp nhận và duyệt / từ chối các góp ý từ con cháu trong dòng họ.
   - Chỉnh sửa thông tin thành viên, quan hệ huyết thống, ngày giỗ, năm sinh/mất.

3. **Quản trị viên (Admin)**:
   - Toàn quyền quản trị hệ thống (`#/admin`).
   - Quản lý tài khoản người dùng, phân quyền vai trò (Viewer / Tộc trưởng / Admin), khóa/mở khóa tài khoản.
   - Xem nhật ký hoạt động (Audit Logs) của dòng họ.

---

## 6. Khắc Phục Sự Cố Thường Gặp

| Vấn đề | Nguyên nhân | Cách xử lý |
|---|---|---|
| Cổng 8443 bị trùng (Port in use) | Có ứng dụng khác đang chiếm cổng 8443 | Tắt ứng dụng đang chiếm cổng hoặc đổi cổng bằng biến môi trường `$env:PORT="8080"` trước khi chạy `pnpm dev`. |
| Lỗi thiếu thư viện | Chưa chạy cài đặt hoặc cache cũ | Chạy `pnpm install` lại. |
| Màn hình trắng | Cache trình duyệt hoặc hash route sai | Truy cập trực tiếp `http://localhost:8443/#/` |
