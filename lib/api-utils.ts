import { NextResponse } from 'next/server'

/**
 * Standard API Response structure
 */
export interface ApiResponse<T = any> {
    success: boolean
    data?: T
    error?: string
    message?: string
}

/**
 * Common API responses
 */
export const apiResponse = {
    success: <T>(data: T, message?: string, status = 200) => {
        return NextResponse.json(
            { success: true, data, message },
            { status }
        )
    },

    error: (error: string, status = 400) => {
        return NextResponse.json(
            { success: false, error },
            { status }
        )
    },

    unauthorized: (message = 'Unauthorized') => {
        return NextResponse.json(
            { success: false, error: message },
            { status: 401 }
        )
    },

    forbidden: (message = 'Forbidden') => {
        return NextResponse.json(
            { success: false, error: message },
            { status: 403 }
        )
    },

    notFound: (message = 'Resource not found') => {
        return NextResponse.json(
            { success: false, error: message },
            { status: 404 }
        )
    },

    serverError: (error: any, message = 'Internal server error') => {
        console.error('API Error:', error)
        return NextResponse.json(
            {
                success: false,
                error: message,
                debug: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: 500 }
        )
    }
}
