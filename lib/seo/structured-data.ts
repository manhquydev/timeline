/**
 * Structured Data (JSON-LD) Helpers for SEO
 * Provides rich snippets for Google Search
 */

export interface EventStructuredData {
  name: string
  description?: string
  startDate: string
  endDate?: string
  location?: string
  image?: string
  url: string
}

/**
 * Organization Schema
 * Helps Google understand the organization behind the site
 */
export function getOrganizationSchema() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Teky Hoàng Mai',
    alternateName: 'Timeline Teky Hoàng Mai',
    url: baseUrl,
    logo: 'https://s3-sgn10.fptcloud.com/teky-prod/teky-edu-vn/media/project_medias/2023/9/23/9RAQ3dMtpTNlxW7G_2023923151535.jpg',
    description: 'Nền tảng chia sẻ ảnh sự kiện cho Teky Hoàng Mai. Lưu giữ và chia sẻ những khoảnh khắc đáng nhớ.',
    sameAs: [
      // Add social media links when available
      // 'https://www.facebook.com/tekyhoangmai',
      // 'https://www.instagram.com/tekyhoangmai',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      availableLanguage: ['Vietnamese'],
    },
  }
}

/**
 * Website Schema
 * Provides search box for site search
 */
export function getWebsiteSchema() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Timeline Teky Hoàng Mai',
    url: baseUrl,
    description: 'Nền tảng chia sẻ ảnh sự kiện cho Teky Hoàng Mai. Lưu giữ và chia sẻ những khoảnh khắc đáng nhớ.',
    inLanguage: 'vi-VN',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/events?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

/**
 * Event Schema
 * Rich snippets for event pages
 */
export function getEventSchema(event: EventStructuredData) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.name,
    description: event.description || `Sự kiện ${event.name} tại Teky Hoàng Mai`,
    startDate: event.startDate,
    endDate: event.endDate || event.startDate,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: event.location ? {
      '@type': 'Place',
      name: event.location,
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Hà Nội',
        addressCountry: 'VN',
      },
    } : undefined,
    image: event.image ? [event.image] : undefined,
    organizer: {
      '@type': 'Organization',
      name: 'Teky Hoàng Mai',
      url: baseUrl,
    },
    url: event.url,
  }
}

/**
 * Breadcrumb Schema
 * Improves navigation in search results
 */
export function getBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

/**
 * Image Object Schema
 * Helps Google understand images
 */
export function getImageSchema(url: string, caption?: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ImageObject',
    url,
    caption: caption || 'Ảnh sự kiện Teky Hoàng Mai',
    author: {
      '@type': 'Organization',
      name: 'Teky Hoàng Mai',
    },
  }
}
