import { eventRepository, postRepository } from '../repositories'

/**
 * Update event statistics based on approved posts
 * This recalculates total_photos, total_videos, and total_contributors
 */
export async function updateEventStats(eventId: string): Promise<void> {
  try {
    // Get fresh stats from posts
    const stats = await postRepository.getEventStats(eventId)

    // Update event with calculated stats
    await eventRepository.updateStats(eventId, {
      total_photos: stats.total_photos,
      total_videos: stats.total_videos,
      total_contributors: stats.total_contributors,
    })
  } catch (error) {
    console.error(`Failed to update stats for event ${eventId}:`, error)
    throw error
  }
}
