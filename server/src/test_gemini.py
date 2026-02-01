from google.genai import Client
import os
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

try:
    client = Client(api_key=api_key)
    response = client.models.generate_content(
        model='gemini-flash-latest',
        contents='Hello, respond with "Success"'
    )
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error Message: {str(e)}")
