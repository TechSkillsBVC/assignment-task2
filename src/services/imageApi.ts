import axios, { AxiosResponse } from 'axios';
import { getEnvironentVariable } from '../utils';
 
// ImgBB API documentation: https://api.imgbb.com/
// Ensure your API key is added to the .env file in the root folder.
// Set the IMGBB_API_KEY when running locally:
// 'IMGBB_API_KEY="insert_your_api_key_here" npx expo start'
// For production, use 'eas secret:push' to store secret values.
 
const apiKey = getEnvironentVariable('494e56a15b2d000ba69569ca8a67d3e7');
 
const imageApi = axios.create({
  baseURL: 'https://api.imgbb.com/1',
  headers: { 'Content-Type': 'multipart/form-data' },
  params: {
    key: apiKey,
  },
});
 
// Upload image function to handle base64 image data
export const uploadImage = (imageBase64: string): Promise<AxiosResponse> => {
  const formData = new FormData();
  formData.append('image', imageBase64);
 
  return imageApi.post('/upload', formData);
};