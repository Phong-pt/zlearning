# Hướng dẫn Deploy lên GitHub Pages - zLearning

## 📦 Về lưu trữ dữ liệu

**Không cần lo!** App sử dụng **localStorage** của trình duyệt:
- ✅ Mỗi người chỉ thấy thẻ của mình
- ✅ Dữ liệu lưu trên máy của họ, không ai khác thấy được
- ✅ Mở lại web vẫn còn dữ liệu
- ✅ 5000 từ ≈ 1-2MB, rất nhẹ!

**Ví dụ:**
- Bạn học trên máy bạn → Bạn chỉ thấy thẻ bạn lưu
- Người khác học trên máy họ → Họ chỉ thấy thẻ họ lưu
- Hai người mở cùng link → Mỗi người thấy data riêng của mình

---

## 🚀 Các bước Deploy

### Bước 1: Tạo GitHub Repository

1. Vào [github.com](https://github.com) → Đăng nhập
2. Click **"New repository"** (nút màu xanh)
3. Đặt tên: `zlearning` (hoặc tên khác bạn muốn)
4. Để **Public** (bắt buộc cho GitHub Pages miễn phí)
5. **KHÔNG** chọn "Add README" (vì mình đã có)
6. Click **"Create repository"**

### Bước 2: Push code lên GitHub

Mở **PowerShell** trong thư mục project và chạy:

```powershell
cd "C:\Users\phong\Downloads\APP học từ"

# Khởi tạo git (chỉ lần đầu)
git init

# Thêm tất cả files
git add .

# Commit
git commit -m "Initial commit - zLearning v2.0"

# Thêm remote (thay YOUR_USERNAME bằng username GitHub của bạn)
git remote add origin https://github.com/YOUR_USERNAME/zlearning.git

# Đổi branch sang main
git branch -M main

# Push lên GitHub
git push -u origin main
```

### Bước 3: Bật GitHub Pages

1. Vào repo trên GitHub
2. Click **Settings** (tab bên phải)
3. Scroll xuống mục **Pages** (menu bên trái)
4. **Source**: Chọn **"GitHub Actions"**
5. Xong! Workflow sẽ tự chạy

### Bước 4: Chờ deploy

1. Vào tab **Actions** trên GitHub
2. Xem workflow **"Deploy to GitHub Pages"** đang chạy
3. Chờ ~2-3 phút cho đến khi hiện ✅ màu xanh

### Bước 5: Truy cập web

Web của bạn sẽ ở địa chỉ:
```
https://YOUR_USERNAME.github.io/zlearning/
```

---

## ⚠️ Lưu ý quan trọng

### Nếu đặt tên repo khác "zlearning"

Mở file `vite.config.js` và sửa dòng:
```javascript
base: process.env.GITHUB_ACTIONS ? '/ten-repo-cua-ban/' : '/',
```

### Mỗi lần update code

```powershell
git add .
git commit -m "Mô tả thay đổi"
git push
```

GitHub Actions sẽ tự động build và deploy lại.

---

## 🔧 Troubleshooting

### Lỗi "Permission denied"
- Kiểm tra đã đăng nhập Git chưa
- Chạy: `git config --global user.email "email@example.com"`

### Web hiển thị trắng
- Kiểm tra đường dẫn base trong `vite.config.js`
- Mở Console (F12) để xem lỗi

### Không thấy Actions
- Vào Settings → Actions → General → Enable

---

## 📱 Kết hợp với APK

- **Web** (GitHub Pages): Dùng trên máy tính, data lưu trong trình duyệt
- **APK** (Android): Dùng trên điện thoại, data lưu trong `Documents/zLearning/`

**Data riêng biệt** - không sync giữa web và app (để đảm bảo privacy)

