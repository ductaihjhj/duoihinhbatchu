/* ============================================
   FIREBASE CLOUD DATABASE SYNC
   Đồng bộ dữ liệu câu hỏi qua đám mây thời gian thực
   ============================================ */

const firebaseConfig = {
  apiKey: "AIzaSyDThgds2pEGXWEYCGK80qUjjSAokekEse8",
  authDomain: "game-duoihinh.firebaseapp.com",
  databaseURL: "https://game-duoihinh-default-rtdb.firebaseio.com",
  projectId: "game-duoihinh",
  storageBucket: "game-duoihinh.firebasestorage.app",
  messagingSenderId: "1085939372618",
  appId: "1:1085939372618:web:64283536fea349d33cccb3",
  measurementId: "G-EBR47KPZQC"
};

// Khởi tạo Firebase
let db = null;
try {
    if (typeof firebase !== 'undefined') {
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        db = firebase.database();
    }
} catch (err) {
    console.warn("Không thể kết nối Firebase:", err);
}

// Hàm lấy dữ liệu câu hỏi từ Cloud
async function fetchCloudLevels() {
    if (!db) {
        return getLocalFallbackLevels();
    }

    try {
        const snapshot = await db.ref('questions').once('value');
        const data = snapshot.val();

        if (Array.isArray(data) && data.length > 0) {
            // Lưu bản cache vào máy phòng khi mất mạng
            try {
                localStorage.setItem('CLOUD_LEVELS_CACHE', JSON.stringify(data));
            } catch (e) {}
            return data;
        } else {
            // Nếu trên Cloud chưa có dữ liệu (lần đầu tạo), tự động khởi tạo bằng 22 câu hỏi mặc định
            if (typeof LEVELS !== 'undefined' && Array.isArray(LEVELS) && LEVELS.length > 0) {
                await saveCloudLevels(LEVELS);
                return LEVELS;
            }
        }
    } catch (error) {
        console.warn("Lỗi đọc dữ liệu từ Cloud, chuyển sang chế độ dự phòng:", error);
    }

    return getLocalFallbackLevels();
}

// Hàm lưu câu hỏi lên Cloud
async function saveCloudLevels(levelsArray) {
    if (!db) {
        throw new Error("Chưa kết nối được với Firebase Cloud!");
    }

    await db.ref('questions').set(levelsArray);
    try {
        localStorage.setItem('CLOUD_LEVELS_CACHE', JSON.stringify(levelsArray));
    } catch (e) {}
    return true;
}

// Hàm lấy dữ liệu dự phòng (Cache hoặc data.js)
function getLocalFallbackLevels() {
    try {
        const cached = localStorage.getItem('CLOUD_LEVELS_CACHE');
        if (cached) {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
        const custom = localStorage.getItem('CUSTOM_LEVELS');
        if (custom) {
            const parsed = JSON.parse(custom);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
    } catch (e) {}

    return (typeof LEVELS !== 'undefined' && Array.isArray(LEVELS)) ? LEVELS : [];
}
