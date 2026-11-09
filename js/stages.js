// Stage definitions and quest locations for FTU Club Day (FCD)
const STAGE_DATA = {
  stage1: {
    id: 'stage1',
    name: 'HỘI TRÁT 1: KHAI NHÃN',
    subtitle: 'Sân Nhà D (FTU Club Day) — Điền Đơn Vòng 1',
    bgm: 'stage1',
    playerStart: { x: 10, y: 34 }, // Cổng trường Chùa Láng cạnh bốt bảo vệ
    questSpot: { x: 50 * 32, y: 25 * 32 }, // Booth JPC tại Sân Nhà D
    questText: 'Đến Sân Nhà D, tìm Booth của CLB Tiếng Nhật JPC để điền đơn Vòng 1!',
    props: [
      { type: 'prop_ftu_sign', x: 8, y: 31, label: 'Cổng Chùa Láng' },
      { type: 'prop_boba', x: 47, y: 27, label: 'Trà sữa FCD' },
      { type: 'prop_lantern', x: 48, y: 24, label: 'Đèn lồng JPC' },
      { type: 'prop_lantern', x: 52, y: 24, label: 'Đèn lồng JPC' }
    ],
    items: [],
    npcs: [
      {
        id: 'npc_guard',
        name: 'Bác Bảo Vệ FTU',
        sprite: 'npc_president',
        x: 10,
        y: 33,
        avatarIcon: '👴',
        dialogues: [
          { speaker: 'Bác Bảo Vệ', text: 'Hôm nay là FCD đó, sẽ có rất nhiều CLB tổ chức booth!' },
          { speaker: 'Bác Bảo Vệ', text: 'Cháu đi thẳng vào Sân Nhà D, tìm booth của CLB Tiếng Nhật JPC để điền đơn Vòng 1 nhé!' }
        ]
      },
      {
        id: 'npc_jpc_booth',
        name: 'Senpai Booth JPC',
        sprite: 'npc_senpai',
        x: 50,
        y: 25,
        avatarIcon: '🌸',
        dialogues: [
          { speaker: 'Senpai JPC', text: 'Konnichiwa! Chào mừng em đến với Booth của CLB Tiếng Nhật JPC tại FTU Club Day!' },
          { speaker: 'Senpai JPC', text: 'Hôm nay JPC chính thức mở đơn tuyển thành viên thế hệ 22 — Hội trát 1: Khai Nhãn. Hãy viết nên ước mơ của em nhé!' }
        ]
      }
    ]
  },

  stage2: {
    id: 'stage2',
    name: 'HỘI TRÁT 2: HÒA NHỊP',
    subtitle: 'Giảng đường B201 FTU — Vòng Phỏng Vấn Nhóm',
    bgm: 'stage2',
    questSpot: { x: 24 * 32, y: 15 * 32 },
    questText: 'Di chuyển lên Tòa Nhà B, vào Giảng đường B201 để tham gia Phỏng Vấn Nhóm!',
    props: [
      { type: 'prop_blackboard', x: 24, y: 13, label: 'Bảng xanh B201 FTU' },
      { type: 'prop_desk', x: 24, y: 15, label: 'Bàn thảo luận nhóm' },
      { type: 'prop_lantern', x: 20, y: 13, label: 'Đèn ấm áp' },
      { type: 'prop_lantern', x: 28, y: 13, label: 'Đèn ấm áp' }
    ],
    items: [],
    npcs: [
      {
        id: 'npc_app_a',
        name: 'Minh (K63 FTU)',
        sprite: 'npc_applicant_a',
        x: 22,
        y: 15,
        talked: false,
        dialogues: [
          { speaker: 'Minh', text: 'Chào cậu! Cậu vừa nộp đơn ở booth Sân Nhà D xong đúng không? Nhìn các anh chị JPC nhiệt huyết quá chừng, cùng cố gắng vào vòng trong nhé!' }
        ]
      },
      {
        id: 'npc_app_b',
        name: 'Hà (K63 FTU)',
        sprite: 'npc_applicant_b',
        x: 26,
        y: 15,
        talked: false,
        dialogues: [
          { speaker: 'Hà', text: 'Konnichiwa! Hồi mới bước chân qua cổng Chùa Láng vào FCD, tớ đã ước mơ được gia nhập JPC rồi! Chúng mình cùng làm một nhóm thật ăn ý nha!' }
        ]
      },
      {
        id: 'npc_interviewer',
        name: 'Senpai Phỏng Vấn',
        sprite: 'npc_senpai',
        x: 24,
        y: 16,
        dialogues: [
          { speaker: 'Senpai Phỏng Vấn', text: 'Chào mừng các tân sinh viên Ngoại Thương đến với Hội trát 2: Hòa Nhịp tại Giảng đường B201!' },
          { speaker: 'Senpai Phỏng Vấn', text: 'Ở ngôi trường FTU năng động này, JPC là nơi các em không bao giờ phải đi một mình. Nào, hãy cùng bắt nhịp trái tim đồng đội nhé!' }
        ]
      }
    ]
  },

  stage3_1: {
    id: 'stage3_1',
    name: 'HỘI TRÁT 3.1: PHÁ PHONG',
    subtitle: 'Dốc Nhà B FTU — Vòng Teamwork bứt phá deadline',
    bgm: 'stage3_1',
    questSpot: { x: 31 * 32, y: 18 * 32 },
    questText: 'Đến Dốc Nhà B huyền thoại, cùng Trưởng nhóm brainstorm và uống trà sữa Chùa Láng!',
    props: [
      { type: 'prop_boba', x: 29, y: 18, label: 'Trà sữa Chùa Láng' },
      { type: 'prop_boba', x: 34, y: 18, label: 'Trà sữa Chùa Láng' },
      { type: 'prop_desk', x: 32, y: 17, label: 'Bàn họp Dốc Nhà B' },
      { type: 'prop_lantern', x: 28, y: 17, label: 'Đèn brainstorm' }
    ],
    items: [],
    npcs: [
      {
        id: 'npc_leader',
        name: 'Trưởng Nhóm Teamwork',
        sprite: 'npc_leader',
        x: 31,
        y: 18,
        dialogues: [
          { speaker: 'Trưởng Nhóm', text: 'Ngồi ở Dốc Nhà B quen thuộc này, tụi mình cùng nhau chạy deadline dự án giao lưu Gen 22 nhé!' },
          { speaker: 'Trưởng Nhóm', text: 'Sinh viên Ngoại Thương chưa bao giờ lùi bước! Hãy cùng gom ý tưởng sáng tạo và những cốc trà sữa Chùa Láng để bứt phá nào!' }
        ]
      }
    ]
  },

  stage3_2: {
    id: 'stage3_2',
    name: 'HỘI TRÁT 3.2: CHÂN DIỆN',
    subtitle: 'Không Gian VJCC FTU — Vòng Phỏng Vấn Cá Nhân',
    bgm: 'stage3_2',
    questSpot: { x: 24 * 32, y: 31 * 32 },
    questText: 'Di chuyển sang Viện VJCC, bước vào phòng trà đạo đối thoại cùng Ban Điều Hành!',
    props: [
      { type: 'prop_lantern', x: 20, y: 30, label: 'Đèn trà đạo hoàng hôn' },
      { type: 'prop_lantern', x: 28, y: 30, label: 'Đèn trà đạo hoàng hôn' },
      { type: 'prop_desk', x: 24, y: 30, label: 'Bàn trà đạo VJCC' }
    ],
    items: [],
    npcs: [
      {
        id: 'npc_mentor_heart',
        name: 'Ban Điều Hành JPC',
        sprite: 'npc_president',
        x: 24,
        y: 31,
        dialogues: [
          { speaker: 'Ban Điều Hành', text: 'Chào em đến với không gian trà đạo VJCC — góc Nhật Bản tĩnh lặng ngay trong lòng Ngoại Thương.' },
          { speaker: 'Ban Điều Hành', text: 'Giữa hàng chục câu lạc bộ sôi động của FTU, điều gì đã thôi thúc trái tim em hướng về JPC?' },
          { speaker: 'Ban Điều Hành', text: 'Hãy soi rọi vào tấm gương nội tâm và chia sẻ tiếng lòng chân thành nhất cùng chúng mình nhé.' }
        ]
      }
    ]
  },

  stage_final: {
    id: 'stage_final',
    name: 'CÔNG BỐ THÀNH VIÊN CHÍNH THỨC',
    subtitle: 'Quảng trường Sân Nhà A FTU — Chào mừng bạn về nhà!',
    bgm: 'stage_final',
    questSpot: { x: 24 * 32, y: 22 * 32 },
    questText: 'Bước đến Cổng Torii Sân Nhà A để nhận Thẻ Thành Viên Chính Thức JPC!',
    props: [
      { type: 'prop_torii', x: 24, y: 19, label: 'Cổng Torii Vinh Quang' },
      { type: 'prop_sakura_tree', x: 17, y: 19, label: 'Cây Anh Đào' },
      { type: 'prop_sakura_tree', x: 31, y: 19, label: 'Cây Anh Đào' },
      { type: 'prop_lantern', x: 20, y: 19, label: 'Đèn hội' },
      { type: 'prop_lantern', x: 28, y: 19, label: 'Đèn hội' }
    ],
    items: [],
    npcs: [
      {
        id: 'npc_bcm',
        name: 'Ban Chuyên Môn',
        sprite: 'kokeshi_bcm',
        x: 19,
        y: 21,
        dialogues: [
          { speaker: 'Ban Chuyên Môn', text: 'Konnichiwa! Chào mừng em gia nhập đại gia đình JPC - FTU! Cùng Ban Chuyên Môn chinh phục tiếng Nhật và văn hóa rực rỡ nhé!' }
        ]
      },
      {
        id: 'npc_bns',
        name: 'Ban Nhân Sự',
        sprite: 'kokeshi_bns',
        x: 21,
        y: 21,
        dialogues: [
          { speaker: 'Ban Nhân Sự', text: 'Chào mừng em về nhà! Nhân Sự sẽ luôn là chỗ dựa ấm áp nhất để em thỏa sức bung tỏa thanh xuân tại Ngoại Thương!' }
        ]
      },
      {
        id: 'npc_btt',
        name: 'Ban Thông Tin',
        sprite: 'kokeshi_btt',
        x: 27,
        y: 21,
        dialogues: [
          { speaker: 'Ban Thông Tin', text: 'Chào mừng tân binh Gen 22! Cùng Thông Tin vẽ nên những ấn phẩm truyền thông triệu view mang đậm bản sắc Ngoại Thương nha!' }
        ]
      },
      {
        id: 'npc_btc',
        name: 'Ban Tổ Chức',
        sprite: 'kokeshi_btc',
        x: 29,
        y: 21,
        dialogues: [
          { speaker: 'Ban Tổ Chức', text: 'Nhiệt liệt chào đón Gen 22! Những sự kiện bùng nổ nhất FTU đang chờ tụi mình cùng nhau thực hiện đó!' }
        ]
      },
      {
        id: 'npc_bdn',
        name: 'Ban Đối Ngoại',
        sprite: 'kokeshi_bdn',
        x: 31,
        y: 21,
        dialogues: [
          { speaker: 'Ban Đối Ngoại', text: 'Chào mừng em! Cùng Đối Ngoại kết nối doanh nghiệp Nhật Bản và đưa hình ảnh sinh viên FTU vươn thật xa nhé!' }
        ]
      },
      {
        id: 'npc_final_president',
        name: 'Chủ Nhiệm JPC',
        sprite: 'npc_president',
        x: 24,
        y: 22,
        dialogues: [
          { speaker: 'Chủ Nhiệm JPC', text: 'Chào mừng em! Kể từ giây phút này, em đã chính thức là một phần máu thịt của JPC - Câu lạc bộ Tiếng Nhật Trường Đại học Ngoại Thương!' },
          { speaker: 'Chủ Nhiệm JPC', text: 'Cảm ơn em vì đã dám ước mơ, dám nỗ lực và trọn vẹn với từng chặng đường... Chào mừng em về nhà!' }
        ]
      }
    ]
  }
};

window.STAGE_DATA = STAGE_DATA;
