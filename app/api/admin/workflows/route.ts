import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isCurrentUserAdmin } from '@/lib/auth-utils'
import { connectToDatabase } from '@/lib/mongodb/connection'
import { getWorkflowModel, WORKFLOW_TEMPLATES } from '@/lib/mongodb/models'

/**
 * GET /api/admin/workflows
 * Fetch all workflows
 */
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !(await isCurrentUserAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    await connectToDatabase()
    const Workflow = getWorkflowModel()

    const workflows = await Workflow.find().sort({ createdAt: 1 }).lean()

    return NextResponse.json({ workflows })
  } catch (error: any) {
    console.error('Error fetching workflows:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * POST /api/admin/workflows
 * Create new workflow or seed defaults
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !(await isCurrentUserAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    await connectToDatabase()
    const Workflow = getWorkflowModel()

    // Seed default workflows
    if (body.action === 'seed') {
      const existingCount = await Workflow.countDocuments()
      if (existingCount > 0) {
        return NextResponse.json({
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
      return NextResponse.json({
        message: `Đã tạo ${workflowsToCreate.length} workflows mặc định`,
        seeded: true
      })
    }

    // Create custom workflow
    const { name, description, type = 'custom', schedule, config } = body

    if (!name || !description) {
      return NextResponse.json({ error: 'Tên và mô tả là bắt buộc' }, { status: 400 })
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

    return NextResponse.json({
      message: 'Workflow đã được tạo',
      workflow: newWorkflow
    })
  } catch (error: any) {
    console.error('Error creating workflow:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * PATCH /api/admin/workflows
 * Update workflow (toggle status, update config, record run)
 */
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !(await isCurrentUserAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const { id, action, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'ID workflow là bắt buộc' }, { status: 400 })
    }

    await connectToDatabase()
    const Workflow = getWorkflowModel()

    const workflow = await Workflow.findOne({ id })
    if (!workflow) {
      return NextResponse.json({ error: 'Không tìm thấy workflow' }, { status: 404 })
    }

    // Toggle status
    if (action === 'toggle') {
      workflow.status = workflow.status === 'active' ? 'disabled' : 'active'
      await workflow.save()
      return NextResponse.json({
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
      return NextResponse.json({
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
      return NextResponse.json({ workflow })
    }

    // General update
    Object.assign(workflow, updates)
    await workflow.save()

    return NextResponse.json({
      message: 'Workflow đã được cập nhật',
      workflow
    })
  } catch (error: any) {
    console.error('Error updating workflow:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/workflows
 * Delete a workflow
 */
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !(await isCurrentUserAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID workflow là bắt buộc' }, { status: 400 })
    }

    await connectToDatabase()
    const Workflow = getWorkflowModel()

    const result = await Workflow.deleteOne({ id })
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Không tìm thấy workflow' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Workflow đã được xóa' })
  } catch (error: any) {
    console.error('Error deleting workflow:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
