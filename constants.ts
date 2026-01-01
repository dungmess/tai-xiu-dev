
export const INITIAL_GOLD = 10000;
export const BET_LEVELS = [100, 500, 1000, 5000, 10000, 50000];

export const DICE_FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

export const RODS = [
  { level: 0, name: 'Cần Tre Cũ', price: 0, power: 10 },
  { level: 1, name: 'Cần Gỗ Mới', price: 1000, power: 25 },
  { level: 2, name: 'Cần Sợi Thủy Tinh', price: 5000, power: 50 },
  { level: 3, name: 'Cần Carbon Cao Cấp', price: 20000, power: 100 },
  { level: 4, name: 'Cần Thần Lực', price: 100000, power: 250 },
];

export const TELCOS = ['VIETTEL', 'MOBIFONE', 'VINAPHONE', 'ZING', 'GATE'];
export const CARD_AMOUNTS = [10000, 20000, 50000, 100000, 200000, 500000, 1000000];

// 10,000 VND Card = 120,000 Gold (Withdrawal fee included)
export const GOLD_TO_VND_RATE = 12; 

export const MASTER_MESSAGES = {
  WIN: [
    "Khá lắm! Thần bài tái thế chăng?",
    "Tiền vào như nước, chúc mừng thí chủ!",
    "Đúng là cao thủ không bằng tranh thủ.",
    "Một cú đặt cược đi vào lòng người!"
  ],
  LOSS: [
    "Thua keo này, ta bày keo khác.",
    "Của đi thay người, đừng buồn nhé.",
    "Có vẻ hôm nay gió không thuận chiều rồi.",
    "Bình tĩnh, đỏ quên đi đen sẽ tới!"
  ],
  TRIPLE: [
    "BÃO! Nhà cái hốt trọn, xin chia buồn!",
    "Tam linh hội tụ! Một sự trùng hợp hiếm hoi.",
    "Bão rồi! Cả làng cùng ra đê."
  ]
};
