import pickle
import numpy as np
import requests
from flask import Flask, render_template, request, jsonify
from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences


flask_app = Flask(__name__, template_folder='templates')
model = pickle.load(open("trained_models/model.pkl", "rb"))
tokenizer = pickle.load(open("trained_models/tokenizer.pkl", "rb"))

@flask_app.route('/', methods=['GET'])
def chess_index(): 
    return render_template('index.html')



@flask_app.route("/predict/", methods=["POST"])
def predict():

   # Get the data from the request
    data = request.json
    moves = data.get('moves', [])

    myseq = str(' '.join(moves))

    sequences = tokenizer.texts_to_sequences([myseq])
    test_sequence = pad_sequences(sequences, maxlen=349)

    white_or_black_proba  = model.predict(test_sequence)
    predicted_winner = (white_or_black_proba >= 0.5).astype(int)

    return jsonify({'prediction': int(predicted_winner[0])})
    


if __name__ == '__main__':
    flask_app.run(host='0.0.0.0', port=5000, debug=True)