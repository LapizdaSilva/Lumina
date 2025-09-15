import cv2
import mediapipe as mp
import joblib
import numpy as np
import os

model_path = "hand_model.pkl"
label_encoder_path = "label_encoder.pkl"

if not os.path.exists(model_path):
    raise FileNotFoundError(f"O modelo \'{model_path}\' nao foi encontrado nesse diretório. {os.getcwd()}")
if not os.path.exists(label_encoder_path):
    raise FileNotFoundError(f"O LabelEncoder \'{label_encoder_path}\' nao foi encontrado nesse diretório. {os.getcwd()}")

try:
    model = joblib.load(model_path)
    label_encoder = joblib.load(label_encoder_path)
except Exception as e:
    raise Exception(f"Erro ao carregar o modelo ou LabelEncoder: {str(e)}. Tenha certeza de que os arquivos não estão corrompidos ou são compatíveis com esta versão do joblib.")

mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils
hands = mp_hands.Hands(max_num_hands=1, min_detection_confidence=0.7)

cap = cv2.VideoCapture(0)
if not cap.isOpened():
    raise Exception("Falha ao acessar a webcam.")

print("Pressione \'ESC\' para sair do programa.")

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        print("Falha em capturar frame da webcam.")
        break

    frame = cv2.flip(frame, 1)
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    result = hands.process(rgb)

    predicted_label = "Nenhuma mao detectada"

    if result.multi_hand_landmarks:
        for handLms in result.multi_hand_landmarks:
            mp_drawing.draw_landmarks(frame, handLms, mp_hands.HAND_CONNECTIONS)

            row = []
            for lm in handLms.landmark:
                row.extend([lm.x, lm.y, lm.z])
            
            row = np.array(row).reshape(1, -1)

            try:
                prediction_encoded = model.predict(row)[0]
                predicted_label = label_encoder.inverse_transform([prediction_encoded])[0]
            except Exception as e:
                predicted_label = f"Erro na predicao: {str(e)}"

    cv2.putText(frame, predicted_label, (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2, cv2.LINE_AA)
    cv2.imshow("Hand Tracking - Predicao Continua", frame)

    if cv2.waitKey(1) & 0xFF == 27:
        break

cap.release()
cv2.destroyAllWindows()