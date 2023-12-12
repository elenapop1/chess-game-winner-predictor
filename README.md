# Chess Game Winner Predictor

This Flask application is designed to predict the winner of a chess game in progress.

## Purpose

The primary goal of this project is to leverage machine learning algorithms to analyze the state of a chess game and make predictions about the eventual winner based on the current game moves and other relevant factors.

## How it Works

The application is built upon a dataset [Chess Game Dataset (Lichess)](https://www.kaggle.com/datasets/datasnaek/chess) obtained from Kaggle, which includes a comprehensive collection of chess games. A RNN model has been trained on this dataset to analyze the moves of games and make predictions about the eventual winner based on the current chess moves, and other relevant factors.


## Installation

To use this application, follow these steps:

1. Install the required dependencies:

        pip install -r requirements.txt

2. Run the Flask application:

        python3 main.py

## Usage


Start a game:

1. Random to Random: Let the engine play against itself.
2. Player to Random: Play against the engine, making moves as a player while the engine responds with random moves.
    
At any point during the game, you have the option to pause and make a prediction about the eventual winner of the session.

Continue playing and interacting with the application as desired.

## Contributors

- Elena Pop

