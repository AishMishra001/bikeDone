import { Platform } from 'react-native';
import { omsApi } from './api';

export interface ImageAsset {
  uri: string;
  name?: string;
  type?: string;
}

/**
 * Upload one or more image files to Cloudinary via the backend.
 * Returns a list of secure Cloudinary URLs (e.g. https://res.cloudinary.com/...).
 */
export async function uploadToCloudinary(images: ImageAsset[]): Promise<string[]> {
  if (!images || images.length === 0) return [];

  const formData = new FormData();

  for (const image of images) {
    // If it's already a hosted Cloudinary or remote HTTPS URL, skip re-uploading
    if (image.uri.startsWith('http://res.cloudinary.com') || image.uri.startsWith('https://res.cloudinary.com')) {
      continue;
    }

    const fileName = image.name || `worker_upload_${Date.now()}.jpg`;
    const mimeType = image.type || 'image/jpeg';

    if (Platform.OS === 'web') {
      // On web, convert blob / object URL to a real File Blob
      const response = await fetch(image.uri);
      const blob = await response.blob();
      const file = new File([blob], fileName, { type: mimeType });
      formData.append('files', file);
    } else {
      // React Native: pass { uri, name, type }
      formData.append('files', {
        uri: image.uri,
        name: fileName,
        type: mimeType,
      } as any);
    }
  }

  // If all were already remote URLs
  const nonUploaded = images.filter(
    (img) => img.uri.startsWith('http://res.cloudinary.com') || img.uri.startsWith('https://res.cloudinary.com')
  ).map((img) => img.uri);

  // If there are files to upload
  if (formData.has('files')) {
    const uploadedUrls = await omsApi.upload<string[]>('/service-requests/upload-images', formData);
    return [...nonUploaded, ...(uploadedUrls || [])];
  }

  return nonUploaded;
}

/**
 * Upload single image to Cloudinary and return its secure URL
 */
export async function uploadSingleImage(uri: string, name?: string, type?: string): Promise<string> {
  if (!uri) return '';
  if (uri.startsWith('http://res.cloudinary.com') || uri.startsWith('https://res.cloudinary.com')) {
    return uri;
  }

  const results = await uploadToCloudinary([{ uri, name, type }]);
  if (results && results.length > 0) {
    return results[0];
  }
  throw new Error('Failed to upload image to Cloudinary');
}
