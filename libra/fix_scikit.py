import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import accuracy_score
from sklearn.preprocessing import LabelEncoder
import joblib
import os

dynamic_csv_file = "hand_data.csv"

if not os.path.exists(dynamic_csv_file):
    print(f"Erro: O arquivo {dynamic_csv_file} não foi encontrado.")
    exit()

try:
    df = pd.read_csv(dynamic_csv_file)
except Exception as e:
    print(f"Erro ao carregar o arquivo CSV: {e}")
    exit()

landmark_cols = [col for col in df.columns if col.startswith(("x", "y", "z"))]

df_grouped = df.groupby('sequence_id').agg({
    'label': 'first',
    **{col: 'mean' for col in landmark_cols}
}).reset_index()

X = df_grouped[landmark_cols].values
y = df_grouped['label'].values

label_encoder = LabelEncoder()
y_encoded = label_encoder.fit_transform(y.astype(str))

if len(X) < 2:
    print("Aviso: Conjunto de dados muito pequeno para divisão em treino/teste. Treinando com todos os dados disponíveis.")
    X_train, y_train = X, y_encoded
    X_test, y_test = X, y_encoded 
else:
    X_train, X_test, y_train, y_test = train_test_split(X, y_encoded, test_size=0.2, random_state=42)

model = KNeighborsClassifier(n_neighbors=1)
model.fit(X_train, y_train)

y_pred = model.predict(X_test)
print("Precisão:", accuracy_score(y_test, y_pred))

joblib.dump(model, "hand_model.pkl")
joblib.dump(label_encoder, "label_encoder.pkl")

print("Modelo e LabelEncoder para dados dinâmicos salvos com sucesso.")