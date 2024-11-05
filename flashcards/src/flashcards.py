from fastapi import FastAPI
from pydantic import BaseModel
from transformers import pipeline, T5ForConditionalGeneration, T5Tokenizer
import math
import nltk

# App 
app = FastAPI()

# Models for 
# 1. QG
# qg_model = T5ForConditionalGeneration.from_pretrained("valhalla/t5-base-qg-hl")
# # qg_model = AutoModelWithLMHead.from_pretrained("valhalla/t5-base-qg-hl")
# qg_tokenizer = T5Tokenizer.from_pretrained("valhalla/t5-base-qg-hl")
qg_model = T5ForConditionalGeneration.from_pretrained("ZhangCheng/T5-Base-Fine-Tuned-for-Question-Generation")
qg_tokenizer = T5Tokenizer.from_pretrained("ZhangCheng/T5-Base-Fine-Tuned-for-Question-Generation")
# 2. QA
qa_model = "mrm8488/spanbert-finetuned-squadv1"
# 3. Generating titles/description
device = "cpu"

model = T5ForConditionalGeneration.from_pretrained("Michau/t5-base-en-generate-headline")
tokenizer = T5Tokenizer.from_pretrained("Michau/t5-base-en-generate-headline")

# Pipelines
qg_pipeline = pipeline("text2text-generation", model=qg_model, tokenizer=qg_tokenizer)
qa_pipeline = pipeline("question-answering", model=qa_model, tokenizer=qa_model)

nltk.download('punkt')
nltk.download('stopwords')

class TextInput(BaseModel):
    text: str

@app.post("/generate_qa")
async def generate_qa(input: TextInput):
    # number of questions to be made
    num_q = 0
    if len(input.text) > 1500:
        num_q = 15
    elif len(input.text) in range(3, 10):
        num_q = 2
    else:
        num_q = (math.floor(len(input.text)/100)) + 3
    
    # generate questions
    generated_questions = qg_pipeline(
        f"generate questions: {input.text}",
        max_length=40,
        num_return_sequences=num_q,
        do_sample=True,
        top_k=30,
        top_p=0.95,
    )
    
    # corrector = pipeline(
    #     'text2text-generation',
    #     'pszemraj/flan-t5-large-grammar-synthesis',
    # )
    
    generated_questions = [(question['generated_text']) for question in generated_questions]

    # generate answers
    flashcards = []
    for question in generated_questions:
        # question = question_data['generated_text']
        result = qa_pipeline(question=question, context=input.text)
        flashcard = {"question": question, "answer": (result['answer'])}
        # append if answer is good
        if result['score'] > 0.2:
            flashcards.append(flashcard)

    return flashcards
    
@app.post("/generate_deck_info")
async def generate_deck_info(input: TextInput):
    # Generate deck title
    model = model.to(device)

    text =  "headline: " + input.text

    max_len = 256

    encoding = tokenizer.encode_plus(text, return_tensors = "pt")
    input_ids = encoding["input_ids"].to(device)
    attention_masks = encoding["attention_mask"].to(device)

    beam_outputs = model.generate(
        input_ids = input_ids,
        attention_mask = attention_masks,
        max_length = max_len,
        num_beams = 3,
        early_stopping = True,
    )

    result = tokenizer.decode(beam_outputs[0])
    print(result)

    # return {"title": result, "description": description}
    return {"title": result}

# also to add later
# @app.post("/generate_suggested_tags")