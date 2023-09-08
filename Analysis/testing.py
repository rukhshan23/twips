import pandas as pd

# Create a DataFrame with MultiIndex for the rows
data = {
    ('Column 1', 'Merged Cell'): ['1-7', '', '', '', '', '', ''],
    ('Column 2', 'Data'): ['Data 1', 'Data 2', 'Data 3', 'Data 4', 'Data 5', 'Data 6', 'Data 7'],
    ('Column 3', 'Data'): ['Data 8', 'Data 9', 'Data 10', 'Data 11', 'Data 12', 'Data 13', 'Data 14'],
    ('Column 4', 'Data'): ['Data 15', 'Data 16', 'Data 17', 'Data 18', 'Data 19', 'Data 20', 'Data 21'],
}

df = pd.DataFrame(data)

# Remove the index name
df.index.name = None

# Specify the file path as "testing.csv"
file_path = "testing.csv"

print(df)

# Write the DataFrame to the CSV file
df.to_csv(file_path)

print(f"CSV file '{file_path}' created successfully.")
