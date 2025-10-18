import Link from 'next/link'

export const metadata = {
  title: 'Điều khoản dịch vụ | Timeline Teky Hoàng Mai',
  description: 'Điều khoản và điều kiện sử dụng dịch vụ Timeline Teky Hoàng Mai',
}

export default function TermsPage() {
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
          <h1 className="text-4xl font-bold text-slate-900 mb-3">Điều khoản dịch vụ</h1>
          <p className="text-slate-600">Cập nhật lần cuối: 18 tháng 10, 2025</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
          <div className="p-8 md:p-12 space-y-8">
            {/* Section 1 */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900">1. Chấp nhận điều khoản</h2>
              <p className="text-slate-700 leading-relaxed text-justify">
                Bằng việc truy cập và sử dụng Timeline Teky Hoàng Mai (&quot;Dịch vụ&quot;), bạn đồng ý tuân thủ và bị ràng buộc bởi các điều khoản và điều kiện sau đây. Nếu bạn không đồng ý với bất kỳ phần nào của các điều khoản này, vui lòng không sử dụng Dịch vụ.
              </p>
            </section>

            {/* Section 2 */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900">2. Mô tả dịch vụ</h2>
              <p className="text-slate-700 leading-relaxed text-justify">
                Timeline Teky Hoàng Mai là nền tảng chia sẻ ảnh và kỷ niệm dành cho các sự kiện của công ty Teky Hoàng Mai. Dịch vụ cho phép người dùng:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700 pl-4">
                <li>Tải lên và chia sẻ ảnh từ các sự kiện công ty</li>
                <li>Xem và tương tác với nội dung từ đồng nghiệp</li>
                <li>Lưu trữ kỷ niệm về các hoạt động của công ty</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900">3. Tài khoản người dùng</h2>
              <div className="space-y-3 text-slate-700">
                <p className="leading-relaxed text-justify">
                  <span className="font-semibold">3.1 Đăng ký:</span> Để sử dụng đầy đủ tính năng của Dịch vụ, bạn cần tạo tài khoản bằng email hợp lệ.
                </p>
                <p className="leading-relaxed text-justify">
                  <span className="font-semibold">3.2 Bảo mật tài khoản:</span> Bạn có trách nhiệm bảo mật thông tin đăng nhập và tất cả các hoạt động diễn ra dưới tài khoản của bạn.
                </p>
                <p className="leading-relaxed text-justify">
                  <span className="font-semibold">3.3 Thông tin chính xác:</span> Bạn cam kết cung cấp thông tin chính xác, đầy đủ và cập nhật khi đăng ký tài khoản.
                </p>
              </div>
            </section>

            {/* Section 4 */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900">4. Nội dung người dùng</h2>
              <div className="space-y-3 text-slate-700">
                <p className="leading-relaxed text-justify">
                  <span className="font-semibold">4.1 Quyền sở hữu:</span> Bạn giữ quyền sở hữu đối với nội dung (ảnh, văn bản) mà bạn tải lên Dịch vụ.
                </p>
                <p className="leading-relaxed text-justify">
                  <span className="font-semibold">4.2 Giấy phép:</span> Bằng việc tải lên nội dung, bạn cấp cho chúng tôi giấy phép không độc quyền, miễn phí, có thể chuyển nhượng để hiển thị, lưu trữ và phân phối nội dung đó trong phạm vi cung cấp Dịch vụ.
                </p>
                <p className="leading-relaxed text-justify">
                  <span className="font-semibold">4.3 Nội dung cấm:</span> Bạn không được tải lên nội dung:
                </p>
                <ul className="list-disc list-inside space-y-2 pl-4">
                  <li>Vi phạm pháp luật hoặc quyền của bên thứ ba</li>
                  <li>Chứa thông tin sai lệch, lừa đảo</li>
                  <li>Có tính chất phỉ báng, xúc phạm, thù địch</li>
                  <li>Chứa virus, mã độc hoặc phần mềm gây hại</li>
                </ul>
              </div>
            </section>

            {/* Section 5 */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900">5. Quyền và nghĩa vụ của chúng tôi</h2>
              <div className="space-y-3 text-slate-700">
                <p className="leading-relaxed text-justify">
                  <span className="font-semibold">5.1 Kiểm duyệt nội dung:</span> Chúng tôi có quyền (nhưng không có nghĩa vụ) xem xét, kiểm duyệt hoặc xóa bất kỳ nội dung nào vi phạm Điều khoản dịch vụ.
                </p>
                <p className="leading-relaxed text-justify">
                  <span className="font-semibold">5.2 Đình chỉ tài khoản:</span> Chúng tôi có quyền đình chỉ hoặc chấm dứt tài khoản của bạn nếu phát hiện vi phạm các điều khoản này.
                </p>
                <p className="leading-relaxed text-justify">
                  <span className="font-semibold">5.3 Thay đổi dịch vụ:</span> Chúng tôi có quyền thay đổi, tạm ngưng hoặc ngừng cung cấp Dịch vụ bất kỳ lúc nào.
                </p>
              </div>
            </section>

            {/* Section 6 */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900">6. Giới hạn trách nhiệm</h2>
              <p className="text-slate-700 leading-relaxed text-justify">
                Dịch vụ được cung cấp &quot;nguyên trạng&quot; và &quot;như hiện có&quot;. Chúng tôi không đảm bảo rằng Dịch vụ sẽ luôn hoạt động không bị gián đoạn, an toàn hoặc không có lỗi. Trong phạm vi tối đa mà pháp luật cho phép, chúng tôi không chịu trách nhiệm đối với bất kỳ thiệt hại trực tiếp, gián tiếp, ngẫu nhiên hoặc hậu quả nào phát sinh từ việc sử dụng hoặc không thể sử dụng Dịch vụ.
              </p>
            </section>

            {/* Section 7 */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900">7. Thay đổi điều khoản</h2>
              <p className="text-slate-700 leading-relaxed text-justify">
                Chúng tôi có quyền sửa đổi các Điều khoản dịch vụ này bất kỳ lúc nào. Các thay đổi sẽ có hiệu lực ngay khi được đăng tải trên trang này. Việc bạn tiếp tục sử dụng Dịch vụ sau khi các thay đổi được đăng tải đồng nghĩa với việc bạn chấp nhận các điều khoản mới.
              </p>
            </section>

            {/* Section 8 */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900">8. Luật áp dụng</h2>
              <p className="text-slate-700 leading-relaxed text-justify">
                Các Điều khoản dịch vụ này được điều chỉnh bởi và giải thích theo pháp luật Việt Nam. Mọi tranh chấp phát sinh sẽ được giải quyết tại tòa án có thẩm quyền tại Việt Nam.
              </p>
            </section>

            {/* Section 9 */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900">9. Liên hệ</h2>
              <p className="text-slate-700 leading-relaxed text-justify">
                Nếu bạn có bất kỳ câu hỏi nào về Điều khoản dịch vụ này, vui lòng liên hệ với chúng tôi qua email hoặc thông qua các kênh hỗ trợ chính thức của công ty.
              </p>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500 mb-4">
            Bằng việc sử dụng Timeline Teky Hoàng Mai, bạn đã đọc và đồng ý với Điều khoản dịch vụ này.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/privacy"
              className="text-sm text-slate-600 hover:text-slate-900 font-medium transition-colors"
            >
              Chính sách bảo mật
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
