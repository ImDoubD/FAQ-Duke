# FAQ Management API

A RESTful API for managing Frequently Asked Questions (FAQs) with multi-language translation support and Redis caching.

## Features

- RESTful API design
- MongoDB database integration
- Redis caching for translations
- Google Translate API integration
- WYSIWYG editor support for answers
- Multi-language question translations
- Automatic cache invalidation
- Comprehensive error handling

## Installation

```bash
# Clone repository
git clone https://github.com/ImDoubD/FAQ-Duke.git

# Install dependencies
npm install

# Build and Start development server
npm run build
npm run start

# Run tests
npm test
```

### API Documentation

- Base URL \
`http://localhost:3000/api/v1/faqs`

- Endpoints \
Method	Endpoint	Description
POST	/	Create new FAQ
GET	/	Get all FAQs
PUT	/:id	Update FAQ by ID
DELETE	/:id	Delete FAQ by ID

- Create FAQ
POST /api/v1/faqs \
Background Translation has been activated.

``` bash
Copy
curl -X POST http://localhost:3000/api/v1/faqs \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Return policy?",
    "answer": "<p>30-day return window</p>"
  }'
Response:
{
  "id": "65a1bcf86cd799439011",
  "question": "Return policy?",
  "answer": "<p>30-day return window</p>",
  "message": "FAQ created. Translations in progress."
}
```
- Get All FAQs
GET /api/v1/faqs

```bash
Copy
curl "http://localhost:3000/api/v1/faqs?lang=hi"
Response:
[
  {
    "id": "65a1bcf86cd799439011",
    "question": "वापसी नीति?",
    "answer": "<p>30-दिन की वापसी अवधि</p>"
  }
]
```
- Update FAQ
PUT /api/v1/faqs/:id \
Background Re-Translation taking place with first clearing the cache , then again setting it.

```bash
Copy
curl -X PUT http://localhost:3000/api/v1/faqs?id=65a1bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -d '{"answer": "<p>Updated 45-day policy</p>"}'

Response:
{
  "id": "65a1bcf86cd799439011",
  "question": "Return policy?",
  "answer": "<p>Updated 45-day policy</p>",
  "message": "FAQ updated. Retranslating content"
}
```
Delete FAQ
DELETE /api/v1/faqs/:id

```bash
Copy
curl -X DELETE http://localhost:3000/api/v1/faqs?id=65a1bcf86cd799439011
Response:
{
  "message": "FAQ deleted",
  "deletedId": "65a1bcf86cd799439011"
}
```

### Model Schema
```bash
interface IFAQ {
  _id: ObjectId;
  question: string;          // Original English question
  answer: string;           // HTML-formatted answer
  translations: Map<        // Language translations
    string,                 // Language code (e.g., 'hi', 'es')
    string                  // Translated question
  >;
  
  // Method to get translated question
  getTranslatedQuestion(lang: string): string;
}
```
### Assumptions
- Answer input to be given in HTML as HTML format expected as input taken from WYSIWYG editor - CKEditor of ReactJS.
- Languages taken : [Hindi (hi), Bengali (bn), Spanish (es), French (fr)]
- Google Cloud Setup
  - Valid Google Cloud API key with Translation API enabled.
  - Translation API quota sufficient for expected traffic.

- Redis Configuration
  - Redis server accessible at provided connection details.
  - Adequate memory allocation for caching.

- Security
  - API exposed behind reverse proxy with HTTPS.
  - Proper authentication/authorization implemented.
  - Input sanitization handled at client side.

- Performance
  - Average FAQ size < 10KB.
  - Expected QPS within Redis and MongoDB limits.


### Caching Strategy
- Key Format: faq:<ID>:<LANG>
- TTL: 1 hour (3600 seconds)
- Cache Invalidation:
  - On FAQ update
  - On FAQ deletion
  - Automatic expiration
