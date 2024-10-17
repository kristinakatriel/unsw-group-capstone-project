from fastapi import FastAPI
from pydantic import BaseModel
from transformers import pipeline, AutoTokenizer, AutoModelForQuestionAnswering

app = FastAPI()
# model = AutoModelForQuestionAnswering.from_pretrained('deepset/bert-base-cased-squad2')
# tokenizer = AutoTokenizer.from_pretrained('deepset/bert-base-cased-squad2')
qg_pipeline = pipeline("text2text-generation", model="valhalla/t5-base-qg-hl")
qa_pipeline = pipeline("question-answering", model="mrm8488/spanbert-finetuned-squadv1")

class TextInput(BaseModel):
    text: str
    
def preprocess(text):
    return text + 'hi'

@app.post("/generate_qa")
async def generate_qa(input: TextInput):
    generated_questions = qg_pipeline(
        f"generate questions: {input.text}",
        max_length=40,
        num_return_sequences=10,
        do_sample=True,
        top_k=30,
        top_p=0.95,
    )

    flashcards = []
    for question_data in generated_questions:
        question = question_data['generated_text']
        result = qa_pipeline(question=question, context=input.text)
        flashcard = {"question": question, "answer": result['answer']}
        flashcards.append(flashcard)

    return flashcards