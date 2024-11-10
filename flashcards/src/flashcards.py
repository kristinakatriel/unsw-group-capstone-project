from fastapi import FastAPI
from pydantic import BaseModel
from transformers import pipeline, T5ForConditionalGeneration, T5Tokenizer
import math
from keybert import KeyBERT
import nltk

# Initialize FastAPI app
app = FastAPI()

# Download necessary nltk resources
nltk.download('punkt')
nltk.download('stopwords')

# Models and Pipelines
# 1. Question Generation (QG)
qg_model = T5ForConditionalGeneration.from_pretrained("ZhangCheng/T5-Base-Fine-Tuned-for-Question-Generation")
qg_tokenizer = T5Tokenizer.from_pretrained("ZhangCheng/T5-Base-Fine-Tuned-for-Question-Generation")
qg_pipeline = pipeline("text2text-generation", model=qg_model, tokenizer=qg_tokenizer)

# 2. Question Answering (QA)
qa_pipeline = pipeline("question-answering", model="mrm8488/spanbert-finetuned-squadv1", tokenizer="mrm8488/spanbert-finetuned-squadv1")

# 3. Title Generation
title_model = T5ForConditionalGeneration.from_pretrained("Michau/t5-base-en-generate-headline")
title_tokenizer = T5Tokenizer.from_pretrained("Michau/t5-base-en-generate-headline")
title_pipeline = pipeline("text2text-generation", model=title_model, tokenizer=title_tokenizer)

# Suggested Tags
kw_model = KeyBERT()

# Input Model for Request
class TextInput(BaseModel):
    text: str

# Generate Q&A Pairs
@app.post("/generate_qa")
async def generate_qa(input: TextInput):
    # Determine number of questions to generate
    num_q = 15 if len(input.text) > 1500 else max((math.floor(len(input.text)/100)) + 3, 2)

    # Generate questions
    generated_questions = qg_pipeline(
        f"generate questions: {input.text}",
        max_length=40,
        num_return_sequences=num_q,
        do_sample=True,
        top_k=30,
        top_p=0.95,
    )

    # Extract questions
    generated_questions = [q['generated_text'] for q in generated_questions]

    # Generate answers and build flashcards
    flashcards = []
    for question in generated_questions:
        result = qa_pipeline(question=question, context=input.text)
        if result['score'] > 0.2:
            flashcards.append({"question": question, "answer": result['answer']})

    return flashcards

# Generate Deck Title and Description
@app.post("/generate_deck_title")
async def generate_deck_title(input: TextInput):
    # Generate title using title pipeline
    generated_title = title_pipeline(
        f"headline: {input.text}",
        max_length=20,
        num_beams=3,
        early_stopping=True,
        num_return_sequences=1,
    )

    # Extract generated title
    title = generated_title[0]['generated_text'].replace("<pad>", "").strip()

    return {"title": title}

# Placeholder for additional routes, e.g., suggested tags
@app.post("/generate_suggested_tags")
async def generate_suggested_tags(input: TextInput):
    # Extract keywords
    keywords = kw_model.extract_keywords(input.text, keyphrase_ngram_range=(1, 2), stop_words='english', top_n=5)

    # Display keywords as tags
    tags = list({kw[0] for kw in keywords})
    return tags