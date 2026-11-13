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
    playerStart: { x: 42, y: 11, direction: 'up' },
    repositionOnTransition: true,
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
    subtitle: 'Tòa H FTU — Vòng Phỏng Vấn Cá Nhân & Tự Luận Tâm Tư',
    bgm: 'stage3_2',
    playerStart: { x: 9.5, y: 15.5, direction: 'left' },
    repositionOnTransition: true,
    questSpot: { x: 8.5 * 32, y: 15 * 32 },
    questText: 'Di chuyển sang Tòa H FTU (cạnh dốc Tòa B), bước vào phòng phỏng vấn tự luận cùng Ban Lãnh Đạo (08/11 – 09/11)!',
    questTitle: 'Hội Trát 3.2: Chân Diện',
    timeline: '08/11 – 09/11/2026',
    objective: 'Gặp gỡ và trải lòng tự luận 1-on-1 cùng Ban Lãnh Đạo JPC trong không gian phỏng vấn Chân Diện tại Tòa H FTU.',
    location: 'Tòa H FTU (Khu vực phỏng vấn cá nhân tầng 1)',
    tip: 'Hãy viết bằng tất cả sự chân thành từ trái tim bạn — mỗi con chữ đều là mảnh ghép quý giá.',
    props: [
      { type: 'prop_lantern', x: 7.5, y: 13.5, label: 'Đèn lồng Tòa H' },
      { type: 'prop_lantern', x: 7.5, y: 16.5, label: 'Đèn lồng Tòa H' },
      { type: 'prop_desk', x: 7.5, y: 15, label: 'Bàn Phỏng Vấn Chân Diện - Tòa H' }
    ],
    items: [],
    npcs: [
      {
        id: 'npc_mentor_heart',
        name: 'Ban Lãnh Đạo JPC',
        sprite: 'npc_president',
        x: 7.5,
        y: 15,
        avatarIcon: '🏛️',
        dialogues: [
          { speaker: 'Ban Lãnh Đạo JPC', text: 'Chào mừng em đến với khu vực phỏng vấn Tòa H FTU — nơi diễn ra Vòng 3.2: Chân Diện (08/11 – 09/11).' },
          { speaker: 'Ban Lãnh Đạo JPC', text: 'Đây là không gian tự luận riêng tư và sâu lắng nhất, nơi chúng mình mong muốn được lắng nghe tiếng lòng và tâm tư chân thành nhất của em.' },
          { speaker: 'Ban Lãnh Đạo JPC', text: 'Hãy soi rọi vào tấm gương nội tâm và chia sẻ ước mơ, khát vọng của em cùng Ban Lãnh Đạo nhé!' }
        ]
      }
    ]
  },

  stage_final: {
    id: 'stage_final',
    name: 'KẾT NẠP THÀNH VIÊN JPC: HÒA SẮC',
    subtitle: 'Văn Phòng CLB Tiếng Nhật JPC — Lễ Kết Nạp Hòa Sắc',
    bgm: 'stage_final',
    playerStart: { x: 27.5, y: 18.5, direction: 'up' },
    repositionOnTransition: true,
    questSpot: { x: 27.5 * 32, y: 17 * 32 },
    questText: 'Bước vào Văn Phòng CLB Tiếng Nhật JPC tại Tòa B để diện kiến Ban Lãnh Đạo và đón nhận Giấy Chứng Nhận Thành Viên Chính Thức!',
    questTitle: 'Kết Nạp: Hòa Sắc',
    timeline: 'Tháng 11/2026',
    objective: 'Bước vào Văn Phòng CLB JPC tại Tòa B, diện kiến Ban Lãnh Đạo (Chủ Tịch, Phó Chủ Tịch và các Trưởng Ban) để tham dự Lễ Kết Nạp: Hòa Sắc và đón nhận Giấy Chứng Nhận Thành Viên Chính Thức!',
    location: 'Văn Phòng CLB Tiếng Nhật JPC (Tòa B FTU)',
    tip: 'Văn Phòng CLB nằm tại Tòa B. Tiến lên đài danh dự diện kiến Ban Lãnh Đạo để nhận Giấy Chứng Nhận!',
    props: [
      { type: 'prop_torii', x: 27.5, y: 16, label: 'Cổng Vinh Quang Tòa B' },
      { type: 'prop_sakura_tree', x: 23, y: 16.5, label: 'Cây Anh Đào' },
      { type: 'prop_sakura_tree', x: 32, y: 16.5, label: 'Cây Anh Đào' },
      { type: 'prop_lantern', x: 25.5, y: 16.5, label: 'Đèn hội Tòa B' },
      { type: 'prop_lantern', x: 29.5, y: 16.5, label: 'Đèn hội Tòa B' }
    ],
    vpQuestSpot: { x: 12 * 32, y: 5.5 * 32 },
    vpProps: [
      { type: 'prop_desk', x: 11, y: 5, label: 'Bàn Nghi Lễ Ban Lãnh Đạo' },
      { type: 'prop_desk', x: 13, y: 5, label: 'Bàn Nghi Lễ Ban Lãnh Đạo' },
      { type: 'prop_lantern', x: 8, y: 4.5, label: 'Đèn Lồng Danh Dự' },
      { type: 'prop_lantern', x: 16, y: 4.5, label: 'Đèn Lồng Danh Dự' },
      { type: 'prop_lantern', x: 5, y: 8, label: 'Đèn Văn Phòng' },
      { type: 'prop_lantern', x: 19, y: 8, label: 'Đèn Văn Phòng' }
    ],
    vpNpcs: [
      {
        id: 'npc_president',
        name: 'Chủ Tịch JPC',
        sprite: 'npc_president',
        x: 11,
        y: 4,
        dialogues: [
          { speaker: 'Chủ Tịch JPC', text: 'Chào mừng em! Kể từ giây phút này, em đã chính thức là một phần máu thịt của JPC - Câu lạc bộ Tiếng Nhật Trường Đại học Ngoại Thương!' },
          { speaker: 'Chủ Tịch JPC', text: 'Cảm ơn em vì đã dám ước mơ, kiên trì nỗ lực và trọn vẹn với từng chặng đường... Thay mặt Ban Lãnh Đạo JPC FTU, chào mừng em về nhà!' }
        ]
      },
      {
        id: 'npc_vice_president',
        name: 'Phó Chủ Tịch JPC',
        sprite: 'npc_senpai',
        x: 13.5,
        y: 4,
        dialogues: [
          { speaker: 'Phó Chủ Tịch JPC', text: 'Chào mừng tân binh Gen 22! Tụi mình vô cùng tự hào khi được đồng hành cùng em trong nhiệm kỳ rực rỡ sắp tới!' }
        ]
      },
      {
        id: 'npc_bcm',
        name: 'Trưởng Ban Chuyên Môn',
        sprite: 'kokeshi_bcm',
        x: 4.5,
        y: 6.5,
        dialogues: [
          { speaker: 'Trưởng Ban Chuyên Môn', text: 'Konnichiwa! Chào mừng em về với ngôi nhà JPC - FTU! Cùng Ban Chuyên Môn chinh phục tiếng Nhật và văn hóa rực rỡ nhé!' }
        ]
      },
      {
        id: 'npc_bdn',
        name: 'Trưởng Ban Đối Ngoại',
        sprite: 'kokeshi_bdn',
        x: 4.5,
        y: 10,
        dialogues: [
          { speaker: 'Trưởng Ban Đối Ngoại', text: 'Chào mừng em! Cùng Đối Ngoại kết nối doanh nghiệp Nhật Bản và đưa hình ảnh sinh viên FTU vươn thật xa nhé!' }
        ]
      },
      {
        id: 'npc_btc',
        name: 'Trưởng Ban Tổ Chức',
        sprite: 'kokeshi_btc',
        x: 19.5,
        y: 6.5,
        dialogues: [
          { speaker: 'Trưởng Ban Tổ Chức', text: 'Nhiệt liệt chào đón Gen 22! Những sự kiện bùng nổ nhất FTU đang chờ tụi mình cùng nhau thực hiện đó!' }
        ]
      },
      {
        id: 'npc_btt',
        name: 'Trưởng Ban Thông Tin',
        sprite: 'kokeshi_btt',
        x: 19.5,
        y: 10,
        dialogues: [
          { speaker: 'Trưởng Ban Thông Tin', text: 'Chào mừng tân binh Gen 22! Cùng Thông Tin vẽ nên những ấn phẩm truyền thông triệu view mang đậm bản sắc Ngoại Thương nha!' }
        ]
      },
      {
        id: 'npc_bns',
        name: 'Trưởng Ban Nhân Sự',
        sprite: 'kokeshi_bns',
        x: 12,
        y: 9.5,
        dialogues: [
          { speaker: 'Trưởng Ban Nhân Sự', text: 'Chào mừng em về nhà! Nhân Sự sẽ luôn là chỗ dựa ấm áp nhất để em thỏa sức bung tỏa thanh xuân tại Ngoại Thương!' }
        ]
      }
    ],
    items: [],
    npcs: [
      {
        id: 'npc_senpai_vanphong',
        name: 'Senpai Đón Tiếp JPC',
        sprite: 'npc_senpai',
        x: 27.5,
        y: 16.5,
        dialogues: [
          { speaker: 'Senpai Đón Tiếp JPC', text: 'Chào em! Cánh cửa Văn Phòng CLB Tiếng Nhật JPC đang mở rộng đón em vào tham dự Lễ Kết Nạp Thành Viên: Hòa Sắc. Em hãy bước vào trong diện kiến Ban Lãnh Đạo nhé!' }
        ]
      }
    ]
  }
};

window.STAGE_DATA = STAGE_DATA;
