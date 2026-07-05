'use client'

import { useEffect, useState, useCallback } from 'react'
import api from '@/services/api'
import type { MediaType } from '@/types'

interface ReviewStats {
    average: number | null
    total: number
}

interface UseReviewsResult {
    stats: ReviewStats
    userReview: { stars: number } | null
    loading: boolean
    submitting: boolean
    submitReview: (stars: number) => Promise<void>
    removeReview: () => Promise<void>
}

export function useReviews(tmdbId: number, mediaType: MediaType): UseReviewsResult {
    const [stats, setStats] = useState<ReviewStats>({ average: null, total: 0 })
    const [userReview, setUserReview] = useState<{ stars: number } | null>(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        let cancelled = false
        setLoading(true)

        Promise.all([
            api.get(`/reviews/${tmdbId}`),
            api.get(`/reviews/me/${tmdbId}`),
        ])
            .then(([statsRes, userRes]) => {
                if (cancelled) return
                setStats({
                    average: statsRes.data.data.average ?? null,
                    total: statsRes.data.data.total,
                })
                setUserReview(
                    userRes.data.data.review ? { stars: userRes.data.data.review.stars } : null
                )
            })
            .catch(() => {
                if (cancelled) return
            })
            .finally(() => {
                if (!cancelled) setLoading(false)
            })

        return () => { cancelled = true }
    }, [tmdbId])

    const submitReview = useCallback(async (stars: number) => {
        setSubmitting(true)
        try {
            await api.post('/reviews', { tmdbId, mediaType, stars })
            const statsRes = await api.get(`/reviews/${tmdbId}`)
            setStats({
                average: statsRes.data.data.average ?? null,
                total: statsRes.data.data.total,
            })
            setUserReview({ stars })
        } finally {
            setSubmitting(false)
        }
    }, [tmdbId, mediaType])

    const removeReview = useCallback(async () => {
        setSubmitting(true)
        try {
            await api.delete(`/reviews/${tmdbId}`)
            const statsRes = await api.get(`/reviews/${tmdbId}`)
            setStats({
                average: statsRes.data.data.average ?? null,
                total: statsRes.data.data.total,
            })
            setUserReview(null)
        } finally {
            setSubmitting(false)
        }
    }, [tmdbId])

    return { stats, userReview, loading, submitting, submitReview, removeReview }
}