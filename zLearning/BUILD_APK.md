# Hướng dẫn Build APK - zLearning

## Cách 1: Build bằng Android Studio (Khuyến nghị)

1. **Mở Android Studio** (đã mở tự động)

2. **Chờ Gradle sync** xong (có thể mất 2-5 phút lần đầu)

3. **Build APK**:
   - Menu: `Build` → `Build Bundle(s) / APK(s)` → `Build APK(s)`
   - Hoặc nhấn `Ctrl+F9` để build

4. **Tìm file APK**:
   ```
   android/app/build/outputs/apk/debug/app-debug.apk
   ```

5. **Copy APK vào điện thoại** và cài đặt

## Cách 2: Build bằng Command Line

### Bước 1: Đảm bảo JAVA_HOME

Mở PowerShell và chạy:
```powershell
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
```

### Bước 2: Fix Gradle Wrapper

Nếu gặp lỗi `GradleWrapperMain`, cần fix gradle-wrapper.jar:

```powershell
cd android

# Xóa file cũ
Remove-Item gradle\wrapper\gradle-wrapper.jar

# Download file mới (chạy trong PowerShell Admin)
gradle wrapper --gradle-version 8.11.1
```

Hoặc copy `gradle-wrapper.jar` từ project Capacitor khác.

### Bước 3: Build APK

```powershell
cd android
.\gradlew.bat assembleDebug
```

File APK sẽ ở: `android/app/build/outputs/apk/debug/app-debug.apk`

## Thông tin APK

- **Package**: com.zlearning.app
- **Tên app**: zLearning
- **Phiên bản**: 1.0.0

## Lưu ý

- File APK debug có thể cài trực tiếp
- Để phát hành lên Play Store, cần build Release APK với signing key

