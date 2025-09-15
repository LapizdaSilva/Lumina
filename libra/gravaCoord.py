import cv2
import mediapipe as mp
import csv
import os

mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils
hands = mp_hands.Hands(max_num_hands=1, min_detection_confidence=0.7)

csv_file = "hand_data.csv"

# contador global de IDs
if not os.path.exists(csv_file):
    current_id = 1
    with open(csv_file, mode="w", newline="") as f:
        writer = csv.writer(f)
        header = ["id", "0", "class"]
        for i in range(21):
            header += [f"x{i}", f"y{i}", f"z{i}"]
        writer.writerow(header)
else:
    # continua a contagem a partir do último id salvo
    with open(csv_file, "r") as f:
        lines = f.readlines()
        current_id = len(lines)  # primeira linha é cabeçalho

def save_landmarks(label, landmarks):
    global current_id
    row = [current_id, 0, label]  # formato: id,0,class
    for lm in landmarks.landmark:
        row += [lm.x, lm.y, lm.z]
    with open(csv_file, mode="a", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(row)
    current_id += 1

base_image_folder = "data/imagens_libras"

if not os.path.exists("data"):
    os.makedirs("data")
if not os.path.exists(base_image_folder):
    os.makedirs(base_image_folder)

for subfolder_name in os.listdir(base_image_folder):
    current_image_folder = os.path.join(base_image_folder, subfolder_name)
    if os.path.isdir(current_image_folder):
        label = subfolder_name  
        image_files = [os.path.join(current_image_folder, f) for f in os.listdir(current_image_folder) if f.endswith((".png", ".jpg", ".jpeg"))]

        for image_file in image_files:
            frame = cv2.imread(image_file)
            if frame is None:
                print(f"Não foi possível carregar a imagem: {image_file}")
                continue

            frame = cv2.flip(frame, 1)  
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            result = hands.process(rgb)

            if result.multi_hand_landmarks:
                for idx, handLms in enumerate(result.multi_hand_landmarks):
                    mp_drawing.draw_landmarks(frame, handLms, mp_hands.HAND_CONNECTIONS)
                    handedness = result.multi_handedness[idx].classification[0].label

                    lm = handLms.landmark[8]  
                    x_pixel, y_pixel = int(lm.x * frame.shape[1]), int(lm.y * frame.shape[0])
                    cv2.putText(frame, handedness, (x_pixel, y_pixel - 20),
                                cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 0, 0), 2)

                    save_landmarks(label, handLms)
                    cv2.waitKey(1)
