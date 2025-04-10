from ultralytics import YOLO
import cv2

# Load your YOLOv8 model (replace with your model path if different)
model = YOLO("best.pt")  # or "yolov8n.pt", "yolov8s.pt", etc.

# Start the webcam
cap = cv2.VideoCapture(0)  # Use 0 for default camera

# Set frame size (optional)
cap.set(3, 1280)  # Width
cap.set(4, 720)   # Height

while True:
    ret, frame = cap.read()
    if not ret:
        break

    # Run YOLOv8 inference on the frame
    results = model(frame, stream=True)

    # Loop through results and draw boxes
    for r in results:
        boxes = r.boxes
        for box in boxes:
            # Bounding box
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            conf = float(box.conf[0])
            cls = int(box.cls[0])
            label = f"{model.names[cls]} {conf:.2f}"

            # Draw rectangle and label
            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
            cv2.putText(frame, label, (x1, y1 - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)

    # Display the frame
    cv2.imshow("YOLOv8 Webcam", frame)

    # Press 'q' to quit
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# Cleanup
cap.release()
cv2.destroyAllWindows()