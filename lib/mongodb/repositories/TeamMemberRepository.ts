import TeamMember, { ITeamMember, ITeamMemberDocument } from '../models/TeamMember'
import { BaseRepository } from './BaseRepository'

/**
 * TeamMember Repository
 * Handles all database operations for team members
 */
export class TeamMemberRepository extends BaseRepository<ITeamMemberDocument, ITeamMember> {
  constructor() {
    super(TeamMember)
  }

  /**
   * Create a new team member
   */
  async create(memberData: Omit<ITeamMember, 'id' | 'created_at' | 'updated_at'>): Promise<ITeamMemberDocument> {
    // Get next order number if not provided
    const order = memberData.order ?? await TeamMember.getNextOrder()

    return super.create({
      ...memberData,
      order,
    } as any)
  }

  /**
   * Find all active team members (sorted by order)
   */
  async findActive(): Promise<ITeamMemberDocument[]> {
    return this.find({ is_active: true }, { order: 1 })
  }

  /**
   * Find all team members (including inactive)
   */
  async findAll(): Promise<ITeamMemberDocument[]> {
    return this.find({}, { order: 1 })
  }

  /**
   * Activate team member
   */
  async activate(id: string): Promise<ITeamMemberDocument | null> {
    return this.update(id, { is_active: true })
  }

  /**
   * Deactivate team member
   */
  async deactivate(id: string): Promise<ITeamMemberDocument | null> {
    return this.update(id, { is_active: false })
  }

  /**
   * Update multiple members' order
   * Useful for drag & drop reordering
   */
  async updateOrders(orders: { id: string; order: number }[]): Promise<boolean> {
    await this.ensureConnection()

    try {
      const bulkOps = orders.map(({ id, order }) => ({
        updateOne: {
          filter: { id },
          update: { $set: { order } },
        },
      }))

      await (this.model as any).bulkWrite(bulkOps)
      return true
    } catch (error) {
      console.error('Error updating orders:', error)
      return false
    }
  }

  /**
   * Get next order number for new member
   */
  async getNextOrder(): Promise<number> {
    await this.ensureConnection()
    return await TeamMember.getNextOrder()
  }

  /**
   * Get total count of team members
   */
  async countTotal(): Promise<number> {
    return this.count()
  }

  /**
   * Get count of active team members
   */
  async countActive(): Promise<number> {
    return this.count({ is_active: true })
  }
}

// Export singleton instance
export const teamMemberRepository = new TeamMemberRepository()
