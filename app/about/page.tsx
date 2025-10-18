import { teamMemberRepository } from '@/lib/mongodb/repositories'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Github, Linkedin, Mail, Facebook, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'Về Chúng Tôi | Timeline Teky Hoàng Mai',
  description: 'Đội ngũ phát triển sản phẩm Timeline - Team Giảng Viên Teky Hoàng Mai',
}

export const dynamic = 'force-dynamic'

export default async function AboutPage() {
  // Fetch active team members
  const members = await teamMemberRepository.findActive()

  // Convert to plain objects for serialization
  const teamMembers = members.map(member => {
    const plainMember = member.toObject ? member.toObject() : member
    return {
      id: plainMember.id,
      name: plainMember.name,
      role: plainMember.role,
      avatar_url: plainMember.avatar_url ?? null,
      description: plainMember.description ?? null,
      bio: plainMember.bio ?? null,
      social_links: plainMember.social_links ? {
        github: plainMember.social_links.github ?? null,
        linkedin: plainMember.social_links.linkedin ?? null,
        email: plainMember.social_links.email ?? null,
        facebook: plainMember.social_links.facebook ?? null,
      } : undefined,
    }
  })

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="container mx-auto px-4 py-12">
        {/* Back Button */}
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại Trang Chủ
          </Button>
        </Link>

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Về Timeline
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
            Sản phẩm được phát triển bởi đội ngũ Giảng Viên tại
            <span className="font-semibold text-foreground"> Teky Hoàng Mai</span>
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full"></div>
        </div>

        {/* About Section */}
        <Card className="mb-16 border-0 shadow-2xl">
          <CardContent className="p-8 md:p-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">Về Dự Án</h2>
            <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
              <p>
                <strong className="text-foreground">Timeline</strong> là nền tảng chia sẻ ảnh hiện đại,
                được thiết kế đặc biệt cho các sự kiện công ty và hoạt động tập thể.
                Chúng tôi giúp mọi người dễ dàng ghi lại và chia sẻ những khoảnh khắc đáng nhớ.
              </p>
              <p>
                Với giao diện thân thiện trên thiết bị di động, tính năng tải ảnh nhanh chóng,
                và hệ thống quản lý hiện đại, Timeline mang đến trải nghiệm tốt nhất
                cho cả người dùng và quản trị viên.
              </p>
              <p>
                Dự án này được phát triển với mục tiêu học tập và ứng dụng thực tế,
                sử dụng các công nghệ web hiện đại như Next.js, MongoDB, và Supabase.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Team Section */}
        {teamMembers.length > 0 && (
          <>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Đội Ngũ Phát Triển</h2>
              <p className="text-muted-foreground text-lg">
                Những người đã đóng góp để tạo nên Timeline
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {teamMembers.map((member, index) => (
                <Card
                  key={member.id}
                  className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 animate-scale-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardContent className="p-6">
                    {/* Avatar */}
                    <div className="flex flex-col items-center text-center mb-6">
                      <Avatar className="w-32 h-32 mb-4 ring-4 ring-primary/10">
                        <AvatarImage src={member.avatar_url || undefined} alt={member.name} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-3xl font-bold">
                          {getInitials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                      <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                      <p className="text-primary font-medium mb-3">{member.role}</p>
                      {member.description && (
                        <p className="text-sm text-muted-foreground">{member.description}</p>
                      )}
                    </div>

                    {/* Bio */}
                    {member.bio && (
                      <div className="mb-4 p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">{member.bio}</p>
                      </div>
                    )}

                    {/* Social Links */}
                    {member.social_links && (
                      <div className="flex justify-center gap-3">
                        {member.social_links.github && (
                          <a
                            href={member.social_links.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-colors"
                          >
                            <Github className="w-5 h-5" />
                          </a>
                        )}
                        {member.social_links.linkedin && (
                          <a
                            href={member.social_links.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-colors"
                          >
                            <Linkedin className="w-5 h-5" />
                          </a>
                        )}
                        {member.social_links.email && (
                          <a
                            href={`mailto:${member.social_links.email}`}
                            className="w-10 h-10 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-colors"
                          >
                            <Mail className="w-5 h-5" />
                          </a>
                        )}
                        {member.social_links.facebook && (
                          <a
                            href={member.social_links.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-colors"
                          >
                            <Facebook className="w-5 h-5" />
                          </a>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Tech Stack */}
        <Card className="border-0 shadow-2xl">
          <CardContent className="p-8 md:p-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">Công Nghệ Sử Dụng</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { name: 'Next.js 15', desc: 'React Framework' },
                { name: 'MongoDB', desc: 'Database' },
                { name: 'Supabase', desc: 'Auth & Storage' },
                { name: 'TypeScript', desc: 'Type Safety' },
                { name: 'Tailwind CSS', desc: 'Styling' },
                { name: 'Shadcn/ui', desc: 'UI Components' },
                { name: 'Sharp', desc: 'Image Processing' },
                { name: 'Vercel', desc: 'Deployment' },
              ].map((tech, index) => (
                <div
                  key={index}
                  className="text-center p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                >
                  <p className="font-semibold mb-1">{tech.name}</p>
                  <p className="text-xs text-muted-foreground">{tech.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-16 text-muted-foreground">
          <p className="text-sm">
            © 2025 Timeline - Phát triển bởi Team Giảng Viên Teky Hoàng Mai
          </p>
        </div>
      </div>
    </main>
  )
}
