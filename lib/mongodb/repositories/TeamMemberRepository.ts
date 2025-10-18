import { connectToDatabase } from '../connection'
import TeamMember, { ITeamMember, ITeamMemberDocument } from '../models/TeamMember'
import { nanoid } from 'nanoid'

/**
 * TeamMember Repository
 * Handles all database operations for team members
 */
export class TeamMemberRepository {
  /**
   * Ensure database connection before operations
   */
  private async ensureConnection() {
    await connectToDatabase()
  }

  /**
   * Create a new team member
   */
  async create(memberData: Omit<ITeamMember, 'id' | 'created_at' | 'updated_at'>): Promise<ITeamMemberDocument> {
    await this.ensureConnection()

    // Get next order number if not provided
    const order = memberData.order ?? await TeamMember.getNextOrder()

    const member = new TeamMember({
      id: nanoid(),
      ...memberData,
      order,
    })

    return await member.save()
  }

  /**
   * Find team member by ID
   */
  async findById(id: string): Promise<ITeamMemberDocument | null> {
    await this.ensureConnection()
    return await TeamMember.findOne({ id })
  }

  /**
   * Find all active team members (sorted by order)
   */
  async findActive(): Promise<ITeamMemberDocument[]> {
    await this.ensureConnection()
    return await TeamMember.find({ is_active: true }).sort({ order: 1 })
  }

  /**
   * Find all team members (including inactive)
   */
  async findAll(): Promise<ITeamMemberDocument[]> {
    await this.ensureConnection()
    return await TeamMember.find().sort({ order: 1 })
  }

  /**
   * Update team member
   */
  async update(id: string, updateData: Partial<ITeamMember>): Promise<ITeamMemberDocument | null> {
    await this.ensureConnection()
    return await TeamMember.findOneAndUpdate(
      { id },
      { $set: updateData },
      { new: true, runValidators: true }
    )
  }

  /**
   * Delete team member
   */
  async delete(id: string): Promise<boolean> {
    await this.ensureConnection()
    const result = await TeamMember.deleteOne({ id })
    return result.deletedCount > 0
  }

  /**
   * Activate team member
   */
  async activate(id: string): Promise<ITeamMemberDocument | null> {
    await this.ensureConnection()
    return await TeamMember.findOneAndUpdate(
      { id },
      { $set: { is_active: true } },
      { new: true }
    )
  }

  /**
   * Deactivate team member
   */
  async deactivate(id: string): Promise<ITeamMemberDocument | null> {
    await this.ensureConnection()
    return await TeamMember.findOneAndUpdate(
      { id },
      { $set: { is_active: false } },
      { new: true }
    )
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

      await TeamMember.bulkWrite(bulkOps)
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
  async count(): Promise<number> {
    await this.ensureConnection()
    return await TeamMember.countDocuments()
  }

  /**
   * Get count of active team members
   */
  async countActive(): Promise<number> {
    await this.ensureConnection()
    return await TeamMember.countDocuments({ is_active: true })
  }
}

// Export singleton instance
export const teamMemberRepository = new TeamMemberRepository()
