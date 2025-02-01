import { Request, Response } from 'express';
import { FAQ, FAQDocument } from '../model/faqModel';
import { translateFAQ } from '../service/translationService';
import { getCacheTranslation, setCacheTranslation } from '../service/cacheService';

export class FAQController {
    public static async createFaq(req: Request, res: Response) {
        try{
            const { question, answer } = req.body;
            if(!question || !answer){
                return res.status(400).json({ error: 'Missing required fields' });
            }

            const newFAQ : FAQDocument = new FAQ({
                question,
                answer
            });

            const savedFAQ = await newFAQ.save();
            translateFAQ(savedFAQ).catch(error => console.error('Translation Failed: ', error));
            res.status(201).json({
                id: savedFAQ._id,
                question: savedFAQ.question,
                answer: savedFAQ.answer,
                message: 'FAQ created. Translations in progress.'
            });
        }catch(error){
            console.error('Error creating FAQ:', error);
            res.status(500).json({message : 'Internal Server Error'});
        }
    }

    public static async getFAQ(req: Request, res: Response) {
        try{
            const lang = req.query.lang as string || 'en';
            const faqs = await FAQ.find();

            const response = await Promise.all(faqs.map(async (faq) => {
                const cachedTranslation = await getCacheTranslation(faq._id.toString(), lang);

                return {
                    id: faq._id,
                    question: faq.getTranslatedQuestion(lang),
                    answer: cachedTranslation || faq.answer,
                    translations: Array.from(faq.translations.entries())
                };
            }));
            
            res.json(response);
        }catch(error){
            console.error('Get FAQs error: ', error);
            res.status(500).json({message : 'Internal Server Error'});
        }
    }
}