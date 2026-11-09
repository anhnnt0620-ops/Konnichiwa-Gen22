// Stage definitions and quest locations according to official FTU & JPC Timeline
const STAGE_DATA = {
  stage1: {
    id: 'stage1',
    name: 'HỘI TRÁT 1: KHAI NHÃN (01/10 – 20/10)',
    subtitle: 'Sân Nhà D FTU — Ngày Hội FCD (18/10) · Điền Đơn Vòng 1',
    bgm: 'stage1',
    playerStart: { x: 9, y: 38 }, // Cổng trường Chùa Láng
    questSpot: { x: 17 * 32, y: 22.5 * 32 }, // Trước Gian trại JPC Sân Nhà D
    questText: 'Đến Sân Nhà D (phía Tây Bia đá FTU), gặp Senpai tại Gian trại JPC màu đỏ để điền đơn Vòng 1!',
    questTitle: 'Hội Trát 1: Khai Nhãn',
    timeline: '01/10 – 20/10/2026 · FTU Club Day: 18/10',
    objective: 'Đến Sân Nhà D (phía Tây Bia Đá FTU), gặp Senpai đứng trước Gian Trại JPC màu đỏ thắm để nhận và niêm phong lá đơn đăng ký gia nhập Gen 22.',
    location: 'Gian Trại JPC · Dãy Booth Sân Nhà D FTU',
    tip: 'Đi theo vệt hoa anh đào phát sáng dưới chân Kokeshi của bạn để đến thẳng Gian Trại JPC!',
    props: [
      { type: 'prop_ftu_sign', x: 8, y: 37, label: 'Cổng Chùa Láng' },
      { type: 'prop_boba', x: 19, y: 22, label: 'Trà sữa FCD' }
    ],
    items: [],
    npcs: [
      {
        id: 'npc_guard',
        name: 'Bác Bảo Vệ FTU',
        sprite: 'npc_president',
        x: 7,
        y: 38,
        avatarIcon: '👴',
        dialogues: [
          { speaker: 'Bác Bảo Vệ', text: 'Chào mừng cháu đến với Trường Đại học Ngoại Thương!' },
          { speaker: 'Bác Bảo Vệ', text: 'Hôm nay 18/10, tại FTU có Ngày hội các Câu lạc bộ - FCD đó! Cháu có thể đến sân nhà D để khám phá các CLB của trường mình nhé!' },
          { speaker: 'Bác Bảo Vệ', text: 'Cháu đi thẳng vào Sân Nhà D, nhìn sang dãy booth bên trái (phía Tây Bia Đá FTU) sẽ thấy Gian Trại JPC màu đỏ thắm rất nổi bật để điền đơn Vòng 1 nhé!' }
        ]
      },
      {
        id: 'npc_jpc_booth',
        name: 'Senpai JPC',
        sprite: 'npc_senpai',
        x: 17,
        y: 22.5,
        avatarIcon: '🌸',
        dialogues: [
          { speaker: 'Senpai JPC', text: 'Konnichiwa! Chào mừng em đến với Gian trại CLB Tiếng Nhật JPC tại Sân Nhà D FTU!' },
          { speaker: 'Senpai JPC', text: 'Hôm nay ngày 18/10 là ngày hội FCD bùng nổ, và Vòng 1 Khai Nhãn (01/10 – 20/10) đang mở đơn chào đón Gen 22. Hãy viết nên ước mơ của em nhé!' }
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
        name: 'Senpai Phỏng Vấn Online',
        sprite: 'npc_senpai',
        x: 27,
        y: 17,
        avatarIcon: '💻',
        dialogues: [
          { speaker: 'Senpai Phỏng Vấn', text: 'Konnichiwa! Chúc mừng em đã xuất sắc vượt qua Vòng Đơn và bước vào Vòng 2: Hòa Nhịp (23/10 – 25/10)!' },
          { speaker: 'Senpai Phỏng Vấn', text: 'Vòng 2 năm nay là Phỏng Vấn Online! Em hãy mở máy tính lên để kết nối phòng phỏng vấn trực tuyến và trả lời bộ 5 câu hỏi trắc nghiệm về JPC nhé (cần đạt tối thiểu 4/5 câu để qua vòng)!' }
        ]
      }
    ]
  },

  stage3_1: {
    id: 'stage3_1',
    name: 'HỘI TRÁT 3.1: PHÁ PHONG (27/10 – 03/11)',
    subtitle: 'Dốc Nhà B FTU — Vòng Teamwork & Pitching (04-05/11)',
    bgm: 'stage3_1',
    questSpot: { x: 12 * 32, y: 13 * 32 },
    questText: 'Đến Dốc Nhà B huyền thoại (giữa NHÀ H và Tòa B), cùng Trưởng nhóm chạy deadline Teamwork (27/10 – 03/11) & Pitching (04 – 05/11)!',
    questTitle: 'Hội Trát 3.1: Phá Phong',
    timeline: '27/10 – 03/11/2026 · Pitching: 04 – 05/11',
    objective: 'Cùng nhóm giải quyết thử thách dự án thực tế tại Dốc Nhà B và tự tin thuyết trình bài Pitching trước Hội đồng đánh giá.',
    location: 'Dốc Nhà B (giữa Nhà H và Tòa B)',
    tip: 'Tập trung nhịp điệu và phối hợp ăn ý cùng đồng đội để hoàn thành bài thi trước deadline!',
    props: [
      { type: 'prop_boba', x: 12, y: 14, label: 'Trà sữa Chùa Láng' },
      { type: 'prop_desk', x: 12, y: 12, label: 'Bàn họp Dốc Nhà B' },
      { type: 'prop_lantern', x: 11, y: 12, label: 'Đèn brainstorm' }
    ],
    items: [],
    npcs: [
      {
        id: 'npc_leader',
        name: 'Trưởng Nhóm Teamwork',
        sprite: 'npc_leader',
        x: 12,
        y: 13,
        avatarIcon: '⚡',
        dialogues: [
          { speaker: 'Trưởng Nhóm', text: 'Ngồi ở Dốc Nhà B quen thuộc này, tụi mình cùng nhau chạy deadline dự án giao lưu Gen 22 nhé!' },
          { speaker: 'Trưởng Nhóm', text: 'Vòng Teamwork diễn ra từ 27/10 đến 03/11, sau đó chúng ta sẽ bước vào ngày Pitching quyết định (04 – 05/11)! Sinh viên Ngoại Thương chưa bao giờ lùi bước, cùng bứt phá nào!' }
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
    subtitle: 'Sân khấu FCD — Chào mừng bạn về nhà!',
    bgm: 'stage_final',
    questSpot: { x: 46 * 32, y: 21 * 32 },
    questText: 'Bước đến Sân khấu FCD bên cạnh Nhà D để nhận Thẻ Thành Viên Chính Thức JPC!',
    questTitle: 'Vinh Quang: Chào Mừng Về Nhà',
    timeline: 'Tháng 11/2026',
    objective: 'Tiến tới Sân khấu FCD đón nhận trọn vẹn tình cảm chúc mừng từ 5 Ban và Chủ Nhiệm JPC FTU!',
    location: 'Sân khấu FCD (cạnh Nhà D)',
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
