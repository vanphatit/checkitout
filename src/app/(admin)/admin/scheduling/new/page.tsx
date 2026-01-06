'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, CalendarRange, FileSpreadsheet } from 'lucide-react';
import SingleSchedulingForm from '@/components/admin/SingleSchedulingForm';
import BulkSchedulingForm from '@/components/admin/BulkSchedulingForm';
import ImportSchedulingExcel from '@/components/admin/ImportSchedulingExcel';

type TabType = 'single' | 'bulk' | 'import';

export default function NewSchedulingPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('single');

  const handleSuccess = () => {
    router.push('/admin/scheduling');
  };

  const tabs = [
    { id: 'single' as TabType, label: 'Tạo Đơn', icon: Calendar, description: 'Tạo 1 lịch trình' },
    { id: 'bulk' as TabType, label: 'Tạo Hàng Loạt', icon: CalendarRange, description: 'Tạo nhiều lịch trình định kỳ' },
    { id: 'import' as TabType, label: 'Import Excel', icon: FileSpreadsheet, description: 'Import từ file Excel' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <Link
            href="/admin/scheduling"
            className="p-2 hover:bg-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tạo Lịch Trình Mới</h1>
            <p className="text-sm text-gray-500 mt-1">Chọn phương thức tạo lịch trình</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <div className="flex -mb-px overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 px-6 py-4 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                  >
                    <Icon className="w-5 h-5" />
                    <div className="text-left">
                      <div>{tab.label}</div>
                      <div className="text-xs font-normal text-gray-400">{tab.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="transition-all">
          {activeTab === 'single' && <SingleSchedulingForm onSuccess={handleSuccess} />}
          {activeTab === 'bulk' && <BulkSchedulingForm onSuccess={handleSuccess} />}
          {activeTab === 'import' && <ImportSchedulingExcel onSuccess={handleSuccess} />}
        </div>
      </div>
    </div>
  );
}
