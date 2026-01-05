"use client";

import { useState } from "react";
import {
  FiEdit2,
  FiX,
  FiTruck,
  FiUser,
  FiHash,
  FiLayers,
  FiActivity,
  FiCamera,
  FiPlus,
  FiTrash2,
} from "react-icons/fi";
import { useRouter } from "next/navigation";
import { busService } from "@/services/busService";
import { Bus } from "@/types/bus";

export default function EditBusModal({ bus }: { bus: Bus }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const router = useRouter();

  // Khởi tạo state từ dữ liệu bus hiện tại
  const [formState, setFormState] = useState({
    busNo: bus.busNo || "",
    plateNo: bus.plateNo || "",
    type: bus.type || "Seater",
    driverName: bus.driverName || "",
    status: bus.status || "AVAILABLE",
  });

  // Quản lý ảnh cũ từ Server
  const [existingImages, setExistingImages] = useState(bus.images || []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (selectedImages.length + files.length + existingImages.length > 5) {
      alert("Total images cannot exceed 5.");
      return;
    }

    setSelectedImages([...selectedImages, ...files]);
    const newUrls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls([...previewUrls, ...newUrls]);
  };

  const removeNewImage = (index: number) => {
    URL.revokeObjectURL(previewUrls[index]);
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
    setPreviewUrls(previewUrls.filter((_, i) => i !== index));
  };

  const handleRemoveExistingImage = async (publicId: string, index: number) => {
    if (
      !window.confirm("Are you sure you want to delete this image permanently?")
    )
      return;

    try {
      setLoading(true);
      await busService.deleteBusImage(bus._id, publicId);

      // Xóa thành công trên server thì xóa ở giao diện
      setExistingImages(existingImages.filter((_, i) => i !== index));
      alert("Image deleted successfully!");
    } catch (error: any) {
      console.error("Delete image failed:", error);
      alert(error.response?.data?.message || "Could not delete image.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = new FormData();
    payload.append("busNo", formState.busNo);
    payload.append("plateNo", formState.plateNo);
    payload.append("type", formState.type);
    payload.append("driverName", formState.driverName);
    payload.append("status", formState.status);

    // Chỉ gửi các file ảnh mới chọn thêm
    selectedImages.forEach((file) => {
      payload.append("images", file);
    });

    try {
      await busService.updateBus(bus._id, payload);
      setIsOpen(false);
      // Reset ảnh mới sau khi update thành công
      setSelectedImages([]);
      setPreviewUrls([]);
      router.refresh();
      alert("Update vehicle successfully!");
    } catch (error: any) {
      console.error("Update failed:", error);
      alert(error.response?.data?.message || "Error updating vehicle!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2.5 hover:bg-white rounded-xl border border-transparent hover:border-slate-200 text-slate-400 hover:text-blue-600 transition-all shadow-none hover:shadow-sm"
      >
        <FiEdit2 className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden my-auto animate-in zoom-in duration-300">
            <div className="p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                    Chỉnh sửa thông tin
                  </h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                    ID: {bus._id.slice(-8).toUpperCase()} | Sức chứa:{" "}
                    {bus.seats?.length || 0}
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <FiX className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Images Section */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 ml-1">
                    <FiCamera className="text-blue-500" /> Hình ảnh (
                    {existingImages.length + selectedImages.length}/5)
                  </label>
                  <div className="grid grid-cols-5 gap-3">
                    {/* Existing Images from Server */}
                    {existingImages.map((img, idx) => (
                      <div
                        key={`old-${idx}`}
                        className="relative aspect-square rounded-xl overflow-hidden group border shadow-sm"
                      >
                        <img
                          src={img.url}
                          alt="existing"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          disabled={loading}
                          onClick={() =>
                            handleRemoveExistingImage(img.publicId, idx)
                          }
                          className="absolute inset-0 bg-red-500/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <FiTrash2 className="text-white w-4 h-4" />
                        </button>
                      </div>
                    ))}

                    {/* New Selection Preview */}
                    {previewUrls.map((url, idx) => (
                      <div
                        key={`new-${idx}`}
                        className="relative aspect-square rounded-xl overflow-hidden group border border-blue-200 shadow-sm"
                      >
                        <img
                          src={url}
                          alt="new"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeNewImage(idx)}
                          className="absolute inset-0 bg-red-500/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <FiTrash2 className="text-white w-4 h-4" />
                        </button>
                      </div>
                    ))}

                    {/* Upload Button */}
                    {existingImages.length + selectedImages.length < 5 && (
                      <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-all">
                        <FiPlus className="text-slate-400 w-5 h-5" />
                        <span className="text-[8px] font-bold text-slate-400 mt-1">
                          ADD
                        </span>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageChange}
                        />
                      </label>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 ml-1">
                      <FiHash /> Mã xe
                    </label>
                    <input
                      value={formState.busNo}
                      onChange={(e) =>
                        setFormState({ ...formState, busNo: e.target.value })
                      }
                      required
                      className="form-input-edit"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 ml-1">
                      <FiTruck /> Biển số xe
                    </label>
                    <input
                      value={formState.plateNo}
                      onChange={(e) =>
                        setFormState({ ...formState, plateNo: e.target.value })
                      }
                      required
                      className="form-input-edit"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 ml-1">
                      <FiUser /> Tài xế
                    </label>
                    <input
                      value={formState.driverName}
                      onChange={(e) =>
                        setFormState({
                          ...formState,
                          driverName: e.target.value,
                        })
                      }
                      required
                      className="form-input-edit"
                    />
                  </div>

                  {/* Type - READONLY */}
                  <div className="flex flex-col gap-1.5">
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 ml-1">
                      <FiLayers /> Loại xe
                    </label>
                    <input
                      value={formState.type}
                      readOnly
                      className="form-input-edit bg-slate-50 text-slate-500 cursor-not-allowed border-dashed opacity-80"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 ml-1">
                      <FiActivity /> Trạng thái
                    </label>
                    <select
                      value={formState.status}
                      onChange={(e) =>
                        setFormState({ ...formState, status: e.target.value })
                      }
                      className="form-input-edit appearance-none cursor-pointer"
                    >
                      <option value="AVAILABLE">Đang chạy</option>
                      <option value="UNAVAILABLE">Ngưng hoạt động</option>
                    </select>
                  </div>
                </div>

                {/* Actions */}
                <div className="md:col-span-2 flex items-center gap-3 mt-6">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => setIsOpen(false)}
                    className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-all disabled:opacity-50"
                  >
                    Hủy thao tác
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50"
                  >
                    {loading ? "Đang lưu" : "Cập nhật"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .form-input-edit {
          width: 100%;
          padding: 0.875rem 1.25rem;
          background-color: #f8fafc;
          border: 1px solid #f1f5f9;
          border-radius: 1rem;
          font-size: 0.875rem;
          font-weight: 700;
          color: #0f172a;
          transition: all 0.2s;
        }
        .form-input-edit:focus {
          outline: none;
          border-color: #3b82f6;
          background-color: #fff;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
        }
      `}</style>
    </>
  );
}
