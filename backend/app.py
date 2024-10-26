from flask import Flask, request, jsonify
from flask_cors import CORS 
from azure.cognitiveservices.vision.computervision import ComputerVisionClient
from azure.cognitiveservices.vision.computervision.models import OperationStatusCodes
from msrest.authentication import CognitiveServicesCredentials
import time
from groq import Groq
from pinecone.grpc import PineconeGRPC as Pinecone
from dotenv import load_dotenv
import os

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
        f'{{"Nutrients": {{}}, "Notes": []}}. '
        f'In the "Nutrients" section, list each nutrient present in {nutrition_label} with "yes" or "no" where yes stands for safe and no stands for not safe . '
        f'In the "Notes" section, provide explanations for each recommendation.'
        f'No additional texts from your side just json'
    )
    chat_completion= client.chat.completions.create(
        messages=[{
            "role":"user",
            "content":query,
        }],
        model="llama3-8b-8192",
    )
    response_content = chat_completion.choices[0].message.content.strip()
    lines = response_content.splitlines()
    cleaned_response = '\n'.join(lines[2:])
    query2=f'for the response{cleaned_response} replace any extra data in nutrient section with just yes or no and add a new entry at the end overall safety:yes/no(yes if number of yes is more and no if number of no is more) and return in same format and dont add anything from your side(nothing i need except this) '
    chat2=client.chat.completions.create(
        messages=[{
            "role":"user",
            "content":query2,
        }],
        model="llama3-8b-8192",
    )
    resp=chat2.choices[0].message.content.strip()
    line=resp.splitlines()
    cp='\n'.join(line[2:])
    
    return cp


@app.route('/extract', methods=['POST','GET'])
def extract():
    if 'image' not in request.files:
        return jsonify({"error": "No file provided"}), 400

    image_file = request.files['image']
    print("received image")
    try:
        
        nutrition_label =  extract_and_format_nutrition_label(image_file.stream)
        print("OCR complete")
        if nutrition_label:
            chat= query(nutrition_label)
            print("Response is ",chat)
            return jsonify({"Chat": chat})
        else:
            
            return jsonify({"error": "Failed to extract text"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
