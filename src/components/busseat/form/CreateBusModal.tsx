"use client";

import { useState, useEffect } from "react";
import {
  FiPlus,
  FiX,
  FiTruck,
  FiUser,
  FiHash,
  FiLayers,
  FiCamera,
  FiTrash2,
} from "react-icons/fi";
import { useRouter } from "next/navigation";
import { busService } from "@/services/busService";

export default function CreateBusModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const router = useRouter();

  // Xử lý khi chọn file
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    // Giới hạn tối đa 5 ảnh
    if (selectedImages.length + files.length > 5) {
      alert("Bạn chỉ có thể tải lên tối đa 5 ảnh.");
      return;
    }

    const newFiles = [...selectedImages, ...files];
    setSelectedImages(newFiles);

    // Tạo URL để preview
    const newUrls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls([...previewUrls, ...newUrls]);
  };

  // Xóa ảnh đã chọn
  const removeImage = (index: number) => {
    const updatedImages = selectedImages.filter((_, i) => i !== index);
    const updatedUrls = previewUrls.filter((_, i) => i !== index);

    // Giải phóng bộ nhớ của URL cũ
    URL.revokeObjectURL(previewUrls[index]);

    setSelectedImages(updatedImages);
    setPreviewUrls(updatedUrls);
  };

  // Cleanup URLs khi component unmount hoặc modal đóng
  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    // Nếu API của bạn nhận FormData (bao gồm ảnh)
    const payload = new FormData();
    payload.append("busNo", formData.get("busNo") as string);
    payload.append("plateNo", formData.get("plateNo") as string);
    payload.append("type", formData.get("type") as string);
    payload.append("driverName", formData.get("driverName") as string);
    payload.append("status", "AVAILABLE");

    // Append nhiều ảnh vào FormData
    selectedImages.forEach((file) => {
      payload.append("images", file);
      console.log("Appending file:", file);
    });

    try {
      await busService.createBus(payload);
      setIsOpen(false);
      resetForm();
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Lỗi khi tạo mới phương tiện.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedImages([]);
    previewUrls.forEach((url) => URL.revokeObjectURL(url));
    setPreviewUrls([]);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
      >
        <FiPlus className="w-5 h-5" /> Thêm phương tiện
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden my-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                    Đăng ký
                  </h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                    Cập nhật hình ảnh và thông tin xe
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
                {/* Upload Image Section */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-[11px] font-black uppercase text-slate-500 ml-1">
                    <FiCamera className="text-blue-500" /> Hình ảnh (
                    {selectedImages.length}/5)
                  </label>

                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                    {/* Preview list */}
                    {previewUrls.map((url, index) => (
                      <div
                        key={url}
                        className="relative aspect-square rounded-2xl overflow-hidden group border border-slate-100"
                      >
                        <img
                          src={url}
                          alt="preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute inset-0 bg-red-500/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <FiTrash2 className="text-white w-5 h-5" />
                        </button>
                      </div>
                    ))}

                    {/* Add button */}
                    {selectedImages.length < 5 && (
                      <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer">
                        <FiPlus className="w-6 h-6 text-slate-400" />
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Bus No */}
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 text-[11px] font-black uppercase text-slate-500 ml-1">
                      <FiHash className="text-blue-500" /> Mã Xe
                    </label>
                    <input
                      name="busNo"
                      required
                      placeholder="VD: Nha Trang - Sài Gòn 01"
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-sm"
                    />
                  </div>

                  {/* License Plate */}
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 text-[11px] font-black uppercase text-slate-500 ml-1">
                      <FiTruck className="text-blue-500" /> Biển số xe
                    </label>
                    <input
                      name="plateNo"
                      required
                      placeholder="VD: 51B-12345"
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-sm"
                    />
                  </div>

                  {/* Driver Name */}
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 text-[11px] font-black uppercase text-slate-500 ml-1">
                      <FiUser className="text-blue-500" /> Tài xế
                    </label>
                    <input
                      name="driverName"
                      required
                      placeholder="Tên tài xế"
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-sm"
                    />
                  </div>

                  {/* Bus Type (Updated) */}
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 text-[11px] font-black uppercase text-slate-500 ml-1">
                      <FiLayers className="text-blue-500" /> Loại Xe
                    </label>
                    <select
                      name="type"
                      required
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-sm appearance-none cursor-pointer"
                    >
                      <option value="SEATER">Xe ghế ngồi (Seater)</option>
                      <option value="SLEEPER">Xe giường nằm (Sleeper)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Đang đăng kí..." : "Đăng kí"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
