import { useEffect, useState } from "react";
import { tenantService, userService } from "../../../services";
import Modal from "../../../components/Modal";
import Button from "../../../components/Button";
import Input from "../../../components/Input";
import Table from "../../../components/Table";
import { toast } from "react-hot-toast";
import { Plus, Edit, Trash2, Users, UserPlus, Shield, Globe, Search, X } from "lucide-react";

export default function TenantManagementPage() {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [memberModal, setMemberModal] = useState(null); // Selected tenant for member management

  const [members, setMembers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [memberLoading, setMemberLoading] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");

  const [formData, setFormData] = useState({ name: "", slug: "", is_active: true });
  const [memberFormData, setMemberFormData] = useState({ user_id: "", role: "member" });

  const loadTenants = async () => {
    try {
      setLoading(true);
      const data = await tenantService.getAll();
      setTenants(data.tenants || data || []);
    } catch (err) {
      toast.error("Không thể tải danh sách tenant");
    } finally {
      setLoading(false);
    }
  };

  const loadMembers = async (tenantId) => {
    try {
      setMemberLoading(true);
      const data = await tenantService.getMembers(tenantId);
      setMembers(data.members || []);
    } catch (err) {
      toast.error("Không thể tải danh sách thành viên");
    } finally {
      setMemberLoading(false);
    }
  };

  const loadAllUsers = async () => {
    try {
      const data = await userService.getAll();
      setAllUsers(data.users || []);
    } catch (err) {
      console.error("Failed to load users:", err);
    }
  };

  useEffect(() => {
    loadTenants();
    loadAllUsers();
  }, []);

  useEffect(() => {
    if (memberModal) {
      loadMembers(memberModal.id);
    }
  }, [memberModal]);

  const resetForm = () => setFormData({ name: "", slug: "", is_active: true });

  const handleCreate = async () => {
    try {
      if (!formData.name.trim() || !formData.slug.trim()) {
        toast.error("Vui lòng điền đầy đủ thông tin");
        return;
      }
      await tenantService.create(formData);
      toast.success("Tạo tenant thành công");
      setCreateModal(false);
      resetForm();
      loadTenants();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Không thể tạo tenant");
    }
  };

  const handleUpdate = async () => {
    if (!editModal) return;
    try {
      await tenantService.update(editModal.id, formData);
      toast.success("Cập nhật tenant thành công");
      setEditModal(null);
      resetForm();
      loadTenants();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Không thể cập nhật tenant");
    }
  };

  const handleAddMember = async () => {
    if (!memberModal || !memberFormData.user_id) return;
    try {
      await tenantService.addMember(memberModal.id, memberFormData);
      toast.success("Thêm thành viên thành công");
      setMemberFormData({ user_id: "", role: "member" });
      loadMembers(memberModal.id);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Không thể thêm thành viên");
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!memberModal) return;
    try {
      await tenantService.removeMember(memberModal.id, userId);
      toast.success("Đã xóa thành viên");
      loadMembers(memberModal.id);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Không thể xóa thành viên");
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
    {
      header: "ID",
      accessor: "id",
      render: (row) => <span className="text-gray-400 text-xs italic">#{row.id}</span>
    },
    {
      header: "Tên Đơn vị",
      accessor: "name",
      render: (row) => (
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-teal-600" />
          <span className="font-semibold text-gray-900">{row.name}</span>
        </div>
      )
    },
    {
      header: "Slug (URL)",
      accessor: "slug",
      render: (row) => <code className="px-1.5 py-0.5 bg-gray-100 rounded text-teal-700 text-xs">{row.slug}</code>
    },
    {
      header: "Trạng thái",
      accessor: "is_active",
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${row.is_active ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>
          {row.is_active ? "Kích hoạt" : "Vô hiệu hóa"}
        </span>
      ),
    },
    {
      header: "Thao tác",
      accessor: "actions",
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors border border-transparent hover:border-teal-200"
            onClick={() => setMemberModal(row)}
            title="Quản lý thành viên"
          >
            <Users className="w-4 h-4" />
          </button>
          <button
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-200"
            onClick={() => {
              setEditModal(row);
              setFormData({ name: row.name, slug: row.slug, is_active: row.is_active });
            }}
            title="Chỉnh sửa"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200"
            onClick={() => setDeleteModal(row)}
            title="Xóa"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const availableUsers = allUsers.filter(u =>
    !members.some(m => m.user_id === u.id) &&
    (u.email.toLowerCase().includes(memberSearch.toLowerCase()) ||
      (u.full_name || "").toLowerCase().includes(memberSearch.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Cấu trúc Tổ chức (Tenancy)</h1>
          <p className="text-sm text-gray-500 mt-1">Thiết lập đơn vị, tổ chức và phân quyền thành viên cấp cao.</p>
        </div>
        <Button onClick={() => setCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Tạo Tổ chức Mới
        </Button>
      </div>

      <Table columns={columns} data={tenants} loading={loading} />

      <Modal isOpen={createModal} onClose={() => { setCreateModal(false); resetForm(); }} title="Tạo Tổ chức Mới" size="md">
        <div className="space-y-4">
          <Input label="Tên tổ chức (VD: Đại học Giao thông vận tải TP.HCM)" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
          <Input label="Slug (Dùng cho URL, VD: uth-edu)" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} required />
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
            <input id="active-create" type="checkbox" className="h-4 w-4 text-teal-600 rounded" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} />
            <label htmlFor="active-create" className="text-sm font-medium text-gray-700 select-none">Kích hoạt ngay</label>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => { setCreateModal(false); resetForm(); }} className="flex-1">Hủy</Button>
            <Button onClick={handleCreate} className="flex-1">Xác nhận Tạo</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!editModal} onClose={() => { setEditModal(null); resetForm(); }} title="Cập nhật Tổ chức" size="md">
        <div className="space-y-4">
          <Input label="Tên tổ chức" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
          <Input label="Slug" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} required />
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
            <input id="active-edit" type="checkbox" className="h-4 w-4 text-teal-600 rounded" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} />
            <label htmlFor="active-edit" className="text-sm font-medium text-gray-700 select-none">Kích hoạt</label>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => { setEditModal(null); resetForm(); }} className="flex-1">Hủy</Button>
            <Button onClick={handleUpdate} className="flex-1">Lưu thay đổi</Button>
          </div>
        </div>
      </Modal>

      {/* Member Management Modal */}
      <Modal
        isOpen={!!memberModal}
        onClose={() => setMemberModal(null)}
        title={`Thành viên: ${memberModal?.name}`}
        size="lg"
      >
        <div className="space-y-6">
          {/* Add Member Section */}
          <div className="p-4 bg-teal-50 rounded-xl border border-teal-100">
            <h3 className="text-sm font-bold text-teal-900 mb-3 flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Thêm thành viên mới
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
              <div className="md:col-span-6 space-y-1">
                <label className="text-[10px] uppercase font-bold text-teal-700 ml-1">Tìm người dùng</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    className="w-full pl-9 pr-4 py-2 bg-white border border-teal-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                    placeholder="Tên hoặc email..."
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                  />
                  {memberSearch && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-teal-100 rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto">
                      {availableUsers.length > 0 ? availableUsers.map(u => (
                        <div
                          key={u.id}
                          className="px-4 py-2 hover:bg-teal-50 cursor-pointer flex flex-col border-b border-gray-50 last:border-0"
                          onClick={() => {
                            setMemberFormData({ ...memberFormData, user_id: u.id });
                            setMemberSearch(u.email);
                          }}
                        >
                          <span className="text-sm font-medium text-gray-900">{u.full_name}</span>
                          <span className="text-xs text-gray-500">{u.email}</span>
                        </div>
                      )) : (
                        <div className="px-4 py-2 text-xs text-gray-400 italic">Không tìm thấy người dùng</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="md:col-span-4 space-y-1">
                <label className="text-[10px] uppercase font-bold text-teal-700 ml-1">Vai trò</label>
                <select
                  className="w-full px-4 py-2 bg-white border border-teal-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none h-[38px]"
                  value={memberFormData.role}
                  onChange={(e) => setMemberFormData({ ...memberFormData, role: e.target.value })}
                >
                  <option value="member">Thành viên</option>
                  <option value="manager">Quản lý (Manager)</option>
                  <option value="admin">Quản trị viên (Admin)</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <Button
                  onClick={handleAddMember}
                  disabled={!memberFormData.user_id}
                  className="w-full !py-2"
                >
                  Thêm
                </Button>
              </div>
            </div>
          </div>

          {/* Member List */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-900 border-b pb-2">Danh sách hiện tại ({members.length})</h3>
            {memberLoading ? (
              <div className="py-10 text-center text-gray-400 italic">Đang tải...</div>
            ) : members.length === 0 ? (
              <div className="py-10 text-center text-gray-400 italic">Chưa có thành viên nào</div>
            ) : (
              <div className="bg-white rounded-lg border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold">
                    <tr>
                      <th className="px-4 py-2 text-left">Người dùng</th>
                      <th className="px-4 py-2 text-left">Vai trò</th>
                      <th className="px-4 py-2 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {members.map(m => (
                      <tr key={m.user_id} className="hover:bg-gray-50 group">
                        <td className="px-4 py-3">
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-900">{m.user_full_name}</span>
                            <span className="text-xs text-gray-500">{m.user_email}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${m.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                            m.role === 'manager' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                            }`}>
                            {m.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleRemoveMember(m.user_id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all opacity-0 group-hover:opacity-100"
                            title="Xóa khỏi đơn vị"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!deleteModal} onClose={() => setDeleteModal(null)} title="Xác nhận xóa" size="md">
        <div className="space-y-4">
          <div className="p-4 bg-red-50 rounded-lg flex items-start gap-3">
            <Trash2 className="w-6 h-6 text-red-600 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-red-900">Xóa dữ liệu vĩnh viễn</p>
              <p className="text-xs text-red-700 mt-1">
                Bạn có chắc chắn muốn xóa tổ chức <span className="font-bold">"{deleteModal?.name}"</span>?
                Hành động này sẽ xóa toàn bộ liên kết thành viên và hội nghị thuộc tổ chức này.
              </p>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setDeleteModal(null)} className="flex-1">Hủy quay lại</Button>
            <Button variant="danger" onClick={handleDelete} className="flex-1">Xác nhận Xóa</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
