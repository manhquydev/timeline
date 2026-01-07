'use client'

import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Loader2, Check, X, RotateCw, ZoomIn, Crop } from 'lucide-react'
import { getCroppedImg } from '@/lib/image-utils' // We will create this utility

interface ImageEditorProps {
    imageSrc: string | null
    isOpen: boolean
    onClose: () => void
    onSave: (croppedImageBlob: Blob) => void
}

export function ImageEditor({ imageSrc, isOpen, onClose, onSave }: ImageEditorProps) {
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [rotation, setRotation] = useState(0)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)
    const [isProcessing, setIsProcessing] = useState(false)

    const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels)
    }, [])

    const handleSave = async () => {
        if (!imageSrc || !croppedAreaPixels) return

        try {
            setIsProcessing(true)
            const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels, rotation)
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

    if (!imageSrc) return null

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl h-[80vh] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="p-4 border-b">
                    <DialogTitle className="flex items-center gap-2">
                        <Crop className="w-5 h-5 text-primary" />
                        Chỉnh Sửa Ảnh
                    </DialogTitle>
                </DialogHeader>

                <div className="relative flex-1 bg-black">
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        rotation={rotation}
                        aspect={4 / 3}
                        onCropChange={setCrop}
                        onCropComplete={onCropComplete}
                        onZoomChange={setZoom}
                        onRotationChange={setRotation}
                    />
                </div>

                <div className="p-6 bg-background border-t space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-3">
                            <label className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                                <ZoomIn className="w-4 h-4" /> Zoom
                            </label>
                            <Slider
                                value={[zoom]}
                                min={1}
                                max={3}
                                step={0.1}
                                onValueChange={(value: number[]) => setZoom(value[0])}
                                className="w-full"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                                <RotateCw className="w-4 h-4" /> Xoay
                            </label>
                            <Slider
                                value={[rotation]}
                                min={0}
                                max={360}
                                step={1}
                                onValueChange={(value: number[]) => setRotation(value[0])}
                                className="w-full"
                            />
                        </div>
                    </div>

                    <DialogFooter className="flex-row justify-end gap-2 sm:gap-0">
                        <Button variant="outline" onClick={onClose} disabled={isProcessing}>
                            <X className="w-4 h-4 mr-2" />
                            Hủy
                        </Button>
                        <Button onClick={handleSave} disabled={isProcessing}>
                            {isProcessing ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Đang xử lý...
                                </>
                            ) : (
                                <>
                                    <Check className="w-4 h-4 mr-2" />
                                    Lưu thay đổi
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    )
}
