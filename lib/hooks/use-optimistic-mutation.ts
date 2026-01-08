'use client'

import { useState, useCallback, useRef } from 'react'
import { useMutation, useQueryClient, MutationFunction } from '@tanstack/react-query'

interface OptimisticMutationOptions<TData, TVariables, TContext> {
  mutationFn: MutationFunction<TData, TVariables>
  // Query key(s) to invalidate on success
  invalidateKeys?: string[][]
  // Function to optimistically update the cache before mutation
  onOptimisticUpdate?: (variables: TVariables) => TContext
  // Function to rollback on error
  onRollback?: (context: TContext, error: Error) => void
  // Called on success
  onSuccess?: (data: TData, variables: TVariables) => void
  // Called on error
  onError?: (error: Error, variables: TVariables, context: TContext | undefined) => void
}

/**
 * Hook for optimistic mutations with automatic rollback
 */
export function useOptimisticMutation<TData, TVariables, TContext = unknown>({
  mutationFn,
  invalidateKeys = [],
  onOptimisticUpdate,
  onRollback,
  onSuccess,
  onError,
}: OptimisticMutationOptions<TData, TVariables, TContext>) {
  const queryClient = useQueryClient()
  const [isPending, setIsPending] = useState(false)
  const contextRef = useRef<TContext | undefined>(undefined)

  const mutation = useMutation({
    mutationFn,
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      for (const key of invalidateKeys) {
        await queryClient.cancelQueries({ queryKey: key })
      }

      // Perform optimistic update
      if (onOptimisticUpdate) {
        contextRef.current = onOptimisticUpdate(variables)
      }

      return contextRef.current
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (onRollback && context) {
        onRollback(context as TContext, error as Error)
      }
      onError?.(error as Error, variables, context as TContext | undefined)
    },
    onSuccess: (data, variables) => {
      onSuccess?.(data, variables)
    },
    onSettled: () => {
      // Invalidate queries to refetch fresh data
      for (const key of invalidateKeys) {
        queryClient.invalidateQueries({ queryKey: key })
      }
      setIsPending(false)
    },
  })

  const mutate = useCallback(
    (variables: TVariables) => {
      setIsPending(true)
      mutation.mutate(variables)
    },
    [mutation]
  )

  const mutateAsync = useCallback(
    async (variables: TVariables) => {
      setIsPending(true)
      return mutation.mutateAsync(variables)
    },
    [mutation]
  )

  return {
    mutate,
    mutateAsync,
    isPending: isPending || mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    data: mutation.data,
    reset: mutation.reset,
  }
}

/**
 * Simple optimistic state hook for local state updates
 */
export function useOptimisticState<T>(initialValue: T) {
  const [value, setValue] = useState(initialValue)
  const [optimisticValue, setOptimisticValue] = useState<T | null>(null)
  const rollbackRef = useRef<T | null>(null)

  const setOptimistic = useCallback((newValue: T) => {
    rollbackRef.current = value
    setOptimisticValue(newValue)
  }, [value])

  const confirm = useCallback(() => {
    if (optimisticValue !== null) {
      setValue(optimisticValue)
      setOptimisticValue(null)
      rollbackRef.current = null
    }
  }, [optimisticValue])

  const rollback = useCallback(() => {
    setOptimisticValue(null)
    rollbackRef.current = null
  }, [])

  return {
    value: optimisticValue ?? value,
    realValue: value,
    isOptimistic: optimisticValue !== null,
    setOptimistic,
    confirm,
    rollback,
    setValue,
  }
}
