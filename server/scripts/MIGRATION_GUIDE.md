# 🚀 Hướng dẫn Migration Database

## Chạy migrations - CHỈ 1 LỆNH!

### Windows:
```bash
scripts\run_migrations.bat
```

### Linux/Mac:
```bash
bash scripts/run_migrations.sh
```

### Hoặc dùng Alembic trực tiếp:
```bash
# Chạy tất cả migrations
alembic upgrade head

# Hoặc
python -m alembic upgrade head
```

## 📋 Các lệnh Alembic thường dùng

### 1. Chạy migrations:
```bash
alembic upgrade head              # Chạy tất cả migrations
alembic upgrade +1                # Chạy 1 migration tiếp theo
alembic upgrade <revision_id>      # Upgrade đến revision cụ thể
```

### 2. Xem trạng thái:
```bash
alembic current                    # Xem migration hiện tại
alembic history                    # Xem lịch sử migrations
alembic history --verbose          # Xem chi tiết
```

### 3. Tạo migration mới:
```bash
alembic revision -m "description"  # Tạo migration mới
```

### 4. Rollback:
```bash
alembic downgrade -1               # Rollback 1 migration
alembic downgrade base              # Rollback về đầu
alembic downgrade <revision_id>     # Rollback đến revision cụ thể
```

### 5. Xem SQL (không thực thi):
```bash
alembic upgrade head --sql          # Xem SQL sẽ chạy
```

## 📝 Tạo migration mới

1. **Tạo file migration:**
   ```bash
   alembic revision -m "add_new_feature"
   ```

2. **File sẽ được tạo trong:** `migrations/versions/`

3. **Chỉnh sửa file migration:**
   ```python
   def upgrade() -> None:
       # Code để upgrade database
       op.add_column('table_name', sa.Column('new_column', sa.String()))
   
   def downgrade() -> None:
       # Code để rollback
       op.drop_column('table_name', 'new_column')
   ```

4. **Chạy migration:**
   ```bash
   alembic upgrade head
   ```

## ⚠️ Lưu ý quan trọng

- ✅ **Luôn backup database** trước khi chạy migrations
- ✅ **Test trên dev** trước khi chạy trên production  
- ✅ **Không sửa migrations đã chạy** - Tạo migration mới thay vì sửa cũ
- ✅ **Kiểm tra `down_revision`** để đảm bảo thứ tự đúng

## 🔍 Troubleshooting

### Lỗi: "Can't locate revision identified by..."
- **Nguyên nhân:** Migration history không khớp
- **Giải pháp:** 
  ```bash
  alembic history  # Kiểm tra lịch sử
  alembic current   # Xem migration hiện tại
  ```

### Lỗi: "Multiple heads detected"
- **Nguyên nhân:** Có nhiều migration heads
- **Giải pháp:**
  ```bash
  alembic merge heads -m "merge_heads"
  alembic upgrade head
  ```

### Migration đã chạy nhưng muốn chạy lại
- **Không nên!** Migrations chỉ chạy 1 lần
- Nếu cần sửa, tạo migration mới để fix

## 📦 Migrations hiện có

- `59deb36d21f5` - Initial schema setup
- `ca0038b2dfaa` - Add refresh_token to users
- `51754f4127ce` - Add audit_logs table
- `d7a5c9b8e3f4` - Add schema updates
- `f9a1b2c3d4e5` - Merge heads
- `a1b2c3d4e5f6` - **Add score column to reviews** ⭐
