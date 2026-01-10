import { NextRequest } from 'next/server'
import { withAdmin, successResponse, errorResponse, ErrorCodes, type AdminContext } from '@/lib/api-utils'
import { connectToDatabase } from '@/lib/mongodb/connection'
import { getWorkflowModel, WORKFLOW_TEMPLATES } from '@/lib/mongodb/models'
import { adminLogger } from '@/lib/logger'

/**
 * GET /api/admin/workflows
 * Fetch all workflows
 */
export const GET = withAdmin(async (request: NextRequest, { user }: AdminContext) => {
  try {
    await connectToDatabase()
    const Workflow = getWorkflowModel()

    const workflows = await Workflow.find().sort({ createdAt: 1 }).lean()

    return successResponse({ workflows })
  } catch (error: any) {
    adminLogger.error({ err: error }, 'Error fetching workflows')
    return errorResponse(error.message || 'Internal server error', 500, ErrorCodes.INTERNAL_ERROR)
  }
})

/**
 * POST /api/admin/workflows
 * Create new workflow or seed defaults
 */
export const POST = withAdmin(async (request: NextRequest, { user }: AdminContext) => {
  try {
    const body = await request.json()
    await connectToDatabase()
    const Workflow = getWorkflowModel()

    // Seed default workflows
    if (body.action === 'seed') {
      const existingCount = await Workflow.countDocuments()
      if (existingCount > 0) {
        return successResponse({
          message: 'Workflows đã tồn tại',
          seeded: false
        })
      }

      const workflowsToCreate = WORKFLOW_TEMPLATES.map(template => ({
        ...template,
        runCount: 0,
        successCount: 0,
        failedCount: 0,
        createdBy: user.id,
      }))

      await Workflow.insertMany(workflowsToCreate)
      return successResponse({
        message: `Đã tạo ${workflowsToCreate.length} workflows mặc định`,
        seeded: true
      })
    }

    // Create custom workflow
    const { name, description, type = 'custom', schedule, config } = body

    if (!name || !description) {
      return errorResponse('Tên và mô tả là bắt buộc', 400, ErrorCodes.VALIDATION_ERROR)
    }

    const newWorkflow = await Workflow.create({
      name,
      description,
      type,
      status: 'disabled',
      schedule: schedule || { enabled: false },
      config,
      runCount: 0,
      successCount: 0,
      failedCount: 0,
      createdBy: user.id,
    })

    return successResponse({
      message: 'Workflow đã được tạo',
      workflow: newWorkflow
    })
  } catch (error: any) {
    adminLogger.error({ err: error }, 'Error creating workflow')
    return errorResponse(error.message || 'Internal server error', 500, ErrorCodes.INTERNAL_ERROR)
  }
})

/**
 * PATCH /api/admin/workflows
 * Update workflow (toggle status, update config, record run)
 */
export const PATCH = withAdmin(async (request: NextRequest, { user }: AdminContext) => {
  try {
    const body = await request.json()
    const { id, action, ...updates } = body

    if (!id) {
      return errorResponse('ID workflow là bắt buộc', 400, ErrorCodes.VALIDATION_ERROR)
    }

    await connectToDatabase()
    const Workflow = getWorkflowModel()

    const workflow = await Workflow.findOne({ id })
    if (!workflow) {
      return errorResponse('Không tìm thấy workflow', 404, ErrorCodes.NOT_FOUND)
    }

    // Toggle status
    if (action === 'toggle') {
      workflow.status = workflow.status === 'active' ? 'disabled' : 'active'
      await workflow.save()
      return successResponse({
        message: `Workflow đã ${workflow.status === 'active' ? 'bật' : 'tắt'}`,
        workflow
      })
    }

    // Toggle schedule
    if (action === 'toggle-schedule') {
      if (workflow.schedule) {
        workflow.schedule.enabled = !workflow.schedule.enabled
      } else {
        workflow.schedule = { enabled: true }
      }
      await workflow.save()
      return successResponse({
        message: `Auto-run đã ${workflow.schedule.enabled ? 'bật' : 'tắt'}`,
        workflow
      })
    }

    // Record run result
    if (action === 'record-run') {
      const { result, message } = updates
      workflow.lastRun = new Date()
      workflow.lastRunResult = result
      workflow.lastRunMessage = message
      workflow.runCount += 1
      if (result === 'success') {
        workflow.successCount += 1
      } else if (result === 'failed') {
        workflow.failedCount += 1
      }
      await workflow.save()
      return successResponse({ workflow })
    }

    // General update
    Object.assign(workflow, updates)
    await workflow.save()

    return successResponse({
      message: 'Workflow đã được cập nhật',
      workflow
    })
  } catch (error: any) {
    adminLogger.error({ err: error }, 'Error updating workflow')
    return errorResponse(error.message || 'Internal server error', 500, ErrorCodes.INTERNAL_ERROR)
  }
})

/**
 * DELETE /api/admin/workflows
 * Delete a workflow
 */
export const DELETE = withAdmin(async (request: NextRequest, { user }: AdminContext) => {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return errorResponse('ID workflow là bắt buộc', 400, ErrorCodes.VALIDATION_ERROR)
    }

    await connectToDatabase()
    const Workflow = getWorkflowModel()

    const result = await Workflow.deleteOne({ id })
    if (result.deletedCount === 0) {
      return errorResponse('Không tìm thấy workflow', 404, ErrorCodes.NOT_FOUND)
    }

    return successResponse({ message: 'Workflow đã được xóa' })
  } catch (error: any) {
    adminLogger.error({ err: error }, 'Error deleting workflow')
    return errorResponse(error.message || 'Internal server error', 500, ErrorCodes.INTERNAL_ERROR)
  }
})
