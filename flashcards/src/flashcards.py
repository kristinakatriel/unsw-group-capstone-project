from fastapi import FastAPI
from pydantic import BaseModel
from transformers import pipeline, T5ForConditionalGeneration, T5Tokenizer
import nltk
from nltk.tokenize import sent_tokenize
import asyncio

# Initialize FastAPI app
app = FastAPI()

# Load models
qg_model = T5ForConditionalGeneration.from_pretrained("ZhangCheng/T5-Base-Fine-Tuned-for-Question-Generation")
qg_tokenizer = T5Tokenizer.from_pretrained("ZhangCheng/T5-Base-Fine-Tuned-for-Question-Generation")
qa_model = "mrm8488/spanbert-finetuned-squadv1"

# Set up pipelines
qg_pipeline = pipeline("text2text-generation", model=qg_model, tokenizer=qg_tokenizer)
qa_pipeline = pipeline("question-answering", model=qa_model, tokenizer=qa_model)

# Download nltk resources
nltk.download('punkt')

class TextInput(BaseModel):
    text: str

@app.post("/generate_qa")
async def generate_qa(input: TextInput):
    text = input.text
    flashcards = []

    # Helper function to create flashcards from text chunks asynchronously
    async def process_chunk(chunk, num_questions):
        questions = qg_pipeline(
            f"generate questions: {chunk}",
            max_length=40,
            num_return_sequences=num_questions,
            do_sample=True,
            top_k=30,
            top_p=0.95,
        )
        for question_data in questions:
            question = question_data['generated_text']
            answer = qa_pipeline(question=question, context=chunk)
            if answer['score'] > 0.2:
                flashcards.append({"question": question, "answer": answer['answer']})

    # Split long text into chunks of ~512 tokens
    sentences = sent_tokenize(text)
    current_chunk = ""
    tasks = []

    for sentence in sentences:
        if len(qg_tokenizer(current_chunk + " " + sentence)['input_ids']) <= 512:
            current_chunk += " " + sentence
        else:
            # Process the current chunk asynchronously
            tasks.append(process_chunk(current_chunk, min(5, len(current_chunk) // 100)))
            current_chunk = sentence

    # Process the last remaining chunk if any
    if current_chunk:
        tasks.append(process_chunk(current_chunk, min(5, len(current_chunk) // 100)))

    # Run all tasks concurrently and wait for completion
    await asyncio.gather(*tasks)

    return flashcards