# 📱 Hướng dẫn Build App Android - LingoDeck

## 💾 Lưu trữ dữ liệu

App lưu dữ liệu thẻ bài vào thư mục riêng trên điện thoại:

```
📁 Documents/
   └── 📁 LingoDeck/
       ├── 📄 cards.json          ← Tất cả thẻ bài
       ├── 📄 settings.json       ← Cài đặt
       └── 📄 LingoDeck_Backup_*.json  ← File backup
```

### ✅ Ưu điểm:
- **Offline hoàn toàn** - Không cần internet để sử dụng
- **Dữ liệu an toàn** - Khi xóa app, thư mục LingoDeck vẫn còn
- **Dễ backup** - Copy folder hoặc dùng tính năng Export trong app
- **Chuyển máy dễ dàng** - Copy folder sang điện thoại mới

### 📍 Vị trí thư mục:
- Mở app **Quản lý tệp** (Files) trên điện thoại
- Vào **Documents** → **LingoDeck**

---

## Yêu cầu

1. **Android Studio** - Tải tại: https://developer.android.com/studio
2. **Java JDK 17+** - Thường được cài kèm Android Studio

## Cách 1: Sử dụng Android Studio (Đề xuất)

### Bước 1: Mở project trong Android Studio
```bash
npm run android:open
```
Hoặc mở thủ công: File → Open → Chọn thư mục `android`

### Bước 2: Build APK
1. Trong Android Studio, vào **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
2. Đợi build xong
3. File APK nằm tại: `android/app/build/outputs/apk/debug/app-debug.apk`

### Bước 3: Cài đặt lên điện thoại
1. Copy file APK sang điện thoại
2. Mở file APK để cài đặt
3. Cho phép "Cài đặt từ nguồn không xác định" nếu được hỏi

---

## Cách 2: Build bằng Command Line

### Bước 1: Sync project
```bash
npm run android:sync
```

### Bước 2: Build APK
```bash
cd android
.\gradlew assembleDebug
```

### Bước 3: Tìm file APK
```
android/app/build/outputs/apk/debug/app-debug.apk
```

---

## Build Release APK (Để đăng Play Store)

### 1. Tạo Keystore
```bash
keytool -genkey -v -keystore lingodeck-release-key.keystore -alias lingodeck -keyalg RSA -keysize 2048 -validity 10000
```

### 2. Cấu hình signing trong `android/app/build.gradle`
Thêm vào block `android`:
```gradle
signingConfigs {
    release {
        storeFile file("lingodeck-release-key.keystore")
        storePassword "your-password"
        keyAlias "lingodeck"
        keyPassword "your-password"
    }
}

buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled true
        proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
    }
}
```

### 3. Build Release
```bash
cd android
.\gradlew assembleRelease
```

File APK: `android/app/build/outputs/apk/release/app-release.apk`

---

## Các lệnh hữu ích

| Lệnh | Mô tả |
|------|-------|
| `npm run android:sync` | Build web + sync vào Android |
| `npm run android:open` | Mở Android Studio |
| `npx cap run android` | Chạy trên thiết bị/emulator |

---

## Cập nhật App

Mỗi khi thay đổi code web:
```bash
npm run android:sync
```
Sau đó build lại APK trong Android Studio.

---

## Troubleshooting

### Lỗi "SDK not found"
1. Mở Android Studio
2. Vào **File** → **Settings** → **Appearance & Behavior** → **System Settings** → **Android SDK**
3. Cài đặt SDK phiên bản 33 trở lên

### Lỗi "Gradle sync failed"
1. File → Sync Project with Gradle Files
2. Hoặc chạy: `cd android && .\gradlew clean`

### App bị trắng/không load
1. Kiểm tra internet connection
2. Clear app data và thử lại

