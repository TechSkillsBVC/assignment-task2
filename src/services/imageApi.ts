import axios, { AxiosResponse } from 'axios';
import { getEnvironentVariable } from '../utils';

// You can use any hosting service of your preference.
// In this case, we will use ImgBB API: https://api.imgbb.com/.
//
// Sign up for free at https://imgbb.com/signup
// Get your API key and add it to the .env file in your root folder.
//
// To run the app in your local environment, you will need to set the IMGBB_API_KEY
// when starting the app using:
// 'IMGBB_API_KEY=81d28dc26996812d4cfd6f782b772cb5 npx expo start'
//
// When creating your app build or publishing, do not forget to run 'eas secret:push' command
// to import your secret values to EAS.

/**
 * Image API instance.
 */

const imageApi = axios.create({
    baseURL: 'https://api.imgbb.com/1',
    headers: { 'Content-Type': 'multipart/form-data' },
    params: { key: getEnvironentVariable('81d28dc26996812d4cfd6f782b772cb5') },
});

/**
 * ImageUploader Class
 * 
 * Handles image upload operations to imgbb API.
 * 
 * Responsibilities:
 * - Encodes images in Base64 format.
 * - Sends images to the imgbb upload endpoint.
 * - Returns the uploaded image URL.
 */

export const uploadImage = (imageBase64: string): Promise<AxiosResponse> => {
    const data = new FormData();
    const cleanBase64 = imageBase64.split(',')[1];
    data.append('image', cleanBase64);

    return imageApi.post('/upload', data);
};
