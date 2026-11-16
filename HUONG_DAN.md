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

```
web/
├── src/
│   ├── App.tsx          # Component gốc và bộ định tuyến điều hướng (Router Shell)
│   ├── main.tsx         # Entry point React 19, gắn vào thẻ #root
│   ├── index.css        # CSS chính tích hợp Tailwind CSS v4
│   ├── data.ts          # Định nghĩa kiểu dữ liệu (Types) & Dữ liệu mẫu (Seed Data)
│   ├── store.tsx        # React Context Quản lý State toàn cục (Thành viên, Góp ý, Vai trò, Log)
│   ├── viewer.tsx       # Giao diện người xem (Trang chủ, Cây gia phả, Góp ý, Chi tiết thành viên)
│   ├── admin.tsx        # Giao diện quản trị (Duyệt góp ý, Quản lý thành viên, Phân quyền, Nhật ký)
│   ├── ui.tsx           # Các component giao diện dùng chung (Button, Modal, Input, Badge...)
│   └── orn.tsx          # Hoa văn họa tiết truyền thống (Trống đồng, hoa sen trang trí)
├── index.html           # Shell HTML chính
├── vite.config.ts       # Cấu hình Vite & Tailwind CSS v4
├── package.json         # Khai báo thư viện và script
└── tsconfig.json        # Cấu hình TypeScript
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
