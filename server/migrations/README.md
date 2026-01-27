# Database Migrations với Alembic

Hệ thống migration tự động sử dụng **Alembic** - công cụ migration chuyên nghiệp cho SQLAlchemy.

## 🚀 Cách sử dụng

### Chạy tất cả migrations (khuyến nghị):
```bash
alembic upgrade head
```

Hoặc nếu dùng Python module:
```bash
python -m alembic upgrade head
```

### Xem trạng thái migrations:
```bash
alembic current
alembic history
```

### Tạo migration mới:
```bash
alembic revision -m "description_of_migration"
```

### Rollback migration:
```bash
alembic downgrade -1        # Rollback 1 migration
alembic downgrade base      # Rollback về đầu
```

## 📝 Quy tắc tạo migration

1. **Tạo migration mới:**
   ```bash
   alembic revision -m "add_new_feature"
   ```

2. **Chỉnh sửa file migration** trong `migrations/versions/`:
   - `upgrade()`: Code để upgrade database
   - `downgrade()`: Code để rollback

3. **Chạy migration:**
   ```bash
   alembic upgrade head
   ```

## 📋 Migrations hiện có

- `59deb36d21f5` - Initial schema setup (all tables)
- `ca0038b2dfaa` - Add refresh_token to users
- `51754f4127ce` - Add audit_logs table
- `d7a5c9b8e3f4` - Add schema updates
- `f9a1b2c3d4e5` - Merge heads
- `a1b2c3d4e5f6` - **Add score column to reviews** ⭐ (MỚI)

## ⚠️ Lưu ý

- **Luôn backup database** trước khi chạy migrations
- **Test trên dev** trước khi chạy trên production
- **Không sửa migrations đã chạy** - Tạo migration mới thay vì sửa cũ
- **Kiểm tra `down_revision`** để đảm bảo thứ tự đúng

## 🔍 Kiểm tra migration

```bash
# Xem migration hiện tại
alembic current

# Xem lịch sử migrations
alembic history

# Xem SQL sẽ được chạy (không thực thi)
alembic upgrade head --sql
```
