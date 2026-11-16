# Gia Phả Họ Nguyễn — Web V2

Ứng dụng web Gia phả dòng họ phát triển bằng **React 19**, **Vite 8**, **Tailwind CSS v4** và **TypeScript**.

👉 **Tài liệu hướng dẫn sử dụng và cài đặt chi tiết:** [HUONG_DAN.md](./HUONG_DAN.md)

---

## Bắt Đầu Nhanh

```bash
# 1. Cài đặt dependencies
pnpm install

# 2. Khởi chạy môi trường phát triển (Dev Server)
pnpm dev

# 3. Kiểm tra kiểu dữ liệu TypeScript
pnpm exec tsc --noEmit

# 4. Biên dịch dự án (Production Build)
pnpm build

# 5. Xem trước bản build
pnpm preview
```

Ứng dụng chạy mặc định tại: **http://localhost:8443**

---

## Cấu Trúc Dự Án (Project Structure)

Dự án được tổ chức theo kiến trúc phân tầng module rõ ràng, logic và dễ mở rộng:

```
web/
├── public/                                # Tài nguyên tĩnh
│   ├── vietnamese_certificate_background_enhanced_4x.png  # Ảnh nền phôi chứng chỉ 4x
│   └── favicon.png                        # Biểu tượng website
│
├── src/
│   ├── types/                             # TypeScript Models & Interfaces
│   │   ├── member.ts                      # Kiểu dữ liệu Thành viên (Member), Cụm hiển thị (Unit)
│   │   ├── feedback.ts                    # Kiểu dữ liệu Góp ý (Feedback, Type, Status)
│   │   ├── user.ts                        # Kiểu dữ liệu Người dùng, Phân quyền (Role, User, Log)
│   │   └── index.ts                       # Barrel export
│   │
│   ├── constants/                         # Hằng số & Dữ liệu hạt giống
│   │   ├── genealogy.ts                   # Hằng số dòng họ (HOME, FOUNDED, MAXGEN, Labels, Colors)
│   │   ├── seeds.ts                       # Dữ liệu mẫu (Thành viên 20 đời, Users, Góp ý, Logs)
│   │   └── index.ts
│   │
│   ├── utils/                             # Hàm tiện ích thuần túy
│   │   ├── text.ts                        # Chuẩn hóa tiếng Việt tìm kiếm không dấu (norm)
│   │   ├── format.ts                      # Xử lý định dạng sinh/mất/ngày giỗ, thời gian
│   │   └── index.ts
│   │
│   ├── context/                           # Quản lý State toàn cục & Định tuyến
│   │   ├── AppContext.tsx                 # React Context lưu trữ & thao tác dữ liệu
│   │   ├── useRouter.ts                   # Hash-based Router hook (useRoute, go, useLoading)
│   │   └── index.ts
│   │
│   ├── components/                        # UI Components tái sử dụng
│   │   ├── common/                        # UI dùng chung (Button, Badge, Modal, Empty, Skeleton, RoleSwitcher)
│   │   ├── layout/                        # Bố cục & Thanh điều hướng (TopBar)
│   │   ├── ornaments/                     # Họa tiết hoa văn truyền thống (Board, Rồng, Phượng, Cuốn thư, Sen)
│   │   ├── member/                        # Thẻ thành viên (MemberCard) & Ngăn chi tiết (MemberDrawer)
│   │   └── index.ts
│   │
│   ├── pages/                             # Màn hình theo tính năng nghiệp vụ
│   │   ├── auth/                          # Trang đăng nhập (LoginPage)
│   │   ├── home/                          # Trang chủ & Tìm kiếm (HomePage)
│   │   ├── tree/                          # Cây gia phả trực quan đa thế hệ (TreePage, RootPicker)
│   │   ├── feedback/                      # Gửi góp ý (FeedbackFormPage) & Góp ý của tôi (MyFeedbackPage)
│   │   ├── admin/                         # Cổng quản trị phân quyền
│   │   │   ├── AdminPage.tsx              # Khung giao diện quản trị & kiểm tra phân quyền
│   │   │   ├── DashboardTab.tsx           # Thống kê tổng quan dòng họ & góp ý chờ duyệt
│   │   │   ├── MembersTab.tsx             # Quản lý danh sách thành viên qua các đời
│   │   │   ├── MemberFormModal.tsx        # Modal form thêm / sửa thông tin thành viên
│   │   │   ├── FeedbacksTab.tsx           # Tiếp nhận và duyệt / từ chối góp ý
│   │   │   ├── UsersTab.tsx               # Quản lý người dùng & phân vai trò
│   │   │   └── AuditLogsTab.tsx           # Nhật ký thay đổi hệ thống
│   │   └── index.ts
│   │
│   ├── App.tsx                            # Root Shell & Page Router
│   ├── main.tsx                           # React 19 entrypoint gắn vào #root
│   ├── index.css                          # Cấu hình Tailwind CSS v4 & hình nền phôi
│   └── vite-env.d.ts                      # TypeScript declaration cho Vite
│
├── index.html                             # Shell HTML chính
├── vite.config.ts                         # Cấu hình Vite & Tailwind CSS v4 (@/* alias)
├── tsconfig.json                          # Cấu hình TypeScript compiler
└── package.json                           # Khai báo packages & build scripts
```

---

## Công Nghệ Sử Dụng (Tech Stack)

- **Frontend**: React 19, TypeScript 5.7+
- **Build Tool**: Vite 8
- **Styling**: Tailwind CSS v4 (qua plugin `@tailwindcss/vite`)
- **Package Manager**: pnpm
- **Asset Storage**: Git LFS cho hình ảnh chất lượng cao
