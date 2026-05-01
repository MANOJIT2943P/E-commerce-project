"""
Script to update FAISS vector store from CSV data
This script reads Q&A data from faiss_data.csv and creates/updates the FAISS index
"""

import csv
import os
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_core.documents import Document

def load_csv_data(csv_path):
    """Load Q&A data from CSV file"""
    documents = []
    
    try:
        with open(csv_path, 'r', encoding='utf-8-sig') as csvfile:  # UTF-8-sig removes BOM
            reader = csv.DictReader(csvfile)
            
            # Get actual column names and clean them
            if reader.fieldnames:
                fieldnames = [name.strip() for name in reader.fieldnames]
                print(f"Column names: {fieldnames}")
                
                # Identify which columns contain content and answer
                content_col = None
                answer_col = None
                
                for name in fieldnames:
                    if 'content' in name.lower():
                        content_col = name
                    elif 'answer' in name.lower():
                        answer_col = name
                
                print(f"Using columns: content='{content_col}', answer='{answer_col}'")
                
                for idx, row in enumerate(reader):
                    content = row.get(content_col, '').strip() if content_col else ''
                    answer = row.get(answer_col, '').strip() if answer_col else ''
                    
                    if content and answer:
                        # Create document with content as page_content and Answer as metadata
                        doc = Document(
                            page_content=content,
                            metadata={'Answer': answer, 'index': idx}
                        )
                        documents.append(doc)
                        print(f"✓ Loaded Q{len(documents)}: {content[:50]}...")
                    elif content or answer:
                        print(f"⚠ Skipped row {idx + 1}: content='{content}' answer='{answer}'")
        
        print(f"\n✓ Total documents loaded: {len(documents)}")
        return documents
    
    except FileNotFoundError:
        print(f"❌ Error: CSV file not found at {csv_path}")
        return []
    except Exception as e:
        print(f"❌ Error reading CSV: {str(e)}")
        return []

def create_vector_store(documents, faiss_path='QAstore'):
    """Create FAISS vector store from documents"""
    if not documents:
        print("❌ No documents to index")
        return False
    
    try:
        print("\n🔄 Initializing embeddings model...")
        embeddings = HuggingFaceEmbeddings(model_name='all-MiniLM-L6-v2')
        
        print("🔄 Creating FAISS vector store...")
        vectorstore = FAISS.from_documents(documents, embeddings)
        
        print(f"🔄 Saving vector store to '{faiss_path}'...")
        vectorstore.save_local(faiss_path)
        
        print(f"✓ Vector store updated successfully!")
        print(f"✓ Saved to: {os.path.abspath(faiss_path)}")
        return True
    
    except Exception as e:
        print(f"❌ Error creating vector store: {str(e)}")
        return False

def main():
    """Main function"""
    print("=" * 60)
    print("FAISS Vector Store Update Script")
    print("=" * 60)
    
    csv_path = 'exported_data/faiss_data.csv'
    faiss_path = 'QAstore'
    
    # Create QAstore directory if it doesn't exist
    if not os.path.exists(faiss_path):
        os.makedirs(faiss_path)
        print(f"✓ Created directory: {faiss_path}")
    
    # Load CSV data
    print(f"\n📂 Loading data from: {csv_path}")
    documents = load_csv_data(csv_path)
    
    # Create and save vector store
    if documents:
        success = create_vector_store(documents, faiss_path)
        if success:
            print("\n" + "=" * 60)
            print("✓ Vector store update completed successfully!")
            print("=" * 60)
        else:
            print("\n" + "=" * 60)
            print("❌ Vector store update failed!")
            print("=" * 60)
    else:
        print("\n" + "=" * 60)
        print("❌ No documents loaded. Update failed!")
        print("=" * 60)

if __name__ == "__main__":
    main()
