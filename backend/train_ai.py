import os
import json
import numpy as np
import pandas as pd
from datetime import datetime
from sklearn.model_selection import train_test_split
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, LSTM, Embedding, Dropout
from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences
from tensorflow.keras.callbacks import ModelCheckpoint

# --- CONFIG ---
EPOCHS = 10
BATCH_SIZE = 32
EMBEDDING_DIM = 128
MODEL_PATH = 'ai_chat_model.h5'
MAX_LEN = 64
MAX_WORDS = 5000

# --- LOAD DATA ---
def load_data():
    # Example: Load chat and restaurant data from CSV or JSON
    # You should replace this with your actual data source
    chat_data = pd.read_sql('select * from ai_chats', os.getenv('DATABASE_URL'))  # Or use Supabase API
    # Optionally, load restaurant data and merge for context
    # restaurant_data = pd.read_csv('restaurants.csv')
    # ...
    return chat_data

# --- PREPROCESS ---
def preprocess(chat_data):
    # Combine user and AI messages for context
    texts = chat_data['message'].astype(str).tolist()
    labels = chat_data['sender'].apply(lambda x: 1 if x == 'ai' else 0).tolist()  # Example binary label
    tokenizer = Tokenizer(num_words=MAX_WORDS, oov_token='<OOV>')
    tokenizer.fit_on_texts(texts)
    sequences = tokenizer.texts_to_sequences(texts)
    padded = pad_sequences(sequences, maxlen=MAX_LEN, padding='post')
    return padded, np.array(labels), tokenizer

# --- MODEL ---
def build_model():
    model = Sequential([
        Embedding(MAX_WORDS, EMBEDDING_DIM, input_length=MAX_LEN),
        LSTM(128, return_sequences=True),
        Dropout(0.2),
        LSTM(64),
        Dense(64, activation='relu'),
        Dropout(0.2),
        Dense(1, activation='sigmoid')
    ])
    model.compile(loss='binary_crossentropy', optimizer='adam', metrics=['accuracy'])
    return model

# --- TRAIN ---
def train():
    print('Loading data...')
    chat_data = load_data()
    X, y, tokenizer = preprocess(chat_data)
    X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.1, random_state=42)
    model = build_model()
    print('Training model...')
    checkpoint = ModelCheckpoint(MODEL_PATH, save_best_only=True, monitor='val_loss', mode='min')
    history = model.fit(
        X_train, y_train,
        validation_data=(X_val, y_val),
        epochs=EPOCHS,
        batch_size=BATCH_SIZE,
        callbacks=[checkpoint]
    )
    print('Training complete. Best model saved to', MODEL_PATH)
    # Save tokenizer for inference
    with open('tokenizer.json', 'w') as f:
        f.write(tokenizer.to_json())

if __name__ == '__main__':
    train()
