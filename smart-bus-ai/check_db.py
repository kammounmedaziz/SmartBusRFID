import pickle
import os

if os.path.exists('face_db.pkl'):
    with open('face_db.pkl', 'rb') as f:
        db = pickle.load(f)
    print('Face Database Contents:')
    print(f'Total users: {len(db)}')
    for user_id, data in db.items():
        name = data.get('name', 'Unknown')
        embeddings = data.get('embeddings', [])
        print(f'User {user_id}: {name}, {len(embeddings)} embeddings')
        print(f'  Created: {data.get("created_at", "N/A")}')
        print(f'  Updated: {data.get("updated_at", "N/A")}')
        if embeddings:
            print(f'  Embedding shape: {len(embeddings[0])} dimensions')
else:
    print('No face database found')