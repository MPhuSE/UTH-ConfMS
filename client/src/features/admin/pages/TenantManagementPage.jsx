import { useEffect, useState } from "react";
import { adminService } from "../../../services/adminService";
import Modal from "../../../components/Modal";
import Button from "../../../components/Button";
import Input from "../../../components/Input";
import Table from "../../../components/Table";
import { toast } from "react-hot-toast";

export default function TenantManagementPage() {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [formData, setFormData] = useState({ name: "", slug: "", is_active: true });

  const loadTenants = async () => {
    try {
      setLoading(true);
      const data = await adminService.getTenants();
      setTenants(data.tenants || []);
    } catch (err) {
      toast.error("Không thể tải danh sách tenant");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTenants();
  }, []);

  const resetForm = () => setFormData({ name: "", slug: "", is_active: true });

  const handleCreate = async () => {
    try {
      await adminService.createTenant(formData);
      toast.success("Tạo tenant thành công");
      setCreateModal(false);
      resetForm();
      loadTenants();
    } catch (err) {
      toast.error("Không thể tạo tenant");
    }
  };

  const handleUpdate = async () => {
    if (!editModal) return;
    try {
      await adminService.updateTenant(editModal.id, formData);
      toast.success("Cập nhật tenant thành công");
      setEditModal(null);
      resetForm();
      loadTenants();
    } catch (err) {
      toast.error("Không thể cập nhật tenant");
    }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    try {
      await adminService.deleteTenant(deleteModal.id);
      toast.success("Xóa tenant thành công");
      setDeleteModal(null);
      loadTenants();
    } catch (err) {
      toast.error("Không thể xóa tenant");
    }
  };

  const columns = [
    { header: "ID", accessor: "id" },
    { header: "Name", accessor: "name" },
    { header: "Slug", accessor: "slug" },
    {
      header: "Status",
      accessor: "is_active",
      render: (row) => (
        <span className={`px-2 py-0.5 rounded text-xs ${row.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
          {row.is_active ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      header: "Actions",
      accessor: "actions",
      render: (row) => (
        <div className="flex items-center gap-2">
          <button className="text-blue-600 text-xs font-bold" onClick={() => {
            setEditModal(row);
            setFormData({ name: row.name, slug: row.slug, is_active: row.is_active });
          }}>
            Edit
          </button>
          <button className="text-red-600 text-xs font-bold" onClick={() => setDeleteModal(row)}>
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tenancy</h1>
          <p className="text-sm text-gray-500">Quản lý tenant trong hệ thống</p>
        </div>
        <Button onClick={() => setCreateModal(true)}>Thêm tenant</Button>
      </div>

      <Table columns={columns} data={tenants} loading={loading} />

      <Modal isOpen={createModal} onClose={() => { setCreateModal(false); resetForm(); }} title="Tạo tenant">
        <div className="space-y-4">
          <Input label="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          <Input label="Slug" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} />
            Active
          </label>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => { setCreateModal(false); resetForm(); }}>Hủy</Button>
            <Button onClick={handleCreate}>Tạo</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!editModal} onClose={() => { setEditModal(null); resetForm(); }} title="Cập nhật tenant">
        <div className="space-y-4">
          <Input label="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          <Input label="Slug" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} />
            Active
          </label>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => { setEditModal(null); resetForm(); }}>Hủy</Button>
            <Button onClick={handleUpdate}>Cập nhật</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!deleteModal} onClose={() => setDeleteModal(null)} title="Xác nhận xóa">
        <div className="space-y-4">
          <p className="text-gray-600">Bạn có chắc chắn muốn xóa tenant "{deleteModal?.name}"?</p>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setDeleteModal(null)}>Hủy</Button>
            <Button variant="danger" onClick={handleDelete}>Xóa</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
