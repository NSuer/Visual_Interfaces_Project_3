import pandas as pd
from collections import defaultdict
from itertools import combinations

df = pd.read_excel("the-office-lines.xlsx")

required_columns = {"season", "episode", "speaker", "line_text"}
if not required_columns.issubset(df.columns):
    raise ValueError(f"Missing one of the required columns: {required_columns}")

characters = df["speaker"].unique()

# 1. Total lines per character
total_lines = df["speaker"].value_counts().rename_axis("speaker").reset_index(name="Total Lines")

# 2. Number of episodes each character appears in
df["episode_id"] = df["season"].astype(str) + "-" + df["episode"].astype(str)

episodes_df = df[["speaker", "episode_id"]].drop_duplicates()

episodes_count = episodes_df.groupby("speaker").size().reset_index(name="Episodes Appeared")

# 3. Lines per character per episode
lines_per_episode = df.groupby(["speaker", "season", "episode"]).size().reset_index(name="Lines in Episode")

# 4. Encounter Ticker: per season, for each pair of characters, how many episodes they share
grouped = df.groupby(["season", "episode"])

encounter_dict = defaultdict(lambda: defaultdict(int))

for (season, episode), group in grouped:
    chars_in_episode = set(group["speaker"].unique())
    for char1, char2 in combinations(sorted(chars_in_episode), 2):
        encounter_dict[(char1, char2)][season] += 1
        encounter_dict[(char2, char1)][season] += 1  # Count both ways for easy lookup

encounter_rows = []
for (char1, char2), season_dict in encounter_dict.items():
    for season, count in season_dict.items():
        encounter_rows.append({"speaker": char1, "Encounter With": char2, "season": season, "Shared Episodes": count})

encounter_df = pd.DataFrame(encounter_rows)

# Write all to Excel
with pd.ExcelWriter("proData.xlsx") as writer:
    total_lines.to_excel(writer, sheet_name="Total Lines", index=False)
    episodes_count.to_excel(writer, sheet_name="Episodes Appeared", index=False)
    lines_per_episode.to_excel(writer, sheet_name="Lines per Episode", index=False)
    encounter_df.to_excel(writer, sheet_name="Encounter Ticker", index=False)

print("Exported to proData.xlsx successfully.")
