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
    const targetLangs = ['hi', 'bn', 'es', 'fr'];

    try{
        for(const lang of targetLangs) {
            // Translate question
            const questionResponse = await axios.post<TranslationResponse>(
                'https://translation.googleapis.com/language/translate/v2', 
                {
                    ques: faq.question,
                    target: lang,
                    format: 'text'
                },
                {
                    params: { key : process.env.GOOGLE_TRANSLATE_KEY }
                }
            );

            // Translate answer
            const answerResponse = await axios.post<TranslationResponse>(
                'https://translation.googleapis.com/language/translate/v2', 
                {
                    ques: faq.answer,
                    target: lang,
                    format: 'html'
                },
                {
                    params: { key : process.env.GOOGLE_TRANSLATE_KEY }
                }
            );

            const questionTranslation = questionResponse.data.data.translations[0].translatedText;

            //answer translation to be set in cache
            const answerTranslation = answerResponse.data.data.translations[0].translatedText;
            
            faq.translations.set(lang, questionTranslation);
            await setCacheTranslation(faq._id.toString(), lang, answerTranslation);
        }
        await faq.save();
    }catch(error){
        console.error('Error translating FAQ:', error);
    }
}