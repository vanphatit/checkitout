import React from "react";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  Facebook,
  Instagram,
  Twitter,
} from "lucide-react";

const ContactPage = () => {
  return (
    <div className="min-h-screen bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* HEADER SECTION */}
        <div className="text-center mb-16">
          <h2 className="text-base font-semibold text-blue-600 uppercase tracking-wide">
            Liên hệ với chúng tôi
          </h2>
          <p className="mt-2 text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Chúng tôi luôn lắng nghe bạn
          </p>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
            Mọi thắc mắc về chuyến đi hoặc phản hồi dịch vụ, đừng ngần ngại gửi
            tin nhắn cho đội ngũ hỗ trợ.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN: INFO CARDS */}
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-neutral-100 flex items-start space-x-4">
              <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
                <Phone size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Hotline 24/7
                </h3>
                <p className="text-gray-500 mt-1">1900 1234 - 090 123 4567</p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-neutral-100 flex items-start space-x-4">
              <div className="bg-green-100 p-3 rounded-xl text-green-600">
                <Mail size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Email</h3>
                <p className="text-gray-500 mt-1">support@vantai.com</p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-neutral-100 flex items-start space-x-4">
              <div className="bg-purple-100 p-3 rounded-xl text-purple-600">
                <MapPin size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Văn phòng chính
                </h3>
                <p className="text-gray-500 mt-1">
                  123 Đường ABC, Quận 1, TP. Hồ Chí Minh
                </p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-neutral-100 flex items-start space-x-4">
              <div className="bg-orange-100 p-3 rounded-xl text-orange-600">
                <Clock size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Giờ làm việc
                </h3>
                <p className="text-gray-500 mt-1">
                  Thứ 2 - Chủ Nhật: 05:00 - 23:00
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: CONTACT FORM */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl border border-neutral-100 overflow-hidden">
            <div className="p-8 md:p-12">
              <form
                action="#"
                method="POST"
                className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8"
              >
                <div>
                  <label
                    htmlFor="first-name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Họ và tên
                  </label>
                  <input
                    type="text"
                    className="mt-1 block w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                    placeholder="Nguyễn Văn A"
                  />
                </div>
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Số điện thoại
                  </label>
                  <input
                    type="text"
                    className="mt-1 block w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                    placeholder="09xx xxx xxx"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email (Không bắt buộc)
                  </label>
                  <input
                    type="email"
                    className="mt-1 block w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                    placeholder="email@vidu.com"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Nội dung tin nhắn
                  </label>
                  <textarea
                    rows={4}
                    className="mt-1 block w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                    placeholder="Bạn cần hỗ trợ điều gì?..."
                  />
                </div>
                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    className="w-full inline-flex items-center justify-center px-6 py-4 border border-transparent rounded-xl shadow-lg text-base font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform hover:-translate-y-1"
                  >
                    Gửi tin nhắn <Send className="ml-2" size={18} />
                  </button>
                </div>
              </form>
            </div>

            {/* SOCIAL MEDIA STRIP */}
            <div className="bg-neutral-50 p-6 flex justify-center space-x-8 border-t border-neutral-100">
              <a
                href="#"
                className="text-gray-400 hover:text-blue-600 transition-colors"
              >
                <Facebook size={24} />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-pink-600 transition-colors"
              >
                <Instagram size={24} />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-blue-400 transition-colors"
              >
                <Twitter size={24} />
              </a>
            </div>
          </div>
        </div>

        {/* MAP SECTION (Optional) */}
        <div className="mt-12 w-full h-[400px] rounded-2xl overflow-hidden shadow-sm grayscale hover:grayscale-0 transition-all duration-700">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4241674197627!2d106.699478315334!3d10.776654762095554!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f385570472f%3A0x178ef994bc924376!2zRGluaCDEkOG7mWMgTOG6rHA!5e0!3m2!1svi!2s!4v1625000000000!5m2!1svi!2s"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
