"use client";
import React from "react";
import { Github, Linkedin, Monitor, Zap, Shield, Star } from "lucide-react";
import { teamMembers } from "@/data/memberData";

const AboutCheckItOut = () => {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <section className="relative py-20 px-6 bg-gradient-to-b from-blue-50 to-white overflow-hidden">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white shadow-sm border border-blue-100 rounded-2xl text-blue-600 font-bold text-sm tracking-wide">
              <Star size={16} className="fill-blue-600" /> Hệ thống đặt vé thông
              minh
            </div>

            <h1 className="text-7xl font-black tracking-tight text-slate-900">
              Check<span className="text-blue-600">It</span>Out
            </h1>

            <p className="text-lg text-slate-600 leading-relaxed">
              Dự án <span className="font-bold text-blue-600">CheckItOut</span>{" "}
              ra đời với sứ mệnh đơn giản hóa việc di chuyển. Chúng tôi cung cấp
              giải pháp đặt vé xe bus nhanh gọn, minh bạch, giúp bạn khởi hành
              chuyến đi chỉ trong vài giây.
            </p>

            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 px-4 py-3 bg-white rounded-2xl shadow-sm border border-slate-100 font-semibold text-slate-700">
                <Zap size={18} className="text-yellow-500" /> Tốc độ xử lý tức
                thì
              </div>
              <div className="flex items-center gap-2 px-4 py-3 bg-white rounded-2xl shadow-sm border border-slate-100 font-semibold text-slate-700">
                <Shield size={18} className="text-blue-500" /> Thanh toán an
                toàn
              </div>
            </div>
          </div>

          <div className="flex-1 relative flex justify-center">
            <div className="w-80 h-80 bg-blue-500/10 rounded-full blur-3xl absolute -z-10 animate-pulse"></div>
            <div className="p-10 bg-white rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-slate-50 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700"></div>
              <Monitor size={64} className="text-blue-600 mb-6" />
              <h3 className="text-3xl font-bold mb-4">
                "Check it out, <br />
                Go anywhere."
              </h3>
              <p className="text-slate-500">
                Giao diện tối giản, tính năng tối đa.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl font-black uppercase tracking-tight text-slate-900">
              The Power of 4
            </h2>
            <div className="w-20 h-1.5 bg-blue-600 mx-auto rounded-full"></div>
            <p className="text-slate-500 max-w-md mx-auto">
              Đội ngũ người "cực kỳ thích ăn Chô li bi tại Việt Nam" đã hiện
              thực hóa ý tưởng này.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {teamMembers.map((member, idx) => (
              <div
                key={idx}
                className="group flex flex-col items-center text-center"
              >
                {/* Avatar Frame */}
                <div className="relative mb-6">
                  <div
                    className={`absolute inset-0 ${member.color} opacity-20 rounded-[2.5rem] rotate-6 group-hover:rotate-12 transition-transform duration-500`}
                  ></div>
                  <div className="relative w-48 h-56 bg-white shadow-xl rounded-[2.5rem] p-2 border border-slate-50 overflow-hidden">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover rounded-[2rem] group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                </div>

                {/* Info */}
                <h3 className="text-xl font-extrabold text-slate-900 mb-1">
                  {member.name}
                </h3>
                <span
                  className={`text-[10px] font-black uppercase tracking-[0.2em] mb-3 px-3 py-1 rounded-full bg-slate-100 text-slate-500 group-hover:bg-blue-600 group-hover:text-white transition-colors`}
                >
                  {member.role}
                </span>
                <p className="text-slate-500 text-sm leading-relaxed px-4">
                  {member.bio}
                </p>

                {/* Social links */}
                <div className="flex gap-4 mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <a
                    href="#"
                    className="p-2 bg-slate-100 rounded-full hover:bg-blue-100 text-slate-600 hover:text-blue-600 transition-all"
                  >
                    <Github size={18} />
                  </a>
                  <a
                    href="#"
                    className="p-2 bg-slate-100 rounded-full hover:bg-blue-100 text-slate-600 hover:text-blue-600 transition-all"
                  >
                    <Linkedin size={18} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutCheckItOut;
