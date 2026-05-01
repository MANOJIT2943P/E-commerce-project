import json
import csv
import os
import pickle

def export_faiss_to_csv(faiss_folder: str, output_dir: str = 'exported_data'):
    """
    Export all data from FAISS vector store to JSON and CSV files.
    Reads the FAISS index files directly to avoid dependency conflicts.
    
    Args:
        faiss_folder: Path to the folder containing FAISS index
        output_dir: Directory to save exported files
    """
    
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)
    
    try:
        print("Loading FAISS index files...")
        
        # Construct paths to FAISS files
        index_pkl_path = os.path.join(faiss_folder, 'index.pkl')
        
        if not os.path.exists(index_pkl_path):
            print(f"✗ Error: Could not find {index_pkl_path}")
            return
        
        # Load the pickle file which contains the docstore and index mapping
        with open(index_pkl_path, 'rb') as f:
            faiss_data = pickle.load(f)
        
        print("Extracting documents from vector store...")
        
        documents = []
        
        # Extract components from the loaded data
        # faiss_data is a tuple: (InMemoryDocstore, index_to_docstore_id_dict)
        docstore = faiss_data[0]  # InMemoryDocstore
        index_to_docstore_id = faiss_data[1]  # Dictionary mapping index to docstore ID
        
        # Access the internal dictionary from the InMemoryDocstore
        if hasattr(docstore, '_dict'):
            docs_dict = docstore._dict
        else:
            print("✗ Error: Could not access docstore internal dictionary")
            return
        
        # Iterate through all documents
        for doc_id, doc in docs_dict.items():
            # Extract content and metadata
            if hasattr(doc, 'page_content'):
                content = doc.page_content
                metadata = doc.metadata if hasattr(doc, 'metadata') else {}
            else:
                content = str(doc)
                metadata = {}
            
            doc_dict = {
                'id': str(doc_id),
                'content': content,
                'metadata': metadata
            }
            documents.append(doc_dict)
        
        print(f"Successfully extracted {len(documents)} documents")
        
        # Export to CSV
        if documents:
            csv_path = os.path.join(output_dir, 'faiss_data.csv')
            with open(csv_path, 'w', newline='', encoding='utf-8') as f:
                # Flatten metadata for CSV
                all_metadata_keys = set()
                for doc in documents:
                    all_metadata_keys.update(doc['metadata'].keys())
                
                fieldnames = ['id', 'content'] + sorted(list(all_metadata_keys))
                writer = csv.DictWriter(f, fieldnames=fieldnames)
                writer.writeheader()
                
                for doc in documents:
                    row = {
                        'id': doc['id'],
                        'content': doc['content']
                    }
                    row.update(doc['metadata'])
                    writer.writerow(row)
            
            print(f"✓ Exported to CSV: {csv_path}")
        
        print(f"\n✓ Export completed successfully!")
        print(f"  Total documents exported: {len(documents)}")
        print(f"  Output directory: {os.path.abspath(output_dir)}")
            
    except Exception as e:
        print(f"✗ Error during export: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    # Export from QAstore folder
    export_faiss_to_csv(
        faiss_folder='QAstore',
        output_dir='exported_data'
    )
