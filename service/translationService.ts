import { Translate } from "@google-cloud/translate/build/src/v2";
import { FAQDocument } from "../model/faqModel";
import dotenv from "dotenv";
import axios from 'axios';
import { setCacheTranslation } from "./cacheService";

dotenv.config();

interface TranslationResponse {
    data: {
        translations: Array<{
            translatedText: string;
            detectedSourceLanguage?: string;
        }>;
    }
}

export const translateFAQ = async (faq: FAQDocument) => {
    if (!faq.translations) {
        faq.translations = new Map();
    }
    const targetLangs = ['hi', 'bn', 'es', 'fr'];

    try{
        for(const lang of targetLangs) {
            // Translate question
            const response = await axios.post<TranslationResponse>(
                'https://translation.googleapis.com/language/translate/v2',
                {
                    q: [faq.question, faq.answer],
                    target: lang,
                    source: 'en',  // Explicitly define source language
                    format: 'text'
                },
                {
                    params: { key: process.env.GOOGLE_TRANSLATE_KEY }
                }
            );

            if (response.data?.data?.translations?.length < 2) {
                console.error(`Translation failed for ${lang}`);
                continue;
            }

            const [questionTranslation, answerTranslation] = response.data.data.translations.map(t => t.translatedText);

            console.log(`[${lang}] Question:`, questionTranslation);
            console.log(`[${lang}] Answer:`, answerTranslation);

            if(faq.translations){
                faq.translations.set(lang, questionTranslation);
            }
            await setCacheTranslation(faq._id.toString(), lang, answerTranslation);
        }
        await faq.save();
    }catch(error){
        if (axios.isAxiosError(error)) {
            console.error('Translation error details:', error.response?.data || error.message);
        } else {
            console.error('Translation error details:', (error as Error).message);
        }
        throw new Error('Translation failed');
    }
}