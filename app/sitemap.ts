import { MetadataRoute } from 'next'
import { eventRepository } from '@/lib/mongodb/repositories'
import { connectToDatabase } from '@/lib/mongodb/connection'

/**
 * Dynamic Sitemap Generation for SEO
 * Automatically includes all public events with proper priority and change frequency
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  // Fetch all public events from MongoDB
  let events: any[] = []
  try {
    await connectToDatabase()
    events = await eventRepository.findPublic()
  } catch (error) {
    console.error('Error fetching events for sitemap:', error)
  }

  // Static pages with high priority
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/events`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/profile/settings`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]

  // Dynamic event pages
  const eventPages: MetadataRoute.Sitemap = events.map((event) => ({
    url: `${baseUrl}/events/${event.slug}`,
    lastModified: event.updated_at || event.created_at || new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [...staticPages, ...eventPages]
}
