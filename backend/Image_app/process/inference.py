import numpy as np
import torch, base64, cv2
from ultralytics import YOLO

def input_fn(request_body):
    print("Executing input_fn from inference.py ...")
    model = YOLO("C:/Users/devap/OneDrive/Documents/mini_project/demo_2/backend/Image_app/process/best.pt")
    jpg_original = base64.b64decode(request_body)
    jpg_as_np = np.frombuffer(jpg_original, dtype=np.uint8)
    img = cv2.imdecode(jpg_as_np, flags=-1)

    # Convert 4-channel (RGBA) to 3-channel (RGB)
    if img.shape[2] == 4:
        img = cv2.cvtColor(img, cv2.COLOR_BGRA2BGR)

    return predict_fn(img, model)

def predict_fn(input_data, model):
    print("Executing predict_fn from inference.py ...")
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    model.to(device)

    with torch.no_grad():
        results = model(input_data)

    return output_fn(results)

# Class index to object name mapping
CLASS_NAMES = {
    0: "fc6dfe4a-969f-4a03-a356-0ae146d728fd", 1: "d18e4aef-8d2f-42ab-a1d7-67a3bed8e6f9", 2: "aae6b447-8bdc-49b8-856b-0acae91045fd", 3: "a3b252e1-2b8d-4359-abd7-9d51452e9193", 4: "d3ca3799-c79e-4081-bedf-4becf74f68aa", 5: "921b4658-e29f-4ff9-89d1-8fc6327eb2bb", 6: "8246009a-720e-4334-827d-5d53ca0aee0e", 7: "a46b8f44-94d9-4a14-be4f-d940aa5695c6", 8: "18df62b8-0cb2-423f-bb74-2e8a555a88e2",
    9: "8da03a94-80d7-47a7-8dd4-8ad9d1adbe1b"}
    
def output_fn(prediction_output):
    print("Executing output_fn from inference.py ...")

    detected_classes = set()

    for result in prediction_output:
        if hasattr(result, "probs") and result.probs is not None:
            probs = result.probs.cpu().numpy()
            if probs.size > 0:
                class_idx = int(probs.argmax())
                detected_classes.add(class_idx)

        if hasattr(result, "boxes") and result.boxes is not None:
            if result.boxes.cls.numel() > 0:
                class_indices = result.boxes.cls.cpu().numpy().astype(int)
                detected_classes.update(class_indices.tolist())

    if not detected_classes:
        return []

    detected_objects = [CLASS_NAMES[idx] for idx in detected_classes if idx in CLASS_NAMES]
    return detected_objects
