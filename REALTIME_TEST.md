# WebSocket Real-time Test Instructions

## Đã fix các vấn đề:

### 1. ✅ Lỗi `data.locks.forEach` is undefined
**Nguyên nhân**: Backend emit `lockedSeats` nhưng frontend đọc `locks`
**Fix**: 
- Backend giờ emit: `{ schedulingId, locks }` (đổi từ `lockedSeats` → `locks`)
- Frontend thêm null check: `if (data && data.locks && Array.isArray(data.locks))`

### 2. ✅ Event payload không khớp
**Nguyên nhân**: Backend dùng `lockedBy`, frontend đọc `clientId`
**Fix**:
- Backend emit: `{ clientId, schedulingId, seatId, userId }`
- Khớp với interface `SeatLockEvent` / `SeatUnlockEvent` ở frontend

### 3. ✅ Thiếu `NEXT_PUBLIC_BACKEND_URL`
**Fix**: Đã thêm vào `.env.local`

## Cách test real-time:

### Bước 1: Start Backend + Redis
```bash
# Terminal 1: Start Redis (nếu chưa chạy)
docker run -d -p 6379:6379 redis:latest

# Terminal 2: Start Backend
cd checkitout-be
npm run start:dev
```

**Check logs backend phải thấy**:
```
[Nest] WebSocket Gateway initialized
[SeatGateway] Client xyz connected
[SeatGateway] Client xyz joined scheduling:abc123
[SeatGateway] Sent 0 locked seats to client xyz
```

### Bước 2: Start Frontend
```bash
# Terminal 3
cd checkitout
npm run dev
```

### Bước 3: Test với 2 browsers

1. **Mở Chrome thường**: `http://localhost:3000/bus/{scheduling-id}`
2. **Mở Chrome Incognito**: Cùng URL

**Console log phải thấy** (F12 → Console):
```
✅ WebSocket connected: <socket-id>
🔒 Received locked seats: { schedulingId: "...", locks: [] }
```

### Bước 4: Click ghế và quan sát

**Browser 1**: Click ghế A1 → Console log:
```
🔒 Seat locked: { seatId: "A1", clientId: "abc", schedulingId: "..." }
```

**Browser 2**: Ghế A1 sẽ:
- ✅ Chuyển sang màu **cam** với **chấm đỏ** góc trên
- ✅ Console log: `🔒 Seat locked: { seatId: "A1", ... }`
- ✅ Hover thấy tooltip: "Locked by another user"
- ✅ Disabled - không click được

**Browser 1**: Bỏ chọn ghế A1 → Console:
```
🔓 Seat unlocked: { seatId: "A1", clientId: "abc" }
```

**Browser 2**: Ghế A1 về lại màu xanh (available)

## Troubleshooting:

### ❌ Không kết nối WebSocket
**Triệu chứng**: Console không có `✅ WebSocket connected`
**Check**:
```bash
# Backend có chạy không?
lsof -i :9091

# NEXT_PUBLIC_BACKEND_URL đúng chưa?
cat checkitout/.env.local | grep BACKEND

# Restart frontend sau khi đổi .env
```

### ❌ Connected nhưng không nhận events
**Triệu chứng**: Có `WebSocket connected` nhưng không có `🔒 Seat locked`
**Check**:
- Backend logs: Có `Client xyz joined scheduling:...` không?
- Redis có chạy không? `docker ps | grep redis`
- schedulingId đúng chưa? Check URL `/bus/{id}` → `id` này phải là scheduling ID

### ❌ Ghế không đổi màu cam
**Check**:
- Console có log `🔒 Seat locked` không?
- Component `SeatItem` có wrap trong `SeatWebSocketProvider` không?
- Check file đã save chưa (sometimes HMR không reload)

## Kiểm tra Redis locks:

```bash
# Connect to Redis CLI
docker exec -it <redis-container-id> redis-cli

# Xem tất cả locks
KEYS seat:lock:*

# Xem chi tiết 1 lock
GET seat:lock:<schedulingId>:<seatId>

# Xóa tất cả locks (để test lại)
FLUSHDB
```

## Expected behavior:

✅ **Lock khi select**: Click ghế → Gọi `lockSeat()` → Backend lock → Broadcast `seat:locked` → All clients update UI
✅ **Unlock khi deselect**: Bỏ chọn → Gọi `unlockSeat()` → Backend unlock → Broadcast `seat:unlocked` → All clients update
✅ **Auto-release on disconnect**: Đóng tab → Backend detect disconnect → Auto unlock all seats → Broadcast updates
✅ **TTL 10 minutes**: Redis auto xóa lock sau 10 phút
✅ **Prevent double-lock**: Nếu ghế đã locked → Backend reject request
