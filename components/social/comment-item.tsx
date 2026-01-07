'use client'

import { formatDistanceToNow } from 'date-fns'
import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, MessageCircle, Edit2, Trash2 } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Textarea } from '@/components/ui/textarea'
import { IComment } from '@/lib/mongodb/models'
import { cn } from '@/lib/utils'

interface CommentItemProps {
    comment: IComment & { _id: string; author?: { name: string; avatar: string } }
    currentUserId?: string
    onReply: (parentId: string, content: string) => Promise<void>
    onEdit: (commentId: string, content: string) => Promise<void>
    onDelete: (commentId: string) => Promise<void>
    replies?: (IComment & { _id: string; author?: { name: string; avatar: string } })[]
}

export function CommentItem({
    comment,
    currentUserId,
    onReply,
    onEdit,
    onDelete,
    replies = []
}: CommentItemProps) {
    const [isReplying, setIsReplying] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [replyContent, setReplyContent] = useState('')
    const [editContent, setEditContent] = useState(comment.content)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleReply = async () => {
        if (!replyContent.trim()) return
        setIsSubmitting(true)
        try {
            await onReply(comment._id, replyContent)
            setReplyContent('')
            setIsReplying(false)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleEdit = async () => {
        if (!editContent.trim()) return
        setIsSubmitting(true)
        try {
            await onEdit(comment._id, editContent)
            setIsEditing(false)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this comment?')) {
            await onDelete(comment._id)
        }
    }

    // Placeholder for author info if missing (should be populated by backend)
    const authorName = comment.author?.name || 'User'
    const authorAvatar = comment.author?.avatar

    return (
        <div className="group flex gap-3 py-3 animate-in fade-in slide-in-from-bottom-2">
            <Avatar className="h-8 w-8">
                <AvatarImage src={authorAvatar} alt={authorName} />
                <AvatarFallback>{authorName.charAt(0)}</AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{authorName}</span>
                        <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                        </span>
                        {comment.isEdited && (
                            <span className="text-xs text-muted-foreground">(edited)</span>
                        )}
                    </div>

                    {currentUserId === comment.userId && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setIsEditing(true)}>
                                    <Edit2 className="mr-2 h-4 w-4" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleDelete} className="text-red-600 focus:text-red-600">
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>

                {isEditing ? (
                    <div className="space-y-2">
                        <Textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="min-h-[60px]"
                        />
                        <div className="flex gap-2 justify-end">
                            <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                            <Button size="sm" onClick={handleEdit} disabled={isSubmitting}>Save</Button>
                        </div>
                    </div>
                ) : (
                    <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                        {comment.content}
                    </p>
                )}

                <div className="flex items-center gap-4 pt-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                        onClick={() => setIsReplying(!isReplying)}
                    >
                        Reply
                    </Button>
                </div>

                {isReplying && (
                    <div className="mt-3 flex gap-3 animate-in fade-in slide-in-from-top-2">
                        <div className="flex-1 space-y-2">
                            <Textarea
                                placeholder={`Reply to ${authorName}...`}
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                className="min-h-[60px]"
                                autoFocus
                            />
                            <div className="flex gap-2 justify-end">
                                <Button size="sm" variant="ghost" onClick={() => setIsReplying(false)}>Cancel</Button>
                                <Button size="sm" onClick={handleReply} disabled={isSubmitting || !replyContent.trim()}>Reply</Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Nested Replies */}
                {replies.length > 0 && (
                    <div className="mt-3 space-y-3 pl-4 border-l-2 border-muted/50">
                        {replies.map(reply => (
                            <CommentItem
                                key={reply._id}
                                comment={reply}
                                currentUserId={currentUserId}
                                onReply={onReply}
                                onEdit={onEdit}
                                onDelete={onDelete}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
