# HỆ THỐNG CHỈ SỐ, BUFF & KỸ NĂNG — VĂN HÓA 404

Tài liệu chi tiết toàn bộ các cơ chế chỉ số nhân vật, hệ thống 8 trụ cột nâng cấp, 4 kỹ năng tiến hóa, hiệu ứng tình huống thực tế và cơ chế Môi Trường Văn Hóa trong game **Văn Hóa 404**.

---

## 1. BẢNG CHỈ SỐ NHÂN VẬT (PlayerStats)

| Chỉ số | Khởi điểm | Cơ chế hoạt động trong trận đấu | Cách gia tăng |
| :--- | :---: | :--- | :--- |
| **`hp`** | 100 | Máu hiện tại của nhân vật. Khi nhận sát thương từ quái hoặc sự kiện, HP sẽ bị trừ. Nếu HP tụt về `<= 0`, người chơi tử trận. | Hồi máu qua trụ cột Thiện (+2 HP/5s), Tiến hóa Văn Hóa Ứng Xử, hoặc lựa chọn đúng sự kiện. |
| **`maxHp`** | 100 | Máu tối đa của nhân vật. Mọi hiệu ứng hồi máu đều bị giới hạn bởi trần `maxHp`. | Có thể gia tăng thông qua các hiệu ứng đặc biệt. |
| **`moveSpeed`** | 240 | Tốc độ di chuyển tính theo pixel/giây (hỗ trợ phím WASD, mũi tên, hoặc kéo ngón tay trên màn cảm ứng). | Nâng cấp thẻ Xây (+15%/cấp), lựa chọn sự kiện tích cực. |
| **`damage`** | 20 | Sát thương cơ bản của mỗi phát đạn bắn ra. | Nâng cấp thẻ Chân (+20%), thẻ Chống (+5), các Tiến Hóa, và buff tạm thời từ sự kiện. |
| **`attackSpeed`** | 1.2 | Tốc độ bắn (số phát bắn mỗi giây). Thời gian giãn cách giữa 2 loạt bắn: `cooldown = 1000 / attackSpeed` ms. | Nâng cấp thẻ Khoa Học (+15%/cấp), sự kiện tích cực. |
| **`projectileCount`**| 1 | Số lượng tia đạn phát ra trong mỗi đòn tấn công. Khi > 1, vũ khí tự động bắn chùm hình nón tỏa đều góc `0.15 rad`. | Nâng cấp thẻ Chống (+1 tia đạn/cấp). |
| **`projectileSpeed`**| 450 | Vận tốc bay của viên đạn (pixel/giây). Giúp đạn bay nhanh đến mục tiêu di động. | Chỉ số cơ bản của vũ khí. |
| **`pickupRadius`** | 90 | Bán kính hút ngọc kinh nghiệm XP (Magnet Radius). Ngọc trong phạm vi này sẽ tự động lướt mượt mà về phía người chơi. | Nâng cấp thẻ Đại Chúng (+30px/cấp). |
| **`critChance`** | 5% (0.05) | Tỉ lệ đòn đánh gây sát thương chí mạng (**x2.0 sát thương**, hiển thị số damage màu vàng kim nổi bật). | Nâng cấp thẻ Khoa Học (+5%/cấp). |
| **`shield`** | 0 | Điểm khiên bảo vệ. Hấp thụ toàn bộ sát thương thay cho HP cho đến khi cạn kiệt. | Nâng cấp thẻ Dân Tộc (+25 khiên), các quyết định sự kiện bảo vệ văn hóa. |
| **`buildPower`** | 0 | **Sức mạnh Kiến Tạo (Xây)**: Tăng tốc độ hồi phục Môi Trường Văn Hóa (+2%/điểm), tăng hiệu lực hồi máu định kỳ (+2%/điểm), và tăng sát thương Hào Quang (+0.4 dmg/điểm). | Thẻ Xây (+15), thẻ Đại Chúng (+5), Tiến Hóa Mặt Trận Văn Hóa (+15). |
| **`fightPower`** | 0 | **Sức mạnh Đấu Tranh (Chống)**: Tăng trực tiếp toàn bộ sát thương vũ khí (+1.5%/điểm) lên quái và Boss, đồng thời gia tăng lực đẩy lùi (+2px/điểm) khi bắn trúng quái. | Thẻ Chống (+10), Tiến Hóa Mặt Trận Văn Hóa (+15). |

---

## 2. HỆ THỐNG 8 TRỤ CỘT NÂNG CẤP (Cultural Upgrades)

Mỗi lần nhặt đủ hạt ngọc kinh nghiệm (XP) để lên cấp, người chơi được chọn 1 trong 3 thẻ bài ngẫu nhiên:

### 1. Tư Duy Phản Biện (Khoa Học I)
* **Trụ cột**: `khoaHoc` (+1)
* **Hiệu ứng**: `+15% Tốc độ bắn`, `+5% Tỉ lệ bạo kích (Chí mạng x2)`
* **Ý nghĩa & Khắc chế**: Rèn luyện khả năng kiểm chứng logic, tăng nhịp độ công kích và xác suất hạ gục nhanh các hiện tượng **Tin Giả**.

### 2. Bản Sắc Bền Vững (Dân Tộc I)
* **Trụ cột**: `danToc` (+1)
* **Hiệu ứng**: `+25 Khiên chắn bảo vệ kiên cố`
* **Ý nghĩa & Khắc chế**: Bảo tồn giá trị cốt lõi, tạo lớp khiên dày giúp chống đỡ sự xuyên tạc và công kích độc hại từ các hiện tượng **Xuyên Tạc Văn Hóa**.

### 3. Lan Tỏa Cộng Đồng (Đại Chúng I)
* **Trụ cột**: `daiChung` (+1)
* **Hiệu ứng**: `+30 Bán kính nhặt XP`, `+5 Sức mạnh Xây`, `Kích hoạt Hào Quang Văn Hóa`
* **Ý nghĩa & Khắc chế**: Mở rộng tầm kết nối cộng đồng, hút XP từ xa và tạo vùng năng lượng làm chậm quái vật, giải tán hiện tượng **Tâm Lý Đám Đông**.

### 4. Xác Thực Chân Lý (Chân I)
* **Trụ cột**: `chan` (+1)
* **Hiệu ứng**: `+20% Sát thương đạn chuẩn xác vĩnh viễn`
* **Ý nghĩa & Khắc chế**: Tôn trọng sự thật khách quan, tăng uy lực đạn để thổi bay các thông tin giật gân, độc hại như **Clickbait** và **Tin Giả**.

### 5. Ứng Xử Văn Minh (Thiện I)
* **Trụ cột**: `thien` (+1)
* **Hiệu ứng**: `Tự động hồi phục 2 HP sau mỗi 5 giây` (được tăng cường thêm bởi Sức mạnh Xây)
* **Ý nghĩa & Khắc chế**: Lan tỏa sự tử tế, hồi phục tinh thần và sinh lực trước các đợt tấn công từ xa của hiện tượng **Bạo Lực Ngôn Từ**.

### 6. Thẩm Mỹ Số (Mỹ I)
* **Trụ cột**: `my` (+1)
* **Hiệu ứng**: `+15% Sát thương diện rộng`, `Mở rộng tầm sát thương của Hào Quang`
* **Ý nghĩa & Khắc chế**: Tôn vinh cái đẹp và sự sáng tạo nguyên bản, khắc chế hiện tượng **Đạo Nhái** và nội dung rác câu view.

### 7. Tường Lửa Chống Lệch Chuẩn (Chống I)
* **Trụ cột**: `fight` (+1)
* **Hiệu ứng**: `+1 Tia đạn bổ sung (Bắn chùm đa tia)`, `+5 Sát thương đạn gốc`, `+10 Sức mạnh Chống`
* **Ý nghĩa & Khắc chế**: Tinh thần đấu tranh quyết liệt đẩy lùi cái xấu, tăng diện bao phủ hỏa lực và gia tăng cự ly đẩy lùi quái vật.

### 8. Kiến Tạo Giá Trị Tích Cực (Xây I)
* **Trụ cột**: `build` (+1)
* **Hiệu ứng**: `+15% Tốc độ di chuyển`, `Hồi phục ngay lập tức 15% Môi Trường Văn Hóa`, `+15 Sức mạnh Xây`
* **Ý nghĩa & Khắc chế**: Tinh thần xây dựng không gian mạng nhân văn, tăng độ cơ động né đòn và củng cố vững chắc thanh Môi Trường Văn Hóa.

---

## 3. TIẾN HÓA KỸ NĂNG KẾT HỢP (Cultural Evolutions)

Khi người chơi sở hữu cùng lúc các cặp giá trị tương hỗ (>= cấp 1), kỹ năng tối thượng sẽ tự động được khai mở:

```mermaid
graph TD
    KhoaHoc["Khoa Học (Critical, Firerate)"] --> KiemChung["✨ KIỂM CHỨNG\n(Đạn xuyên thấu + 50% dmg vs Tin Giả)"]
    Chan["Chân (Damage Chuẩn Xác)"] --> KiemChung

    DaiChung["Đại Chúng (Pickup, Aura)"] --> VanHoaUngXu["✨ VĂN HÓA ỨNG XỬ\n(Hào quang làm chậm 30% + Hồi 3 HP/5s)"]
    Thien["Thiện (Hồi Máu Định Kỳ)"] --> VanHoaUngXu

    DanToc["Dân Tộc (Khiên Chắn Bền Vững)"] --> BanSacSangTao["✨ BẢN SẮC SÁNG TẠO\n(+35% Toàn bộ Damage + Mở rộng hào quang 70px)"]
    My["Mỹ (Sát Thương Diện Rộng)"] --> BanSacSangTao

    Build["Xây (Kiến Tạo, Môi Trường)"] --> MatTranVanHoa["✨ MẶT TRẬN VĂN HÓA\n(+30% Damage + Hồi 25% Môi trường + 15 Xây/Chống)"]
    Fight["Chống (Đa Tia Đạn, Đẩy Lùi)"] --> MatTranVanHoa
```

### 1. Kiểm Chứng (Khoa học + Chân)
* **Mô tả**: *"Đạn xuyên thấu mọi mục tiêu và gây thêm 50% sát thương lên Tin Giả."*
* **Cơ chế**: Đạn không còn biến mất khi chạm quái vật đầu tiên mà bay thẳng xuyên suốt đội hình địch; quái vật `tinGia` nhận sát thương nhân thêm hệ số `1.5x`.

### 2. Văn Hóa Ứng Xử (Đại chúng + Thiện)
* **Mô tả**: *"Hào quang xung quanh làm chậm quái 30% và hồi máu đều đặn (+3 HP mỗi 5s)."*
* **Cơ chế**: Tăng thêm `30%` hiệu quả làm chậm trong vùng hào quang (quái bị giảm mạnh tốc độ tiếp cận) và bổ sung thêm `+3 HP` mỗi chu kỳ hồi phục 5 giây.

### 3. Bản Sắc Sáng Tạo (Dân tộc + Mỹ)
* **Mô tả**: *"Đòn tấn công sóng năng lượng lan tỏa diện rộng, tăng 35% sát thương và mở rộng hào quang."*
* **Cơ chế**: Nhân trực tiếp `1.35x` sát thương toàn bộ vũ khí và mở rộng thêm `70px` bán kính vùng ảnh hưởng của hào quang văn hóa.

### 4. Mặt Trận Văn Hóa (Xây + Chống cân bằng)
* **Mô tả**: *"Xây và Chống đi đôi: +30% Sát thương, hồi ngay 25% Môi Trường Văn Hóa, +15 Xây & Chống."*
* **Cơ chế**: Đạt đỉnh cao nhận thức "Xây đi đôi với Chống", tăng ngay `1.30x` sát thương, lập tức khôi phục `+25%` Môi Trường Văn Hóa, đồng thời tăng vọt 15 điểm chỉ số Xây và 15 điểm chỉ số Chống.

---

## 4. TÌNH HUỐNG THỰC TẾ & BUFF/DEBUFF TẠM THỜI (Scenario Events)

Các tình huống xuất hiện ngắt nhịp trận đấu, yêu cầu người chơi giải quyết bài toán văn hóa mạng với hệ quả trực tiếp:

| Thời điểm | Tình huống | Lựa chọn ứng xử | Hiệu ứng nhận được |
| :--- | :--- | :--- | :--- |
| **00:45** | **Tin Đồn Chưa Kiểm Chứng** | **Kiểm chứng nguồn tin** | `+10 Khiên`, `+20% Sát thương (20s)`, `+15% Môi Trường`, `+20% XP (20s)` |
| | | Chia sẻ cảnh báo ngay | `-5 HP`, `-15% Môi Trường`, sinh 6 quái Tin Giả tăng 20% tốc độ |
| | | Báo cáo vi phạm | `+10% Môi Trường`, làm chậm quái 20% (15s) |
| **02:40** | **Công Kích Hội Đồng (Cyberbullying)** | **Lên tiếng bênh vực văn minh** | `+15 Khiên`, `+10% Sát thương` & `+10% Tốc bắn (20s)`, `+20% Môi Trường`, làm chậm quái 10% (20s) |
| | | Hùa theo bình luận ác ý | `-10 HP`, `-20% Môi Trường`, sinh 4 quái Bạo Lực Ngôn Từ tăng 25% tốc độ |
| **05:10** | **Xuyên Tạc Di Sản Văn Hóa** | **Đính chính tư liệu chuẩn xác** | `+20 Khiên`, `+25% Sát thương (25s)`, `+25% Môi Trường`, `+15% XP (25s)` |
| | | Thả phẫn nộ câu view | `-5 HP`, `-15% Môi Trường`, sinh 2 quái Tinh Anh Xuyên Tạc tăng 10% tốc độ |
| **07:40** | **Đạo Nhái Tác Phẩm Sáng Tạo** | **Bảo vệ quyền tác giả gốc** | `+25 Khiên`, `+30% Sát thương` & `+10% Tốc bắn (25s)`, `+25% Môi Trường`, làm chậm quái 15% (25s) |
| | | Thờ ơ xem như bình thường | `-10% Sát thương (15s)`, `-10% Môi Trường`, sinh 5 quái Clickbait tăng 10% tốc độ |

> **Lưu ý**: Trong thời gian buff/debuff tạm thời kích hoạt, thanh HUD trên cùng sẽ hiển thị biểu tượng `⚡ HIỆU ỨNG SỰ KIỆN` với các thông số cụ thể và tự động hoàn trả chỉ số chuẩn xác khi hết thời gian `durationSeconds`.

---

## 5. CƠ CHẾ MÔI TRƯỜNG VĂN HÓA (Community Meter)

* **Thang điểm**: `0% — 100%` (Khởi điểm: `75%`).
* **Quy luật suy giảm**: Khi để quái vật tích tụ đông đảo trên màn hình (`> 25 quái`), không gian mạng bị vẩn đục, thanh Môi Trường giảm `-0.6%/giây`.
* **Quy luật phục hồi**:
  * Khi quét sạch chiến trường (`< 10 quái`) và có đầu tư điểm Xây (`values.build > 0`), thanh tự hồi phục `+0.4%/giây x (1 + buildPower * 0.02)`.
  * Nhận trực tiếp khi chọn thẻ **Xây I** (`+15%`), **Mặt Trận Văn Hóa** (`+25%`), hoặc các lựa chọn sự kiện tích cực (`+10%` đến `+25%`).
* **Trạng thái Khủng hoảng (Crisis State)**: Khi Môi Trường chạm đáy `0%`, người chơi không bị xử thua ngay lập tức mà bị áp dụng **Debuff Nghiêm Trọng**:
  * **`-25% Sát thương`**
  * **`-20% Tốc độ di chuyển`**
  * Trạng thái này chỉ được giải trừ khi người chơi phục hồi chỉ số Môi Trường trở lại trên `20%`.

---

## 6. CÔNG THỨC EXP NGHỊCH ĐẢO HÀM MŨ (Inverse Exponential XP Scaling)

Nhằm khắc phục nhược điểm của công thức tuyến tính (gây buồn ngủ lúc đầu hoặc quá chậm lúc sau) và công thức hàm mũ đơn thuần (tạo ra bức tường cản trở vô lý ở giai đoạn giữa và cuối), game áp dụng **Công thức Nghịch Đảo Hàm Mũ (Inverse Exponential)** kết hợp gia số bù trừ ổn định:

$$\text{nextLevelXP}(L) = \left\lfloor 10 + 70 \cdot \left(1 - e^{-0.085 \cdot (L - 1)}\right) + 3 \cdot (L - 1) \right\rfloor$$

### Ưu điểm thiết kế:
1. **Khởi đầu nhanh và trực quan (Levels 1 — 3)**: Người chơi chỉ cần nhặt `10 — 18 XP` để đạt ngay những cấp độ đầu tiên, nhanh chóng hình thành bộ kỹ năng cốt lõi.
2. **Tăng độ thử thách mượt mà (Levels 4 — 10)**: Số XP yêu cầu tăng dần đều đặn (`26 — 64 XP`) tương ứng với mật độ quái vật bắt đầu đông hơn trên bản đồ.
3. **Không tạo "bức tường kinh nghiệm" (Levels 15+)**: Nhờ độ cong tiệm cận của hàm nghịch đảo hàm mũ, mức XP yêu cầu không bị bùng nổ vô tận mà duy trì tốc độ thăng cấp ổn định (`75 — 95 XP`), giúp người chơi liên tục có cơ hội nâng cấp và thử nghiệm chiến thuật.

| Cấp độ | XP cần để lên cấp tiếp theo | Nhịp độ trải nghiệm |
| :---: | :---: | :--- |
| **Cấp 1 → 2** | `10 XP` | Nhặt vài ngọc quái đầu tiên, mở khóa thẻ trụ cột đầu tiên |
| **Cấp 2 → 3** | `18 XP` | Định hình phong cách (Xây, Chống, hoặc Khoa học) |
| **Cấp 3 → 4** | `26 XP` | Chuẩn bị trước đợt sóng quái bầy đàn đầu tiên |
| **Cấp 5 → 6** | `40 XP` | Đạt ngưỡng kích hoạt Tiến hóa đầu tiên nếu chọn đúng cặp |
| **Cấp 7 → 8** | `52 XP` | Chuẩn bị đối đầu Trùm 3 phút |
| **Cấp 10 → 11** | `67 XP` | Củng cố sức mạnh đối đầu Trùm 5 phút |
| **Cấp 15 → 16** | `85 XP` | Đạt 2-3 Kỹ năng Tiến hóa, đối đầu Trùm 7 phút |
| **Cấp 20+** | `~98+ XP` | Sức mạnh toàn diện đối đầu Đại Trùm 10 phút |

---

## 7. HỆ THỐNG 4 TRÙM THEO MỐC THỜI GIAN & KIỂM TRA PHÂN BỔ CHỈ SỐ CÂN BẰNG

Trận đấu được cấu trúc thành 4 mốc thử thách trùm then chốt tại các phút **3, 5, 7 và 10**. Mỗi con trùm được thiết kế đặc thù nhằm **kiểm tra sự phân bổ cân bằng giữa các chỉ số nhân vật**, ngăn chặn lối chơi dồn toàn bộ điểm vào một chỉ số duy nhất:

```mermaid
timeline
    title 4 Mốc Thời Gian Trùm & Chỉ Số Thử Thách
    03:00 : Trùm 1: Hội Chứng Bầy Đàn Siêu Tốc : Thử thách ProjectileCount, Pierce, MoveSpeed, Hào Quang
    05:00 : Trùm 2: Bão Độc Bạo Lực Mạng (DOT) : Thử thách Shield, Sustain (Hồi máu Thiện), BuildPower
    07:00 : Trùm 3: Hiện Thân Xuyên Tạc & Ảo Ảnh : Thử thách CritChance, FightPower, Khắc chế Phân thân & Lướt
    10:00 : Trùm 4: Đại Trùm Lệch Chuẩn Văn Hóa Số : Thử thách Toàn Diện 8 Trụ Cột & Các Kỹ Năng Tiến Hóa
```

---

### Mốc 1: 03 Phút (180s) — Trùm Hội Chứng Bầy Đàn Siêu Tốc
* **Hình thái**: Hiện thân của hiện tượng tâm lý a dua, bầy đàn cực đoan trên mạng.
* **Cơ chế chiến đấu**:
  * Triệu hồi liên tục từng đợt **10 quái vật tí hon** (`tiny_swarm`) sau mỗi 3.5 giây. Bầy quái tí hon này di chuyển với tốc độ cực nhanh (`215 px/s`), lao thẳng bổ nhào vào người chơi.
  * Bản thân trùm bắn chùm đạn quạt 5 hướng tỏa rộng.
* **Chỉ số kiểm tra**:
  * **`projectileCount` (Số tia đạn)** & **Kỹ năng Kiểm Chứng (`pierce` đạn xuyên)**: Cực kỳ cần thiết để quét sạch hàng chục quái đàn tí hon đang lao tới mà không bị chặn đạn.
  * **`moveSpeed` (Tốc chạy)**: Cần tốc độ để giữ cự ly an toàn, thả diều (kiting) không để bị vây ép vào góc tường.
  * **Hào Quang Văn Hóa (`daiChung`, `my`)**: Làm chậm và triệt tiêu bầy quái áp sát.
* **Phần thưởng khi đánh bại**: Mưa **25 ngọc XP**, lập tức hồi phục **+25% Môi Trường Văn Hóa**, hiển thị biểu ngữ vinh danh và tiếp tục hành trình sang mốc thời gian tiếp theo.

---

### Mốc 2: 05 Phút (300s) — Trùm Bão Độc Bạo Lực Mạng (Toxic DOT)
* **Hình thái**: Hiện thân của không gian mạng độc hại, ngôn từ thù ghét và công kích cá nhân.
* **Cơ chế chiến đấu**:
  * Tỏa ra một **Vùng Độc Tố Bán Kính 280px** màu xanh lục vây quanh trùm. Người chơi khi ở trong vùng này sẽ liên tục nhận sát thương theo thời gian (**Damage Over Time - DOT: 3 sát thương mỗi 1.5 giây**).
  * Trùm liên tục bắn 3 quả cầu độc tầm xa gây khó khăn cho việc né tránh.
* **Chỉ số kiểm tra**:
  * **`shield` (Khiên chắn Dân Tộc)**: Lớp khiên vững chắc là tấm đệm hấp thụ các nhịp rút máu DOT độc hại mà không làm tổn hại đến HP gốc.
  * **`thien` (Hồi máu định kỳ Ứng Xử)** & **`buildPower` (Sức mạnh Xây)**: Bù đắp lượng máu bị rút liên tục, giúp trụ vững suốt thời gian giao tranh trong vùng ô nhiễm.
  * Tầm bắn và sát thương chuẩn xác để không bị ép góc quá lâu.
* **Phần thưởng khi đánh bại**: Mưa **25 ngọc XP**, hồi phục **+25% Môi Trường Văn Hóa**, hiển thị thông báo vượt ải và tiếp tục cuộc chơi.

---

### Mốc 3: 07 Phút (420s) — Trùm Hiện Thân Xuyên Tạc & Ảo Ảnh (Phantom Shield & Dash)
* **Hình thái**: Hiện thân của sự bẻ cong sự thật, tạo thông tin giả ngụy tạo và các chiêu trò đánh lạc hướng.
* **Cơ chế chiến đấu**:
  * **Phân thân ảo ảnh (`clones`)**: Triệu hồi 2 phân thân ảo ảnh bay quanh bảo vệ, đóng vai trò như lá chắn thịt hấp thụ mọi phát đạn thông thường.
  * **Khiên giảm thương**: Trùm nhận giảm 50% sát thương từ mọi đòn đánh thông thường nếu người chơi không có đòn bạo kích hoặc thiếu Sức mạnh Chống.
  * **Lướt thần tốc (`dash`)**: Cứ sau mỗi 4 giây, trùm khóa mục tiêu và tung cú lướt tốc hành cực mạnh (`320 px/s`) hướng thẳng vào người chơi kèm theo bão đạn 8 hướng.
* **Chỉ số kiểm tra**:
  * **`critChance` (Tỉ lệ chí mạng Khoa Học)**: Đòn đánh bạo kích bỏ qua hiệu ứng giảm thương của lớp khiên, gây trọn vẹn x2 sát thương dứt điểm.
  * **`fightPower` (Sức mạnh Chống)**: Nếu đạt `fightPower >= 10`, người chơi vô hiệu hóa cơ chế phòng ngự của trùm và đẩy lùi hiệu quả.
  * **Đạn xuyên (`pierce`)**: Đạn xuyên thấu qua phân thân ảo ảnh để chạm thẳng vào thực thể trùm phía sau.
* **Phần thưởng khi đánh bại**: Mưa **25 ngọc XP**, hồi phục **+25% Môi Trường Văn Hóa**, thông báo hoàn thành ải 7 phút.

---

### Mốc 4: 10 Phút (600s) — Đại Trùm Cuối: Hiện Thân Lệch Chuẩn Văn Hóa Số
* **Hình thái**: Hiện thân tối thượng tích tụ của toàn bộ 4 hiện tượng xấu xa trên mạng Internet (Tin giả, Bạo lực, Đạo nhái, Xuyên tạc).
* **Cơ chế 3 giai đoạn tiến hóa (`Phases`)**:
  * **Giai đoạn 1 (100% — 65% HP)**: Bão đạn 8 hướng hình quạt, di chuyển áp sát đều đặn, bắt đầu rút nhẹ Môi Trường Văn Hóa.
  * **Giai đoạn 2 (65% — 30% HP)**: *Bạo Lực & Cực Hóa*: Tăng 35% tốc độ di chuyển, bắn chùm đạn liên thanh 3 tia tốc độ cao 240 px/s.
  * **Giai đoạn 3 (< 30% HP)**: *Khủng Hoảng Toàn Diện*: Tung bão đạn 12 hướng toàn màn hình, liên tục triệu hồi quái Tinh Anh Xuyên Tạc tiếp ứng, rút mạnh Môi Trường Văn Hóa (-2%/giây).
* **Chỉ số kiểm tra**:
  * Đòi hỏi sự **cân bằng toàn diện cả 8 trụ cột**: Đủ sát thương và bạo kích để kết liễu trùm trước khi Môi Trường cạn kiệt; đủ khiên, máu và tốc chạy để sống sót qua làn đạn 12 hướng; và sở hữu các kỹ năng tối thượng như **Mặt Trận Văn Hóa**, **Kiểm Chứng**, **Văn Hóa Ứng Xử**, **Bản Sắc Sáng Tạo**.
* **Phần thưởng khi đánh bại**: Mưa **40 ngọc XP**, kích hoạt màn hình **Chiến Thắng Vinh Quang (Victory)** với phân tích toàn diện bảng thành tích và huy hiệu danh dự văn hóa số!

