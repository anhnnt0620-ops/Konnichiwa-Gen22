// Stage definitions, map layouts, NPC dialogues, and quest triggers set in FTU (Foreign Trade University)
const STAGE_DATA = {
  stage1: {
    id: 'stage1',
    name: 'HỘI TRÁT 1: KHAI NHÃN',
    subtitle: 'Tiền sảnh Nhà A - Đêm thu Ngoại Thương rực rỡ cờ hoa',
    bgm: 'stage1',
    width: 16,
    height: 12,
    playerStart: { x: 4, y: 7 },
    floorTile: 'tile_stone',
    accentTile: 'tile_wood',
    ambientColor: 'rgba(20, 20, 45, 0.35)', // Cozy night mood at FTU
    questText: 'Thu thập 3 mảnh ghép tinh thần FTU & JPC rồi gửi đơn vào Hòm thư trước sảnh Nhà A!',
    props: [
      { type: 'prop_ftu_sign', x: 2, y: 2, label: 'Biển tên FTU - JPC' },
      { type: 'prop_desk', x: 4, y: 4, label: 'Bàn tuyển sinh JPC' },
      { type: 'prop_mailbox', x: 12, y: 4, label: 'Hòm thư nhận đơn JPC' },
      { type: 'prop_lantern', x: 2, y: 6, label: 'Đèn ấm áp' },
      { type: 'prop_lantern', x: 13, y: 2, label: 'Đèn lồng sảnh Nhà A' }
    ],
    items: [
      { id: 'memory_passion', name: 'Mảnh ghép Bản lĩnh FTU', x: 7, y: 4, collected: false, icon: '🔥' },
      { id: 'memory_dream', name: 'Mảnh ghép Tình yêu Văn hóa Nhật', x: 5, y: 9, collected: false, icon: '✨' },
      { id: 'memory_fire', name: 'Mảnh ghép Khát khao Gen 22', x: 10, y: 8, collected: false, icon: '🌟' }
    ],
    npcs: [
      {
        id: 'npc_guide1',
        name: 'Senpai Sảnh Nhà A',
        sprite: 'npc_senpai',
        x: 3,
        y: 6,
        dialogues: [
          { speaker: 'Senpai Nhà A', text: 'Chào mừng em đến với Tiền sảnh Nhà A - Trường Đại học Ngoại Thương!' },
          { speaker: 'Senpai Nhà A', text: 'Đêm nay là hạn chót nộp đơn tuyển thành viên Gen 22 của JPC. Hãy đi quanh sảnh Nhà A gom đủ 3 mảnh ghép cảm xúc, rồi tiến tới Hòm thư JPC để niêm phong gửi lá đơn nhé!' }
        ]
      }
    ],
    portal: { x: 14, y: 4, unlocked: false, targetStage: 'stage2' }
  },

  stage2: {
    id: 'stage2',
    name: 'HỘI TRÁT 2: HÒA NHỊP',
    subtitle: 'Giảng đường B201 FTU - Vòng Phỏng Vấn Nhóm',
    bgm: 'stage2',
    width: 18,
    height: 12,
    playerStart: { x: 2, y: 6 },
    floorTile: 'tile_wood',
    accentTile: 'tile_tatami',
    ambientColor: 'rgba(255, 230, 200, 0.15)', // Bright daylight in FTU lecture hall
    questText: 'Làm quen với các bạn FTUers cùng nhóm và cùng nhau "Hòa Nhịp" tại giảng đường B201!',
    props: [
      { type: 'prop_blackboard', x: 8, y: 2, label: 'Bảng xanh B201 FTU' },
      { type: 'prop_lantern', x: 4, y: 2, label: 'Đèn ấm áp' },
      { type: 'prop_lantern', x: 14, y: 2, label: 'Đèn ấm áp' },
      { type: 'prop_desk', x: 9, y: 5, label: 'Bàn thảo luận nhóm' }
    ],
    items: [],
    npcs: [
      {
        id: 'npc_app_a',
        name: 'Minh (K63 FTU)',
        sprite: 'npc_applicant_a',
        x: 8,
        y: 4,
        talked: false,
        dialogues: [
          { speaker: 'Minh', text: 'Chào cậu! Cậu học chuyên ngành nào ở FTU thế? Tớ K63 Kinh tế Đối ngoại nè!' },
          { speaker: 'Minh', text: 'Tớ hồi hộp từ lúc nộp đơn ở sảnh Nhà A tới giờ luôn. Nhưng nhìn các bạn ai cũng nhiệt huyết, tớ tự tin hẳn lên. Cùng cố gắng nhé!' }
        ]
      },
      {
        id: 'npc_app_b',
        name: 'Hà (K63 FTU)',
        sprite: 'npc_applicant_b',
        x: 10,
        y: 4,
        talked: false,
        dialogues: [
          { speaker: 'Hà', text: 'Konnichiwa! Hồi mới bước chân qua cổng Chùa Láng vào trường Ngoại Thương, tớ đã ước mơ được gia nhập JPC rồi!' },
          { speaker: 'Hà', text: 'Chúng mình cùng phối hợp thật ăn ý để anh chị giám khảo phải bất ngờ nha!' }
        ]
      },
      {
        id: 'npc_interviewer',
        name: 'Senpai Phỏng Vấn',
        sprite: 'npc_senpai',
        x: 9,
        y: 8,
        dialogues: [
          { speaker: 'Senpai Phỏng Vấn', text: 'Chào mừng các tân sinh viên Ngoại Thương đến với Hội trát 2: Hòa Nhịp tại Giảng đường B201!' },
          { speaker: 'Senpai Phỏng Vấn', text: 'Ở ngôi trường FTU năng động này, JPC là nơi các em không bao giờ phải đi một mình. Khi biết lắng nghe và nâng đỡ nhau, các em sẽ tỏa sáng rực rỡ nhất.' },
          { speaker: 'Senpai Phỏng Vấn', text: 'Nào, hãy cùng bắt nhịp trái tim đồng đội qua thử thách Hòa Nhịp nhé!' }
        ]
      }
    ],
    portal: { x: 16, y: 6, unlocked: false, targetStage: 'stage3_1' }
  },

  stage3_1: {
    id: 'stage3_1',
    name: 'HỘI TRÁT 3.1: PHÁ PHONG',
    subtitle: 'Dốc Nhà B FTU - Vòng Teamwork bứt phá deadline',
    bgm: 'stage3_1',
    width: 20,
    height: 12,
    playerStart: { x: 2, y: 6 },
    floorTile: 'tile_stone',
    accentTile: 'tile_wood',
    ambientColor: 'rgba(255, 180, 100, 0.1)', // Energetic sunset at FTU
    questText: 'Cùng đồng đội brainstorm tại Dốc Nhà B, uống trà sữa Chùa Láng và hoàn thiện dự án!',
    props: [
      { type: 'prop_boba', x: 4, y: 4, label: 'Trà sữa Chùa Láng' },
      { type: 'prop_boba', x: 14, y: 9, label: 'Trà sữa Chùa Láng' },
      { type: 'prop_desk', x: 8, y: 4, label: 'Bàn họp Dốc Nhà B' },
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
          { speaker: 'Trưởng Nhóm', text: 'Ngồi ở Dốc Nhà B quen thuộc này, tụi mình cùng nhau chạy deadline dự án giao lưu Gen 22 nhé!' },
          { speaker: 'Trưởng Nhóm', text: 'Deadline ở Ngoại Thương tuy gắt, nhưng sinh viên FTU chưa bao giờ lùi bước! Khi cả team cùng chung một ý chí, không phong ấn nào không thể phá vỡ!' },
          { speaker: 'Trưởng Nhóm', text: 'Hãy cùng gom các ý tưởng sáng tạo và những cốc trà sữa Chùa Láng để hoàn thành dự án nào!' }
        ]
      }
    ],
    portal: { x: 18, y: 6, unlocked: false, targetStage: 'stage3_2' }
  },

  stage3_2: {
    id: 'stage3_2',
    name: 'HỘI TRÁT 3.2: CHÂN DIỆN',
    subtitle: 'Không Gian VJCC FTU - Vòng Phỏng Vấn Cá Nhân',
    bgm: 'stage3_2',
    width: 16,
    height: 12,
    playerStart: { x: 3, y: 6 },
    floorTile: 'tile_tatami',
    accentTile: 'tile_wood',
    ambientColor: 'rgba(255, 140, 100, 0.25)', // Sunset glow in VJCC room
    questText: 'Bước vào không gian Nhật Bản VJCC FTU và đối thoại chân thành cùng Ban Điều Hành.',
    props: [
      { type: 'prop_lantern', x: 4, y: 2, label: 'Đèn trà đạo hoàng hôn' },
      { type: 'prop_lantern', x: 12, y: 2, label: 'Đèn trà đạo hoàng hôn' },
      { type: 'prop_desk', x: 8, y: 4, label: 'Bàn trà đạo VJCC' }
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
          { speaker: 'Ban Điều Hành', text: 'Chào em đến với không gian trà đạo VJCC - góc Nhật Bản tĩnh lặng ngay trong lòng Ngoại Thương.' },
          { speaker: 'Ban Điều Hành', text: 'Giữa hàng chục câu lạc bộ sôi động của FTU, điều gì đã thôi thúc trái tim em hướng về JPC?' },
          { speaker: 'Ban Điều Hành', text: 'Ở chặng "Chân Diện" này, hãy soi rọi vào tấm gương nội tâm và chia sẻ tiếng lòng chân thành nhất cùng chúng mình nhé.' }
        ]
      }
    ],
    portal: { x: 14, y: 6, unlocked: false, targetStage: 'stage_final' }
  },

  stage_final: {
    id: 'stage_final',
    name: 'CÔNG BỐ THÀNH VIÊN CHÍNH THỨC',
    subtitle: 'Quảng trường Sân Nhà A FTU - Chào mừng bạn về nhà!',
    bgm: 'stage_final',
    width: 22,
    height: 14,
    playerStart: { x: 3, y: 7 },
    floorTile: 'tile_grass_sakura',
    accentTile: 'tile_carpet',
    ambientColor: 'rgba(255, 200, 220, 0.1)', // Sakura celebration at FTU
    questText: 'Bước trên thảm đỏ hoa anh đào sảnh Nhà A FTU để nhận Thẻ Thành Viên Chính Thức JPC!',
    props: [
      { type: 'prop_ftu_sign', x: 10, y: 2, label: 'Biển FTU - JPC' },
      { type: 'prop_torii', x: 4, y: 4, label: 'Cổng Torii Vinh Quang' },
      { type: 'prop_sakura_tree', x: 1, y: 2, label: 'Cây Anh Đào' },
      { type: 'prop_sakura_tree', x: 18, y: 2, label: 'Cây Anh Đào' },
      { type: 'prop_sakura_tree', x: 1, y: 9, label: 'Cây Anh Đào' },
      { type: 'prop_sakura_tree', x: 18, y: 9, label: 'Cây Anh Đào' },
      { type: 'prop_lantern', x: 8, y: 3, label: 'Đèn hội' },
      { type: 'prop_lantern', x: 14, y: 3, label: 'Đèn hội' },
      { type: 'prop_lantern', x: 8, y: 11, label: 'Đèn hội' },
      { type: 'prop_lantern', x: 14, y: 11, label: 'Đèn hội' }
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
          { speaker: 'Ban Chuyên Môn', text: 'Konnichiwa! Chào mừng em gia nhập đại gia đình JPC - FTU! Cùng Ban Chuyên Môn chinh phục tiếng Nhật và văn hóa rực rỡ nhé!' }
        ]
      },
      {
        id: 'npc_bns',
        name: 'Ban Nhân Sự',
        sprite: 'kokeshi_bns',
        x: 12,
        y: 4,
        dialogues: [
          { speaker: 'Ban Nhân Sự', text: 'Chào mừng em về nhà! Nhân Sự sẽ luôn là chỗ dựa ấm áp nhất để em thỏa sức bung tỏa thanh xuân tại Ngoại Thương!' }
        ]
      },
      {
        id: 'npc_btt',
        name: 'Ban Thông Tin',
        sprite: 'kokeshi_btt',
        x: 8,
        y: 10,
        dialogues: [
          { speaker: 'Ban Thông Tin', text: 'Chào mừng tân binh Gen 22! Cùng Thông Tin vẽ nên những ấn phẩm truyền thông triệu view mang đậm bản sắc Ngoại Thương nha!' }
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
          { speaker: 'Ban Đối Ngoại', text: 'Chào mừng em! Cùng Đối Ngoại kết nối doanh nghiệp Nhật Bản và đưa hình ảnh sinh viên FTU vươn thật xa nhé!' }
        ]
      },
      {
        id: 'npc_final_president',
        name: 'Chủ Nhiệm JPC',
        sprite: 'npc_president',
        x: 16,
        y: 7,
        dialogues: [
          { speaker: 'Chủ Nhiệm JPC', text: 'Chào mừng em! Kể từ giây phút này, em đã chính thức là một phần máu thịt của JPC - Câu lạc bộ Tiếng Nhật Trường Đại học Ngoại Thương!' },
          { speaker: 'Chủ Nhiệm JPC', text: 'Cảm ơn em vì đã dám ước mơ, dám nỗ lực và trọn vẹn với từng chặng đường.' },
          { speaker: 'Chủ Nhiệm JPC', text: 'Chiếc thẻ thành viên và phong thư chào đón thiêng liêng này xin được trao đến em... Chào mừng em về nhà!' }
        ]
      }
    ],
    portal: null // Final destination
  }
};

window.STAGE_DATA = STAGE_DATA;
