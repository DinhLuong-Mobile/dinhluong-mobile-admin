import { useState, useCallback } from "react";
import { message, Form } from "antd";
import { adminMasterDataService } from "../../../services";
import type {
  SpecGroup,
  SpecGroupRequest,
  SpecAttribute,
  SpecAttributeRequest,
} from "../../../types/spec.types";

export const useSpecManager = () => {
  const [groups, setGroups] = useState<SpecGroup[]>([]);
  const [loading, setLoading] = useState(false);

  // States cho Nhóm (Group)
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<SpecGroup | null>(null);
  const [groupForm] = Form.useForm();

  // States cho Thuộc tính (Attribute)
  const [isAttrModalOpen, setIsAttrModalOpen] = useState(false);
  const [editingAttr, setEditingAttr] = useState<SpecAttribute | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [attrForm] = Form.useForm();

  // 1. FETCH DATA
  const fetchSpecGroups = useCallback(async () => {
    setLoading(true);
    try {
      const res = (await adminMasterDataService.getSpecGroups()) as any;
      if (res) {
        const rawData = Array.isArray(res) ? res : res.data || [];
        const sortedData = rawData.sort(
          (a: SpecGroup, b: SpecGroup) =>
            (a.sortOrder || 0) - (b.sortOrder || 0),
        );
        setGroups(sortedData);
      }
    } catch (error) {
      message.error("Lỗi tải danh sách nhóm thông số");
    } finally {
      setLoading(false);
    }
  }, []);


  const openGroupModal = (record?: SpecGroup) => {
    setIsGroupModalOpen(true);
    setTimeout(() => {
      if (record) {
        setEditingGroup(record);
        groupForm.setFieldsValue(record);
      } else {
        setEditingGroup(null);
        groupForm.resetFields();
        const nextSort =
          groups.length > 0
            ? Math.max(...groups.map((g) => g.sortOrder || 0)) + 1
            : 1;
        groupForm.setFieldValue("sortOrder", nextSort);
      }
    }, 0);
  };

  const handleGroupSubmit = async () => {
    try {
      const values: SpecGroupRequest = await groupForm.validateFields();
      const res = editingGroup
        ? ((await adminMasterDataService.updateSpecGroup(
            editingGroup.id,
            values,
          )) as any)
        : ((await adminMasterDataService.createSpecGroup(values)) as any);

      if (res) {
        message.success(
          editingGroup ? "Cập nhật Nhóm thành công!" : "Thêm Nhóm thành công!",
        );
        setIsGroupModalOpen(false);
        fetchSpecGroups();
      } else {
        message.error("Lỗi khi lưu Nhóm");
      }
    } catch (error) {
      // Validate form error
    }
  };

  const deleteGroup = async (id: number) => {
    try {
      await adminMasterDataService.deleteSpecGroup(id);
      message.success("Đã xóa Nhóm");
      fetchSpecGroups();
    } catch (error) {
      message.error("Không thể xóa (Nhóm có thể đang được sử dụng)");
    }
  };

  // ================= SPEC ATTRIBUTE HANDLERS =================
  const openAttrModal = (groupId: number, record?: SpecAttribute) => {
    setSelectedGroupId(groupId);
    setIsAttrModalOpen(true);

    setTimeout(() => {
      if (record) {
        setEditingAttr(record);
        attrForm.setFieldsValue(record);
      } else {
        setEditingAttr(null);
        attrForm.resetFields();

        const currentGroup = groups.find((g) => g.id === groupId);

        const attributesList = currentGroup?.attributes ?? [];
        const nextSort =
          attributesList.length > 0
            ? Math.max(...attributesList.map((a) => a.sortOrder || 0)) + 1
            : 1;

        attrForm.setFieldsValue({ sortOrder: nextSort, dataType: "STRING" });
      }
    }, 0);
  };

  const handleAttrSubmit = async () => {
    try {
      const values = await attrForm.validateFields();
      const payload: SpecAttributeRequest = {
        ...values,
        groupId: selectedGroupId,
      };

      const res = editingAttr
        ? ((await adminMasterDataService.updateSpecAttribute(
            editingAttr.id,
            payload,
          )) as any)
        : ((await adminMasterDataService.createSpecAttribute(payload)) as any);

      if (res) {
        message.success(
          editingAttr
            ? "Cập nhật Thuộc tính thành công!"
            : "Thêm Thuộc tính thành công!",
        );
        setIsAttrModalOpen(false);
        fetchSpecGroups();
      } else {
        message.error("Lỗi khi lưu Thuộc tính");
      }
    } catch (error) {
      // Validate form error
    }
  };

  const deleteAttr = async (id: number) => {
    try {
      await adminMasterDataService.deleteSpecAttribute(id);
      message.success("Đã xóa Thuộc tính");
      fetchSpecGroups();
    } catch (error) {
      message.error("Không thể xóa (Đang được dùng trong sản phẩm)");
    }
  };

  return {
    groups,
    loading,
    fetchSpecGroups,
    // Group Modal & Actions
    isGroupModalOpen,
    setIsGroupModalOpen,
    editingGroup,
    groupForm,
    openGroupModal,
    handleGroupSubmit,
    deleteGroup,
    // Attribute Modal & Actions
    isAttrModalOpen,
    setIsAttrModalOpen,
    editingAttr,
    attrForm,
    openAttrModal,
    handleAttrSubmit,
    deleteAttr,
  };
};
