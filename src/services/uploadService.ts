/**
 * uploadService.ts
 * Service d'upload d'images réel pour l'application ActivityTN.
 * Envoie l'image en base64 vers l'API backend qui la stocke sur Cloudinary CDN ou en local.
 */

import { getApiBaseUrl } from './apiConfig';
import { fetchWithSessionRefresh, getAuthToken } from './authService';

export interface UploadResult {
  success: boolean;
  url: string;
  provider: 'cloudinary' | 'local';
}

/**
 * Uploader une image vers le serveur (Cloudinary CDN ou stockage local)
 * @param base64Image Chaîne de caractères image Base64 (ex: "data:image/jpeg;base64,...")
 * @param folder Sous-dossier de destination (ex: "activities" ou "avatars")
 */
export async function uploadImage(
  base64Image: string,
  folder: 'activities' | 'avatars' = 'activities'
): Promise<UploadResult> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Authentification requise pour uploader une image.');
  }

  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/upload/image`;

  const response = await fetchWithSessionRefresh(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      image: base64Image,
      folder,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Échec de l'upload de l'image (code ${response.status})`);
  }

  const data = await response.json();
  return {
    success: true,
    url: data.url,
    provider: data.provider,
  };
}
