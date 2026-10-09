/* ============================================
   GAME DATA - DỮ LIỆU CÂU HỎI
   
   Cách thêm câu hỏi mới:
   1. Thêm hình ảnh vào thư mục images/<category>/
   2. Thêm object mới vào mảng LEVELS bên dưới
   3. Mỗi object cần có:
      - image: đường dẫn tới file ảnh
      - emoji: emoji dự phòng nếu ảnh không load được
      - answer: đáp án TIẾNG VIỆT CÓ DẤU (viết HOA)
      - hint: gợi ý cho người chơi
      - extraLetters: các chữ cái nhiễu (4-8 chữ)
   ============================================ */

const LEVELS = [
    // ====== ĐỘNG VẬT ======
    {
        image: "images/animals/cho.svg",
        emoji: "🐕",
        answer: "CHÓ",
        hint: "Bạn thân của con người",
        extraLetters: "AXMPBK"
    },
    {
        image: "images/animals/meo.svg",
        emoji: "🐱",
        answer: "MÈO",
        hint: "Kêu meo meo, thích bắt chuột",
        extraLetters: "BXLNPK"
    },
    {
        image: "images/animals/voi.svg",
        emoji: "🐘",
        answer: "VOI",
        hint: "Động vật to nhất trên cạn",
        extraLetters: "BXLKNMP"
    },
    {
        image: "images/animals/su-tu.svg",
        emoji: "🦁",
        answer: "SƯ TỬ",
        hint: "Vua của muôn loài",
        extraLetters: "BXLKNMA"
    },
    {
        image: "images/animals/tho.svg",
        emoji: "🐰",
        answer: "THỎ",
        hint: "Tai dài, nhảy giỏi, thích cà rốt",
        extraLetters: "BXLKNMC"
    },
    {
        image: "images/animals/ca.svg",
        emoji: "🐟",
        answer: "CÁ",
        hint: "Sống dưới nước, có vây",
        extraLetters: "BXLKNMPT"
    },

    // ====== TRÁI CÂY ======
    {
        image: "images/fruits/tao.svg",
        emoji: "🍎",
        answer: "TÁO",
        hint: "Quả màu đỏ, Newton và quả này",
        extraLetters: "BXKPNG"
    },
    {
        image: "images/fruits/chuoi.svg",
        emoji: "🍌",
        answer: "CHUỐI",
        hint: "Quả dài, màu vàng, khỉ rất thích",
        extraLetters: "BXKNMA"
    },
    {
        image: "images/fruits/dua-hau.svg",
        emoji: "🍉",
        answer: "DƯA HẤU",
        hint: "Quả to, xanh vỏ đỏ lòng",
        extraLetters: "BXKNMT"
    },
    {
        image: "images/fruits/nho.svg",
        emoji: "🍇",
        answer: "NHO",
        hint: "Quả nhỏ, mọc thành chùm",
        extraLetters: "BXLKAMP"
    },

    // ====== ẨM THỰC ======
    {
        image: "images/food/pizza.svg",
        emoji: "🍕",
        answer: "PIZZA",
        hint: "Món ăn nổi tiếng từ nước Ý",
        extraLetters: "BXLKNM"
    },
    {
        image: "images/food/com.svg",
        emoji: "🍚",
        answer: "CƠM",
        hint: "Bữa ăn chính của người Việt",
        extraLetters: "BXLKNPA"
    },
    {
        image: "images/food/pho.svg",
        emoji: "🍜",
        answer: "PHỞ",
        hint: "Món nước nổi tiếng nhất Việt Nam",
        extraLetters: "BXLKNMA"
    },
    {
        image: "images/food/banh-mi.svg",
        emoji: "🥖",
        answer: "BÁNH MÌ",
        hint: "Món ăn đường phố VN nổi tiếng thế giới",
        extraLetters: "XKLPGT"
    },

    // ====== THIÊN NHIÊN ======
    {
        image: "images/nature/hoa.svg",
        emoji: "🌸",
        answer: "HOA",
        hint: "Mọc trong vườn, rất đẹp và thơm",
        extraLetters: "BXLKNM"
    },
    {
        image: "images/nature/nui.svg",
        emoji: "⛰️",
        answer: "NÚI",
        hint: "Địa hình cao nhất, có đỉnh nhọn",
        extraLetters: "BXLKAMP"
    },
    {
        image: "images/nature/bien.svg",
        emoji: "🌊",
        answer: "BIỂN",
        hint: "Nơi có nước mặn mênh mông",
        extraLetters: "XKCPGM"
    },
    {
        image: "images/nature/mat-troi.svg",
        emoji: "☀️",
        answer: "MẶT TRỜI",
        hint: "Ngôi sao gần Trái Đất nhất",
        extraLetters: "XKBP"
    },

    // ====== ĐỒ VẬT / PHƯƠNG TIỆN ======
    {
        image: "images/objects/xe.svg",
        emoji: "🚗",
        answer: "XE",
        hint: "Phương tiện giao thông phổ biến",
        extraLetters: "BALNKMP"
    },
    {
        image: "images/objects/may-bay.svg",
        emoji: "✈️",
        answer: "MÁY BAY",
        hint: "Bay trên trời, chở khách đi xa",
        extraLetters: "XKLNP"
    },
    {
        image: "images/objects/nha.svg",
        emoji: "🏠",
        answer: "NHÀ",
        hint: "Nơi ở của gia đình",
        extraLetters: "BXLKPM"
    },
    {
        image: "images/objects/sach.svg",
        emoji: "📚",
        answer: "SÁCH",
        hint: "Đọc để mở mang kiến thức",
        extraLetters: "BXLKNM"
    }
];

/* ============================================
   CÀI ĐẶT GAME
   Chỉnh các thông số game ở đây
   ============================================ */
const GAME_CONFIG = {
    questionsPerRound: 12,      // Số câu hỏi mỗi lượt chơi
    pointsPerCorrect: 100,      // Điểm thưởng khi đúng
    hintPenalty: 20,            // Điểm trừ khi dùng gợi ý
    totalHints: 3,              // Số lượt gợi ý
    showImageFallback: true,    // Hiện emoji nếu ảnh lỗi
};
