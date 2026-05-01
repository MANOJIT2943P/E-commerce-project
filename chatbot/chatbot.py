from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_openai import ChatOpenAI
from langchain_core.output_parsers import StrOutputParser
from Tools import DBaccess as db
from prompts import normal, fallback, SUPPORT_EMAIL, SUPPORT_PHONE
import os
from dotenv import load_dotenv

# Load environment variables from .env file if it exists
load_dotenv()

# Load vector store
embedding_model = HuggingFaceEmbeddings(model_name='all-MiniLM-L6-v2')
QAstore = FAISS.load_local(folder_path='QAstore', embeddings=embedding_model, allow_dangerous_deserialization=True)

# Initialize LLM
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    raise ValueError(
        "❌ OPENAI_API_KEY not found!\n"
        "Set it using: $env:OPENAI_API_KEY = 'your-api-key'\n"
        "Or create a .env file with: OPENAI_API_KEY=your-api-key"
    )

llm = ChatOpenAI(
    model="openai/gpt-oss-120b:free",
    base_url="https://openrouter.ai/api/v1",
    api_key=api_key
)

parser = StrOutputParser()

# Initialize app
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Memory for simple order/product follow-up (can be replaced later by real session handling)
user_context = {}

# Define schema for input
class ChatRequest(BaseModel):
    user_id: str
    message: str

@app.post("/chat")
async def chat(req: ChatRequest):
    user_id = req.user_id
    msg = req.message.lower()

    # Handle order/product follow-up
    if user_id in user_context:
        context_type = user_context[user_id]['type']
        if context_type == 'order':
            try:
                order_id = int(msg)
                order_details = db.get_order_info(order_id)
                del user_context[user_id]
                return {"response": f"Here are your order details:\n{order_details}"}
            except ValueError:
                return {"response": "Please enter a valid numeric order ID."}
        elif context_type == 'product':
            product_info = db.get_product_info(msg)
            del user_context[user_id]
            return {"response": f"Here is the product info:\n{product_info}"}

    # Normal query → similarity search with scoring
    try:
        # Use similarity_search_with_score to get confidence scores
        results_with_scores = QAstore.similarity_search_with_score(msg, k=1)
        
        # Check if results exist and meet confidence threshold
        isContext = False
        similarity_threshold = 0.5  # Adjust this threshold as needed
        
        if results_with_scores and len(results_with_scores) > 0:
            result_doc, similarity_score = results_with_scores[0]
            
            # Check if similarity score meets threshold
            if similarity_score >= similarity_threshold:
                print("done1",similarity_score)
                isContext = True
                answer_type = result_doc.metadata.get('Answer', '')
                context_content = result_doc.page_content
                
                # Check for specific answer types that need follow-up
                if answer_type == 'Track Order':
                    user_context[user_id] = {'type': 'order'}
                    return {"response": "Please provide your order ID.", "isContext": True}
                
                elif answer_type == 'Get Product':
                    user_context[user_id] = {'type': 'product'}
                    return {"response": "Please provide the product name.", "isContext": True}
                
                # For other contexts, use LLM with the normal prompt template
                else:
                    llm_prompt = normal.format(user_query=msg, context=context_content, support_email=SUPPORT_EMAIL, support_phone=SUPPORT_PHONE)
                    llm_response = llm.invoke(llm_prompt)
                    response_text = parser.parse(llm_response)
                    return {"response": response_text, "isContext": True}
        
        # No context found - return user-friendly message using fallback prompt
        if not isContext:
            fallback_response = fallback.format(SUPPORT_EMAIL=SUPPORT_EMAIL)
            return {"response": fallback_response, "isContext": False}
    
    except Exception as e:
        error_response = f"An error occurred while processing your request: {str(e)}"
        return {"response": error_response, "isContext": False}