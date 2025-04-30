import pandas as pd
from collections import defaultdict, Counter

# Load the scene word bank data
df = pd.read_csv("data/scene_word_bank.csv")

# Define the characters to include in the adjacency matrix
characters = ["Michael", "Dwight", "Pam", "Kevin", "Oscar", "Jim", "Angela"]

# Initialize the adjacency matrix as a dictionary of dictionaries
# Each entry will store a Counter to track word frequencies
adjacency_matrix = {char1: {char2: Counter() for char2 in characters} for char1 in characters}

# Process each scene
for scene, group in df.groupby("Scene"):
    # Get the characters present in the scene
    scene_characters = group["Speaker"].unique()
    
    # Filter to include only the specified characters
    scene_characters = [char for char in scene_characters if char in characters]
    
    # Count words spoken by each character in the scene
    for _, row in group.iterrows():
        speaker = row["Speaker"]
        if speaker in characters:
            # Tokenize the words spoken by the speaker
            words = row["Words"].split()
            
            # Increment word counts for all other characters present in the scene
            for listener in scene_characters:
                if listener != speaker:
                    adjacency_matrix[speaker][listener].update(words)

# Convert the adjacency matrix to a DataFrame with top 5 words for each pair
matrix_data = []
for speaker, listeners in adjacency_matrix.items():
    for listener, word_counts in listeners.items():
        top_words = word_counts.most_common(20)  # Get the top 5 words
        top_words_str = ", ".join([f"{word} ({count})" for word, count in top_words])
        matrix_data.append({"Speaker": speaker, "Listener": listener, "Top Words": top_words_str})

# Create a DataFrame from the matrix data
matrix_df = pd.DataFrame(matrix_data)

# Save the adjacency matrix to a CSV file
matrix_df.to_csv("data/adjacency_matrix_top_words.csv", index=False)

print("Adjacency matrix with top words saved to data/adjacency_matrix_top_words.csv")