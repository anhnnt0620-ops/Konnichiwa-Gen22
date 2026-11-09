# 🌸 Konnichiwa Gen 22 - Hành Trình Về Nhà Cùng JPC

Game phiêu lưu Pixel RPG tái hiện hành trình tuyển thành viên Gen 22 của **Câu lạc bộ Tiếng Nhật JPC - Trường Đại học Ngoại thương (FTU)**.

---

## 🎮 Giới Thiệu & Lối Chơi

- **Thời lượng:** 5 - 10 phút.
- **Nền tảng:** Tối ưu hóa cho **điện thoại di động (màn hình ngang - Landscape)** và **máy tính (Desktop)**.
- **Phong cách:** Pixel Art Nhật Bản ấm áp, kết hợp hiệu ứng cánh hoa anh đào rơi, nhạc 8-bit lofi hoài niệm và pháo hoa rực rỡ.

---

## ⛩️ 4 Chặng Hành Trình (Hội Trát) & Chung Kết

1. **Hội trát 1: Khai Nhãn (Vòng Đơn)**
   - *Bối cảnh:* Bàn học ban đêm dưới ánh đèn vàng ấm áp.
   - *Nhiệm vụ:* Tìm 3 mảnh ghép cảm xúc (*Đam mê, Ước mơ, Nhiệt huyết*).
   - *Mini-game:* Bắt nhịp niêm phong lá đơn và gửi vào hòm thư JPC lấp lánh.
   - *Kỷ vật:* Lá thư trúng tuyển Hội trát 1 & Huy hiệu Vòng 1.

2. **Hội trát 2: Hòa Nhịp (Vòng Phỏng Vấn Nhóm)**
   - *Bối cảnh:* Phòng phỏng vấn nhóm ấm cúng trên chiếu Tatami.
   - *Nhiệm vụ:* Trò chuyện cùng các bạn ứng viên Gen 22 khác.
   - *Mini-game:* Bắt nhịp sóng cảm xúc đồng điệu cùng cả nhóm.
   - *Kỷ vật:* Bức ảnh nụ cười đồng đội & Huy hiệu Vòng 2.

3. **Hội trát 3.1: Phá Phong (Vòng Teamwork)**
   - *Bối cảnh:* Phòng làm việc nhóm sôi nổi, bảng kế hoạch và những cốc trà sữa tiếp sức.
   - *Nhiệm vụ:* Gặp Trưởng Nhóm để hoàn thiện dự án.
   - *Mini-game:* Điều khiển hứng các ý tưởng sáng tạo và boba, vượt qua mọi áp lực deadline.
   - *Kỷ vật:* Kế hoạch dự án vẽ tay & Huy hiệu Vòng 3.1.

4. **Hội trát 3.2: Chân Diện (Vòng Phỏng Vấn Cá Nhân)**
   - *Bối cảnh:* Căn phòng hoàng hôn tĩnh lặng bên bàn trà đạo.
   - *Nhiệm vụ:* Đối thoại sâu sắc cùng Ban Điều Hành JPC.
   - *Mini-game:* Gương soi nội tâm - Lắng đọng để thành thật với chính mình và lựa chọn câu trả lời từ trái tim.
   - *Kỷ vật:* Gương sáng Chân Diện & Huy hiệu Vòng 3.2.

5. **Chung Kết: Công Bố Thành Viên Chính Thức - Đại Gia Đình JPC Gen 22!**
   - *Bối cảnh:* Đại sảnh lễ hội rợp bóng hoa anh đào, cổng Torii đỏ thắm và đèn lồng lung linh.
   - *Đại diện 5 Ban:* Ban Chuyên Môn, Ban Nhân Sự, Ban Thông Tin, Ban Tổ Chức, Ban Đối Ngoại (linh vật Kokeshi) đứng hai hàng đón chào.
   - *Phần thưởng:* Gặp Chủ Nhiệm JPC nhận **Thẻ Chứng Nhận Thành Viên Chính Thức Gen 22** mang tên bạn, kèm pháo hoa và Sổ Hồi Ức lưu giữ toàn bộ hành trình!

---

## 🕹️ Hướng Dẫn Điều Khiển

### Trên Điện Thoại (Màn hình ngang)
- **Cụm D-Pad (bên trái):** Chạm các nút ▲ ▼ ◀ ▶ để di chuyển.
- **Nút [A] (bên phải):** Tương tác nhặt vật phẩm, nói chuyện với NPC, qua ải hoặc bấm lựa chọn trong mini-game.
- **Nút Menu trên cùng:** Bật/Tắt âm thanh (🔊), mở Sổ Kỷ Niệm (📖), bật Toàn màn hình (⛶).

### Trên Máy Tính (Desktop)
- **Di chuyển:** Phím `W, A, S, D` hoặc các phím Mũi tên `↑, ↓, ←, →`.
- **Tương tác:** Phím `Space`, `Enter` hoặc phím `E`.
- **Sổ Kỷ Niệm:** Phím `M`.

---

## 🚀 Hướng Dẫn Chạy & Triển Khai (Deploy)

### 1. Chạy Trực Tiếp Cục Bộ
Chỉ cần nhấp đúp mở file `index.html` trong bất kỳ trình duyệt nào (Chrome, Safari, Edge...), hoặc chạy máy chủ nhỏ bằng lệnh:
```bash
npx serve .
```

### 2. Triển Khai Lên GitHub Pages
1. Đẩy code lên GitHub:
   ```bash
   git add .
   git commit -m "Hoàn thiện game Konnichiwa Gen 22 JPC"
   git push origin main
   ```
2. Vào GitHub Repository `anhnnt0620-ops/Konnichiwa-Gen22` -> **Settings** -> **Pages**.
3. Tại mục **Branch**, chọn `main` và thư mục `/ (root)` rồi bấm **Save**.
4. Sau 1-2 phút, game sẽ có đường link trực tiếp trên web để các bạn Gen 22 có thể mở chơi ngay trên điện thoại!
