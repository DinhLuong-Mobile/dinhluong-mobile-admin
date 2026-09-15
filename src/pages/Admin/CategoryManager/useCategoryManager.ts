// src/hooks/useCategoryManager.ts
import { useState, useCallback } from "react";
import { message, Form } from "antd";
import { adminMasterDataService } from "../../../services";
import type { Category, CategoryRequest } from "../../../types/category.types";

export const generateSlug = (str: string): string => {
  if (!str) return "";
  return str
    .toString()
    .toLowerCase()
    .replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a")
    .replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e")
    .replace(/ì|í|ị|ỉ|ĩ/g, "i")
    .replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o")
    .replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u")
    .replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y")
    .replace(/đ/g, "d")
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
};

export const useCategoryManager = () => {
  const [categoriesTree, setCategoriesTree] = useState<Category[]>([]);
  const [flatCategories, setFlatCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form] = Form.useForm();

  const buildTree = (data: Category[]): Category[] => {
    const tree: Category[] = [];
    const lookup: Record<number, Category & { children: Category[] }> = {};

    data.forEach((item) => {
      lookup[item.id] = { ...item, children: [] };
    });

    data.forEach((item) => {
      if (item.parentId && lookup[item.parentId]) {
        lookup[item.parentId].children.push(lookup[item.id]);
      } else {
        tree.push(lookup[item.id]);
      }
    });

    const cleanEmptyChildren = (nodes: Category[]) => {
      nodes.forEach((node) => {
        if (node.children && node.children.length === 0) {
          delete node.children;
        } else if (node.children) {
          cleanEmptyChildren(node.children);
        }
      });
    };
    cleanEmptyChildren(tree);

    return tree;
  };

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = (await adminMasterDataService.getCategories()) as any;
      if (res) {
        const flatData = Array.isArray(res) ? res : res.data || [];
        setFlatCategories(flatData);
        setCategoriesTree(buildTree(flatData));
      }
    } catch (error) {
      message.error("Lỗi tải danh mục");
    } finally {
      setLoading(false);
    }
  }, []);

  const showAddModal = () => {
    setEditingId(null);
    setIsModalVisible(true);
    setTimeout(() => {
      try {
        form.resetFields();
      } catch (e) {
        // Form not mounted yet
      }
    }, 0);
  };

  const showEditModal = (record: Category) => {
    setEditingId(record.id);
    setIsModalVisible(true);
    setTimeout(() => {
      try {
        form.setFieldsValue({
          name: record.name,
          slug: record.slug,
          parentId: record.parentId,
          description: record.description,
          thumbnailUrl: record.thumbnailUrl,
        });
      } catch (e) {
        // Form not mounted yet
      }
    }, 0);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    form.setFieldValue("slug", generateSlug(e.target.value));
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();

      let calculatedLevel = 1;
      if (values.parentId) {
        const parent = flatCategories.find((c) => c.id === values.parentId);
        if (parent) calculatedLevel = (parent.level || 1) + 1;
      }

      const payload: CategoryRequest = {
        name: values.name,
        slug: values.slug,
        description: values.description,
        thumbnailUrl: values.thumbnailUrl,
        parentId: values.parentId ?? null,
        level: calculatedLevel,
      };

      const res = editingId
        ? ((await adminMasterDataService.updateCategory(
            editingId,
            payload as any,
          )) as any)
        : ((await adminMasterDataService.createCategory(
            payload as any,
          )) as any);

      if (res) {
        message.success(
          editingId ? "Cập nhật thành công!" : "Thêm thành công!",
        );
        setIsModalVisible(false);
        fetchCategories();
      } else {
        message.error("Lỗi khi lưu danh mục");
      }
    } catch (error) {
      // Form validate failed
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await adminMasterDataService.deleteCategory(id);
      message.success("Xóa danh mục thành công!");
      fetchCategories();
    } catch (error) {
      message.error(
        "Không thể xóa (Danh mục có thể đang chứa dữ liệu con hoặc sản phẩm)",
      );
    }
  };

  return {
    categoriesTree,
    flatCategories,
    loading,
    isModalVisible,
    setIsModalVisible,
    editingId,
    form,
    fetchCategories,
    showAddModal,
    showEditModal,
    handleNameChange,
    handleModalOk,
    handleDelete,
  };
};
