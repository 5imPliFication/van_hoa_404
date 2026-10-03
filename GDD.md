# VĂN HÓA 404 — GAME DESIGN DOCUMENT
## Phiên bản 0.1

## 1. High concept
Web game survivor-like ngắn, nơi người chơi di chuyển, tự động tấn công, né chướng ngại, nhặt XP, lên cấp và xây dựng một “hệ giá trị văn hóa” để chống lại các biểu hiện lệch chuẩn trong không gian số.

Các trụ gameplay:
- Dân tộc
- Khoa học
- Đại chúng
- Chân
- Thiện
- Mỹ
- Xây
- Chống

Quái là hiện tượng/hành vi, không đại diện cho một nhóm người cụ thể.

## 2. Mục tiêu học tập
Sau game, người chơi cần ghi nhớ:
- ba tính chất Dân tộc – Khoa học – Đại chúng;
- tư duy “Xây đi đôi với Chống”;
- một số biểu hiện lệch chuẩn như tin giả, cyberbullying, nội dung câu view, xuyên tạc văn hóa;
- tinh thần tiếp thu văn hóa có chọn lọc, không sao chép máy móc.

## 3. Thời lượng
Mục tiêu 12 phút:
- 0:00–0:45 Intro
- 0:45–3:00 Wave 1
- 3:00–5:30 Wave 2
- 5:30–8:00 Wave 3
- 8:00–10:30 Elite + scenario events
- 10:30–12:00 Boss + ending

## 4. Core loop
Di chuyển → auto-fire → né → diệt quái → nhặt XP → level up → chọn 1/3 upgrade → tạo synergy → event tình huống → boss → hồ sơ kết quả.

## 5. Điều khiển
Desktop:
- WASD / Arrow Keys: di chuyển
- Mouse: chọn upgrade/event

Mobile:
- virtual joystick
- tap UI

Không có nút bắn.

## 6. Player stats
```ts
type PlayerStats = {
  hp: number;
  maxHp: number;
  moveSpeed: number;
  damage: number;
  attackSpeed: number;
  projectileCount: number;
  projectileSpeed: number;
  pickupRadius: number;
  critChance: number;
  shield: number;
  buildPower: number;
  fightPower: number;
};
```

## 7. Hệ giá trị

### Dân tộc
- shield
- kháng debuff bóp méo
- synergy với Mỹ

### Khoa học
- crit
- xuyên giáp
- bonus với Tin giả
- synergy với Chân

### Đại chúng
- aura
- vùng ảnh hưởng
- pickup radius
- summon/community buff
- synergy với Thiện

### Chân
- accuracy
- crit
- true damage
- reveal mục tiêu ngụy trang

### Thiện
- heal
- giảm sát thương
- bảo vệ vùng cộng đồng

### Mỹ
- area damage
- crowd control
- tăng hiệu quả vùng tích cực

## 8. Xây – Chống
CHỐNG:
- damage
- projectile
- slow
- cleanse
- knockback

XÂY:
- heal
- aura
- positive zone
- summon
- community restoration

Không ép build 50/50, nhưng boss và ending phản ánh build quá lệch.

## 9. Upgrade system
Mỗi level:
- pause ngắn
- hiện 3 card
- chọn 1

Ví dụ:
- KHOA HỌC I: +10% projectile speed, +5% crit lên Tin giả
- THIỆN I: hồi 1 HP mỗi 12 giây
- ĐẠI CHÚNG I: +15% pickup radius

## 10. Evolution / synergy
### Khoa học + Chân → KIỂM CHỨNG
Projectile xuyên mục tiêu, bonus lên Fake News.

### Đại chúng + Thiện → VĂN HÓA ỨNG XỬ
Aura làm chậm cyberbullying và hồi nhẹ.

### Dân tộc + Mỹ → BẢN SẮC SÁNG TẠO
Area attack, bonus chống Sao chép máy móc.

### Xây + Chống cân bằng → MẶT TRẬN VĂN HÓA
Buff tạm thời cho damage và Community Meter.

## 11. Enemy taxonomy
### Tin giả
Nhanh, có thể nhân bản nếu sống lâu.

### Clickbait
Dash, máu thấp, spawn nhiều.

### Bạo lực ngôn từ
Đánh xa, tạo slow zone.

### Sao chép máy móc
Copy pattern, kháng nhất định nếu thiếu Dân tộc/Mỹ.

### Xuyên tạc văn hóa
Elite, tạo debuff nhiễu.

### Tâm lý đám đông
Swarm đông, yếu riêng lẻ.

## 12. Community Meter
Thanh môi trường văn hóa chung.

Tăng:
- build aura
- positive zone
- event tốt

Giảm:
- quái sống quá lâu
- hazard
- lựa chọn event tiêu cực
- boss phase

Về 0 không game over ngay, nhưng player nhận debuff mạnh.

## 13. Scenario Event
Combat pause/chậm 3–5 giây.

Ví dụ:
“Một bài đăng chưa được kiểm chứng đang lan truyền nhanh.”

Choice chỉ tạo hiệu ứng đơn giản:
- buff
- debuff
- spawn
- community delta
- XP multiplier

Không branch sang wave khác.

Ví dụ:
- Verify → +25% damage lên Fake News trong 20s
- Share → spawn thêm Fake News
- Ignore → không thay đổi

Scenario load từ JSON.

## 14. Level structure
Wave 1: Clickbait + Fake News  
Wave 2: Cyberbullying + swarm  
Wave 3: Copying + Cultural Distortion  
Wave 4: mix + elite + event  
Final: boss

## 15. Boss
### LỆCH CHUẨN VĂN HÓA SỐ
3 phase:
1. Nhiễu thông tin
2. Bạo lực/cực hóa
3. Khủng hoảng giá trị

Điều kiện thắng:
- hạ boss
- Community Meter không tụt về trạng thái khủng hoảng kéo dài

## 16. HUD
- HP
- XP
- Level
- Community Meter
- Timer
- 2–3 icon build nổi bật

## 17. Ending
Hiển thị:
- Dân tộc
- Khoa học
- Đại chúng
- Chân
- Thiện
- Mỹ
- Xây
- Chống

Archetype:
- Người Kiểm Chứng
- Người Kiến Tạo
- Người Gìn Giữ
- Người Kết Nối
- Người Phản Biện

Không dùng “đúng/sai” tổng thể.

## 18. Visual direction
- digital/social-media inspired
- neon nhẹ
- motif Việt Nam tinh tế
- enemy abstract icon/shape
- không dùng nhóm người cụ thể làm quái

## 19. MVP
Must have:
- movement
- auto-fire
- 3–4 enemy types
- XP + level up
- 12–18 upgrades
- 3 evolutions
- Community Meter
- scenario JSON
- 1 boss
- final profile

Không làm ở MVP:
- multiplayer
- inventory
- crafting
- procedural map phức tạp
- AI enemy phức tạp
- branching story
- backend bắt buộc

## 20. Success criteria
1. Hoàn thành trong 10–15 phút.
2. Dân tộc – Khoa học – Đại chúng hiện diện trong core mechanic.
3. Xây và Chống đều có giá trị gameplay.
4. Scenario ảnh hưởng trực tiếp combat.
5. Thêm scenario chỉ cần sửa JSON.
6. Game vẫn vui nếu bỏ phần giải thích dài.
