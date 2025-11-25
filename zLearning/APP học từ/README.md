# zLearning 📚

> Học từ vựng đa ngôn ngữ thông minh với AI

![zLearning](https://img.shields.io/badge/zLearning-v2.0.0-emerald)
![React](https://img.shields.io/badge/React-18.2-blue)
![Capacitor](https://img.shields.io/badge/Capacitor-7.4-purple)

## 🌟 Giới thiệu

zLearning là ứng dụng học từ vựng đa ngôn ngữ với tính năng tra cứu từ điển thông minh và hỗ trợ AI. Người dùng có thể:
- **Tra cứu từ** với nhiều nguồn từ điển (Free Dictionary, Wiktionary)
- **AI Summarization** - Tự động tóm tắt nghĩa ngắn gọn với Gemini/GPT
- **Ôn tập** bằng flashcard đẹp mắt
- **Kiểm tra** kiến thức với Active Recall Quiz
- **Sưu tập** và quản lý các thẻ đã tạo

## 🚀 Bắt đầu

### Yêu cầu
- Node.js 18+ 
- npm hoặc yarn
- Android Studio (nếu build app Android)

### Cài đặt

```bash
# Clone repo hoặc tạo project
cd "APP học từ"

# Cài đặt dependencies
npm install

# Chạy development server
npm run dev
```

Mở trình duyệt tại `http://localhost:5173`

### Build Android APK

```bash
# Build và sync
npm run android:sync

# Mở Android Studio
npm run android:open
```

## 🎮 Tính năng

### 1. Smart Dictionary Lookup 🔍
- **Tiếng Anh**: Free Dictionary API với phiên âm IPA
- **Tiếng Nga**: Wiktionary API với loại từ và ngữ pháp
- **Các ngôn ngữ khác**: Auto translate sang tiếng Việt
- **Smart Phonetic**: Tự động tìm phiên âm cho từ phái sinh (attractiveness, beautifully...)
- **Rút gọn nghĩa**: Tự động làm ngắn gọn các định nghĩa dài dòng

### 2. AI Summarization ⚡ (Mới!)
- Tích hợp **Google Gemini** (Free!) hoặc **OpenAI GPT**
- Tự động tóm tắt nghĩa tiếng Việt ngắn gọn, dễ hiểu
- Không cần chỉnh sửa thủ công nữa!

### 3. Multi-language Support 🌍
- 🇬🇧 English
- 🇨🇳 中文 (Chinese)
- 🇷🇺 Русский (Russian) - Cải tiến với Wiktionary!
- 🇯🇵 日本語 (Japanese)
- 🇰🇷 한국어 (Korean)
- 🇫🇷 Français (French)
- 🇩🇪 Deutsch (German)
- 🇪🇸 Español (Spanish)

### 4. Flashcard System 🎴
- Lướt qua từng thẻ bằng swipe hoặc phím mũi tên
- Xáo bài ngẫu nhiên
- Hiệu ứng chuyển trang mượt mà

### 5. Active Recall Quiz
- Cơ chế "Cloze Deletion" 
- Theo dõi điểm số và tiến độ
- Hiệu ứng khi trả lời đúng

### 6. The Binder (Sổ sưu tập)
- Hiển thị dạng lưới
- Lọc theo loại từ và ngôn ngữ
- Tìm kiếm nhanh

## 🎨 Thiết kế

- **Color coding**: Mỗi loại từ một màu riêng
  - 🔵 Noun (Danh từ)
  - 🔴 Verb (Động từ)  
  - 🟢 Adjective (Tính từ)
  - 🟣 Adverb (Trạng từ)
- **Responsive**: Tối ưu cho cả mobile và desktop
- **Dark theme**: Dễ nhìn, bảo vệ mắt

## 💾 Lưu trữ

**Android**: `Documents/zLearning/` - Không mất dữ liệu khi xóa app!
**Web**: Local Storage

## 🔌 API tích hợp

- **Free Dictionary API** - Tiếng Anh
- **Wiktionary API** - Tiếng Nga và các ngôn ngữ khác
- **MyMemory Translation** - Dịch sang tiếng Việt
- **Google Gemini / OpenAI** - AI Summarization (optional)

## 🛠 Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **Mobile**: Capacitor (Android)
- **Storage**: Capacitor Filesystem / Local Storage

## 📁 Cấu trúc

```
src/
├── components/
│   ├── VocabCard.jsx      # Card component
│   ├── CardCreator.jsx    # Tạo thẻ mới + AI Settings
│   ├── Deck.jsx           # Chế độ học
│   ├── Quiz.jsx           # Chế độ kiểm tra
│   ├── Binder.jsx         # Sổ sưu tập
│   └── Navigation.jsx     # Thanh điều hướng
├── context/
│   └── CardContext.jsx    # State management
├── services/
│   ├── dictionaryService.js  # Multi-API dictionary lookup
│   └── storageService.js     # File/localStorage management
├── App.jsx
├── main.jsx
└── index.css
```

## 📝 License

MIT License - Tự do sử dụng và phát triển!

---

Made with ❤️ for language learners
