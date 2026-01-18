import { useEffect, useMemo, useState } from "react";
import { userService } from "../../../services";
import { UserPlus, Edit, Trash2, Shield, UserCog } from "lucide-react";
import Modal from "../../../components/Modal";
import Button from "../../../components/Button";
import Input from "../../../components/Input";
import Table from "../../../components/Table";
import { toast } from "react-hot-toast";
import { useAuthStore } from "../../../app/store/useAuthStore";

/**
 * Trang quản lý người dùng cho Admin
 */
export default function UserManagementPage() {
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [roleModal, setRoleModal] = useState(null); // user object
  const [allRoles, setAllRoles] = useState([]); // [{id,name}]
  const [roleLoading, setRoleLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    full_name: "",
    password: "",
    affiliation: "",
    is_active: true,
    is_verified: false,
  });

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (roleModal) {
      loadRoles();
    }
  }, [roleModal]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAll();
      setUsers(data.users || []);
    } catch (error) {
      toast.error("Không thể tải danh sách người dùng");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      setRoleLoading(true);
      const data = await userService.listRoles();
      setAllRoles(data.roles || []);
    } catch (error) {
      toast.error("Không thể tải danh sách roles");
      console.error(error);
    } finally {
      setRoleLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      await userService.create(formData);
      toast.success("Tạo người dùng thành công");
      setCreateModal(false);
      resetForm();
      loadUsers();
    } catch (error) {
      toast.error("Không thể tạo người dùng");
      console.error(error);
    }
  };

  const handleUpdate = async () => {
    if (!editModal) return;
    try {
      await userService.update(editModal.id, formData);
      toast.success("Cập nhật người dùng thành công");
      setEditModal(null);
      resetForm();
      loadUsers();
    } catch (error) {
      toast.error("Không thể cập nhật người dùng");
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await userService.delete(id);
      toast.success("Xóa người dùng thành công");
      setDeleteModal(null);
      loadUsers();
    } catch (error) {
      toast.error("Không thể xóa người dùng");
      console.error(error);
    }
  };

  const resetForm = () => {
    setFormData({
      email: "",
      full_name: "",
      password: "",
      affiliation: "",
      is_active: true,
      is_verified: false,
    });
  };

  const openEditModal = (user) => {
    setEditModal(user);
    setFormData({
      email: user.email,
      full_name: user.full_name || "",
      password: "",
      affiliation: user.affiliation || "",
      is_active: user.is_active,
      is_verified: user.is_verified,
    });
  };

  const updateUserInList = (updated) => {
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
  };

  const toggleRole = async (targetUser, role) => {
    if (!targetUser?.id || !role?.id) return;

    const roleNames = targetUser.role_names || targetUser.roles || [];
    const hasRole = roleNames.includes(role.name);

    // Prevent admin from removing their own admin role (avoid lockout)
    if (
      targetUser.id === currentUser?.id &&
      role.name === "admin" &&
      hasRole
    ) {
      toast.error("Không thể tự gỡ quyền admin của chính mình");
      return;
    }

    try {
      let updated;
      if (hasRole) {
        updated = await userService.removeRole(targetUser.id, role.id);
        toast.success(`Đã gỡ role '${role.name}'`);
      } else {
        updated = await userService.addRole(targetUser.id, { role_id: role.id });
        toast.success(`Đã thêm role '${role.name}'`);
      }
      updateUserInList(updated);
      setRoleModal(updated);
    } catch (error) {
      const message = error?.response?.data?.detail || "Không thể cập nhật role";
      toast.error(message);
      console.error(error);
    }
  };

  const columns = [
    {
      header: "ID",
      accessor: "id",
    },
    {
      header: "Họ tên",
      accessor: "full_name",
      render: (row) => (
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-gray-400" />
          <span className="font-medium">{row.full_name || "N/A"}</span>
        </div>
      ),
    },
    {
      header: "Email",
      accessor: "email",
    },
    {
      header: "Affiliation",
      accessor: "affiliation",
      render: (row) => row.affiliation || "N/A",
    },
    {
      header: "Vai trò",
      accessor: "roles",
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.role_names?.map((role, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs"
            >
              {role}
            </span>
          ))}
        </div>
      ),
    },
    {
      header: "Trạng thái",
      accessor: "status",
      render: (row) => (
        <div className="flex flex-col gap-1">
          <span
            className={`px-2 py-0.5 rounded text-xs ${
              row.is_active
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {row.is_active ? "Active" : "Inactive"}
          </span>
          {!row.is_verified && (
            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs">
              Chưa xác thực
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Thao tác",
      accessor: "actions",
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setRoleModal(row)}
            className="p-2 text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
            title="Chỉnh roles"
          >
            <UserCog className="w-4 h-4" />
          </button>
          <button
            onClick={() => openEditModal(row)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteModal(row)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý người dùng</h1>
          <p className="mt-1 text-sm text-gray-500">Quản lý tất cả người dùng trong hệ thống</p>
        </div>
        <Button onClick={() => setCreateModal(true)}>
          <UserPlus className="w-4 h-4 mr-2" />
          Thêm người dùng
        </Button>
      </div>

      <Table columns={columns} data={users} loading={loading} />

      {/* Role Modal */}
      <Modal
        isOpen={!!roleModal}
        onClose={() => setRoleModal(null)}
        title="Chỉnh vai trò (roles)"
        size="md"
      >
        <div className="space-y-4">
          <div className="text-sm text-gray-700">
            User: <span className="font-semibold">{roleModal?.email}</span>
          </div>

          {roleLoading ? (
            <div className="text-sm text-gray-500">Đang tải roles...</div>
          ) : (
            <div className="space-y-2">
              {(allRoles || []).map((r) => {
                const roleNames = roleModal?.role_names || roleModal?.roles || [];
                const checked = roleNames.includes(r.name);
                const disabled =
                  roleModal?.id === currentUser?.id && r.name === "admin" && checked;

                return (
                  <label key={r.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">{r.name}</span>
                      <span className="text-xs text-gray-500">role_id: {r.id}</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={disabled}
                      onChange={() => toggleRole(roleModal, r)}
                      className="h-4 w-4"
                    />
                  </label>
                );
              })}
              {(!allRoles || allRoles.length === 0) && (
                <div className="text-sm text-gray-500">Chưa có roles trong hệ thống.</div>
              )}
            </div>
          )}

          <div className="flex justify-end">
            <Button variant="secondary" onClick={() => setRoleModal(null)} className="!w-auto">
              Đóng
            </Button>
          </div>
        </div>
      </Modal>

      {/* Create Modal */}
      <Modal
        isOpen={createModal}
        onClose={() => {
          setCreateModal(false);
          resetForm();
        }}
        title="Thêm người dùng mới"
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <Input
            label="Họ tên"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            required
          />
          <Input
            label="Mật khẩu"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
          <Input
            label="Affiliation"
            value={formData.affiliation}
            onChange={(e) => setFormData({ ...formData, affiliation: e.target.value })}
          />
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => {
              setCreateModal(false);
              resetForm();
            }}>
              Hủy
            </Button>
            <Button onClick={handleCreate}>Tạo</Button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editModal}
        onClose={() => {
          setEditModal(null);
          resetForm();
        }}
        title="Chỉnh sửa người dùng"
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            disabled
          />
          <Input
            label="Họ tên"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
          />
          <Input
            label="Mật khẩu mới (để trống nếu không đổi)"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
          <Input
            label="Affiliation"
            value={formData.affiliation}
            onChange={(e) => setFormData({ ...formData, affiliation: e.target.value })}
          />
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => {
              setEditModal(null);
              resetForm();
            }}>
              Hủy
            </Button>
            <Button onClick={handleUpdate}>Cập nhật</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Xác nhận xóa"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Bạn có chắc chắn muốn xóa người dùng "{deleteModal?.full_name}"?
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setDeleteModal(null)}>
              Hủy
            </Button>
            <Button variant="danger" onClick={() => handleDelete(deleteModal.id)}>
              Xóa
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}