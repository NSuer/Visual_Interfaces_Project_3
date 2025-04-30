import csv
from collections import defaultdict

def create_word_bank(file_path):
    # Dictionary to store word banks for each scene
    scene_word_bank = defaultdict(lambda: defaultdict(list))
    
    # Read the CSV file
    with open(file_path, mode='r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        
        for row in reader:
            # Extract relevant fields
            scene_id = f"Season {row['season']}, Episode {row['episode']}, Scene {row['scene']}"
            speaker = row['speaker']
            line_text = row['line-text']
            
            # Tokenize the line text into words
            words = line_text.split()
            
            # Add words to the word bank for the scene and speaker
            scene_word_bank[scene_id][speaker].extend(words)
    
    return scene_word_bank

def write_word_bank_to_csv(word_bank, output_file_path):
    # Write the word bank to a CSV file
    with open(output_file_path, mode='w', encoding='utf-8', newline='') as file:
        writer = csv.writer(file)
        # Write the header row
        writer.writerow(["Scene", "Speaker", "Words"])
        
        # Write each scene's data
        for scene, speakers in word_bank.items():
            for speaker, words in speakers.items():
                writer.writerow([scene, speaker, ' '.join(words)])

def main():
    # Path to the input CSV file
    csv_file_path = r"data\the-office-lines-modded.csv"
    # Path to the output CSV file
    output_file_path = r"data\scene_word_bank.csv"
    
    # Create the word bank
    word_bank = create_word_bank(csv_file_path)
    
    # Write the word bank to a CSV file
    write_word_bank_to_csv(word_bank, output_file_path)
    
    # Output the word bank for verification
    for scene, speakers in word_bank.items():
        print(f"Scene: {scene}")
        for speaker, words in speakers.items():
            print(f"  {speaker}: {', '.join(words[:10])}...")  # Print first 10 words for brevity
        print()

if __name__ == "__main__":
    main()