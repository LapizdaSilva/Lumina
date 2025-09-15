import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import accuracy_score
from sklearn.preprocessing import LabelEncoder
import joblib

df = pd.read_csv("hand_data.csv")

landmark_cols = [col for col in df.columns if col.startswith(("x", "y", "z"))]

X = df[landmark_cols].values

y = df["class"].values

label_encoder = LabelEncoder()
y_encoded = label_encoder.fit_transform(y.astype(str))

X_train, X_test, y_train, y_test = train_test_split(X, y_encoded, test_size=0.5, random_state=42)

model = KNeighborsClassifier(n_neighbors=1)
model.fit(X_train, y_train)

y_pred = model.predict(X_test)
print("Precisão:", accuracy_score(y_test, y_pred))

joblib.dump(model, "hand_model.pkl")
joblib.dump(label_encoder, "label_encoder.pkl")

print("Modelo e LabelEncoder salvos com sucesso.")