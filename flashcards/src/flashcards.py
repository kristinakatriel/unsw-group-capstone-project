from fastapi import FastAPI
from pydantic import BaseModel
from transformers import pipeline, AutoModelWithLMHead, AutoTokenizer
import re
from nltk.tokenize import sent_tokenize, word_tokenize
import math
import nltk
import string
from bs4 import BeautifulSoup

# App 
app = FastAPI()

# Models for 
# 1. QG
# qg_model = "valhalla/t5-base-qg-hl"
qg_model = AutoModelWithLMHead.from_pretrained("mrm8488/t5-base-finetuned-question-generation-ap")
# 2. QA
qa_model = "mrm8488/spanbert-finetuned-squadv1"

# Pipelines
qg_pipeline = pipeline("text2text-generation", model=qg_model)
qa_pipeline = pipeline("question-answering", model=qa_model, tokenizer=qa_model)

nltk.download('punkt')
nltk.download('stopwords')

class TextInput(BaseModel):
    text: str

def preprocess_for_question_generation(text):
    # Step 1: Sentence Segmentation
    sentences = sent_tokenize(text)

    # Initialize a list to store cleaned sentences
    clean_sentences = []

    for sentence in sentences:
        # Step 2: Text Normalization (Lowercasing, Removing Punctuation, Extra Whitespaces)
        sentence = sentence.lower()  # Lowercasing
        sentence = re.sub(r'[^\w\s]', '', sentence)  # Remove punctuation
        sentence = re.sub(r'\s+', ' ', sentence).strip()  # Remove extra whitespaces

        # Step 3: Cleaning Text (Remove HTML tags, numbers, URLs, and emails)
        sentence = BeautifulSoup(sentence, "html.parser").get_text()  # Remove HTML tags
        # sentence = re.sub(r'\d+', '', sentence)  # Remove numbers
        sentence = re.sub(r'http\S+|www\S+|@\S+', '', sentence)  # Remove URLs and emails

        # Step 4: Word Tokenization (Converting sentences to word tokens)
        word_tokens = word_tokenize(sentence)

        # Rejoin tokenized words into clean sentence
        clean_sentence = ' '.join(word_tokens)
        clean_sentences.append(clean_sentence)

    return ' '.join(clean_sentences)

@app.post("/generate_qa")
async def generate_qa(input: TextInput):
    # number of questions -> WILL CHANGE maybe
    num_q = (len(input.text) / 200) * 5
    num_q = math.ceil(num_q)
    
    # generate questions
    generated_questions = qg_pipeline(
        f"generate questions: {input.text}",
        max_length=40,
        num_return_sequences=10,
        do_sample=True,
        top_k=30,
        top_p=0.95,
    )

    # generate answers
    flashcards = []
    for question_data in generated_questions:
        question = question_data['generated_text']
        result = qa_pipeline(question=question, context=input.text)
        flashcard = {"question": question, "answer": result['answer']}
        # append if answer is good
        if result['score'] > 0.5:
            flashcards.append(flashcard)

    return flashcards