/**
 * Client-side image compression utility using Canvas.
 * Compresses any image exceeding the maxSizeMB to a target size below maxSizeMB.
 */
export async function compressImage(file: File, maxSizeMB: number = 2): Promise<File> {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  
  // Skip compression if file size is already within limits
  if (file.size <= maxSizeBytes) {
    return file;
  }

  // Ensure this runs only on client-side browser environment
  if (typeof window === 'undefined') {
    return file;
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Downscale dimension if extremely large to prevent canvas memory crash
        const maxDimension = 2048;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(file); // Fallback to original file if canvas context is not supported
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Perform recursive quality reduction compression steps
        const compressStep = (quality: number) => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                return resolve(file);
              }
              // If compressed size fits, or quality limit reached, return compressed file
              if (blob.size <= maxSizeBytes || quality <= 0.4) {
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                // Reduce quality step by 0.1 and re-compress
                compressStep(quality - 0.1);
              }
            },
            'image/jpeg',
            quality
          );
        };

        compressStep(0.85);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}
