'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Sparkles, Loader2, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface SmartSearchBarProps {
    onSearch: (results: any[], query: string) => void
    onClear: () => void
    eventId?: string
    placeholder?: string
}

export function SmartSearchBar({ onSearch, onClear, eventId, placeholder = "Tìm kiếm bằng ngôn ngữ tự nhiên (Vd: ảnh có bánh kem)..." }: SmartSearchBarProps) {
    const [query, setQuery] = useState('')
    const [isSearching, setIsSearching] = useState(false)

    const handleSearch = async (e?: React.FormEvent) => {
        e?.preventDefault()
        if (!query.trim()) return

        setIsSearching(true)
        try {
            const response = await fetch('/api/ai/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query, eventId }),
            })

            const data = await response.json()
            if (data.success) {
                onSearch(data.data.posts, query)
            }
        } catch (error) {
            console.error('Search error:', error)
        } finally {
            setIsSearching(false)
        }
    }

    const handleClear = () => {
        setQuery('')
        onClear()
    }

    return (
        <div className="relative w-full max-w-2xl mx-auto">
            <form onSubmit={handleSearch} className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                </div>

                <Input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={placeholder}
                    className="pl-10 pr-24 py-6 bg-background/50 backdrop-blur-xl border-primary/20 focus:border-primary/50 rounded-full text-lg shadow-2xl transition-all"
                />

                <div className="absolute inset-y-0 right-2 flex items-center gap-2">
                    {query && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={handleClear}
                            className="h-8 w-8 rounded-full hover:bg-muted"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}

                    <Button
                        type="submit"
                        disabled={isSearching || !query.trim()}
                        className="rounded-full px-6 h-10 bg-primary/90 hover:bg-primary text-white gap-2 transition-all shadow-lg"
                    >
                        {isSearching ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <>
                                <Sparkles className="h-4 w-4" />
                                <span>AI</span>
                            </>
                        )}
                    </Button>
                </div>
            </form>

            <AnimatePresence>
                {isSearching && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute -bottom-10 left-0 right-0 text-center text-sm text-muted-foreground flex items-center justify-center gap-2"
                    >
                        <Sparkles className="h-3 w-3 animate-pulse text-yellow-500" />
                        <span>Đang sử dụng AI để dịch câu hỏi của bạn...</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
