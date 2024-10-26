import os
from flask import Flask, request, jsonify
from groq import Groq
from flask_cors import CORS

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Initialize the Groq client with the API key from environment variables
client = Groq(
    api_key="",  # Ensure the API key is set in the environment
)


@app.route('/api/groq', methods=['POST'])
def get_model_response():
    print('show me something')
    try:
        # Get user input from the POST request body (e.g., user message)
        user_message = request.json.get('message')

        # Send a chat completion request to the Groq client
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": user_message,  # Use the message from the request body
                }
            ],
            model="llama3-8b-8192",  # Model to be used for the query
        )

        # Extract the model's response
        model_response = chat_completion.choices[0].message.content

        # Return the model's response as JSON
        return jsonify({"response": model_response})

    except Exception as e:
        # Return an error message if something goes wrong
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000,debug=True)
