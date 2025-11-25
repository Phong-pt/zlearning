/**
 * Storage Service
 * 
 * Lưu dữ liệu vào thư mục riêng trên điện thoại (zLearning folder)
 * - Android: Documents/zLearning/
 * - Web: localStorage (fallback)
 * 
 * Khi xóa app, dữ liệu vẫn còn trong thư mục!
 */

import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';

// Tên thư mục lưu trữ
const FOLDER_NAME = 'zLearning';
// Old folder name for migration
const OLD_FOLDER_NAME = 'LingoDeck';
const CARDS_FILE = 'cards.json';
const SETTINGS_FILE = 'settings.json';

/**
 * Kiểm tra xem đang chạy trên mobile hay web
 */
function isMobile() {
  return typeof window !== 'undefined' && 
         window.Capacitor && 
         window.Capacitor.isNativePlatform();
}

/**
 * Đảm bảo thư mục LingoDeck tồn tại
 */
async function ensureFolder() {
  if (!isMobile()) return true;
  
  try {
    // Kiểm tra thư mục đã tồn tại chưa
    await Filesystem.stat({
      path: FOLDER_NAME,
      directory: Directory.Documents,
    });
    return true;
  } catch (e) {
    // Thư mục chưa tồn tại, tạo mới
    try {
      await Filesystem.mkdir({
        path: FOLDER_NAME,
        directory: Directory.Documents,
        recursive: true,
      });
      console.log('Created zLearning folder in Documents');
      return true;
    } catch (mkdirError) {
      console.error('Failed to create folder:', mkdirError);
      return false;
    }
  }
}

/**
 * Lưu dữ liệu thẻ bài
 */
export async function saveCards(cards) {
  const jsonData = JSON.stringify(cards, null, 2);
  
  if (isMobile()) {
    try {
      await ensureFolder();
      await Filesystem.writeFile({
        path: `${FOLDER_NAME}/${CARDS_FILE}`,
        data: jsonData,
        directory: Directory.Documents,
        encoding: Encoding.UTF8,
      });
      console.log('Saved cards to Documents/zLearning/cards.json');
      return true;
    } catch (error) {
      console.error('Error saving cards to file:', error);
      // Fallback to localStorage
      localStorage.setItem('zlearning_cards', jsonData);
      return true;
    }
  } else {
    // Web: use localStorage
    localStorage.setItem('lingodeck_cards', jsonData);
    return true;
  }
}

/**
 * Đọc dữ liệu thẻ bài
 */
export async function loadCards() {
  if (isMobile()) {
    try {
      await ensureFolder();
      const result = await Filesystem.readFile({
        path: `${FOLDER_NAME}/${CARDS_FILE}`,
        directory: Directory.Documents,
        encoding: Encoding.UTF8,
      });
      console.log('Loaded cards from Documents/zLearning/cards.json');
      return JSON.parse(result.data);
    } catch (error) {
      console.log('No cards file found, checking localStorage...');
      // Try localStorage as fallback (for migration from old version)
      const localData = localStorage.getItem('zlearning_cards') || localStorage.getItem('lingodeck_cards');
      if (localData) {
        const cards = JSON.parse(localData);
        // Migrate to file storage
        await saveCards(cards);
        return cards;
      }
      return [];
    }
  } else {
    // Web: use localStorage
    const localData = localStorage.getItem('zlearning_cards') || localStorage.getItem('lingodeck_cards');
    return localData ? JSON.parse(localData) : [];
  }
}

/**
 * Lưu cài đặt
 */
export async function saveSettings(settings) {
  const jsonData = JSON.stringify(settings, null, 2);
  
  if (isMobile()) {
    try {
      await ensureFolder();
      await Filesystem.writeFile({
        path: `${FOLDER_NAME}/${SETTINGS_FILE}`,
        data: jsonData,
        directory: Directory.Documents,
        encoding: Encoding.UTF8,
      });
      return true;
    } catch (error) {
      console.error('Error saving settings:', error);
      localStorage.setItem('zlearning_settings', jsonData);
      return true;
    }
  } else {
    localStorage.setItem('lingodeck_settings', jsonData);
    return true;
  }
}

/**
 * Đọc cài đặt
 */
export async function loadSettings() {
  if (isMobile()) {
    try {
      const result = await Filesystem.readFile({
        path: `${FOLDER_NAME}/${SETTINGS_FILE}`,
        directory: Directory.Documents,
        encoding: Encoding.UTF8,
      });
      return JSON.parse(result.data);
    } catch (error) {
      const localData = localStorage.getItem('zlearning_settings') || localStorage.getItem('lingodeck_settings');
      return localData ? JSON.parse(localData) : {};
    }
  } else {
    const localData = localStorage.getItem('zlearning_settings') || localStorage.getItem('lingodeck_settings');
    return localData ? JSON.parse(localData) : {};
  }
}

/**
 * Xuất dữ liệu (backup)
 */
export async function exportData() {
  const cards = await loadCards();
  const settings = await loadSettings();
  
  const exportData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    cards,
    settings,
  };
  
  if (isMobile()) {
    try {
      const fileName = `zLearning_Backup_${Date.now()}.json`;
      await Filesystem.writeFile({
        path: `${FOLDER_NAME}/${fileName}`,
        data: JSON.stringify(exportData, null, 2),
        directory: Directory.Documents,
        encoding: Encoding.UTF8,
      });
      return { success: true, path: `Documents/${FOLDER_NAME}/${fileName}` };
    } catch (error) {
      console.error('Export error:', error);
      return { success: false, error: error.message };
    }
  } else {
    // Web: download file
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zLearning_Backup_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    return { success: true };
  }
}

/**
 * Nhập dữ liệu từ backup
 */
export async function importData(jsonString) {
  try {
    const data = JSON.parse(jsonString);
    
    if (data.cards && Array.isArray(data.cards)) {
      await saveCards(data.cards);
    }
    
    if (data.settings) {
      await saveSettings(data.settings);
    }
    
    return { success: true, cardsCount: data.cards?.length || 0 };
  } catch (error) {
    console.error('Import error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Lấy thông tin thư mục lưu trữ
 */
export async function getStorageInfo() {
  if (isMobile()) {
    try {
      const stat = await Filesystem.stat({
        path: FOLDER_NAME,
        directory: Directory.Documents,
      });
      return {
        platform: 'mobile',
        path: `Documents/${FOLDER_NAME}/`,
        exists: true,
        ...stat,
      };
    } catch (error) {
      return {
        platform: 'mobile',
        path: `Documents/${FOLDER_NAME}/`,
        exists: false,
      };
    }
  } else {
    return {
      platform: 'web',
      path: 'localStorage',
      exists: true,
    };
  }
}

/**
 * Xóa tất cả dữ liệu (cẩn thận!)
 */
export async function clearAllData() {
  if (isMobile()) {
    try {
      await Filesystem.rmdir({
        path: FOLDER_NAME,
        directory: Directory.Documents,
        recursive: true,
      });
      await ensureFolder();
      return true;
    } catch (error) {
      console.error('Clear data error:', error);
      return false;
    }
  } else {
    localStorage.removeItem('zlearning_cards');
    localStorage.removeItem('zlearning_settings');
    // Also clear old keys for full cleanup
    localStorage.removeItem('lingodeck_cards');
    localStorage.removeItem('lingodeck_settings');
    return true;
  }
}

export default {
  saveCards,
  loadCards,
  saveSettings,
  loadSettings,
  exportData,
  importData,
  getStorageInfo,
  clearAllData,
  isMobile,
};

