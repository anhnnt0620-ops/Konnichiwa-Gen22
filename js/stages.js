// Stage definitions, map layouts, NPC dialogues, and quest triggers
const STAGE_DATA = {
  stage1: {
    id: 'stage1',
    name: 'HỘI TRÁT 1: KHAI NHÃN',
    subtitle: 'Vòng Đơn - Nơi khởi đầu của những khát khao',
    bgm: 'stage1',
    width: 16,
    height: 12,
    playerStart: { x: 4, y: 7 },
    floorTile: 'tile_wood',
    accentTile: 'tile_tatami',
    ambientColor: 'rgba(20, 20, 45, 0.35)', // Cozy night mood
    questText: 'Viết nên câu chuyện của bạn và gửi lá đơn vào Hòm thư JPC.',
    props: [
      { type: 'prop_desk', x: 3, y: 4, label: 'Bàn học ban đêm' },
      { type: 'prop_mailbox', x: 12, y: 4, label: 'Hòm thư JPC' },
      { type: 'prop_lantern', x: 2, y: 2, label: 'Đèn lồng' },
      { type: 'prop_lantern', x: 13, y: 2, label: 'Đèn lồng' }
    ],
    items: [
      { id: 'memory_passion', name: 'Mảnh ghép Đam mê', x: 7, y: 4, collected: false, icon: '🔥' },
      { id: 'memory_dream', name: 'Mảnh ghép Ước mơ', x: 5, y: 9, collected: false, icon: '✨' },
      { id: 'memory_fire', name: 'Mảnh ghép Nhiệt huyết', x: 10, y: 8, collected: false, icon: '🌟' }
    ],
    npcs: [
      {
        id: 'npc_guide1',
        name: 'Tiếng Nói Nội Tâm',
        sprite: 'npc_senpai',
        x: 3,
        y: 6,
        dialogues: [
          { speaker: 'Tiếng Nói Nội Tâm', text: 'Đêm đã khuya rồi. Trước mắt bạn là tờ đơn đăng ký tuyển thành viên Gen 22 của JPC.' },
          { speaker: 'Tiếng Nói Nội Tâm', text: 'Hãy thu thập 3 "Mảnh ghép cảm xúc" trong phòng, sau đó tiến tới Hòm thư JPC để niêm phong đơn nhé!' }
        ]
      }
    ],
    portal: { x: 14, y: 4, unlocked: false, targetStage: 'stage2' }
  },

  stage2: {
    id: 'stage2',
    name: 'HỘI TRÁT 2: HÒA NHỊP',
    subtitle: 'Vòng Phỏng Vấn Nhóm - Những ánh mắt đầu tiên tìm thấy nhau',
    bgm: 'stage2',
    width: 18,
    height: 12,
    playerStart: { x: 2, y: 6 },
    floorTile: 'tile_tatami',
    accentTile: 'tile_wood',
    ambientColor: 'rgba(255, 230, 200, 0.15)', // Bright friendly daylight
    questText: 'Làm quen với các bạn cùng nhóm và cùng nhau "Hòa Nhịp"!',
    props: [
      { type: 'prop_lantern', x: 4, y: 2, label: 'Đèn ấm áp' },
      { type: 'prop_lantern', x: 14, y: 2, label: 'Đèn ấm áp' },
      { type: 'prop_desk', x: 9, y: 5, label: 'Bàn tròn thảo luận' }
    ],
    items: [],
    npcs: [
      {
        id: 'npc_app_a',
        name: 'Minh (Ứng viên)',
        sprite: 'npc_applicant_a',
        x: 8,
        y: 4,
        talked: false,
        dialogues: [
          { speaker: 'Minh', text: 'Chào cậu! Cậu cũng thi vào JPC hả? Tớ hồi hộp từ tối qua tới giờ luôn á!' },
          { speaker: 'Minh', text: 'Nhưng nhìn thấy mọi người ở đây ai cũng nhiệt huyết, tớ thấy tự tin hơn nhiều rồi. Cùng cố gắng nhé!' }
        ]
      },
      {
        id: 'npc_app_b',
        name: 'Hà (Ứng viên)',
        sprite: 'npc_applicant_b',
        x: 10,
        y: 4,
        talked: false,
        dialogues: [
          { speaker: 'Hà', text: 'Konnichiwa! Tớ mê các sự kiện văn hóa Nhật Bản của JPC từ hồi cấp 3 lận.' },
          { speaker: 'Hà', text: 'Chúng mình cùng làm một nhóm thật ăn ý để anh chị giám khảo phải bất ngờ nha!' }
        ]
      },
      {
        id: 'npc_interviewer',
        name: 'Senpai Phỏng Vấn',
        sprite: 'npc_senpai',
        x: 9,
        y: 8,
        dialogues: [
          { speaker: 'Senpai', text: 'Chào các em đến với Vòng Phỏng Vấn Nhóm - Hội trát 2: Hòa Nhịp!' },
          { speaker: 'Senpai', text: 'Ở JPC, không ai phải đi một mình cả. Khi các em biết lắng nghe và nâng đỡ nhau, sức mạnh sẽ nhân lên gấp bội.' },
          { speaker: 'Senpai', text: 'Nào, hãy cùng bắt nhịp trái tim đồng đội qua thử thách Hòa Nhịp nhé!' }
        ]
      }
    ],
    portal: { x: 16, y: 6, unlocked: false, targetStage: 'stage3_1' }
  },

  stage3_1: {
    id: 'stage3_1',
    name: 'HỘI TRÁT 3.1: PHÁ PHONG',
    subtitle: 'Vòng Teamwork - Bứt phá giới hạn, sát cánh bên nhau',
    bgm: 'stage3_1',
    width: 20,
    height: 12,
    playerStart: { x: 2, y: 6 },
    floorTile: 'tile_stone',
    accentTile: 'tile_wood',
    ambientColor: 'rgba(255, 180, 100, 0.1)', // Energetic sunset warmth
    questText: 'Cùng đồng đội gom đủ ý tưởng để hoàn thành kế hoạch Teamwork!',
    props: [
      { type: 'prop_boba', x: 4, y: 4, label: 'Trà sữa tiếp sức' },
      { type: 'prop_boba', x: 14, y: 9, label: 'Trà sữa tiếp sức' },
      { type: 'prop_desk', x: 8, y: 4, label: 'Bàn dự án' },
      { type: 'prop_lantern', x: 12, y: 2, label: 'Đèn brainstorm' }
    ],
    items: [],
    npcs: [
      {
        id: 'npc_leader',
        name: 'Trưởng Nhóm Teamwork',
        sprite: 'npc_leader',
        x: 9,
        y: 6,
        dialogues: [
          { speaker: 'Trưởng Nhóm', text: 'Deadline sắp tới rồi mọi người ơi! Chúng ta cần dựng xong format sự kiện giao lưu Gen 22!' },
          { speaker: 'Trưởng Nhóm', text: 'Dù có mệt và áp lực, nhưng khi cả team cùng nhìn về một hướng, không có "phong ấn" nào không thể phá vỡ!' },
          { speaker: 'Trưởng Nhóm', text: 'Hãy cùng gom các ý tưởng sáng tạo và chiếc boba ngọt ngào để hoàn thiện dự án nào!' }
        ]
      }
    ],
    portal: { x: 18, y: 6, unlocked: false, targetStage: 'stage3_2' }
  },

  stage3_2: {
    id: 'stage3_2',
    name: 'HỘI TRÁT 3.2: CHÂN DIỆN',
    subtitle: 'Vòng Phỏng Vấn Cá Nhân - Lắng đọng để hiểu mình, hiểu JPC',
    bgm: 'stage3_2',
    width: 16,
    height: 12,
    playerStart: { x: 3, y: 6 },
    floorTile: 'tile_tatami',
    accentTile: 'tile_wood',
    ambientColor: 'rgba(255, 140, 100, 0.25)', // Deep sunset twilight
    questText: 'Bước vào căn phòng hoàng hôn và đối thoại chân thành với Ban Điều Hành.',
    props: [
      { type: 'prop_lantern', x: 4, y: 2, label: 'Đèn hoàng hôn' },
      { type: 'prop_lantern', x: 12, y: 2, label: 'Đèn hoàng hôn' },
      { type: 'prop_desk', x: 8, y: 4, label: 'Bàn trà đạo tĩnh tâm' }
    ],
    items: [],
    npcs: [
      {
        id: 'npc_mentor_heart',
        name: 'Ban Điều Hành JPC',
        sprite: 'npc_president',
        x: 8,
        y: 6,
        dialogues: [
          { speaker: 'Ban Điều Hành', text: 'Chào em. Chúc mừng em đã đi trọn vẹn qua 3 chặng thử thách đầy cam go.' },
          { speaker: 'Ban Điều Hành', text: 'Ở chặng "Chân Diện" này, không có câu trả lời nào là đúng hay sai. Chỉ có tiếng lòng chân thật nhất của em.' },
          { speaker: 'Ban Điều Hành', text: 'Hãy soi rọi vào chiếc gương tâm trí và chia sẻ cùng chúng mình nhé.' }
        ]
      }
    ],
    portal: { x: 14, y: 6, unlocked: false, targetStage: 'stage_final' }
  },

  stage_final: {
    id: 'stage_final',
    name: 'CÔNG BỐ THÀNH VIÊN CHÍNH THỨC',
    subtitle: 'Konnichiwa Gen 22 - Chào mừng bạn đã về nhà!',
    bgm: 'stage_final',
    width: 22,
    height: 14,
    playerStart: { x: 3, y: 7 },
    floorTile: 'tile_grass_sakura',
    accentTile: 'tile_carpet',
    ambientColor: 'rgba(255, 200, 220, 0.1)', // Sakura celebration
    questText: 'Bước trên thảm đỏ hoa anh đào để nhận Thẻ Thành Viên Chính Thức JPC!',
    props: [
      { type: 'prop_torii', x: 4, y: 4, label: 'Cổng Torii Vinh Quang' },
      { type: 'prop_sakura_tree', x: 1, y: 2, label: 'Cây Anh Đào' },
      { type: 'prop_sakura_tree', x: 16, y: 2, label: 'Cây Anh Đào' },
      { type: 'prop_sakura_tree', x: 1, y: 9, label: 'Cây Anh Đào' },
      { type: 'prop_sakura_tree', x: 16, y: 9, label: 'Cây Anh Đào' },
      { type: 'prop_lantern', x: 8, y: 3, label: 'Đèn hội' },
      { type: 'prop_lantern', x: 12, y: 3, label: 'Đèn hội' },
      { type: 'prop_lantern', x: 8, y: 11, label: 'Đèn hội' },
      { type: 'prop_lantern', x: 12, y: 11, label: 'Đèn hội' }
    ],
    items: [],
    npcs: [
      {
        id: 'npc_bcm',
        name: 'Ban Chuyên Môn',
        sprite: 'kokeshi_bcm',
        x: 8,
        y: 4,
        dialogues: [
          { speaker: 'Ban Chuyên Môn', text: 'Konnichiwa! Chào mừng em đến với đại gia đình JPC! Cùng Ban Chuyên Môn khám phá tiếng Nhật và văn hóa rực rỡ nhé!' }
        ]
      },
      {
        id: 'npc_bns',
        name: 'Ban Nhân Sự',
        sprite: 'kokeshi_bns',
        x: 12,
        y: 4,
        dialogues: [
          { speaker: 'Ban Nhân Sự', text: 'Chào mừng em về nhà! Nhân Sự sẽ luôn là chỗ dựa ấm áp nhất để em thỏa sức trưởng thành và gắn kết!' }
        ]
      },
      {
        id: 'npc_btt',
        name: 'Ban Thông Tin',
        sprite: 'kokeshi_btt',
        x: 8,
        y: 10,
        dialogues: [
          { speaker: 'Ban Thông Tin', text: 'Chào mừng tân binh Gen 22! Hãy cùng Thông Tin lan tỏa những ấn phẩm và câu chuyện tuyệt đẹp của JPC nha!' }
        ]
      },
      {
        id: 'npc_btc',
        name: 'Ban Tổ Chức',
        sprite: 'kokeshi_btc',
        x: 12,
        y: 10,
        dialogues: [
          { speaker: 'Ban Tổ Chức', text: 'Nhiệt liệt chào đón Gen 22! Những sự kiện bùng nổ nhất FTU đang chờ tụi mình cùng nhau thực hiện đó!' }
        ]
      },
      {
        id: 'npc_bdn',
        name: 'Ban Đối Ngoại',
        sprite: 'kokeshi_bdn',
        x: 15,
        y: 4,
        dialogues: [
          { speaker: 'Ban Đối Ngoại', text: 'Chào mừng em! Cùng Đối Ngoại kết nối những cơ hội lớn và đưa hình ảnh JPC vươn thật xa nhé!' }
        ]
      },
      {
        id: 'npc_final_president',
        name: 'Chủ Nhiệm JPC',
        sprite: 'npc_president',
        x: 16,
        y: 7,
        dialogues: [
          { speaker: 'Chủ Nhiệm JPC', text: 'Chào mừng em! Kể từ giây phút này, em đã chính thức là một phần máu thịt của JPC - Konnichiwa Gen 22!' },
          { speaker: 'Chủ Nhiệm JPC', text: 'Cảm ơn em vì đã dám ước mơ, dám nỗ lực và trọn vẹn với từng chặng đường.' },
          { speaker: 'Chủ Nhiệm JPC', text: 'Chiếc thẻ thành viên và phong thư chào đón thiêng liêng này xin được trao đến em... Chào mừng em về nhà!' }
        ]
      }
    ],
    portal: null // Final destination
  }
};

window.STAGE_DATA = STAGE_DATA;
