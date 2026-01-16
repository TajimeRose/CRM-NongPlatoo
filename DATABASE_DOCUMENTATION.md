# 📊 Database Documentation - CRM น้องปลาทู Admin Panel

## 📌 ภาพรวม

เอกสารนี้อธิบายโครงสร้างฐานข้อมูลและ Environment Variables สำหรับระบบ Admin Panel ของเว็บไซต์ท่องเที่ยวน้องปลาทู

---

## 🔧 Environment Variables

### Database Connection
```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@38.242.132.39:8900/postgres
POSTGRES_HOST=38.242.132.39
POSTGRES_PORT=8900
POSTGRES_DB=postgres
POSTGRES_USER=postgres
POSTGRES_PASSWORD=[ดู .env ไฟล์]
```

### OpenAI API
```env
OPENAI_API_KEY=sk-proj-xxxxx
```

### Firebase Configuration
```env
VITE_FIREBASE_API_KEY=AIzaSyBoLd2sXB0Uwh5mfnRKHLA699j38GaEl_Q
VITE_FIREBASE_AUTH_DOMAIN=nong-platoo.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=nong-platoo
VITE_FIREBASE_STORAGE_BUCKET=nong-platoo.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=904706157245
VITE_FIREBASE_APP_ID=1:904706157245:web:e89b85d5b90578c24be5d4
```

---

## 📁 Database Tables (10 ตาราง)

### 1. `users` - ข้อมูลผู้ใช้งาน
| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL (PK) | รหัสผู้ใช้ (Primary Key) |
| `email` | VARCHAR(255) | อีเมล (Unique) |
| `name` | VARCHAR(100) | ชื่อผู้ใช้ |
| `password_hash` | VARCHAR(255) | รหัสผ่านที่เข้ารหัสแล้ว |
| `role` | ENUM | บทบาท: `user`, `moderator`, `admin` |
| `status` | ENUM | สถานะ: `active`, `inactive`, `banned` |
| `last_login` | TIMESTAMP | เวลาเข้าสู่ระบบล่าสุด |
| `created_at` | TIMESTAMP | วันที่สร้างบัญชี |
| `updated_at` | TIMESTAMP | วันที่อัปเดตล่าสุด |

**ใช้กับ:** หน้า User Management (`/users`)

---

### 2. `places` - สถานที่ท่องเที่ยว
| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL (PK) | รหัสสถานที่ |
| `name` | VARCHAR(255) | ชื่อสถานที่ |
| `description` | TEXT | รายละเอียด |
| `category` | VARCHAR(100) | หมวดหมู่: ตลาดน้ำ, วัด, โฮมสเตย์ ฯลฯ |
| `address` | VARCHAR(500) | ที่อยู่ |
| `latitude` | VARCHAR(20) | พิกัด Latitude |
| `longitude` | VARCHAR(20) | พิกัด Longitude |
| `is_promoted` | BOOLEAN | สถานะโปรโมท |
| `promoted_score` | INTEGER | คะแนนโปรโมท (0-100) |
| `promotion_expiry` | TIMESTAMP | วันหมดอายุโปรโมชัน |
| `views_count` | INTEGER | จำนวนการเข้าชม |
| `created_at` | TIMESTAMP | วันที่สร้าง |
| `updated_at` | TIMESTAMP | วันที่อัปเดต |

**ใช้กับ:** หน้า Places Management (`/places`)

---

### 3. `places_search` - การค้นหาสถานที่
| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL (PK) | รหัส |
| `query` | TEXT | คำค้นหา |
| `results_count` | INTEGER | จำนวนผลลัพธ์ |
| `user_id` | INTEGER (FK) | รหัสผู้ใช้ที่ค้นหา |
| `created_at` | TIMESTAMP | เวลาที่ค้นหา |

**ใช้กับ:** Analytics - ดูคำค้นหายอดนิยม

---

### 4. `saved_places` - สถานที่ที่บันทึกไว้
| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL (PK) | รหัส |
| `user_id` | INTEGER (FK) | รหัสผู้ใช้ |
| `place_id` | INTEGER (FK) | รหัสสถานที่ |
| `created_at` | TIMESTAMP | วันที่บันทึก |

**ใช้กับ:** ฟีเจอร์ Bookmark/Favorite ของผู้ใช้

---

### 5. `chat_logs` - ประวัติการแชท AI
| Column | Type | Description |
|--------|------|-------------|
| `id` | BIGINT (PK) | รหัส |
| `user_id` | INTEGER (FK) | รหัสผู้ใช้ (⚠️ ปัจจุบันเป็น null) |
| `tokens_used` | INTEGER | จำนวน Token ที่ใช้ตอบ |
| `prompt_tokens` | INTEGER | จำนวน Token ของคำถาม |
| `latency_ms` | INTEGER | เวลาตอบกลับ (มิลลิวินาที) |
| `session_id` | INTEGER | รหัส Session |
| `user_message` | TEXT | ข้อความของผู้ใช้ |
| `ai_response` | TEXT | ข้อความตอบกลับจาก AI |
| `created_at` | TIMESTAMP | เวลาที่สร้าง |

**ใช้กับ:** หน้า Chat Logs (`/chats`)

> ⚠️ **หมายเหตุ:** `user_id` ยังเป็น null เนื่องจาก Frontend ยังไม่ส่ง user_id มาตอนบันทึก

---

### 6. `chat_sessions` - Session การแชท
| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL (PK) | รหัส Session |
| `user_id` | INTEGER (FK) | รหัสผู้ใช้ |
| `started_at` | TIMESTAMP | เวลาเริ่ม Session |
| `ended_at` | TIMESTAMP | เวลาจบ Session |
| `total_messages` | INTEGER | จำนวนข้อความทั้งหมด |

**ใช้กับ:** จัดกลุ่มประวัติแชทเป็น Session

---

### 7. `message_feedback` - Feedback ข้อความ AI
| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL (PK) | รหัส |
| `chat_log_id` | INTEGER (FK) | รหัส chat_log |
| `rating` | INTEGER | คะแนน (1-5 หรือ thumbs up/down) |
| `feedback_text` | TEXT | ความคิดเห็นเพิ่มเติม |
| `created_at` | TIMESTAMP | เวลาที่ให้ feedback |

**ใช้กับ:** ประเมินคุณภาพคำตอบ AI

---

### 8. `user_activity_logs` - Log กิจกรรมผู้ใช้
| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL (PK) | รหัส |
| `user_id` | INTEGER (FK) | รหัสผู้ใช้ (nullable) |
| `session_id` | VARCHAR(100) | รหัส Session |
| `action_type` | VARCHAR(50) | ประเภท: `page_view`, `click`, `form_submit`, `scroll`, `custom` |
| `target_element` | VARCHAR(255) | Element ที่ถูกกระทำ |
| `page_url` | VARCHAR(500) | URL ของหน้า |
| `meta_data` | JSONB | ข้อมูลเพิ่มเติม (JSON) |
| `ip_address` | VARCHAR(45) | IP Address |
| `user_agent` | TEXT | User Agent string |
| `browser` | VARCHAR(50) | Browser: Chrome, Safari, etc. |
| `os` | VARCHAR(50) | OS: Windows, iOS, Android |
| `device_type` | VARCHAR(20) | ประเภทอุปกรณ์: `desktop`, `mobile`, `tablet` |
| `created_at` | TIMESTAMP | เวลาที่เกิด event |

**ใช้กับ:** Dashboard Analytics - ดู traffic, page views

---

### 9. `security_logs` - Log ความปลอดภัย
| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL (PK) | รหัส |
| `ip_address` | VARCHAR(45) | IP Address |
| `action` | VARCHAR(100) | ประเภทเหตุการณ์: `Failed Login`, `Rate Limit`, `SQL Injection` |
| `severity` | VARCHAR(20) | ความรุนแรง: `low`, `medium`, `high`, `critical` |
| `count` | INTEGER | จำนวนครั้งที่เกิด |
| `is_blocked` | BOOLEAN | ถูกบล็อกหรือไม่ |
| `meta_data` | JSONB | ข้อมูลเพิ่มเติม |
| `created_at` | TIMESTAMP | เวลาที่เกิด |
| `updated_at` | TIMESTAMP | เวลาอัปเดต |

**ใช้กับ:** หน้า Security Logs (`/security`)

---

### 10. `system_configs` - ตั้งค่าระบบ
| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL (PK) | รหัส |
| `key` | VARCHAR(100) | ชื่อ Config (Unique) |
| `value` | TEXT | ค่า Config |
| `description` | VARCHAR(500) | คำอธิบาย |
| `category` | VARCHAR(50) | หมวดหมู่: `AI`, `ระบบ`, `ความปลอดภัย` |
| `created_at` | TIMESTAMP | วันที่สร้าง |
| `updated_at` | TIMESTAMP | วันที่อัปเดต |

**ใช้กับ:** หน้า System Config (`/config`)

**ตัวอย่าง Config:**
| key | value | description |
|-----|-------|-------------|
| `ai_model` | `gpt-4-turbo` | โมเดล AI สำหรับน้องปลาทู |
| `ai_max_tokens` | `2048` | จำนวน Token สูงสุดต่อการตอบ |
| `ai_temperature` | `0.7` | ความสร้างสรรค์ของ AI (0-1) |
| `maintenance_mode` | `false` | เปิดโหมดปิดปรับปรุง |
| `rate_limit_requests` | `100` | จำกัด API ต่อนาที |
| `session_timeout` | `3600` | หมดเวลา Session (วินาที) |

---

## 🔗 Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────────────┐
│   users     │───────│  user_activity_logs │
│             │   1:N │                     │
└──────┬──────┘       └─────────────────────┘
       │
       │ 1:N
       ▼
┌─────────────┐       ┌─────────────────────┐
│  chat_logs  │───────│   message_feedback  │
│             │   1:1 │                     │
└──────┬──────┘       └─────────────────────┘
       │
       │ N:1
       ▼
┌───────────────┐
│ chat_sessions │
└───────────────┘

┌─────────────┐       ┌─────────────────────┐
│   users     │───────│    saved_places     │
│             │   1:N │                     │
└─────────────┘       └──────────┬──────────┘
                                 │ N:1
                                 ▼
                      ┌─────────────────────┐
                      │       places        │
                      └─────────────────────┘
```

---

## 🛠️ API Endpoints (สำหรับ Admin Panel)

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | เข้าสู่ระบบ |
| POST | `/api/auth/logout` | ออกจากระบบ |

### Dashboard Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/analytics/overview` | สถิติภาพรวม |
| GET | `/api/admin/analytics/traffic` | สถิติ Traffic (Browser/OS) |
| GET | `/api/admin/analytics/pages` | สถิติ Page Views |
| GET | `/api/admin/analytics/ai-usage` | สถิติการใช้งาน AI |

### User Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | รายชื่อผู้ใช้ทั้งหมด |
| DELETE | `/api/admin/users/:id` | ลบผู้ใช้ |
| POST | `/api/admin/users/:id/ban` | แบน/ปลดแบนผู้ใช้ |

### Places Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/places` | รายชื่อสถานที่ทั้งหมด |
| POST | `/api/admin/places/:id/promote` | อัปเดตการโปรโมท |

### System Config
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/config` | ดู Config ทั้งหมด |
| PUT | `/api/admin/config/:id` | แก้ไข Config |
| POST | `/api/admin/config` | สร้าง Config ใหม่ |

### Security & Logs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/security-logs` | Log ความปลอดภัย |
| POST | `/api/admin/security-logs/:id/block` | บล็อก/ปลดบล็อก IP |
| GET | `/api/admin/chat-logs` | ประวัติแชท AI |

### Telemetry (Public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/track` | บันทึก user activity |
| GET | `/api/places` | สถานที่ท่องเที่ยว (Public) |

---

## ⚠️ สิ่งที่ต้องแก้ไข

### 1. `user_id` เป็น null ใน `chat_logs`
**ปัญหา:** Frontend ไม่ได้ส่ง user_id ไปตอนบันทึก chat log

**แก้ไข:** แก้ไข API ที่บันทึก chat ให้ดึง user_id จาก JWT token หรือ session

### 2. Login ยังใช้ Mock Data
**ปัญหา:** `AuthContext.tsx` ใช้ hardcode `admin/admin123`

**แก้ไข:** เปลี่ยนให้เรียก API `/api/auth/login` จริง

### 3. `useTelemetry` hook ยังไม่ถูกใช้งาน
**ปัญหา:** Hook สำหรับ track user activity ถูกสร้างแล้วแต่ยังไม่มีใครเรียกใช้

**แก้ไข:** เพิ่ม `useTelemetry` ใน App.tsx และส่ง userId

---

## 📝 ไฟล์ที่เกี่ยวข้อง

| File | Description |
|------|-------------|
| `src/backend/models.py` | SQLAlchemy Models (Database Schema) |
| `src/backend/routes.py` | Flask API Routes |
| `src/contexts/AuthContext.tsx` | Authentication Context |
| `src/hooks/useTelemetry.ts` | User Activity Tracking Hook |
| `src/data/mockData.ts` | Mock Data สำหรับ Development |
| `.env` | Environment Variables |

---

**สร้างโดย:** Antigravity AI Assistant  
**วันที่อัปเดต:** 15 มกราคม 2026
