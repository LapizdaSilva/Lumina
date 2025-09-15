import cv2
import mediapipe as mp
import csv
import os
import time

mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils
hands = mp_hands.Hands(max_num_hands=2, min_detection_confidence=0.7)

csv_file = "hand_data.csv"

last_sequence_id = 0
if os.path.exists(csv_file):
    try:
        with open(csv_file, mode="r") as f:
            reader = csv.reader(f)
            header = next(reader)
            if 'sequence_id' in header:
                seq_id_col_idx = header.index('sequence_id')
                for row in reversed(list(reader)):
                    if row:
                        last_sequence_id = int(row[seq_id_col_idx])
                        break
    except Exception as e:
        print(f"Erro ao ler o último sequence_id do CSV: {e}. Iniciando sequence_id do 0.")
        last_sequence_id = 0

def get_next_sequence_id():
    global last_sequence_id
    last_sequence_id += 1
    return last_sequence_id


if not os.path.exists(csv_file):
    with open(csv_file, mode="w", newline="") as f:
        writer = csv.writer(f)
        header = ["sequence_id", "frame_id", "label"]
        for i in range(21):
            header += [f"x{i}", f"y{i}", f"z{i}"]
        writer.writerow(header)

def save_landmarks(sequence_id, frame_id, label, landmarks):
    row = [sequence_id, frame_id, label]
    for lm in landmarks.landmark:
        row += [lm.x, lm.y, lm.z]
    with open(csv_file, mode="a", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(row)

cap = cv2.VideoCapture(0)
if not cap.isOpened():
    print("Erro: Não conseguiu abrir a câmera. Verifique se ela está conectada e não está em uso.")
    exit()

base_image_folder = "data/imagens_libras"

if not os.path.exists("data"):
    os.makedirs("data")
if not os.path.exists(base_image_folder):
    os.makedirs(base_image_folder)

current_label = ""
current_save_path = ""
image_counter = 0

print("\n--- Instruções ---")
print("Pressione \'L\' para definir o rótulo (letra) e a pasta de destino.")
print("Pressione \'S\' para salvar uma única imagem e suas landmarks na pasta definida.")
print("Pressione \'A\' para iniciar a captura automática de múltiplas imagens.")
print("Pressione \'D\' para iniciar a captura de um gesto dinâmico (sequência de frames).")
print("Pressione \'ESC\' para sair do programa.")
print("------------------\n")

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        print("Erro ao capturar frame da câmera.")
        break

    frame = cv2.flip(frame, 1)
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    result = hands.process(rgb)

    display_text = f"Rotulo: {current_label if current_label else 'Nenhum'}"
    cv2.putText(frame, display_text, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2, cv2.LINE_AA)

    if result.multi_hand_landmarks:
        for idx, handLms in enumerate(result.multi_hand_landmarks):
            mp_drawing.draw_landmarks(frame, handLms, mp_hands.HAND_CONNECTIONS)
            handedness = result.multi_handedness[idx].classification[0].label
            lm = handLms.landmark[8]
            x_pixel, y_pixel = int(lm.x * frame.shape[1]), int(lm.y * frame.shape[0])
            cv2.putText(frame, handedness, (x_pixel, y_pixel - 20),
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 0, 0), 2)

    cv2.imshow("Hand Tracking", frame)

    key = cv2.waitKey(1) & 0xFF

    if key == ord("l"):
        new_label = input("Digite o rótulo (letra) para as imagens: ").upper()
        if new_label:
            current_label = new_label
            current_save_path = os.path.join(base_image_folder, current_label)
            if not os.path.exists(current_save_path):
                os.makedirs(current_save_path)
            image_counter = len(os.listdir(current_save_path))
            print(f"Pasta de destino definida: {current_save_path}")
        else:
            print("Rótulo inválido.")
    elif key == ord("s"):
        if current_label:
            image_filename = os.path.join(current_save_path, f"{current_label}_{image_counter:04d}.png")
            cv2.imwrite(image_filename, frame)
            if result.multi_hand_landmarks:
                # Para gestos estáticos, cada imagem é uma sequência de 1 frame
                current_sequence_id = get_next_sequence_id()
                for idx, handLms in enumerate(result.multi_hand_landmarks):
                    save_landmarks(current_sequence_id, 0, current_label, handLms)
            print(f"Imagem e landmarks salvas: {image_filename}")
            image_counter += 1
        else:
            print("Defina um rótulo (letra) primeiro pressionando \"L\".")
    elif key == ord("a"):
        if current_label:
            try:
                num_images = int(input("Quantas imagens você deseja capturar automaticamente? "))
            except ValueError:
                print("Número inválido. Por favor, digite um número inteiro.")
                continue

            print(f"Iniciando captura automática de {num_images} imagens para o rótulo \"{current_label}\".")
            for i in range(num_images):
                ret_auto, frame_auto = cap.read()
                if not ret_auto:
                    print("Erro ao capturar frame da câmera durante a captura automática.")
                    break
                frame_auto = cv2.flip(frame_auto, 1)
                rgb_auto = cv2.cvtColor(frame_auto, cv2.COLOR_BGR2RGB)
                result_auto = hands.process(rgb_auto)

                if result_auto.multi_hand_landmarks:
                    current_sequence_id = get_next_sequence_id()
                    for idx_auto, handLms_auto in enumerate(result_auto.multi_hand_landmarks):
                        image_filename = os.path.join(current_save_path, f"{current_label}_{image_counter:04d}.png")
                        cv2.imwrite(image_filename, frame_auto)
                        save_landmarks(current_sequence_id, 0, current_label, handLms_auto)
                        print(f"Imagem e landmarks salvas automaticamente: {image_filename}") 
                        image_counter += 1
                
                cv2.imshow("Hand Tracking - Captura Automática", frame_auto)
                cv2.waitKey(1) 
                time.sleep(0.1)
            print(f"Captura automática de {num_images} imagens concluída para o rótulo \"{current_label}\".")
            cv2.destroyWindow("Hand Tracking - Captura Automática") # Fecha a janela extra após a captura
        else:
            print("Defina um rótulo (letra) primeiro pressionando \"L\".")

    elif key == ord("d"):
        if current_label:
            print(f"Preparando para capturar gesto dinâmico para o rótulo \"{current_label}\". Faça o gesto e pressione qualquer tecla para parar.")
            sequence_landmarks_data = []
            current_sequence_id = get_next_sequence_id()
            frame_count_in_sequence = 0

            while True:
                ret_seq, frame_seq = cap.read()
                if not ret_seq:
                    print("Erro ao capturar frame da câmera durante a captura de sequência.")
                    break
                frame_seq = cv2.flip(frame_seq, 1)
                rgb_seq = cv2.cvtColor(frame_seq, cv2.COLOR_BGR2RGB)
                result_seq = hands.process(rgb_seq)

                if result_seq.multi_hand_landmarks:
                    for idx_seq, handLms_seq in enumerate(result_seq.multi_hand_landmarks):
                        save_landmarks(current_sequence_id, frame_count_in_sequence, current_label, handLms_seq)
                        frame_count_in_sequence += 1

                cv2.imshow("Hand Tracking - Capturando Gesto Dinâmico", frame_seq)
                if cv2.waitKey(1) & 0xFF != 0xFF:
                    break
            
            if frame_count_in_sequence > 0:
                print(f"Gesto dinâmico com {frame_count_in_sequence} frames salvo para o rótulo \"{current_label}\" (Sequence ID: {current_sequence_id}).")
            else:
                print("Nenhuma landmark detectada durante a captura do gesto dinâmico.")
            cv2.destroyWindow("Hand Tracking - Capturando Gesto Dinâmico")
        else:
            print("Defina um rótulo (letra) primeiro pressionando \"L\".")

    if key == 27:
        break

cap.release()
cv2.destroyAllWindows()