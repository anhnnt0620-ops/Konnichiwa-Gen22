// Stage definitions and quest locations according to official FTU & JPC Timeline
const STAGE_DATA = {
  stage1: {
    id: 'stage1',
    name: 'HỘI TRÁT 1: KHAI NHÃN (01/10 – 20/10)',
    subtitle: 'Sân Nhà D FTU — Ngày Hội FCD (18/10) · Điền Đơn Vòng 1',
    bgm: 'stage1',
    playerStart: { x: 9.5, y: 41.5 }, // Cổng trường Chùa Láng (ngay dưới Cổng Trường ĐH Ngoại Thương)
    questSpot: { x: 13.8 * 32, y: 29.8 * 32 }, // Bàn Check-in FCD đối diện FTU Shop
    questText: 'Đến Bàn Check-in FCD đối diện FTU Shop để nhận thẻ ngày hội!',
    questTitle: 'Hội Trát 1: Khai Nhãn',
    timeline: '01/10 – 20/10/2026 · FTU Club Day: 18/10',
    objective: 'Đi qua Cổng chào Ngày hội đến Bàn Check-in FCD đối diện FTU Shop để check-in, sau đó gặp Senpai JPC trên đường và ghé Gian Trại JPC điền đơn Vòng 1.',
    location: 'Bàn Check-in FCD & Gian Trại JPC Sân Nhà D FTU',
    tip: 'Đi qua Cổng chào Ngày hội để gặp BTC Check-in FCD tại bàn check-in!',
    props: [
      { type: 'prop_boba', x: 19, y: 22, label: 'Trà sữa FCD' }
    ],
    items: [],
    npcs: [
      {
        id: 'npc_guard',
        name: 'Bác Bảo Vệ FTU',
        sprite: 'npc_president',
        x: 7.2,
        y: 38.2,
        avatarIcon: '👴',
        dialogues: [
          { speaker: 'Bác Bảo Vệ FTU', text: 'Chào mừng cháu đến với Trường Đại học Ngoại Thương!' },
          { speaker: 'Bác Bảo Vệ FTU', text: 'Hôm nay 18/10, tại FTU diễn ra Ngày hội các Câu lạc bộ - FTU Club\'s Day (FCD) rộn ràng lắm đấy!' },
          { speaker: 'Bác Bảo Vệ FTU', text: 'Cháu đi thẳng qua Cổng chào Ngày hội, đối diện FTU Shop sẽ thấy Bàn Check-in FCD nhé. Hãy tới đó check-in lấy thẻ tham gia hội chợ nha!' }
        ]
      },
      {
        id: 'npc_fcd_checkin',
        name: 'BTC Check-in FCD',
        sprite: 'npc_president',
        x: 13.8,
        y: 28.5,
        avatarIcon: '📋',
        dialogues: [
          { speaker: 'BTC Check-in FCD', text: 'Chào mừng tân sinh viên đến với Ngày hội Chào Tân Sinh Viên - FTU Club\'s Day (FCD) 2026!' },
          { speaker: 'BTC Check-in FCD', text: 'Anh/chị đã đóng dấu check-in vào ngày hội FCD cho em rồi nhé! Chúc em có một ngày hội bùng nổ và sớm tìm được ngôi nhà chung CLB phù hợp!' }
        ]
      },
      {
        id: 'npc_senpai_road',
        name: 'Senpai JPC',
        sprite: 'npc_senpai',
        x: 11.5,
        y: 24.5,
        avatarIcon: '🌸',
        dialogues: [
          { speaker: 'Senpai JPC', text: 'Konnichiwa! Chào mừng em đến với FTU Club\'s Day (FCD)!' },
          { speaker: 'Senpai JPC', text: 'Chị là Senpai từ CLB Tiếng Nhật Trường ĐH Ngoại Thương - JPC FTU đây.' },
          { speaker: 'Senpai JPC', text: 'Hôm nay JPC đang mở đợt tuyển quân Gen 22 với rất nhiều cơ hội bùng nổ và tỏa sáng!' },
          { speaker: 'Senpai JPC', text: 'Gian Trại JPC màu đỏ thắm của bọn chị ở ngay góc Sân Nhà D đằng kia. Em hãy mau vào Booth JPC điền đơn ứng tuyển Vòng 1 nhé!' }
        ]
      }
    ]
  },

  stage2: {
    id: 'stage2',
    name: 'HỘI TRÁT 2: HÒA NHỊP (23/10 – 25/10)',
    subtitle: 'Tòa B FTU — Phỏng Vấn Online Gen 22',
    bgm: 'stage2',
    questSpot: { x: 27 * 32, y: 17 * 32 },
    questText: 'Di chuyển lên Tòa B gặp Senpai để mở máy tính tham gia Phỏng Vấn Online (23/10 – 25/10)!',
    questTitle: 'Hội Trát 2: Hòa Nhịp (Phỏng Vấn Online)',
    timeline: '23/10 – 25/10/2026',
    objective: 'Gặp Senpai tại Tòa B và mở laptop phòng họp trực tuyến để trả lời bộ 5 câu hỏi trắc nghiệm (Multiple Choice) kiểm tra mức độ hiểu biết về JPC (cần đạt tối thiểu 4/5 câu).',
    location: 'Tòa Nhà B · Trường Đại học Ngoại Thương',
    tip: 'Vòng phỏng vấn online qua máy tính. Hãy trả lời chính xác tối thiểu 4/5 câu hỏi trắc nghiệm về JPC để vượt qua vòng phỏng vấn!',
    props: [
      { type: 'prop_blackboard', x: 27, y: 16, label: 'Bảng xanh B201 FTU' },
      { type: 'prop_desk', x: 27, y: 17, label: 'Bàn phỏng vấn online' },
      { type: 'prop_lantern', x: 24, y: 17, label: 'Đèn ấm áp' },
      { type: 'prop_lantern', x: 30, y: 17, label: 'Đèn ấm áp' }
    ],
    items: [],
    npcs: [
      {
        id: 'npc_interviewer',
        name: 'Senpai JPC',
        sprite: 'npc_senpai',
        x: 27,
        y: 17,
        avatarIcon: '🌸',
        dialogues: [
          { speaker: 'Senpai JPC', text: 'Konnichiwa! Chúc mừng em đã xuất sắc vượt qua Hội trát 1: Khai Nhãn và bước vào Hội trát 2: Hòa Nhịp!' },
          { speaker: 'Senpai JPC', text: 'Hội trát 2 năm nay sẽ được thực hiện online! Em hãy mở máy tính lên để kết nối phòng phỏng vấn trực tuyến với Pokemon bô lão của JPC và trả lời bộ 5 câu hỏi trắc nghiệm về nhé (cần đạt tối thiểu 4/5 câu để qua vòng)!' }
        ]
      }
    ]
  },

  stage3_1: {
    id: 'stage3_1',
    name: 'HỘI TRÁT 3.1: PHÁ PHONG (27/10 – 03/11)',
    subtitle: 'Nhà Thể Chất FTU — Đấu Trường Tổ Đội 5 Ban vs. Tengu',
    bgm: 'stage3_1',
    questSpot: { x: 42.5 * 32, y: 5.2 * 32 },
    interiorQuestSpot: { x: 13 * 32, y: 6.2 * 32 },
    questText: 'Di chuyển lên Nhà Thể Chất FTU (phía Bắc sân trường), bước vào đấu trường bên trong để ghép ngẫu nhiên tổ đội 5 ban và đánh bại Tengu!',
    questTitle: 'Hội Trát 3.1: Phá Phong',
    timeline: '27/10 – 03/11/2026 · Pitching: 04 – 05/11',
    objective: 'Bước vào không gian Nhà Thể Chất FTU, ghép tổ đội 5 ban liên máy chủ và hợp lực giải 5 câu hỏi Nhân Sư chéo ban (10s/câu, câu cuối mấu chốt) để đánh bại Tengu!',
    location: 'Bên trong Nhà Thể Chất FTU (Khuôn viên phía Bắc)',
    tip: 'Câu hỏi của ban này sẽ do thành viên ban khác trả lời trong 10 giây — mỗi câu rút 20% HP của Tengu!',
    props: [
      { type: 'prop_lantern', x: 40, y: 5, label: 'Đèn lồng Nhà Thể Chất' },
      { type: 'prop_lantern', x: 44, y: 5, label: 'Đèn lồng Nhà Thể Chất' },
      { type: 'prop_boba', x: 39, y: 6, label: 'Trà sữa tiếp sức' }
    ],
    interiorProps: [
      { type: 'prop_lantern', x: 9, y: 4, label: 'Đèn Phá Phong' },
      { type: 'prop_lantern', x: 16, y: 4, label: 'Đèn Phá Phong' },
      { type: 'prop_desk', x: 6, y: 12, label: 'Bàn tiếp sức 5 Ban' },
      { type: 'prop_boba', x: 7, y: 12, label: 'Nước tăng lực FCD' }
    ],
    items: [],
    npcs: [],
    interiorNpcs: [
      {
        id: 'npc_leader',
        name: 'Trưởng Nhóm Phá Phong',
        sprite: 'npc_leader',
        x: 10,
        y: 6.5,
        avatarIcon: '⚡',
        dialogues: [
          { speaker: 'Trưởng Nhóm', text: 'Chào mừng em đã bước vào Đấu Trường Phá Phong bên trong Nhà Thể Chất FTU!' },
          { speaker: 'Trưởng Nhóm', text: 'Tengu Bão Tố đang phong ấn Nhà Thể Chất! Chúng ta sẽ ghép ngẫu nhiên tổ đội đủ 5 Ban liên máy chủ và dùng trí tuệ Nhân Sư chéo ban (5 câu · 10s/câu) để phá tan phong ấn!' }
        ]
      }
    ]
  },

  stage3_2: {
    id: 'stage3_2',
    name: 'HỘI TRÁT 3.2: CHÂN DIỆN (08/11 – 09/11)',
    subtitle: 'Trường VJCBI — Vòng Phỏng Vấn Cá Nhân',
    bgm: 'stage3_2',
    questSpot: { x: 27 * 32, y: 32 * 32 },
    questText: 'Di chuyển sang Trường VJCBI ngay dưới Nhà A, bước vào phòng trà đạo đối thoại cùng Ban Điều Hành (08/11 – 09/11)!',
    questTitle: 'Hội Trát 3.2: Chân Diện',
    timeline: '08/11 – 09/11/2026',
    objective: 'Gặp gỡ và trò chuyện chân thành, sâu lắng 1-on-1 cùng Ban Điều Hành JPC trong không gian văn hóa trà đạo Nhật Bản tại VJCBI.',
    location: 'Trường VJCBI (phía Nam Nhà A, trên KTX 7 tầng)',
    tip: 'Hãy lắng nghe trái tim mình và thể hiện bản sắc chân thật nhất của bạn.',
    props: [
      { type: 'prop_lantern', x: 25, y: 32, label: 'Đèn trà đạo hoàng hôn' },
      { type: 'prop_lantern', x: 29, y: 32, label: 'Đèn trà đạo hoàng hôn' },
      { type: 'prop_desk', x: 27, y: 32, label: 'Bàn trà đạo VJCBI' }
    ],
    items: [],
    npcs: [
      {
        id: 'npc_mentor_heart',
        name: 'Ban Điều Hành JPC',
        sprite: 'npc_president',
        x: 27,
        y: 32,
        avatarIcon: '🍵',
        dialogues: [
          { speaker: 'Ban Điều Hành', text: 'Chào em đến với không gian trà đạo Trường VJCBI — góc Nhật Bản tĩnh lặng ngay trong lòng Ngoại Thương.' },
          { speaker: 'Ban Điều Hành', text: 'Vòng 3.2 Chân Diện (08/11 – 09/11) là nơi chúng mình lắng nghe tiếng lòng chân thành nhất của em sau chặng đường dài.' },
          { speaker: 'Ban Điều Hành', text: 'Hãy soi rọi vào tấm gương nội tâm và chia sẻ ước mơ cùng đại gia đình JPC nhé.' }
        ]
      }
    ]
  },

  stage_final: {
    id: 'stage_final',
    name: 'CÔNG BỐ THÀNH VIÊN CHÍNH THỨC',
    subtitle: 'Sân Nhà D FTU — Chào mừng em về nhà!',
    bgm: 'stage_final',
    questSpot: { x: 46 * 32, y: 21 * 32 },
    questText: 'Bước đến Sân Nhà D FTU để gặp gỡ các Ban và nhận Thẻ Thành Viên Chính Thức JPC!',
    questTitle: 'Vinh Quang: Chào Mừng Về Nhà',
    timeline: 'Tháng 11/2026',
    objective: 'Tiến tới Sân Nhà D FTU đón nhận trọn vẹn tình cảm chúc mừng từ 5 Ban và Chủ Nhiệm JPC FTU!',
    location: 'Sân Nhà D FTU',
    tip: 'Tận hưởng khoảnh khắc thanh xuân rực rỡ nhất cùng đại gia đình JPC!',
    props: [
      { type: 'prop_torii', x: 46, y: 20, label: 'Cổng Torii Vinh Quang' },
      { type: 'prop_sakura_tree', x: 40, y: 18, label: 'Cây Anh Đào' },
      { type: 'prop_sakura_tree', x: 40, y: 24, label: 'Cây Anh Đào' },
      { type: 'prop_lantern', x: 44, y: 19, label: 'Đèn hội' },
      { type: 'prop_lantern', x: 44, y: 23, label: 'Đèn hội' }
    ],
    items: [],
    npcs: [
      {
        id: 'npc_bcm',
        name: 'Ban Chuyên Môn',
        sprite: 'kokeshi_bcm',
        x: 44,
        y: 20,
        dialogues: [
          { speaker: 'Ban Chuyên Môn', text: 'Konnichiwa! Chào mừng em gia nhập đại gia đình JPC - FTU! Cùng Ban Chuyên Môn chinh phục tiếng Nhật và văn hóa rực rỡ nhé!' }
        ]
      },
      {
        id: 'npc_bns',
        name: 'Ban Nhân Sự',
        sprite: 'kokeshi_bns',
        x: 44,
        y: 22,
        dialogues: [
          { speaker: 'Ban Nhân Sự', text: 'Chào mừng em về nhà! Nhân Sự sẽ luôn là chỗ dựa ấm áp nhất để em thỏa sức bung tỏa thanh xuân tại Ngoại Thương!' }
        ]
      },
      {
        id: 'npc_btt',
        name: 'Ban Thông Tin',
        sprite: 'kokeshi_btt',
        x: 42,
        y: 19,
        dialogues: [
          { speaker: 'Ban Thông Tin', text: 'Chào mừng tân binh Gen 22! Cùng Thông Tin vẽ nên những ấn phẩm truyền thông triệu view mang đậm bản sắc Ngoại Thương nha!' }
        ]
      },
      {
        id: 'npc_btc',
        name: 'Ban Tổ Chức',
        sprite: 'kokeshi_btc',
        x: 42,
        y: 21,
        dialogues: [
          { speaker: 'Ban Tổ Chức', text: 'Nhiệt liệt chào đón Gen 22! Những sự kiện bùng nổ nhất FTU đang chờ tụi mình cùng nhau thực hiện đó!' }
        ]
      },
      {
        id: 'npc_bdn',
        name: 'Ban Đối Ngoại',
        sprite: 'kokeshi_bdn',
        x: 42,
        y: 23,
        dialogues: [
          { speaker: 'Ban Đối Ngoại', text: 'Chào mừng em! Cùng Đối Ngoại kết nối doanh nghiệp Nhật Bản và đưa hình ảnh sinh viên FTU vươn thật xa nhé!' }
        ]
      },
      {
        id: 'npc_final_president',
        name: 'Chủ Nhiệm JPC',
        sprite: 'npc_president',
        x: 46,
        y: 21,
        dialogues: [
          { speaker: 'Chủ Nhiệm JPC', text: 'Chào mừng em! Kể từ giây phút này, em đã chính thức là một phần máu thịt của JPC - Câu lạc bộ Tiếng Nhật Trường Đại học Ngoại Thương!' },
          { speaker: 'Chủ Nhiệm JPC', text: 'Cảm ơn em vì đã dám ước mơ, dám nỗ lực và trọn vẹn với từng chặng đường... Chào mừng em về nhà!' }
        ]
      }
    ]
  }
};

window.STAGE_DATA = STAGE_DATA;
