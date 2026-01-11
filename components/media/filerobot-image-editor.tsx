'use client'

import { useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'

// Dynamically import Filerobot to avoid SSR issues
const FilerobotImageEditorComponent = dynamic(
  () => import('react-filerobot-image-editor').then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
        <div className="flex flex-col items-center gap-3 text-white">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span>Đang tải trình chỉnh sửa...</span>
        </div>
      </div>
    )
  }
)

// Import TABS and TOOLS constants
import { TABS, TOOLS } from 'react-filerobot-image-editor'

interface FilerobotEditorProps {
  imageSrc: string
  isOpen: boolean
  onClose: () => void
  onSave: (editedBlob: Blob) => void
}

// Type from react-filerobot-image-editor
interface SavedImageData {
  name: string
  extension: string
  mimeType: string
  fullName?: string
  height?: number
  width?: number
  imageBase64?: string
  imageCanvas?: HTMLCanvasElement
  quality?: number
  cloudimageUrl?: string
}

/**
 * Filerobot Image Editor Wrapper
 * Full-featured editor with filters, text, stickers, adjustments
 * Mobile-optimized with touch gestures
 */
export function FilerobotEditor({
  imageSrc,
  isOpen,
  onClose,
  onSave
}: FilerobotEditorProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  // Handle save - convert base64 to Blob
  const handleSave = useCallback(async (
    editedImageObject: SavedImageData,
    _designState: unknown
  ) => {
    try {
      setIsProcessing(true)

      // Convert base64 to Blob
      const base64 = editedImageObject.imageBase64
      if (!base64) {
        console.error('No image data received')
        return
      }
      const response = await fetch(base64)
      const blob = await response.blob()

      onSave(blob)
      onClose()
    } catch (error) {
      console.error('Error saving edited image:', error)
    } finally {
      setIsProcessing(false)
    }
  }, [onSave, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50">
      {isProcessing && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/60">
          <div className="flex flex-col items-center gap-3 text-white">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span>Đang lưu ảnh...</span>
          </div>
        </div>
      )}

      <FilerobotImageEditorComponent
        source={imageSrc}
        onSave={handleSave}
        onClose={onClose}
        annotationsCommon={{
          fill: '#7c3aed', // Primary purple color
        }}
        Text={{
          text: 'Teky',
          fonts: [
            { label: 'Arial', value: 'Arial' },
            { label: 'Times New Roman', value: 'Times New Roman' },
            { label: 'Courier', value: 'Courier' },
            { label: 'Comic Sans MS', value: 'Comic Sans MS' },
            { label: 'Impact', value: 'Impact' },
          ],
        }}
        tabsIds={[
          TABS.ADJUST,
          TABS.FINETUNE,
          TABS.FILTERS,
          TABS.ANNOTATE,
          TABS.WATERMARK,
        ]}
        defaultTabId={TABS.ADJUST}
        defaultToolId={TOOLS.CROP}
        savingPixelRatio={2}
        previewPixelRatio={window?.devicePixelRatio || 1}
        moreSaveOptions={[]}
        useBackendTranslations={false}
        translations={{
          // Vietnamese translations
          name: 'Tên',
          save: 'Lưu',
          saveAs: 'Lưu thành',
          back: 'Quay lại',
          loading: 'Đang tải...',
          resetOperations: 'Đặt lại',
          changesLoseConfirmation: 'Bạn có chắc muốn hủy các thay đổi?',
          changesLoseConfirmationHint: 'Các thay đổi của bạn sẽ bị mất.',
          cancel: 'Hủy',
          continue: 'Tiếp tục',
          undoTitle: 'Hoàn tác',
          redoTitle: 'Làm lại',
          showImageTitle: 'Xem ảnh gốc',
          zoomInTitle: 'Phóng to',
          zoomOutTitle: 'Thu nhỏ',
          toggleZoomMenuTitle: 'Chuyển đổi menu zoom',
          adjustTab: 'Điều chỉnh',
          finetuneTab: 'Tinh chỉnh',
          filtersTab: 'Bộ lọc',
          watermarkTab: 'Watermark',
          annotateTab: 'Chú thích',
          resize: 'Thay đổi kích thước',
          resizeTab: 'Kích thước',
          imageName: 'Tên ảnh',
          invalidImageError: 'Ảnh không hợp lệ',
          uploadImageError: 'Lỗi tải ảnh',
          areNotImages: 'không phải là ảnh',
          isNotImage: 'không phải là ảnh',
          toBeUploaded: 'để tải lên',
          cropTool: 'Cắt',
          original: 'Gốc',
          custom: 'Tùy chỉnh',
          square: 'Vuông',
          landscape: 'Ngang',
          portrait: 'Dọc',
          ellipse: 'Elip',
          classicTv: 'TV cổ điển',
          cinemascope: 'Cinemascope',
          arrowTool: 'Mũi tên',
          blurTool: 'Làm mờ',
          brightnessTool: 'Độ sáng',
          contrastTool: 'Độ tương phản',
          ellipseTool: 'Hình elip',
          unFlipX: 'Bỏ lật ngang',
          flipX: 'Lật ngang',
          unFlipY: 'Bỏ lật dọc',
          flipY: 'Lật dọc',
          hsvTool: 'HSV',
          hue: 'Màu sắc',
          saturation: 'Độ bão hòa',
          value: 'Giá trị',
          imageTool: 'Ảnh',
          importing: 'Đang nhập...',
          addImage: '+ Thêm ảnh',
          lineTool: 'Đường thẳng',
          penTool: 'Bút vẽ',
          polygonTool: 'Đa giác',
          sides: 'Cạnh',
          rectangleTool: 'Hình chữ nhật',
          cornerRadius: 'Bán kính góc',
          resizeWidthTitle: 'Chiều rộng (px)',
          resizeHeightTitle: 'Chiều cao (px)',
          toggleRatioLockTitle: 'Khóa tỷ lệ',
          reset: 'Đặt lại',
          resetSize: 'Đặt lại kích thước',
          rotateTool: 'Xoay',
          textTool: 'Chữ',
          textSpacings: 'Khoảng cách chữ',
          textAlignment: 'Căn lề',
          fontFamily: 'Font chữ',
          size: 'Kích thước',
          letterSpacing: 'Khoảng cách ký tự',
          lineHeight: 'Chiều cao dòng',
          warmthTool: 'Độ ấm',
          addWatermark: '+ Thêm watermark',
          addWatermarkTitle: 'Chọn loại watermark',
          uploadWatermark: 'Tải watermark',
          addWatermarkAsText: 'Thêm chữ',
          padding: 'Padding',
          shadow: 'Đổ bóng',
          horizontal: 'Ngang',
          vertical: 'Dọc',
          blur: 'Làm mờ',
          opacity: 'Độ trong suốt',
          position: 'Vị trí',
          stroke: 'Viền',
          saveAsModalLabel: 'Lưu ảnh thành',
          extension: 'Định dạng',
          actualSize: 'Kích thước thực',
          fitSize: 'Vừa khung',
          quality: 'Chất lượng',
          width: 'Chiều rộng',
          height: 'Chiều cao',
          plus: 'Thêm',
          cropSizeTool: 'Kích thước cắt',
        }}
        Crop={{
          presetsItems: [
            {
              titleKey: 'classicTv',
              descriptionKey: '4:3',
              ratio: 4 / 3,
            },
            {
              titleKey: 'cinemascope',
              descriptionKey: '21:9',
              ratio: 21 / 9,
            },
          ],
          presetsFolders: [
            {
              titleKey: 'socialMedia',
              groups: [
                {
                  titleKey: 'Instagram',
                  items: [
                    { titleKey: 'instaPost', width: 1080, height: 1080, ratio: 1 },
                    { titleKey: 'instaStory', width: 1080, height: 1920, ratio: 9 / 16 },
                  ],
                },
                {
                  titleKey: 'Facebook',
                  items: [
                    { titleKey: 'fbPost', width: 1200, height: 630, ratio: 1200 / 630 },
                    { titleKey: 'fbCover', width: 820, height: 312, ratio: 820 / 312 },
                  ],
                },
              ],
            },
          ],
        }}
        theme={{
          palette: {
            'bg-primary': '#0a0a0a',
            'bg-primary-active': '#1a1a1a',
            'bg-secondary': '#171717',
            'accent-primary': '#7c3aed',
            'accent-primary-active': '#6d28d9',
            'icons-primary': '#a1a1aa',
            'icons-secondary': '#71717a',
            'borders-primary': '#27272a',
            'borders-secondary': '#3f3f46',
            'borders-strong': '#52525b',
            'light-shadow': 'rgba(0, 0, 0, 0.3)',
            'warning': '#f59e0b',
            'error': '#ef4444',
            'success': '#22c55e',
            'info': '#3b82f6',
          },
          typography: {
            fontFamily: 'inherit',
          },
        }}
      />
    </div>
  )
}

export default FilerobotEditor
