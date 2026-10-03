# VĂN HÓA 404 — STARTER PACK

Bộ tài liệu khởi động cho mini survival web game 10–15 phút.

## Thành phần
- GDD.md
- TECHNICAL_DESIGN.md
- PRODUCTION_ROADMAP.md
- CONTENT_GUIDE.md
- data/scenarios.placeholder.json
- data/upgrades.placeholder.json
- data/enemies.placeholder.json
- data/waves.placeholder.json

## Prompt khởi động cho coding agent
Implement MVP theo GDD và TECHNICAL_DESIGN. Dùng Phaser 3 + TypeScript + Vite. Mọi enemy, upgrade, wave và scenario phải data-driven từ JSON. Không tự tạo tình huống thực tế; chỉ dùng placeholder. Ưu tiên combat prototype trước UI polish.

## Quy tắc
1. Không hard-code scenario.
2. Không multiplayer trong MVP.
3. Không AI phức tạp cho enemy.
4. Không branching story.
5. Scenario chỉ tác động bằng buff/debuff/spawn/community meter.
