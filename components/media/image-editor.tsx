'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import Cropper from 'react-easy-crop'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import {
    Loader2, Check, X, RotateCw, ZoomIn, Crop,
    FlipHorizontal, FlipVertical, RotateCcw,
    Undo2, Redo2, RefreshCcw, LayoutTemplate
} from 'lucide-react'
import { getCroppedImg } from '@/lib/image-utils'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { cn } from '@/lib/utils'

interface ImageEditorProps {
    imageSrc: string | null
    isOpen: boolean
    onClose: () => void
    onSave: (croppedImageBlob: Blob) => void
}

interface EditorState {
    crop: { x: number; y: number }
    zoom: number
    rotation: number
    flip: { horizontal: false, vertical: false }
    aspect: number | undefined
}

const DEFAULT_STATE: EditorState = {
    crop: { x: 0, y: 0 },
    zoom: 1,
    rotation: 0,
    flip: { horizontal: false, vertical: false },
    aspect: 4 / 3
}

export function ImageEditor({ imageSrc, isOpen, onClose, onSave }: ImageEditorProps) {
    // Current State
    const [crop, setCrop] = useState(DEFAULT_STATE.crop)
    const [zoom, setZoom] = useState(DEFAULT_STATE.zoom)
    const [rotation, setRotation] = useState(DEFAULT_STATE.rotation)
    const [flip, setFlip] = useState(DEFAULT_STATE.flip)
    const [aspect, setAspect] = useState<number | undefined>(DEFAULT_STATE.aspect)

    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)
    const [isProcessing, setIsProcessing] = useState(false)

    // History for Undo/Redo
    const [history, setHistory] = useState<EditorState[]>([])
    const [historyIndex, setHistoryIndex] = useState(-1)
    const isInternalUpdate = useRef(false)

    // Initial Load
    useEffect(() => {
        if (isOpen) {
            // Reset to defaults when opening new image
            setCrop(DEFAULT_STATE.crop)
            setZoom(DEFAULT_STATE.zoom)
            setRotation(DEFAULT_STATE.rotation)
            setFlip(DEFAULT_STATE.flip)
            setAspect(DEFAULT_STATE.aspect)
            setHistory([DEFAULT_STATE])
            setHistoryIndex(0)
        }
    }, [isOpen, imageSrc])

    // Update History on changes (debounced/controlled)
    const addToHistory = useCallback((newState: EditorState) => {
        if (isInternalUpdate.current) return

        setHistory(prev => {
            const newHistory = prev.slice(0, historyIndex + 1)
            newHistory.push(newState)
            return newHistory
        })
        setHistoryIndex(prev => prev + 1)
    }, [historyIndex])

    const handleUndo = () => {
        if (historyIndex > 0) {
            isInternalUpdate.current = true
            const prevState = history[historyIndex - 1]
            setCrop(prevState.crop)
            setZoom(prevState.zoom)
            setRotation(prevState.rotation)
            setFlip(prevState.flip)
            setAspect(prevState.aspect)
            setHistoryIndex(prev => prev - 1)
            // Reset flag after render
            setTimeout(() => { isInternalUpdate.current = false }, 50)
        }
    }

    const handleRedo = () => {
        if (historyIndex < history.length - 1) {
            isInternalUpdate.current = true
            const nextState = history[historyIndex + 1]
            setCrop(nextState.crop)
            setZoom(nextState.zoom)
            setRotation(nextState.rotation)
            setFlip(nextState.flip)
            setAspect(nextState.aspect)
            setHistoryIndex(prev => prev + 1)
            setTimeout(() => { isInternalUpdate.current = false }, 50)
        }
    }

    // Helper to capture state change explicitly (e.g., after slider release)
    const snapState = () => {
        addToHistory({ crop, zoom, rotation, flip, aspect })
    }

    const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels)
    }, [])

    const handleSave = async () => {
        if (!imageSrc || !croppedAreaPixels) return

        try {
            setIsProcessing(true)
            const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels, rotation, flip)
            if (croppedImage) {
                onSave(croppedImage)
                onClose()
            }
        } catch (e) {
            console.error(e)
        } finally {
            setIsProcessing(false)
        }
    }

    const rotateBy = (deg: number) => {
        const newRotation = rotation + deg
        setRotation(newRotation)
        addToHistory({ crop, zoom, rotation: newRotation, flip, aspect })
    }

    const toggleFlip = (direction: 'horizontal' | 'vertical') => {
        const newFlip = { ...flip, [direction]: !flip[direction] }
        setFlip(newFlip)
        addToHistory({ crop, zoom, rotation, flip: newFlip, aspect })
    }

    const changeAspect = (newAspect: number | undefined) => {
        setAspect(newAspect)
        addToHistory({ crop, zoom, rotation, flip, aspect: newAspect })
    }

    if (!imageSrc) return null

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 overflow-hidden bg-zinc-950 border-zinc-800">
                <DialogHeader className="p-4 border-b border-zinc-800 bg-zinc-900 z-10">
                    <div className="flex items-center justify-between w-full">
                        <DialogTitle className="flex items-center gap-2 text-white">
                            <Crop className="w-5 h-5 text-primary" />
                            Chỉnh Sửa Ảnh
                        </DialogTitle>
                        <DialogDescription className="sr-only">
                            Công cụ chỉnh sửa ảnh: cắt, xoay, phóng to và lật ảnh.
                        </DialogDescription>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleUndo}
                                disabled={historyIndex <= 0}
                                className="text-zinc-400 hover:text-white hover:bg-zinc-800"
                            >
                                <Undo2 className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleRedo}
                                disabled={historyIndex >= history.length - 1}
                                className="text-zinc-400 hover:text-white hover:bg-zinc-800"
                            >
                                <Redo2 className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setCrop(DEFAULT_STATE.crop)
                                    setZoom(DEFAULT_STATE.zoom)
                                    setRotation(DEFAULT_STATE.rotation)
                                    setFlip(DEFAULT_STATE.flip)
                                    setAspect(DEFAULT_STATE.aspect)
                                    addToHistory(DEFAULT_STATE)
                                }}
                                className="text-xs text-zinc-400 hover:text-white hover:bg-zinc-800 ml-2"
                            >
                                <RefreshCcw className="w-3 h-3 mr-1" /> Reset
                            </Button>
                        </div>
                    </div>
                </DialogHeader>

                <div className="relative flex-1 bg-black overflow-hidden backdrop-blur-3xl">
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        rotation={rotation}
                        aspect={aspect}
                        onCropChange={setCrop}
                        onCropComplete={onCropComplete}
                        onZoomChange={setZoom}
                        onRotationChange={setRotation}
                        transform={[
                            `translate(${crop.x}px, ${crop.y}px)`,
                            `rotate(${rotation}deg)`,
                            `scale(${zoom})`,
                            `scaleX(${flip.horizontal ? -1 : 1})`,
                            `scaleY(${flip.vertical ? -1 : 1})`,
                        ].join(' ')}
                    />
                </div>

                <div className="p-4 bg-zinc-900 border-t border-zinc-800 space-y-4 shadow-2xl z-10">
                    {/* Controls Toolbar */}
                    <div className="flex flex-col gap-4">
                        {/* Top Row: Aspect & Flip & Rotate Buttons */}
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-[40%] text-zinc-300">
                                <ToggleGroup type="single" value={aspect?.toString() || 'free'} onValueChange={(v: string) => changeAspect(v === 'free' ? undefined : parseFloat(v))}>
                                    <ToggleGroupItem value="1" aria-label="Square" className='h-8 w-8 p-0'><div className="w-3 h-3 border border-current" /></ToggleGroupItem>
                                    <ToggleGroupItem value={String(4 / 3)} aria-label="4:3" className='h-8 px-2 text-xs'>4:3</ToggleGroupItem>
                                    <ToggleGroupItem value={String(16 / 9)} aria-label="16:9" className='h-8 px-2 text-xs'>16:9</ToggleGroupItem>
                                    <ToggleGroupItem value="free" aria-label="Free" className='h-8 px-2 text-xs'><LayoutTemplate className="w-3 h-3" /></ToggleGroupItem>
                                </ToggleGroup>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="icon" onClick={() => toggleFlip('horizontal')} className="h-8 w-8 bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-zinc-300">
                                    <FlipHorizontal className="w-4 h-4" />
                                </Button>
                                <Button variant="outline" size="icon" onClick={() => toggleFlip('vertical')} className="h-8 w-8 bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-zinc-300">
                                    <FlipVertical className="w-4 h-4" />
                                </Button>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="icon" onClick={() => rotateBy(-90)} className="h-8 w-8 bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-zinc-300">
                                    <RotateCcw className="w-4 h-4" />
                                </Button>
                                <Button variant="outline" size="icon" onClick={() => rotateBy(90)} className="h-8 w-8 bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-zinc-300">
                                    <RotateCw className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Sliders Row */}
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-wider font-bold text-zinc-500 flex items-center justify-between">
                                    <span className="flex items-center gap-1"><ZoomIn className="w-3 h-3" /> Zoom</span>
                                    <span className="text-zinc-400">{Math.round(zoom * 100)}%</span>
                                </label>
                                <Slider
                                    value={[zoom]}
                                    min={1}
                                    max={3}
                                    step={0.1}
                                    onValueChange={(value) => setZoom(value[0])}
                                    onValueCommit={snapState}
                                    className="w-full"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-wider font-bold text-zinc-500 flex items-center justify-between">
                                    <span className="flex items-center gap-1"><RotateCw className="w-3 h-3" /> Fine Rotate</span>
                                    <span className="text-zinc-400">{rotation}°</span>
                                </label>
                                <Slider
                                    value={[rotation]}
                                    min={0}
                                    max={360}
                                    step={1}
                                    onValueChange={(value) => setRotation(value[0])}
                                    onValueCommit={snapState}
                                    className="w-full"
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="flex-row justify-between gap-2 sm:gap-0 pt-2 border-t border-zinc-800 mt-2">
                        <Button variant="ghost" onClick={onClose} disabled={isProcessing} className="text-zinc-400 hover:text-white">
                            <X className="w-4 h-4 mr-2" />
                            Đóng
                        </Button>
                        <Button onClick={handleSave} disabled={isProcessing} className="bg-primary hover:bg-primary/90 text-white min-w-[120px]">
                            {isProcessing ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Đang lưu...
                                </>
                            ) : (
                                <>
                                    <Check className="w-4 h-4 mr-2" />
                                    Lưu Thay Đổi
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    )
}
