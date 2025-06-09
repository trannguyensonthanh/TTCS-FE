import React from 'react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { PTITLogo } from '@/assets/logo';
import { motion } from 'framer-motion';
import {
  Users, // Cho Đội ngũ/Đối tượng
  Target, // Cho Sứ mệnh
  Eye, // Cho Tầm nhìn
  Award, // Cho Thành tựu/Giá trị
  History, // Cho Lịch sử
  Zap, // Cho Lợi ích/Hiện đại hóa
  Layers, // Cho Hệ thống
  Info, // Cho Giới thiệu chung
  ChevronRight,
  HeartHandshake, // Cho Giá trị cốt lõi
  Lightbulb, // Cho Đổi mới
  Cpu, // Cho Công nghệ
  UsersIcon,
} from 'lucide-react';

// Nên có một component Footer chung
const Footer = () => (
  <footer className="bg-slate-900 text-slate-300 dark:bg-gray-950 dark:text-gray-400 border-t dark:border-slate-800">
    <div className="container mx-auto px-6 py-12 text-center">
      <PTITLogo size={48} className="mx-auto mb-4 text-white" />
      <p className="mb-2">
        Học viện Công nghệ Bưu chính Viễn thông – Cơ sở tại TP. Hồ Chí Minh
        (PTITHCM)
      </p>
      <p className="text-sm text-slate-400 dark:text-gray-500">
        © {new Date().getFullYear()} PTITHCM. Phát triển bởi [Tên Của Bạn/Nhóm].
      </p>
    </div>
  </footer>
);

const AboutPage = () => {
  const fadeInProps = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.3 },
    transition: { duration: 0.6, ease: 'easeOut' },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: 'easeOut',
      },
    }),
  };

  const values = [
    {
      icon: Lightbulb,
      title: 'Đổi Mới Sáng Tạo',
      description:
        'Luôn tiên phong trong nghiên cứu và ứng dụng công nghệ mới vào giáo dục và đời sống.',
    },
    {
      icon: Users,
      title: 'Con Người Làm Trung Tâm',
      description:
        'Tạo môi trường học tập và làm việc năng động, tôn trọng sự khác biệt và phát triển cá nhân.',
    },
    {
      icon: HeartHandshake,
      title: 'Hợp Tác Bền Vững',
      description:
        'Xây dựng mối quan hệ đối tác tin cậy với doanh nghiệp, tổ chức trong và ngoài nước.',
    },
    {
      icon: Award,
      title: 'Chất Lượng Hàng Đầu',
      description:
        'Cam kết chất lượng đào tạo và nghiên cứu đạt chuẩn quốc tế, đáp ứng nhu cầu xã hội.',
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background dark:bg-slate-950 text-foreground">
      {/* Hero Section */}
      <motion.section
        className="relative h-[60vh] md:h-[70vh] flex items-center justify-center text-center text-white overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <img
          src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1974&auto=format&fit=crop" // Thay bằng ảnh PTITHCM chất lượng cao
          alt="Khuôn viên PTITHCM"
          className="absolute inset-0 w-full h-full object-cover filter brightness-50"
        />
        <div className="relative z-10 p-6 max-w-4xl flex flex-col items-center">
          <motion.div
            {...fadeInProps}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col items-center"
          >
            <PTITLogo size={72} className="mb-6 drop-shadow-lg mx-auto" />
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6 drop-shadow-md text-center">
              Khám Phá PTITHCM
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl opacity-90 mb-8 max-w-3xl mx-auto drop-shadow-sm text-center">
              Nơi hội tụ tri thức, công nghệ và những cơ hội phát triển không
              giới hạn trong kỷ nguyên số.
            </p>
            <Button
              size="lg"
              className="bg-ptit-red hover:bg-red-700 dark:bg-ptit-blue dark:hover:bg-blue-700 text-white text-lg px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              asChild
            >
              <Link to="/events-public">
                Xem Lịch Sự Kiện <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </motion.section>

      <main className="flex-1">
        {/* Về Chúng Tôi Section */}
        <section className="py-16 lg:py-24 bg-card dark:bg-slate-900">
          <div className="container mx-auto px-6">
            <motion.div
              {...fadeInProps}
              className="text-center max-w-3xl mx-auto mb-12 lg:mb-16"
            >
              <Info className="h-12 w-12 text-primary dark:text-ptit-red mx-auto mb-4" />
              <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4">
                Về Học Viện PTITHCM
              </h2>
              <p className="text-lg text-muted-foreground">
                Học viện Công nghệ Bưu chính Viễn thông cơ sở tại TP. Hồ Chí
                Minh (PTITHCM), một trong những đơn vị đào tạo và nghiên cứu
                hàng đầu về Công nghệ Thông tin và Truyền thông tại Việt Nam.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-center">
              <motion.div {...fadeInProps}>
                <h3 className="text-2xl font-semibold mb-3 text-primary dark:text-ptit-red">
                  Lịch Sử & Sứ Mệnh
                </h3>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  Được thành lập từ năm 1997, PTITHCM đã trải qua một hành trình
                  phát triển không ngừng, đóng góp quan trọng vào việc đào tạo
                  nguồn nhân lực chất lượng cao, đáp ứng nhu cầu của cuộc Cách
                  mạng Công nghiệp 4.0.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Sứ mệnh của chúng tôi là trở thành một trung tâm đào tạo,
                  nghiên cứu khoa học và chuyển giao công nghệ xuất sắc, có uy
                  tín trong nước và quốc tế, đặc biệt trong các lĩnh vực mũi
                  nhọn của ngành Thông tin và Truyền thông.
                </p>
              </motion.div>
              <motion.div
                {...fadeInProps}
                className="rounded-xl overflow-hidden shadow-2xl"
              >
                <img
                  src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1170"
                  alt="Hoạt động tại PTITHCM"
                  className="w-full h-auto object-cover transition-transform duration-500 hover:scale-105"
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Giá trị cốt lõi */}
        <section className="py-16 lg:py-24 bg-background dark:bg-slate-950">
          <div className="container mx-auto px-6">
            <motion.div
              {...fadeInProps}
              className="text-center max-w-3xl mx-auto mb-12 lg:mb-16"
            >
              <Target className="h-12 w-12 text-primary dark:text-ptit-red mx-auto mb-4" />
              <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4">
                Giá Trị Cốt Lõi
              </h2>
              <p className="text-lg text-muted-foreground">
                Những nền tảng định hướng mọi hoạt động của Học viện.
              </p>
            </motion.div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  custom={index}
                  variants={cardVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                >
                  <Card className="text-center h-full hover:shadow-xl transition-shadow duration-300 dark:bg-slate-800/50 dark:border-slate-700">
                    <CardHeader className="items-center">
                      <div className="p-3 bg-primary/10 dark:bg-ptit-red/10 rounded-full mb-3">
                        <value.icon className="h-8 w-8 text-primary dark:text-ptit-red" />
                      </div>
                      <CardTitle className="text-xl">{value.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {value.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Về Hệ Thống Quản Lý Sự Kiện */}
        <section className="py-16 lg:py-24 bg-muted/30 dark:bg-slate-900">
          <div className="container mx-auto px-6">
            <motion.div
              {...fadeInProps}
              className="text-center max-w-3xl mx-auto mb-12 lg:mb-16"
            >
              <Layers className="h-12 w-12 text-primary dark:text-ptit-red mx-auto mb-4" />
              <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4">
                Hệ Thống Quản Lý Sự Kiện & CSVC
              </h2>
              <p className="text-lg text-muted-foreground">
                Một giải pháp số hóa toàn diện, được xây dựng để tối ưu hóa và
                nâng cao hiệu quả công tác tổ chức sự kiện và quản lý cơ sở vật
                chất tại PTITHCM.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-center">
              <motion.div
                {...fadeInProps}
                className="rounded-xl overflow-hidden shadow-2xl order-1 md:order-2"
              >
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1171"
                  alt="Hệ thống quản lý"
                  className="w-full h-auto object-cover transition-transform duration-500 hover:scale-105"
                />
              </motion.div>
              <motion.div {...fadeInProps} className="order-2 md:order-1">
                <h3 className="text-2xl font-semibold mb-3 text-primary dark:text-ptit-red">
                  Mục Tiêu & Lợi Ích
                </h3>
                <ul className="space-y-3 text-muted-foreground leading-relaxed">
                  <li className="flex items-start">
                    <Zap className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                    <span>
                      <b>Hiện đại hóa quy trình:</b> Tự động hóa các bước từ đề
                      xuất, phê duyệt đến triển khai sự kiện và bố trí phòng.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Cpu className="h-5 w-5 text-blue-500 mr-3 mt-1 flex-shrink-0" />
                    <span>
                      <b>Tối ưu nguồn lực:</b> Quản lý hiệu quả việc sử dụng
                      phòng họp, hội trường, thiết bị, tránh lãng phí và trùng
                      lắp.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Info className="h-5 w-5 text-yellow-500 mr-3 mt-1 flex-shrink-0" />
                    <span>
                      <b>Minh bạch thông tin:</b> Cung cấp một kênh thông tin
                      tập trung, dễ dàng tra cứu lịch sự kiện và tình trạng
                      phòng.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Users className="h-5 w-5 text-purple-500 mr-3 mt-1 flex-shrink-0" />
                    <span>
                      <b>Nâng cao trải nghiệm:</b> Giao diện thân thiện, dễ sử
                      dụng cho mọi đối tượng người dùng trong Học viện.
                    </span>
                  </li>
                </ul>
                <Button
                  size="lg"
                  className="mt-8 bg-ptit-blue hover:bg-blue-700 dark:bg-ptit-red dark:hover:bg-red-700 text-white"
                  asChild
                >
                  <Link to="/login">Truy Cập Hệ Thống</Link>
                </Button>
              </motion.div>
            </div>
          </div>
        </section>

        {/* (Tùy chọn) Section Đội Ngũ Phát Triển */}

        <section className="py-16 lg:py-24 bg-card dark:bg-slate-900">
          <div className="container mx-auto px-6">
            <motion.div
              {...fadeInProps}
              className="text-center max-w-3xl mx-auto mb-12 lg:mb-16"
            >
              <UsersIcon className="h-12 w-12 text-primary dark:text-ptit-red mx-auto mb-4" />
              <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4">
                Đội Ngũ Phát Triển
              </h2>
              <p className="text-lg text-muted-foreground">
                Sản phẩm này là kết quả của niềm đam mê và nỗ lực của nhóm 7 -
                Chiến Thần
              </p>
            </motion.div>
            {/* Thông tin của bạn/nhóm */}
          </div>
        </section>
      </main>
    </div>
  );
};

export default AboutPage;
