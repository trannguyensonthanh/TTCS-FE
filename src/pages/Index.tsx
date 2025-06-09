import React from 'react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import {
  ChevronRight,
  Calendar,
  Users,
  Award,
  GraduationCap,
  Bookmark,
  MapPin,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { PTITLogo } from '@/assets/logo';

// Mock upcoming events
const upcomingEvents = [
  {
    id: '1',
    title: 'PTIT Hackathon 2024',
    date: '27/06/2024',
    location: 'Khu vực thực hành',
    imageUrl:
      'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1170',
  },
  {
    id: '2',
    title: 'Ngày hội việc làm CNTT',
    date: '15/07/2024',
    location: 'Hội trường A',
    imageUrl:
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1170',
  },
  {
    id: '3',
    title: 'Hội nghị Khoa học Sinh viên',
    date: '05/08/2024',
    location: 'Phòng hội thảo B3-01',
    imageUrl:
      'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=1170',
  },
];

// Mock testimonials
const testimonials = [
  {
    id: '1',
    name: 'Nguyễn Văn A',
    role: 'Sinh viên năm 3, ngành CNTT',
    quote:
      'Các sự kiện tại PTITHCM luôn được tổ chức chuyên nghiệp, mang lại nhiều kiến thức và kỹ năng hữu ích.',
    imageUrl:
      'https://api.dicebear.com/7.x/micah/svg?seed=Nguy%E1%BB%85n%20V%C4%83n%20A&backgroundColor=1e88e5',
  },
  {
    id: '2',
    name: 'Trần Minh B',
    role: 'Giảng viên Khoa CNTT',
    quote:
      'Tôi rất hài lòng với hệ thống quản lý sự kiện mới, giúp việc tổ chức và điều phối trở nên dễ dàng hơn nhiều.',
    imageUrl:
      'https://api.dicebear.com/7.x/micah/svg?seed=Tr%E1%BA%A7n%20Minh%20B&backgroundColor=d32f2f',
  },
  {
    id: '3',
    name: 'Lê Thị C',
    role: 'Trưởng CLB Truyền thông',
    quote:
      'Nhờ sự hỗ trợ của các bộ phận quản lý, CLB chúng tôi đã tổ chức thành công nhiều sự kiện lớn trong năm học vừa qua.',
    imageUrl:
      'https://api.dicebear.com/7.x/micah/svg?seed=L%C3%AA%20Th%E1%BB%8B%20C&backgroundColor=1e88e5',
  },
];

const Index = () => {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1170"
              alt="PTITHCM Campus"
              className="object-cover w-full h-full"
            />
            <div className="absolute inset-0 bg-black bg-opacity-60"></div>
          </div>

          <div className="relative container mx-auto px-6 py-32 flex flex-col items-start">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-3xl"
            >
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Chào mừng bạn đến với Học viện Công nghệ Bưu chính Viễn thông –
                Cơ sở TP.HCM (PTITHCM)
              </h1>
              <p className="text-xl text-white/90 mb-8">
                Nơi kết nối tri thức, sáng tạo và đổi mới trong lĩnh vực công
                nghệ thông tin và truyền thông
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" asChild>
                  <a href="#about">
                    Tìm hiểu thêm
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </a>
                </Button>

                {!isAuthenticated && (
                  <Button
                    size="lg"
                    variant="outline"
                    className="bg-white/10 text-white"
                    asChild
                  >
                    <Link to="/login">Đăng nhập</Link>
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-16 bg-white dark:bg-gray-950">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Giới thiệu về PTITHCM</h2>
              <div className="w-24 h-1 bg-red-600 mx-auto"></div>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <h3 className="text-2xl font-bold mb-4">Lịch sử và Sứ mệnh</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Học viện Công nghệ Bưu chính Viễn thông cơ sở tại TP.HCM
                  (PTITHCM), được thành lập từ năm 1997, là cơ sở đào tạo công
                  lập trực thuộc Bộ Thông tin và Truyền thông.
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  Với sứ mệnh đào tạo nguồn nhân lực chất lượng cao trong lĩnh
                  vực công nghệ thông tin, điện tử viễn thông và kinh tế,
                  PTITHCM không ngừng phát triển và khẳng định vị thế là một
                  trong những cơ sở đào tạo hàng đầu về CNTT ở Việt Nam.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="rounded-lg overflow-hidden shadow-lg"
              >
                <img
                  src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1170"
                  alt="PTITHCM Campus"
                  className="w-full h-[300px] object-cover"
                />
              </motion.div>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mt-16">
              <Card>
                <CardHeader>
                  <GraduationCap className="h-8 w-8 text-red-600 mb-2" />
                  <CardTitle>Đào tạo</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400">
                    Chương trình đào tạo hiện đại, đáp ứng nhu cầu thực tế của
                    thị trường lao động trong lĩnh vực CNTT.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Bookmark className="h-8 w-8 text-blue-600 mb-2" />
                  <CardTitle>Nghiên cứu</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400">
                    Nghiên cứu khoa học và phát triển công nghệ luôn được chú
                    trọng với nhiều đề tài, dự án có giá trị thực tiễn cao.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Calendar className="h-8 w-8 text-green-600 mb-2" />
                  <CardTitle>Sự kiện</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400">
                    Thường xuyên tổ chức các sự kiện học thuật, hội thảo,
                    workshop và hoạt động ngoại khóa phong phú.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Event Highlights Section */}
        <section className="py-16 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Sự kiện nổi bật</h2>
              <div className="w-24 h-1 bg-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                Khám phá những sự kiện sắp diễn ra tại PTITHCM
              </p>
            </div>

            <div className="md:max-w-4xl mx-auto">
              <Carousel
                opts={{
                  align: 'center',
                  loop: true,
                }}
                className="w-full"
              >
                <CarouselContent>
                  {upcomingEvents.map((event) => (
                    <CarouselItem
                      key={event.id}
                      className="md:basis-1/2 lg:basis-1/3 p-2"
                    >
                      <div className="h-full">
                        <Card className="h-full">
                          <div className="aspect-video relative overflow-hidden">
                            <img
                              src={event.imageUrl}
                              alt={event.title}
                              className="object-cover w-full h-full"
                            />
                          </div>
                          <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-lg">
                              {event.title}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-4 pt-0 space-y-2">
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Calendar className="mr-1 h-4 w-4" />
                              <span>{event.date}</span>
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <MapPin className="mr-1 h-4 w-4" />
                              <span>{event.location}</span>
                            </div>
                          </CardContent>
                          <CardFooter className="p-4 pt-0">
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full"
                            >
                              Chi tiết
                            </Button>
                          </CardFooter>
                        </Card>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <div className="flex justify-center mt-6">
                  <CarouselPrevious className="relative mr-2" />
                  <CarouselNext className="relative" />
                </div>
              </Carousel>

              <div className="text-center mt-8">
                <Link to="/events">
                  <Button>
                    Xem tất cả sự kiện
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16 bg-white dark:bg-gray-950">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                Đánh giá từ người tham gia
              </h2>
              <div className="w-24 h-1 bg-red-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                Những chia sẻ từ sinh viên và giảng viên đã tham gia sự kiện
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, idx) => (
                <motion.div
                  key={testimonial.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full">
                    <CardContent className="p-6 flex flex-col h-full">
                      <div className="mb-4">
                        <svg
                          className="h-10 w-10 text-gray-300 dark:text-gray-700"
                          fill="currentColor"
                          viewBox="0 0 32 32"
                        >
                          <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                        </svg>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 flex-grow">
                        {testimonial.quote}
                      </p>
                      <div className="flex items-center mt-6">
                        <div className="h-12 w-12 rounded-full overflow-hidden">
                          <img
                            src={testimonial.imageUrl}
                            alt={testimonial.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="ml-4">
                          <p className="font-medium">{testimonial.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {testimonial.role}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Statistics Section */}
        <section className="py-16 bg-gradient-to-r from-red-600 to-blue-600 text-white">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <h3 className="text-4xl font-bold mb-2">15+</h3>
                <p className="text-white/80">Năm kinh nghiệm</p>
              </div>
              <div>
                <h3 className="text-4xl font-bold mb-2">10,000+</h3>
                <p className="text-white/80">Sinh viên</p>
              </div>
              <div>
                <h3 className="text-4xl font-bold mb-2">200+</h3>
                <p className="text-white/80">Sự kiện mỗi năm</p>
              </div>
              <div>
                <h3 className="text-4xl font-bold mb-2">50+</h3>
                <p className="text-white/80">Đối tác doanh nghiệp</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">
                Sẵn sàng tham gia sự kiện tại PTITHCM?
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                Khám phá các sự kiện đang diễn ra và sắp diễn ra tại học viện
                của chúng tôi
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/events">
                  <Button size="lg">
                    Xem danh sách sự kiện
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>

                {!isAuthenticated && (
                  <Link to="/login">
                    <Button size="lg" variant="outline">
                      Đăng nhập
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer Section */}
      {/* <footer className="bg-gray-900 text-white">
        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <PTITLogo size={40} />
              </div>
              <p className="text-gray-400 mb-4">
                Học viện Công nghệ Bưu chính Viễn thông – Cơ sở TP.HCM (PTITHCM)
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm4.225 8.16c.004.09.006.18.006.27 0 2.73-2.078 5.87-5.876 5.87a5.83 5.83 0 01-3.158-.926 4.126 4.126 0 003.042-.85 2.054 2.054 0 01-1.918-1.425 2.056 2.056 0 00.928-.034 2.054 2.054 0 01-1.645-2.013v-.026c.277.154.594.247.93.257a2.052 2.052 0 01-.635-2.74 5.83 5.83 0 004.234 2.148 2.053 2.053 0 013.5-1.87 4.126 4.126 0 001.304-.499 2.059 2.059 0 01-.902 1.133 4.113 4.113 0 001.18-.323 4.148 4.148 0 01-1.025 1.064z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 6.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7zm7 3.5a7 7 0 11-14 0 7 7 0 0114 0zm-4.499-3.15a.851.851 0 100-1.7.851.851 0 000 1.7z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm-4.5 6.5h-3v9h-2v-9h-2v-2h2v-1c0-1.88 1.09-2.5 3.5-2.5h2v2h-1c-.55 0-1 .45-1 1v.5h2.5l-.5 2z" />
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Liên kết nhanh</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Trang chủ</a></li>
                <li><a href="#about" className="text-gray-400 hover:text-white">Giới thiệu</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Tuyển sinh</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Đào tạo</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Nghiên cứu</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Sự kiện</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Lịch sự kiện</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Sự kiện nổi bật</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Đăng ký tham gia</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Tổ chức sự kiện</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Liên hệ</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <MapPin className="h-5 w-5 mr-2 text-gray-400 mt-0.5" />
                  <span className="text-gray-400">
                    97 Man Thiện, P. Hiệp Phú, TP. Thủ Đức, TP.HCM
                  </span>
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <a href="mailto:info@ptithcm.edu.vn" className="text-gray-400 hover:text-white">
                    info@ptithcm.edu.vn
                  </a>
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <a href="tel:+842837307979" className="text-gray-400 hover:text-white">
                    (028) 3730 7979
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2024 Học viện Công nghệ Bưu chính Viễn thông – Cơ sở TP.HCM. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white text-sm">Điều khoản sử dụng</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm">Chính sách bảo mật</a>
            </div>
          </div>
        </div>
      </footer> */}
    </div>
  );
};

export default Index;
