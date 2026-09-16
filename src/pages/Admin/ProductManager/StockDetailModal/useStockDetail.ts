import { useState, useEffect } from 'react';
import { message } from 'antd';
import { adminProductService } from '../../../../services';

export interface VariantDetail {
    id: number;
    sku: string;
    colorName: string;
    colorHex: string;
    ram: string;
    rom: string;
    stockQuantity: number;
    imageUrl: string;
}

export const useStockDetail = (
    open: boolean,
    productId: number | undefined,
    onClose: () => void,
    onSuccess: () => void
) => {
    const [variants, setVariants] = useState<VariantDetail[]>([]);
    const [loading, setLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editingStocks, setEditingStocks] = useState<Record<number, number>>({});
    const [bulkValue, setBulkValue] = useState<number | null>(null);

   useEffect(() => {
        const fetchVariants = async (id: number) => {
            setBulkValue(null);
            setLoading(true);
            try {
                const res = await adminProductService.getProductVariants(id);
                
                if (res.code === 200 || res.status === 'success') {
                    const variantData: VariantDetail[] = res.data || [];
                    setVariants(variantData);
                    
                    const initialStocks: Record<number, number> = {};
                    variantData.forEach((v) => {
                        initialStocks[v.id] = v.stockQuantity;
                    });
                    setEditingStocks(initialStocks);
                }
            } catch (error: unknown) {
                const err = error as Error;
                message.error(err.message || "Lỗi tải phiên bản");
            } finally {
                setLoading(false);
            }
        };

        const clearStates = async () => {
             setVariants([]);
             setEditingStocks({});
             setBulkValue(null);
        };

        if (open && productId) {
            fetchVariants(productId);
        } else {
            clearStates();
        }
    }, [open, productId]);

    const handleStockChange = (variantId: number, value: number | null) => {
        setEditingStocks(prev => ({
            ...prev,
            [variantId]: value || 0
        }));
    };

    const handleApplyAll = () => {
        if (bulkValue === null || bulkValue < 0) return;
        const newStocks = { ...editingStocks };
        variants.forEach(v => {
            newStocks[v.id] = bulkValue;
        });
        setEditingStocks(newStocks);
        message.info(`Đã áp dụng số lượng ${bulkValue} cho tất cả phiên bản.`);
    };

    const handleSaveAll = async () => {
        if (!productId) return;
        
        const changedStocks = variants
            .filter(v => editingStocks[v.id] !== v.stockQuantity)
            .map(v => ({
                variantId: v.id,
                stockQuantity: editingStocks[v.id]
            }));

        if (changedStocks.length === 0) {
            message.info("Không có thay đổi nào để lưu.");
            onClose();
            return;
        }

        setIsSaving(true);
        try {
            const payload = {
                productId: productId,
                stocks: changedStocks
            };

            const res = await adminProductService.updateBulkStock(payload);
            
            if (res.code === 200 || res.status === 'success') {
                message.success(`Đã cập nhật tồn kho cho ${changedStocks.length} phiên bản!`);
                onSuccess(); 
                onClose();   
            } else {
                throw new Error(res.message || "Lỗi khi cập nhật");
            }
        } catch (error: unknown) {
            const err = error as Error;
            message.error(err.message || "Lỗi lưu dữ liệu!");
        } finally {
            setIsSaving(false);
        }
    };

    const hasAnyChange = variants.some(v => editingStocks[v.id] !== v.stockQuantity);

    return {
        variants, loading, isSaving, editingStocks, bulkValue, hasAnyChange,
        setBulkValue, handleStockChange, handleApplyAll, handleSaveAll
    };
};