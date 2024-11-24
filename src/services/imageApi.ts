import axios, { AxiosResponse } from 'axios';

const IMGBB_API_KEY = '9c51a3a2c427154e10112b17e4d5a2e0';

const imageApi = axios.create({
    baseURL: 'https://api.imgbb.com/1',
    headers: { 'Content-Type': 'multipart/form-data' },
    params: { key: IMGBB_API_KEY },
});

export const uploadImage = async (imageBase64: string): Promise<AxiosResponse> => {
    const formData = new FormData();
    formData.append('image', imageBase64);

    return await imageApi.post('/upload', formData);
};
