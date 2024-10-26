from flask import Flask, request, jsonify
from flask_cors import CORS 
from azure.cognitiveservices.vision.computervision import ComputerVisionClient
from azure.cognitiveservices.vision.computervision.models import OperationStatusCodes
from msrest.authentication import CognitiveServicesCredentials
import time
from groq import Groq
from pinecone.grpc import PineconeGRPC as Pinecone
import asyncio
from pydantic import BaseModel
from dotenv import load_dotenv
import os
import re 


class UserInfo(BaseModel):
    protien: str
    energy: str
    carbohydrates: str

load_dotenv()

app = Flask(__name__)
CORS(app)
subscription_key =os.getenv('AZURE_KEY')
endpoint = os.getenv('ENDPOINT')
key=os.getenv('PINECONE_KEY')
pc=Pinecone(api_key=key)
client = Groq(
    api_key=os.getenv('GROQ'),
)

index_name="sample-index"
index=pc.Index(index_name)
computervision_client = ComputerVisionClient(endpoint, CognitiveServicesCredentials(subscription_key))

def extract_and_format_nutrition_label(image_stream):
    read_response = computervision_client.read_in_stream(image_stream, raw=True)
    operation_location = read_response.headers["Operation-Location"]
    operation_id = operation_location.split("/")[-1]


    while True:
        result = computervision_client.get_read_result(operation_id)
        if result.status not in ['notStarted', 'running']:
            break
        time.sleep(1)


    if result.status == OperationStatusCodes.succeeded:
        read_results = result.analyze_result.read_results
        nutrition_label = ""
        for page in read_results:
            for line in page.lines:
                nutrition_label += line.text + "\n"
        return nutrition_label
    else:
        return None
    
def query(nutrition_label):
    data="age:65,weight:70,gender:male,condition:Diabetic"
    query_response=pc.inference.embed(
        model="multilingual-e5-large",
        inputs=[data],
        parameters={
            "input_type":"query",
            "truncate":"END"
        }
    )
    
    results=index.query(
        vector=query_response.data[0].values,
        top_k=3,
        include_metadata=True
    )
    matched_texts = [item['metadata'].get('text', '') for item in results['matches']]
    sources = [item['metadata']['source'] for item in results['matches']]
    scores = [item['score'] for item in results['matches']]


    matched_info = ' '.join(matched_texts)
    query = (
        f'Based on {matched_info}, just return whether a product with nutrients {nutrition_label} '
        f'is safe for a patient with condition {data}. '
        f'Please provide the output in the following JSON format: '
        f'{{"Nutrients": {{}}, "Notes": {{}}}}. '
        f'In the "Nutrients" section, list each nutrient present in {nutrition_label} with "yes" or "no" where yes stands for safe and no stands for not safe . Give a detailed conclusion based on the nutrition_label in notes and ensure that notes is not empty'
    )
    chat_completion= client.chat.completions.create(
        messages=[{
            "role":"user",
            "content":query,
        }],
        temperature=0.2,
        model="llama3-8b-8192",
    )
    response_content = chat_completion.choices[0].message.content.strip()
    lines = response_content.splitlines()
    cleaned_response = '\n'.join(lines[2:])
    query2=f'for the response{cleaned_response} replace any extra data in nutrient section with just yes or no and add a new entry at the end overall rating out of hundred and give the permissible consumption quantity for a packet of the food product return in same format and do not add anything and give only json '
    chat2=client.chat.completions.create(
        messages=[{
            "role":"user",
            "content":query2,
        }],
        temperature=0.1,
        model="llama3-8b-8192",
    )
    resp=chat2.choices[0].message.content.strip()
    line=resp.splitlines()
    cp='\n'.join(line[2:])
    
    
    
    return cp

def recommend(chat):
    product = "chips"
    query3=f'{chat} if overall rating is <50, then for this lays {product}, give 2 healthier alternative food products with brief description (max 15 words) as to why it is better, else dont give any recommendation whatsoever '
    chat3=client.chat.completions.create(
        messages=[{
            "role":"user",
            "content":query3,
        }],
        temperature=0.1,
        model="llama3-8b-8192",
    )
    resp3=chat3.choices[0].message.content.strip()
    line3=resp3.splitlines()
    cp3='\n'.join(line3[2:])

    return cp3

@app.route('/extract_nutrition_label', methods=['POST'])
def extract_nutrition_label():
    if 'image' not in request.files:
        return jsonify({"error": "No file provided"}), 400

    image_file = request.files['image']
    try:
        
        nutrition_label =  extract_and_format_nutrition_label(image_file.stream)
        if nutrition_label:
            chat= query(nutrition_label)
            recomend = recommend(chat)
            out=chat+recomend
            f_out=re.sub(r'`+', '', out)
            return jsonify({"Chat": f_out})
        else:
            
            return jsonify({"error": "Failed to extract text"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
