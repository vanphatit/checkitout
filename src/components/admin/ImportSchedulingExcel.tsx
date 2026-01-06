'use client';

import { useState } from 'react';
import { FileUp, Download, CheckCircle2, XCircle, AlertTriangle, FileSpreadsheet, Upload } from 'lucide-react';
import { schedulingService } from '@/services/schedulingService';
import { toast } from 'sonner';

interface ImportSchedulingExcelProps {
    onSuccess: () => void;
}

export default function ImportSchedulingExcel({ onSuccess }: ImportSchedulingExcelProps) {
    const [file, setFile] = useState<File | null>(null);
    const [validating, setValidating] = useState(false);
    const [importing, setImporting] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [validationResult, setValidationResult] = useState<{
        valid: number;
        invalid: number;
        errors: Array<{ row: number; field: string; message: string }>;
    } | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (!selectedFile.name.match(/\.(xlsx|xls)$/)) {
                toast.error('Vui lòng chọn file Excel (.xlsx hoặc .xls)');
                return;
            }
            setFile(selectedFile);
            setValidationResult(null);
        }
    };

    const handleDownloadTemplate = async () => {
        try {
            setDownloading(true);
            const blob = await schedulingService.downloadTemplate();

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'lich_trinh_template.xlsx';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success('Tải template thành công');
        } catch (error: any) {
            console.error('Error downloading template:', error);
            toast.error(error.response?.data?.message || 'Không thể tải template');
        } finally {
            setDownloading(false);
        }
    };

    const handleValidate = async () => {
        if (!file) {
            toast.error('Vui lòng chọn file Excel');
            return;
        }

        try {
            setValidating(true);
            const result = await schedulingService.validateImport(file);
            setValidationResult(result);

            if (result.invalid === 0) {
                toast.success(`✅ Dữ liệu hợp lệ! ${result.valid} dòng sẵn sàng import`);
            } else {
                toast.warning(`⚠️ Có ${result.invalid} dòng lỗi, vui lòng kiểm tra`);
            }
        } catch (error: any) {
            console.error('Error validating file:', error);
            toast.error(error.response?.data?.message || 'Không thể validate file');
        } finally {
            setValidating(false);
        }
    };

    const handleImport = async () => {
        console.log('🚀 handleImport called', { file, validationResult });

        if (!file) {
            toast.error('Vui lòng chọn file Excel');
            return;
        }

        if (validationResult && validationResult.invalid > 0) {
            toast.error('Vui lòng sửa các lỗi trước khi import');
            return;
        }

        try {
            setImporting(true);
            console.log('📤 Calling importExcel API...');
            const result = await schedulingService.importExcel(file);
            console.log('✅ Import result received:', result);
            console.log('✅ Import result JSON:', JSON.stringify(result, null, 2));

            // Always show result feedback
            if (!result) {
                console.error('❌ No result from API!');
                toast.error('Không nhận được kết quả từ server!', { duration: 5000 });
                return;
            }

            const { successCount = 0, errorCount = 0, totalRows = 0, errors = [], warnings = [] } = result;

            console.log('📊 Parsed values:', { successCount, errorCount, totalRows, errorsLength: errors.length, warningsLength: warnings.length });

            // Case 1: All success
            if (successCount > 0 && errorCount === 0) {
                console.log('✅ Case 1: All success');
                toast.success(
                    `🎉 Import thành công ${successCount}/${totalRows} lịch trình!`,
                    { duration: 5000 }
                );
                onSuccess();
            }
            // Case 2: Partial success
            else if (successCount > 0 && errorCount > 0) {
                console.log('⚠️ Case 2: Partial success');
                toast.success(
                    `✅ Import thành công ${successCount}/${totalRows} lịch trình`,
                    { duration: 4000 }
                );

                setTimeout(() => {
                    toast.error(
                        `⚠️ ${errorCount} dòng thất bại. Xem console để biết chi tiết.`,
                        { duration: 6000 }
                    );
                    console.error('❌ Import errors:');
                    errors.forEach((err: any, idx: number) => {
                        console.error(`   ${idx + 1}. Dòng ${err.row}: ${err.message}`);
                    });
                }, 600);

                onSuccess();
            }
            // Case 3: All failed
            else if (errorCount > 0 && successCount === 0) {
                console.log('❌ Case 3: All failed');
                console.log('📊 Error details:', errors);

                // DEBUG: Test if code execution continues
                console.log('🔔 About to call toast.error...');

                // Try multiple methods
                const errorMsg = `Import thất bại! ${errorCount}/${totalRows} dòng có lỗi`;

                // Method 1: Simple toast
                toast.error(errorMsg);

                // Method 2: With options
                setTimeout(() => {
                    toast.error(errorMsg + ' (timeout)', { duration: 5000 });
                }, 100);

                console.log('✅ Toast calls completed');

                // Log detailed errors
                console.group('❌ All import errors:');
                errors.forEach((err: any, idx: number) => {
                    console.log(`${idx + 1}. Dòng ${err.row}: ${err.message}`);
                });
                console.groupEnd();
            }
            // Case 4: No data processed
            else {
                console.log('⚠️ Case 4: No data processed');
                toast.warning(
                    '⚠️ Không có dữ liệu nào được xử lý! Kiểm tra lại file Excel.',
                    { duration: 6000 }
                );
            }

            // Show warnings if any
            if (warnings.length > 0) {
                setTimeout(() => {
                    toast.warning(
                        `⚠️ Có ${warnings.length} cảnh báo - Xem console để biết chi tiết`,
                        { duration: 5000 }
                    );
                    console.warn('⚠️ Import warnings:', warnings);
                }, 1200);
            }
        } catch (error: any) {
            console.error('❌ CATCH ERROR:', error);
            console.error('❌ Error response:', error.response?.data);

            const errorMsg = error.response?.data?.message
                || error.message
                || 'Không thể import file. Vui lòng thử lại!';

            toast.error(
                `💥 Lỗi import:\n${errorMsg}`,
                { duration: 7000 }
            );
        } finally {
            setImporting(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Step 1: Template Info & Download */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                        1
                    </div>
                    <h3 className="text-lg font-semibold">Template Excel Mẫu</h3>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                        <FileSpreadsheet className="w-5 h-5" />
                        Cấu trúc file Excel
                    </h4>
                    <div className="text-sm text-blue-800 space-y-1">
                        <p>File Excel cần có các cột sau (theo thứ tự):</p>
                        <ul className="list-disc list-inside ml-2 space-y-1 mt-2">
                            <li><strong>Tên tuyến đường</strong> - Ví dụ: "Sài Gòn - Hồng Ngự" (bắt buộc)</li>
                            <li><strong>Biển số xe</strong> - Ví dụ: "51B-12345" (bắt buộc)</li>
                            <li><strong>Ngày khởi hành</strong> - Format: YYYY-MM-DD (bắt buộc)</li>
                            <li><strong>Giờ khởi hành</strong> - Format: HH:mm, ví dụ: "08:30" (bắt buộc)</li>
                            <li><strong>Giờ đến</strong> - Format: HH:mm (không bắt buộc)</li>
                            <li><strong>Giá vé</strong> - Số nguyên, ví dụ: 150000 (bắt buộc)</li>
                            <li><strong>Tên tài xế</strong> - Ví dụ: "Nguyễn Văn A" (không bắt buộc)</li>
                            <li><strong>SĐT tài xế</strong> - Ví dụ: "0987654321" (không bắt buộc)</li>
                            <li><strong>GPLX</strong> - Giấy phép lái xe, ví dụ: "B1234567" (không bắt buộc)</li>
                            <li><strong>Ghi chú</strong> - Ghi chú bổ sung (không bắt buộc)</li>
                        </ul>
                        <p className="mt-3 text-blue-700 font-medium">
                            ⚠️ Lưu ý: Tên tuyến đường và biển số xe phải khớp với dữ liệu trong hệ thống
                        </p>
                    </div>
                </div>

                <button
                    onClick={handleDownloadTemplate}
                    disabled={downloading}
                    className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                >
                    {downloading ? (
                        <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            Đang tải...
                        </>
                    ) : (
                        <>
                            <Download className="w-5 h-5" />
                            Tải File Excel Mẫu
                        </>
                    )}
                </button>
            </div>

            {/* Step 2: Upload File */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                        2
                    </div>
                    <h3 className="text-lg font-semibold">Upload File Excel</h3>
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
                    <input
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleFileChange}
                        className="hidden"
                        id="excel-upload"
                    />
                    <label
                        htmlFor="excel-upload"
                        className="cursor-pointer flex flex-col items-center gap-3"
                    >
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                            <FileSpreadsheet className="w-8 h-8 text-blue-600" />
                        </div>
                        {file ? (
                            <>
                                <div className="text-green-600 font-medium">{file.name}</div>
                                <div className="text-sm text-gray-500">
                                    {(file.size / 1024).toFixed(2)} KB
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="text-gray-700 font-medium">
                                    Click để chọn file Excel
                                </div>
                                <div className="text-sm text-gray-500">
                                    Hỗ trợ định dạng: .xlsx, .xls
                                </div>
                            </>
                        )}
                    </label>
                </div>

                {file && (
                    <div className="mt-4 flex gap-3">
                        <button
                            onClick={handleValidate}
                            disabled={validating}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                            {validating ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    Đang kiểm tra...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="w-5 h-5" />
                                    Kiểm Tra Dữ Liệu
                                </>
                            )}
                        </button>

                        <button
                            onClick={() => {
                                setFile(null);
                                setValidationResult(null);
                                const input = document.getElementById('excel-upload') as HTMLInputElement;
                                if (input) input.value = '';
                            }}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Hủy
                        </button>
                    </div>
                )}
            </div>

            {/* Step 3: Validation Result */}
            {validationResult && (
                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                            3
                        </div>
                        <h3 className="text-lg font-semibold">Kết Quả Kiểm Tra</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 text-green-700 font-semibold mb-1">
                                <CheckCircle2 className="w-5 h-5" />
                                Hợp lệ
                            </div>
                            <div className="text-2xl font-bold text-green-800">
                                {validationResult.valid}
                            </div>
                            <div className="text-sm text-green-600">dòng dữ liệu</div>
                        </div>

                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 text-red-700 font-semibold mb-1">
                                <XCircle className="w-5 h-5" />
                                Lỗi
                            </div>
                            <div className="text-2xl font-bold text-red-800">
                                {validationResult.invalid}
                            </div>
                            <div className="text-sm text-red-600">dòng dữ liệu</div>
                        </div>
                    </div>

                    {validationResult.errors.length > 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 text-yellow-800 font-semibold mb-3">
                                <AlertTriangle className="w-5 h-5" />
                                Chi tiết lỗi ({validationResult.errors.length})
                            </div>
                            <div className="max-h-64 overflow-y-auto space-y-2">
                                {validationResult.errors.slice(0, 10).map((error, index) => (
                                    <div key={index} className="text-sm bg-white p-3 rounded border border-yellow-200">
                                        <div className="font-medium text-gray-900">
                                            Dòng {error.row}: <span className="text-red-600">{error.field}</span>
                                        </div>
                                        <div className="text-gray-600">{error.message}</div>
                                    </div>
                                ))}
                                {validationResult.errors.length > 10 && (
                                    <div className="text-sm text-gray-500 text-center pt-2">
                                        ... và {validationResult.errors.length - 10} lỗi khác
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {validationResult.invalid === 0 && (
                        <button
                            onClick={handleImport}
                            disabled={importing}
                            className="w-full mt-4 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
                        >
                            {importing ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    Đang import...
                                </>
                            ) : (
                                <>
                                    <Upload className="w-5 h-5" />
                                    Import {validationResult.valid} Lịch Trình
                                </>
                            )}
                        </button>
                    )}
                </div>
            )}

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <h4 className="font-semibold text-blue-900 mb-3">📝 Hướng dẫn</h4>
                <ul className="space-y-2 text-sm text-blue-800">
                    <li>1️⃣ Tải file template Excel về máy</li>
                    <li>2️⃣ Điền thông tin lịch trình vào các cột theo hướng dẫn trong file</li>
                    <li>3️⃣ Upload file đã điền và click "Kiểm Tra Dữ Liệu"</li>
                    <li>4️⃣ Nếu có lỗi, sửa lại file Excel theo thông báo</li>
                    <li>5️⃣ Khi không còn lỗi, click "Import" để hoàn tất</li>
                </ul>
                <div className="mt-4 p-3 bg-white rounded-lg border border-blue-200">
                    <div className="font-medium text-blue-900 mb-1">⚠️ Lưu ý:</div>
                    <ul className="text-xs text-blue-700 space-y-1">
                        <li>• File Excel phải có đúng các cột theo template</li>
                        <li>• RouteID và BusID phải tồn tại trong hệ thống</li>
                        <li>• Định dạng ngày: YYYY-MM-DD (VD: 2024-12-25)</li>
                        <li>• Định dạng giờ: HH:mm (VD: 08:30)</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
