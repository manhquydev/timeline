import Link from 'next/link'

export const metadata = {
  title: 'Chính sách bảo mật | Timeline Teky Hoàng Mai',
  description: 'Chính sách bảo mật thông tin người dùng của Timeline Teky Hoàng Mai',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors group mb-6"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span>
            Quay lại trang chủ
          </Link>
          <h1 className="text-4xl font-bold text-slate-900 mb-3">Chính sách bảo mật</h1>
          <p className="text-slate-600">Cập nhật lần cuối: 18 tháng 10, 2025</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
          <div className="p-8 md:p-12 space-y-8">
            {/* Introduction */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900">Giới thiệu</h2>
              <p className="text-slate-700 leading-relaxed text-justify">
                Timeline Teky Hoàng Mai (&quot;chúng tôi&quot;, &quot;của chúng tôi&quot;) cam kết bảo vệ quyền riêng tư của bạn. Chính sách bảo mật này giải thích cách chúng tôi thu thập, sử dụng, lưu trữ và bảo vệ thông tin cá nhân của bạn khi bạn sử dụng dịch vụ của chúng tôi.
              </p>
            </section>

            {/* Section 1 */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900">1. Thông tin chúng tôi thu thập</h2>
              <div className="space-y-3 text-slate-700">
                <p className="leading-relaxed text-justify">
                  <span className="font-semibold">1.1 Thông tin bạn cung cấp:</span>
                </p>
                <ul className="list-disc list-inside space-y-2 pl-4">
                  <li>Địa chỉ email khi đăng ký tài khoản</li>
                  <li>Tên hiển thị và thông tin hồ sơ (nếu bạn chọn cung cấp)</li>
                  <li>Ảnh và nội dung bạn tải lên</li>
                  <li>Bình luận và tương tác với nội dung khác</li>
                </ul>
                <p className="leading-relaxed text-justify pt-3">
                  <span className="font-semibold">1.2 Thông tin tự động thu thập:</span>
                </p>
                <ul className="list-disc list-inside space-y-2 pl-4">
                  <li>Địa chỉ IP và thông tin thiết bị</li>
                  <li>Loại trình duyệt và hệ điều hành</li>
                  <li>Thời gian truy cập và các trang bạn xem</li>
                  <li>Cookie và công nghệ theo dõi tương tự</li>
                </ul>
              </div>
            </section>

            {/* Section 2 */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900">2. Cách chúng tôi sử dụng thông tin</h2>
              <p className="text-slate-700 leading-relaxed text-justify">
                Chúng tôi sử dụng thông tin thu thập được cho các mục đích sau:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700 pl-4">
                <li>Cung cấp, vận hành và duy trì dịch vụ của chúng tôi</li>
                <li>Cải thiện, cá nhân hóa và mở rộng dịch vụ</li>
                <li>Hiểu và phân tích cách bạn sử dụng dịch vụ</li>
                <li>Phát triển tính năng, sản phẩm và dịch vụ mới</li>
                <li>Giao tiếp với bạn về cập nhật, thông báo và hỗ trợ</li>
                <li>Phát hiện và ngăn chặn gian lận, lạm dụng hoặc hoạt động bất hợp pháp</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900">3. Chia sẻ thông tin</h2>
              <div className="space-y-3 text-slate-700">
                <p className="leading-relaxed text-justify">
                  <span className="font-semibold">3.1 Chia sẻ công khai:</span> Ảnh và nội dung bạn tải lên có thể được xem bởi người dùng khác trong phạm vi công ty.
                </p>
                <p className="leading-relaxed text-justify">
                  <span className="font-semibold">3.2 Nhà cung cấp dịch vụ:</span> Chúng tôi có thể chia sẻ thông tin với các nhà cung cấp dịch vụ bên thứ ba để:
                </p>
                <ul className="list-disc list-inside space-y-2 pl-4">
                  <li>Lưu trữ dữ liệu (MongoDB Atlas, Supabase)</li>
                  <li>Xác thực người dùng (Supabase Auth)</li>
                  <li>Phân tích dịch vụ</li>
                </ul>
                <p className="leading-relaxed text-justify pt-3">
                  <span className="font-semibold">3.3 Yêu cầu pháp lý:</span> Chúng tôi có thể tiết lộ thông tin nếu được yêu cầu bởi pháp luật hoặc để bảo vệ quyền và an toàn của chúng tôi và người dùng.
                </p>
                <p className="leading-relaxed text-justify">
                  <span className="font-semibold">3.4 Không bán thông tin:</span> Chúng tôi không bán, cho thuê hoặc trao đổi thông tin cá nhân của bạn với bên thứ ba cho mục đích tiếp thị.
                </p>
              </div>
            </section>

            {/* Section 4 */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900">4. Bảo mật thông tin</h2>
              <p className="text-slate-700 leading-relaxed text-justify">
                Chúng tôi thực hiện các biện pháp bảo mật kỹ thuật và tổ chức phù hợp để bảo vệ thông tin cá nhân của bạn:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700 pl-4">
                <li>Mã hóa dữ liệu khi truyền tải (SSL/TLS)</li>
                <li>Xác thực an toàn qua Supabase Auth</li>
                <li>Kiểm soát truy cập dựa trên vai trò</li>
                <li>Giám sát và ghi log hoạt động hệ thống</li>
                <li>Sao lưu dữ liệu định kỳ</li>
              </ul>
              <p className="text-slate-700 leading-relaxed text-justify pt-3">
                Tuy nhiên, không có phương thức truyền tải qua Internet hoặc lưu trữ điện tử nào là 100% an toàn. Chúng tôi không thể đảm bảo tuyệt đối về bảo mật.
              </p>
            </section>

            {/* Section 5 */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900">5. Lưu trữ và xóa dữ liệu</h2>
              <div className="space-y-3 text-slate-700">
                <p className="leading-relaxed text-justify">
                  <span className="font-semibold">5.1 Thời gian lưu trữ:</span> Chúng tôi lưu trữ thông tin cá nhân của bạn miễn là tài khoản của bạn còn hoạt động hoặc cần thiết để cung cấp dịch vụ.
                </p>
                <p className="leading-relaxed text-justify">
                  <span className="font-semibold">5.2 Xóa tài khoản:</span> Bạn có thể yêu cầu xóa tài khoản và dữ liệu liên quan bất kỳ lúc nào bằng cách liên hệ với chúng tôi.
                </p>
                <p className="leading-relaxed text-justify">
                  <span className="font-semibold">5.3 Lưu trữ sau khi xóa:</span> Một số thông tin có thể được lưu trữ trong bản sao lưu trong thời gian giới hạn theo yêu cầu pháp lý hoặc kỹ thuật.
                </p>
              </div>
            </section>

            {/* Section 6 */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900">6. Quyền của bạn</h2>
              <p className="text-slate-700 leading-relaxed text-justify">
                Bạn có các quyền sau đối với thông tin cá nhân của mình:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700 pl-4">
                <li><span className="font-semibold">Quyền truy cập:</span> Yêu cầu một bản sao thông tin cá nhân của bạn</li>
                <li><span className="font-semibold">Quyền chỉnh sửa:</span> Cập nhật hoặc sửa thông tin không chính xác</li>
                <li><span className="font-semibold">Quyền xóa:</span> Yêu cầu xóa thông tin cá nhân của bạn</li>
                <li><span className="font-semibold">Quyền hạn chế:</span> Yêu cầu hạn chế xử lý thông tin của bạn</li>
                <li><span className="font-semibold">Quyền phản đối:</span> Phản đối việc xử lý thông tin của bạn</li>
              </ul>
              <p className="text-slate-700 leading-relaxed text-justify pt-3">
                Để thực hiện các quyền này, vui lòng liên hệ với chúng tôi qua các kênh hỗ trợ chính thức.
              </p>
            </section>

            {/* Section 7 */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900">7. Cookie và công nghệ theo dõi</h2>
              <p className="text-slate-700 leading-relaxed text-justify">
                Chúng tôi sử dụng cookie và công nghệ tương tự để:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700 pl-4">
                <li>Duy trì phiên đăng nhập của bạn</li>
                <li>Ghi nhớ tùy chọn của bạn</li>
                <li>Phân tích cách bạn sử dụng dịch vụ</li>
                <li>Cải thiện trải nghiệm người dùng</li>
              </ul>
              <p className="text-slate-700 leading-relaxed text-justify pt-3">
                Bạn có thể kiểm soát cookie thông qua cài đặt trình duyệt của mình. Tuy nhiên, việc vô hiệu hóa cookie có thể ảnh hưởng đến chức năng của dịch vụ.
              </p>
            </section>

            {/* Section 8 */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900">8. Người dùng dưới 16 tuổi</h2>
              <p className="text-slate-700 leading-relaxed text-justify">
                Dịch vụ của chúng tôi không dành cho người dưới 16 tuổi. Chúng tôi không cố ý thu thập thông tin cá nhân từ trẻ em dưới 16 tuổi. Nếu bạn là phụ huynh hoặc người giám hộ và biết rằng con bạn đã cung cấp thông tin cá nhân cho chúng tôi, vui lòng liên hệ với chúng tôi.
              </p>
            </section>

            {/* Section 9 */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900">9. Thay đổi chính sách</h2>
              <p className="text-slate-700 leading-relaxed text-justify">
                Chúng tôi có thể cập nhật Chính sách bảo mật này theo thời gian. Chúng tôi sẽ thông báo cho bạn về bất kỳ thay đổi nào bằng cách đăng Chính sách bảo mật mới trên trang này và cập nhật &quot;Ngày cập nhật lần cuối&quot; ở đầu trang. Bạn nên xem lại Chính sách bảo mật này định kỳ để biết về bất kỳ thay đổi nào.
              </p>
            </section>

            {/* Section 10 */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900">10. Liên hệ</h2>
              <p className="text-slate-700 leading-relaxed text-justify">
                Nếu bạn có bất kỳ câu hỏi, thắc mắc hoặc yêu cầu nào về Chính sách bảo mật này hoặc cách chúng tôi xử lý thông tin cá nhân của bạn, vui lòng liên hệ với chúng tôi qua:
              </p>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mt-3">
                <p className="text-slate-700">
                  <span className="font-semibold">Email:</span> Liên hệ qua kênh hỗ trợ chính thức của công ty<br />
                  <span className="font-semibold">Thời gian phản hồi:</span> Trong vòng 3-5 ngày làm việc
                </p>
              </div>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500 mb-4">
            Chính sách bảo mật này có hiệu lực kể từ ngày 18 tháng 10, 2025.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/terms"
              className="text-sm text-slate-600 hover:text-slate-900 font-medium transition-colors"
            >
              Điều khoản dịch vụ
            </Link>
            <span className="text-slate-300">•</span>
            <Link
              href="/"
              className="text-sm text-slate-600 hover:text-slate-900 font-medium transition-colors"
            >
              Trang chủ
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
