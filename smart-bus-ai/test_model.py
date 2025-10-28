import cv2
import numpy as np
from deepface import DeepFace

print('Testing DeepFace model...')
try:
    # Create a dummy image for testing
    dummy_img = np.zeros((100, 100, 3), dtype=np.uint8)

    result = DeepFace.represent(
        img_path=dummy_img,
        model_name='Facenet',
        enforce_detection=False
    )
    print(f'Model used: Facenet')
    print(f'Embedding dimensions: {len(result[0]["embedding"])}')
except Exception as e:
    print(f'Error with Facenet: {e}')
    try:
        result = DeepFace.represent(
            img_path=dummy_img,
            model_name='VGG-Face',
            enforce_detection=False
        )
        print(f'Model used: VGG-Face')
        print(f'Embedding dimensions: {len(result[0]["embedding"])}')
    except Exception as e2:
        print(f'Error with VGG-Face: {e2}')