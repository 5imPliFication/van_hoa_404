# VĂN HÓA 404 — CHARACTER CLASSES & VALUE COMBO SYSTEM
## Thiết kế hệ nhân vật và cơ chế cộng hưởng chỉ số

---

# 1. Mục tiêu hệ thống

Hai hệ thống này nhằm tăng:
- replayability;
- sự khác biệt giữa các lần chơi;
- cảm giác build nhân vật;
- chiều sâu chiến thuật mà không làm gameplay phức tạp quá mức.

Phân vai thiết kế:

- **Class nhân vật** = xác định phong cách chơi ngay từ đầu.
- **Chỉ số văn hóa** = xác định hướng build trong trận.
- **Combo chỉ số / Cộng hưởng giá trị** = phần thưởng khi người chơi chủ động phát triển một số nhóm chỉ số đến ngưỡng yêu cầu.

Nguyên tắc:
- class không khóa cứng build;
- combo phải thay đổi gameplay nhìn thấy được;
- tránh buff chỉ là “+X% damage” nếu có thể;
- hệ thống phải đủ đơn giản để triển khai trong MVP.

---

# 2. Hệ class nhân vật

Không nên dùng class fantasy kiểu Warrior / Mage / Archer.

Nên đặt class theo **vai trò trong không gian văn hóa**, nhưng vẫn phải có gameplay identity rõ ràng.

---

## 2.1 Người Kiểm Chứng

### Phong cách
Đánh xa, chính xác, ổn định.

### Vũ khí
- projectile đơn mục tiêu;
- tự động khóa enemy gần nhất;
- tốc độ đạn cao.

### Chỉ số khởi đầu gợi ý
- + projectile speed
- + crit chance
- - area

### Passive
Enemy bị trúng liên tiếp 3 phát nhận trạng thái **Đã xác minh**, chịu thêm damage.

### Affinity
- Khoa học
- Chân

### Vai trò gameplay
Class dễ chơi nhất cho người mới.

---

## 2.2 Người Kiến Tạo

### Phong cách
Kiểm soát khu vực.

### Vũ khí
- pulse / aura định kỳ quanh nhân vật;
- damage đơn mục tiêu không cao;
- clear swarm tốt.

### Chỉ số khởi đầu gợi ý
- + area
- + community power
- - attack speed

### Passive
Đứng trong vùng tích cực do bản thân tạo ra sẽ hồi nhẹ **Community Meter**.

### Affinity
- Đại chúng
- Thiện
- Xây

---

## 2.3 Người Gìn Giữ

### Phong cách
Tanker / defensive.

### Vũ khí
- các mảnh biểu tượng quay quanh nhân vật;
- va vào enemy gây damage.

### Chỉ số khởi đầu gợi ý
- + HP
- + shield
- - move speed

### Passive
Mỗi vài giây nhận một lớp **Bảo hộ bản sắc**, chặn một hit hoặc giảm debuff.

### Affinity
- Dân tộc
- Mỹ
- Thiện

---

## 2.4 Người Lan Tỏa

### Phong cách
Tốc độ cao, nhiều projectile.

### Vũ khí
- bắn nhiều hướng;
- damage mỗi viên thấp.

### Chỉ số khởi đầu gợi ý
- + projectile count
- + attack speed
- - damage per projectile

### Passive
Enemy chết gần enemy khác có xác suất tạo **Lan truyền tích cực**, gây splash damage.

### Affinity
- Đại chúng
- Mỹ
- Xây

---

## 2.5 Người Phản Biện

### Phong cách
Burst / counter.

### Vũ khí
- projectile chậm nhưng damage cao;
- knockback mạnh.

### Chỉ số khởi đầu gợi ý
- + damage
- + knockback
- - attack speed

### Passive
Nếu enemy vừa tung đòn mà bị bắn trúng, đòn đó nhận bonus damage.

### Affinity
- Khoa học
- Chân
- Chống

---

## 2.6 Người Kết Nối

### Phong cách
Summon.

### Vũ khí
- triệu hồi các node cộng đồng;
- node bay quanh người chơi và tự bắn.

### Chỉ số khởi đầu gợi ý
- + summon count
- + pickup radius
- - personal damage

### Passive
Càng nhiều summon đang hoạt động, Community Meter hồi càng nhanh.

### Affinity
- Đại chúng
- Thiện
- Xây

---

# 3. Weapon Identity theo class

Không nên để class chỉ khác nhau ở vài phần trăm chỉ số.

Mỗi class cần có **cách tấn công nền tảng khác nhau**:

- Người Kiểm Chứng → sniper projectile
- Người Kiến Tạo → pulse area
- Người Gìn Giữ → cone AoE (Trống Đồng: sóng âm hình nón, dập tắt đạn địch)
- Người Lan Tỏa → multishot
- Người Phản Biện → heavy shot
- Người Kết Nối → summon

Mục tiêu:
ngay trong 10 giây đầu người chơi phải cảm nhận được “class này chơi khác class kia”.

---

# 4. Affinity

Affinity là hệ số tăng xác suất xuất hiện upgrade phù hợp với class.

Ví dụ:

### Người Kiểm Chứng
Affinity:
- Khoa học
- Chân

Upgrade thuộc hai nhóm này có xác suất xuất hiện cao hơn.

### Người Gìn Giữ
Affinity:
- Dân tộc
- Mỹ

### Người Kiến Tạo
Affinity:
- Đại chúng
- Thiện

Implementation gợi ý:
- dùng weighted random khi chọn 3 upgrade card;
- affinity chỉ tăng xác suất, không khóa build.

---

# 5. Class khuyến nghị cho MVP

Không cần làm đủ 6 class từ đầu.

Bắt đầu với 3 class:

## Người Kiểm Chứng
- projectile
- ranged
- crit / precision

## Người Kiến Tạo
- AoE pulse
- zone control
- community sustain

## Người Gìn Giữ
- orbiting weapon
- tank / shield
- defensive

Ba class này đã đủ đại diện cho:
- ranged;
- area;
- defensive.

Sau đó mới mở rộng:
- Người Lan Tỏa
- Người Phản Biện
- Người Kết Nối

---

# 6. Class unlockable

## Người Toàn Diện

Class dành cho replay.

### Đặc điểm
- starting stats trung bình;
- không có weapon quá mạnh đầu game.

### Passive
Giảm threshold combo 2 stat từ Lv4 xuống Lv3.

### Mục đích
- early game yếu hơn;
- mid/late game có nhiều combo hơn;
- phù hợp người đã clear game ít nhất một lần.

---

# 7. Cơ chế combo chỉ số

Tên hiển thị nên dùng:

## CỘNG HƯỞNG GIÁ TRỊ

Thay vì chỉ gọi “combo stat”.

Cơ chế:

```text
Nếu các chỉ số yêu cầu đạt threshold
→ unlock một passive / effect mới
→ effect tồn tại đến hết trận
```

---

# 8. Ngưỡng combo

Khuyến nghị:

### Combo 2 chỉ số
- mỗi chỉ số đạt Lv4

### Combo 3 chỉ số
- mỗi chỉ số đạt Lv5

Không cần nhiều tier combo.

Tránh:
- combo Lv2
- combo Lv4
- combo Lv6
- combo nâng cấp nhiều tầng

để không làm hệ thống phình quá nhanh.

---

# 9. Combo 2 chỉ số

## 9.1 Chân + Thiện
### KHIÊN THÔNG TIN

Hiệu ứng:
- 3 mảnh khiên quay quanh người chơi;
- chặn projectile địch;
- mỗi mảnh hồi lại sau X giây.

Ý nghĩa:
- thông tin đúng + trách nhiệm/nhân văn.

---

## 9.2 Khoa học + Chân
### KIỂM CHỨNG

Hiệu ứng:
- projectile xuyên 2 mục tiêu;
- bonus damage vào Tin giả;
- enemy bị đánh dấu nhận thêm crit.

---

## 9.3 Đại chúng + Thiện
### VĂN HÓA ỨNG XỬ

Hiệu ứng:
- aura làm chậm Bạo lực ngôn từ;
- hồi nhẹ HP;
- hồi nhẹ Community Meter.

---

## 9.4 Dân tộc + Mỹ
### BẢN SẮC SÁNG TẠO

Hiệu ứng:
- pulse AoE;
- bonus damage vào Sao chép máy móc;
- tăng area.

---

## 9.5 Dân tộc + Chân
### GỐC RỄ VỮNG VÀNG

Hiệu ứng:
- giảm duration distortion debuff;
- tăng shield;
- tăng khả năng chống knockback.

---

## 9.6 Khoa học + Thiện
### PHẢN BIỆN CÓ TRÁCH NHIỆM

Hiệu ứng:
- sau khi bị bắn trúng, đòn đánh kế tiếp nhận bonus damage;
- giảm thời gian debuff.

---

## 9.7 Đại chúng + Mỹ
### LAN TỎA TÍCH CỰC

Hiệu ứng:
- enemy chết có xác suất tạo wave lan ra;
- tăng pickup radius;
- XP orb hút về từ xa.

---

## 9.8 Chân + Mỹ
### NỘI DUNG CÓ GIÁ TRỊ

Hiệu ứng:
- crit tạo AoE nhỏ;
- projectile có xác suất split.

---

# 10. Combo 3 chỉ số

Không nên có quá nhiều.

Chỉ cần khoảng 3–4 combo cao cấp.

---

## 10.1 Dân tộc + Khoa học + Đại chúng
### NỀN VĂN HÓA MỚI

Điều kiện:
- mỗi stat Lv5

Hiệu ứng:
- + area
- + damage
- + community restoration
- tạo aura đặc biệt

Đây nên là một trong những combo mạnh nhất.

---

## 10.2 Chân + Thiện + Mỹ
### GIÁ TRỊ TOÀN DIỆN

Hiệu ứng:
- crit tạo heal pulse;
- giảm damage nhận;
- tăng area.

Vai trò:
defensive sustain build.

---

## 10.3 Khoa học + Chân + Đại chúng
### MẠNG LƯỚI KIỂM CHỨNG

Hiệu ứng:
- enemy bị mark có thể truyền mark sang enemy gần;
- marked enemy chết tạo XP bonus.

---

## 10.4 Dân tộc + Mỹ + Đại chúng
### LAN TỎA BẢN SẮC

Hiệu ứng:
- AoE lớn;
- summon hoặc pulse;
- bonus Community Meter.

---

# 11. Nguyên tắc thiết kế combo

Combo không nên chỉ là:

> +20% damage

Nên ưu tiên hiệu ứng nhìn thấy được:

- orbiting shield;
- aura;
- projectile đổi hình;
- summon;
- chain effect;
- pulse;
- phản đạn;
- vùng hồi;
- slow zone;
- mark propagation.

Người chơi cần cảm nhận được:

> “Tôi vừa unlock một cơ chế mới.”

---

# 12. Quan hệ giữa class và combo

Class không khóa combo.

Ví dụ:
- Người Kiểm Chứng có lợi thế tự nhiên với Khoa học + Chân;
- nhưng vẫn có thể build Dân tộc + Mỹ;
- hoặc Đại chúng + Thiện.

Class chỉ:
- cho starting stats;
- starting value levels;
- starting weapon;
- passive;
- affinity.

Combo vẫn phụ thuộc build trong trận.

---

# 13. Data schema đề xuất

Nên tách thành các file:

```text
classes.json
weapons.json
upgrades.json
combos.json
```

Vai trò:

- `classes.json` = identity
- `weapons.json` = attack behavior
- `upgrades.json` = stat growth
- `combos.json` = threshold reward

---

# 14. Schema class

Ví dụ:

```json
{
  "id": "nguoiKiemChung",
  "name": "Người Kiểm Chứng",
  "startingWeapon": "verificationShot",
  "startingStats": {
    "hp": 100,
    "damage": 12,
    "attackSpeed": 1.0,
    "moveSpeed": 1.0
  },
  "startingValues": {
    "khoaHoc": 1,
    "chan": 1
  },
  "affinity": [
    "khoaHoc",
    "chan"
  ],
  "passive": {
    "type": "mark_after_hits",
    "requiredHits": 3,
    "bonusDamage": 0.2
  }
}
```

---

# 15. Schema combo

Ví dụ:

```json
{
  "id": "khienThongTin",
  "name": "Khiên Thông Tin",
  "requirements": [
    {
      "stat": "chan",
      "level": 4
    },
    {
      "stat": "thien",
      "level": 4
    }
  ],
  "effects": {
    "type": "orbiting_shield",
    "shieldCount": 3,
    "radius": 80,
    "respawnSeconds": 6
  }
}
```

---

# 16. Hướng triển khai MVP

Phase đầu nên làm:

### Class
- Người Kiểm Chứng
- Người Kiến Tạo
- Người Gìn Giữ

### Combo
- Khiên Thông Tin
- Kiểm Chứng
- Văn Hóa Ứng Xử
- Bản Sắc Sáng Tạo

### Sau khi core loop ổn định
Bổ sung:
- Người Lan Tỏa
- Người Phản Biện
- Người Kết Nối
- combo 3 stat
- Người Toàn Diện unlockable

---

# 17. Design takeaway

Mục tiêu cuối cùng của hệ thống:

- class tạo khác biệt ngay từ đầu;
- upgrade tạo hướng build;
- combo thưởng cho build có chủ đích;
- mỗi combo phải đủ “gameplay-visible” để người chơi cảm thấy build của mình đã thay đổi;
- nội dung học thuật phải được thể hiện qua mechanic, không chỉ qua text.
