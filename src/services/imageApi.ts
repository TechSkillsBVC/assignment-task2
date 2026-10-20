import axios, { AxiosResponse } from 'axios';
import { getEnvironentVariable } from '../utils';

const imageApi = axios.create({
    baseURL: 'https://api.imgbb.com/1',
});

interface ImgBBUploadResponse {
    data?: {
        display_url?: string;
        url?: string;
    };
}

export const uploadImage = async (imageBase64: string): Promise<string> => {
    const apiKey = getEnvironentVariable('IMGBB_API_KEY');
    if (typeof apiKey !== 'string' || !apiKey.trim()) {
        throw new Error('IMGBB_API_KEY is not configured.');
    }

    const data = new FormData();
    data.append('image', imageBase64);

    const response: AxiosResponse<ImgBBUploadResponse> = await imageApi.post('/upload', data, {
        params: { key: apiKey },
    });
    const imageUrl = response.data.data?.display_url ?? response.data.data?.url;
    if (!imageUrl) {
        throw new Error('ImgBB did not return an image URL.');
    }
    return imageUrl;
};
