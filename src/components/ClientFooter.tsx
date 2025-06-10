// src/components/ClientFooter.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '@/assets/logo';
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  MapPin,
  Phone,
  Mail,
} from 'lucide-react';

export const ClientFooter = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-slate-900 text-slate-300 dark:bg-gray-950 dark:text-slate-400 border-t border-slate-800 dark:border-slate-700/50">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Column 1: Logo và Giới thiệu ngắn */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <Logo className="h-10 w-10 text-white" />{' '}
              {/* Logo màu trắng trên nền tối */}
              <span className="font-bold text-2xl text-white">PTIT Events</span>
            </Link>
            <p className="text-sm leading-relaxed">
              Hệ thống quản lý sự kiện và cơ sở vật chất chính thức của Học viện
              Công nghệ Bưu chính Viễn thông - Cơ sở TP.HCM.
            </p>
            <div className="flex space-x-4 mt-4">
              <a
                href="#"
                aria-label="Facebook PTIT"
                className="text-slate-400 hover:text-white transition-colors"
              >
                <Facebook size={20} />
              </a>
              <a
                href="#"
                aria-label="Twitter PTIT"
                className="text-slate-400 hover:text-white transition-colors"
              >
                <Twitter size={20} />
              </a>
              <a
                href="#"
                aria-label="Instagram PTIT"
                className="text-slate-400 hover:text-white transition-colors"
              >
                <Instagram size={20} />
              </a>
              <a
                href="#"
                aria-label="Youtube PTIT"
                className="text-slate-400 hover:text-white transition-colors"
              >
                <Youtube size={20} />
              </a>
            </div>
          </div>

          {/* Column 2: Liên kết nhanh */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 tracking-wide">
              Khám Phá
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link
                  to="/"
                  className="hover:text-white transition-colors text-sm"
                >
                  Trang Chủ
                </Link>
              </li>
              <li>
                <Link
                  to="/events-public"
                  className="hover:text-white transition-colors text-sm"
                >
                  Lịch Sự Kiện
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="hover:text-white transition-colors text-sm"
                >
                  Giới Thiệu
                </Link>
              </li>
              <li>
                <Link
                  to="/news"
                  className="hover:text-white transition-colors text-sm"
                >
                  Tin Tức
                </Link>
              </li>{' '}
              {/* Giả sử có trang tin tức */}
            </ul>
          </div>

          {/* Column 3: Hỗ trợ */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 tracking-wide">
              Hỗ Trợ
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link
                  to="/faq"
                  className="hover:text-white transition-colors text-sm"
                >
                  Câu Hỏi Thường Gặp
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="hover:text-white transition-colors text-sm"
                >
                  Liên Hệ
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="hover:text-white transition-colors text-sm"
                >
                  Điều Khoản Dịch Vụ
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="hover:text-white transition-colors text-sm"
                >
                  Chính Sách Bảo Mật
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Liên hệ */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 tracking-wide">
              Thông Tin Liên Hệ
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 mr-2.5 mt-0.5 flex-shrink-0 text-slate-400" />
                <span>97 Man Thiện, P. Hiệp Phú, TP. Thủ Đức, TP.HCM</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 mr-2.5 flex-shrink-0 text-slate-400" />
                <a
                  href="mailto:info@ptithcm.edu.vn"
                  className="hover:text-white transition-colors"
                >
                  info@ptithcm.edu.vn
                </a>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 mr-2.5 flex-shrink-0 text-slate-400" />
                <a
                  href="tel:+842837307979"
                  className="hover:text-white transition-colors"
                >
                  (028) 3730 7979
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-700 dark:border-slate-600/50 mt-10 pt-8 text-center">
          <p className="text-sm">
            © {currentYear} Học viện Công nghệ Bưu chính Viễn thông - Cơ sở tại
            TP. Hồ Chí Minh.
            <br className="sm:hidden" /> Bảo lưu mọi quyền.
          </p>
          <p className="text-xs mt-2">
            Phát triển bởi Nhóm 7 - Chiến Thần với ❤️
          </p>
        </div>
      </div>
    </footer>
  );
};
