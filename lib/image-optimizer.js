/**
 * Professional Image Optimization Utility
 * Compresses and converts images to WebP format for efficient transfer
 */

const DEFAULT_OPTIONS = {
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 0.8, // 80% quality
    format: "webp",
  }
  
  /**
   * Optimizes an image file by resizing and compressing it
   * @param {File} file - The image file to optimize
   * @param {Object} options - Optimization options
   * @returns {Promise<string>} Promise with optimized image as base64 data URL
   */
  export async function optimizeImage(file, options = {}) {
    const opts = { ...DEFAULT_OPTIONS, ...options }
  
    return new Promise((resolve, reject) => {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        reject(new Error("File is not an image"))
        return
      }
  
      const reader = new FileReader()
  
      reader.onload = (e) => {
        const img = new Image()
  
        img.onload = () => {
          try {
            // Calculate new dimensions while maintaining aspect ratio
            let width = img.width
            let height = img.height
  
            if (width > opts.maxWidth || height > opts.maxHeight) {
              const ratio = Math.min(opts.maxWidth / width, opts.maxHeight / height)
              width = Math.floor(width * ratio)
              height = Math.floor(height * ratio)
            }
  
            // Create canvas and draw resized image
            const canvas = document.createElement("canvas")
            canvas.width = width
            canvas.height = height
  
            const ctx = canvas.getContext("2d")
            if (!ctx) {
              reject(new Error("Failed to get canvas context"))
              return
            }
  
            // Use image smoothing for better quality
            ctx.imageSmoothingEnabled = true
            ctx.imageSmoothingQuality = "high"
  
            // Draw image on canvas
            ctx.drawImage(img, 0, 0, width, height)
  
            // Convert to optimized format
            const mimeType = `image/${opts.format}`
            const optimizedDataUrl = canvas.toDataURL(mimeType, opts.quality)
  
            // Log compression stats for debugging
            const originalSize = e.target?.result?.toString().length || 0
            const optimizedSize = optimizedDataUrl.length
            const compressionRatio = ((1 - optimizedSize / originalSize) * 100).toFixed(1)
  
            console.log(`[Image Optimizer] Image optimized: ${file.name}`)
            console.log(`[Image Optimizer] Original size: ${(originalSize / 1024).toFixed(2)} KB`)
            console.log(`[Image Optimizer] Optimized size: ${(optimizedSize / 1024).toFixed(2)} KB`)
            console.log(`[Image Optimizer] Compression: ${compressionRatio}%`)
  
            resolve(optimizedDataUrl)
          } catch (error) {
            reject(error)
          }
        }
  
        img.onerror = () => {
          reject(new Error("Failed to load image"))
        }
  
        img.src = e.target?.result
      }
  
      reader.onerror = () => {
        reject(new Error("Failed to read file"))
      }
  
      reader.readAsDataURL(file)
    })
  }
  
  /**
   * Get file size from base64 data URL in KB
   * @param {string} dataUrl - Base64 data URL
   * @returns {number} Size in KB
   */
  export function getBase64Size(dataUrl) {
    const base64str = dataUrl.split(",")[1]
    const decoded = atob(base64str)
    return decoded.length / 1024 // Return size in KB
  }
  
  /**
   * Validate image file before processing
   * @param {File} file - File to validate
   * @returns {Object} Validation result
   */
  export function validateImageFile(file) {
    // Check file type
    if (!file.type.startsWith("image/")) {
      return { valid: false, error: "File must be an image" }
    }
  
    // Check file size (max 10MB before compression)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return { valid: false, error: "Image must be smaller than 10MB" }
    }
  
    return { valid: true }
  }
  