// Stage definitions and quest locations according to official FTU & JPC Timeline
const STAGE_DATA = {
  stage1: {
    id: 'stage1',
    name: 'HỘI TRÁT 1: KHAI NHÃN (01/10 – 20/10)',
    subtitle: 'Sân Trung Tâm FTU — Ngày Hội FCD (18/10) · Điền Đơn Vòng 1',
    bgm: 'stage1',
    playerStart: { x: 9, y: 38 }, // Cổng trường Chùa Láng
    questSpot: { x: 16 * 32 + 16, y: 22 * 32 + 16 }, // Gian trại JPC màu đỏ tại dãy booth phía Tây Sân Trung Tâm
    questText: 'Đến Sân Trung Tâm (phía Tây Bia đá FTU), tìm Gian trại JPC màu đỏ thắm để điền đơn Vòng 1!',
    props: [
      { type: 'prop_ftu_sign', x: 8, y: 37, label: 'Cổng Chùa Láng' },
      { type: 'prop_boba', x: 18, y: 22, label: 'Trà sữa FCD' },
      { type: 'prop_lantern', x: 15, y: 20, label: 'Đèn lồng JPC' },
      { type: 'prop_lantern', x: 15, y: 24, label: 'Đèn lồng JPC' }
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
          { speaker: 'Bác Bảo Vệ', text: 'Chào mừng cháu đến với Trường Đại học Ngoại Thương FTU!' },
          { speaker: 'Bác Bảo Vệ', text: 'Hôm nay ngày 18/10 là ngày hội CLB FTU Club Day (FCD) bùng nổ đó! Vòng 1 Khai Nhãn của JPC mở từ 01/10 đến 20/10.' },
          { speaker: 'Bác Bảo Vệ', text: 'Cháu đi thẳng vào Sân Trung Tâm, nhìn sang dãy booth bên trái (phía Tây Bia Đá FTU) sẽ thấy Gian Trại JPC màu đỏ thắm rất nổi bật để điền đơn Vòng 1 nhé!' }
        ]
      },
      {
        id: 'npc_jpc_booth',
        name: 'Senpai Gian Trại JPC',
        sprite: 'npc_senpai',
        x: 16,
        y: 22,
        avatarIcon: '🌸',
        dialogues: [
          { speaker: 'Senpai JPC', text: 'Konnichiwa! Chào mừng em đến với Gian trại CLB Tiếng Nhật JPC tại Sân Trung Tâm FTU!' },
          { speaker: 'Senpai JPC', text: 'Hôm nay ngày 18/10 là ngày hội FCD bùng nổ, và Vòng 1 Khai Nhãn (01/10 – 20/10) đang mở đơn chào đón Gen 22. Hãy viết nên ước mơ của em nhé!' }
        ]
      }
    ]
  },

  stage2: {
    id: 'stage2',
    name: 'HỘI TRÁT 2: HÒA NHỊP (23/10 – 25/10)',
    subtitle: 'Tòa B FTU — Phỏng Vấn Nhóm',
    bgm: 'stage2',
    questSpot: { x: 27 * 32, y: 17 * 32 },
    questText: 'Di chuyển lên Tòa B (Giảng đường B201) để tham gia Phỏng Vấn Nhóm: Hòa Nhịp (23/10 – 25/10)!',
    props: [
      { type: 'prop_blackboard', x: 27, y: 16, label: 'Bảng xanh B201 FTU' },
      { type: 'prop_desk', x: 27, y: 17, label: 'Bàn thảo luận nhóm' },
      { type: 'prop_lantern', x: 24, y: 17, label: 'Đèn ấm áp' },
      { type: 'prop_lantern', x: 30, y: 17, label: 'Đèn ấm áp' }
    ],
    items: [],
    npcs: [
      {
        id: 'npc_app_a',
        name: 'Minh (K63 FTU)',
        sprite: 'npc_applicant_a',
        x: 25,
        y: 17,
        talked: false,
        dialogues: [
          { speaker: 'Minh', text: 'Chào cậu! Cậu vừa nộp đơn ở gian trại JPC cạnh Bia Đá FTU hôm FCD đúng không? Nhìn các anh chị JPC nhiệt huyết quá chừng, cùng cố gắng vào vòng trong nhé!' }
        ]
      },
      {
        id: 'npc_app_b',
        name: 'Hà (K63 FTU)',
        sprite: 'npc_applicant_b',
        x: 29,
        y: 17,
        talked: false,
        dialogues: [
          { speaker: 'Hà', text: 'Konnichiwa! Hồi mới bước chân qua cổng Chùa Láng vào FCD, tớ đã ước mơ được gia nhập JPC rồi! Chúng mình cùng làm một nhóm thật ăn ý nha!' }
        ]
      },
      {
        id: 'npc_interviewer',
        name: 'Senpai Phỏng Vấn',
        sprite: 'npc_senpai',
        x: 27,
        y: 17,
        dialogues: [
          { speaker: 'Senpai Phỏng Vấn', text: 'Chào mừng các tân sinh viên Ngoại Thương đến với Hội trát 2: Hòa Nhịp (23/10 – 25/10) tại Giảng đường B201!' },
          { speaker: 'Senpai Phỏng Vấn', text: 'Ở ngôi trường FTU năng động này, JPC là nơi các em không bao giờ phải đi một mình. Nào, hãy cùng bắt nhịp trái tim đồng đội nhé!' }
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
    questText: 'Đến Dốc Nhà B huyền thoại (giữa NHÀ H và Tòa B), cùng Trưởng nhóm vượt qua deadline Teamwork (27/10 – 03/11) & tiến tới Pitching (04 – 05/11)!',
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
