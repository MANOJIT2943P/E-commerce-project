import joblib
import pandas as pd
from fastapi import FastAPI
from pydantic import BaseModel, Field
from typing import List


similarity = joblib.load('similarity.pkl.gz')
data = pd.read_csv('Products.csv')

app = FastAPI()


# Define response models
class Product(BaseModel):
    id: str = Field(alias="_id")
    uid: str
    name: str
    price: float
    rating: float
    stock: int
    category: str
    description: str
    minStockLevel: int


class RecommendationResponse(BaseModel):
    recommended_products: List[Product]


@app.post('/recommend', response_model=RecommendationResponse)
def recommend(product_name: str):

    # ─── Step 1: Try full query first ───────────────────────────────
    matches = data[data['name'].str.contains(product_name, case=False, na=False)]

    # ─── Step 2: Fallback — split into keywords and search each ─────
    if matches.empty:
        keywords = product_name.split()  # ["samsung", "s25", "ultra"]

        fallback_indices = set()
        for keyword in keywords:
            kw_matches = data[data['name'].str.contains(keyword, case=False, na=False)]
            fallback_indices.update(kw_matches.index.tolist())

        if not fallback_indices:
            raise HTTPException(
                status_code=404,
                detail=f"No products found matching '{product_name}' or any of its keywords."
            )

        # Use the first fallback match as anchor for similarity
        matches = data.loc[list(fallback_indices)]

    # ─── Step 3: Get similarity scores for all matched indices ───────
    prod_index = matches.index[0]
    dis = similarity[prod_index]

    # Boost scores for other keyword matches so they rank higher
    for idx in matches.index:
        dis[idx] = min(dis[idx] + 0.2, 1.0)  # bump keyword-matched items

    # ─── Step 4: Build recommendations ──────────────────────────────
    prod_list = sorted(
        list(enumerate(dis)), reverse=True, key=lambda x: x[1]
    )[:15]

    recommendations = []
    for i in prod_list:
        product = data.iloc[i[0]]
        recommendations.append({
            '_id': str(product['_id']),
            'uid': str(product['u_id']),
            'name': str(product['name']),
            'price': float(product['price']),
            'rating': float(product['rating']),
            'stock': int(product['stock']),
            'minStockLevel': int(product['minStockLevel']),
            'category': str(product['category']),
            'description': str(product['description']),
        })

    return {
        'recommended_products': recommendations,
        # 'matched_by': 'exact' if matches is not None else 'keywords'  # helpful for debugging
    }