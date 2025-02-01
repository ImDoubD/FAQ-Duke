import { redisClient } from '../config/redis';

export const getCacheTranslation = async (id: string, lang: string) => {
    const key = `faq:${id}:${lang}`;
    try{
        return await redisClient.get(key);
    }catch(error){
        console.log('Redis get error: ', error);
        return null;
    }
}

export const setCacheTranslation = async (id: string, lang: string, answer: string) => {
    const key = `faq:${id}:${lang}`;
    try{
        await redisClient.set(key, answer, 'EX', 3600);
    }catch(error){
        console.log('Redis set error: ', error);
    }
}
