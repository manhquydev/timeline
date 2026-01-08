'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface ErrorBoundaryProps {
    children: React.ReactNode
    fallback?: React.ReactNode
}

interface ErrorBoundaryState {
    hasError: boolean
    error: Error | null
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo)
    }

    resetError = () => {
        this.setState({ hasError: false, error: null })
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback
            }

            return (
                <div className="flex flex-col items-center justify-center p-6 text-center rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-900/20">
                    <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-4 text-red-600 dark:text-red-400">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-red-900 dark:text-red-300 mb-2">
                        Đã xảy ra lỗi
                    </h3>
                    <p className="text-sm text-red-700 dark:text-red-400 mb-4 max-w-xs">
                        {this.state.error?.message || 'Không thể hiển thị thành phần này.'}
                    </p>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={this.resetError}
                        className="border-red-200 hover:bg-red-100 hover:text-red-700 dark:border-red-800 dark:hover:bg-red-900/30"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Thử lại
                    </Button>
                </div>
            )
        }

        return this.props.children
    }
}
