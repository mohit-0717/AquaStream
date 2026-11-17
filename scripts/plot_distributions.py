import pandas as pd
import matplotlib.pyplot as plt
import os

CURATED_FILE = r"C:\Users\mohit\Documents\EDA-Project\data\curated\clean_water_quality.csv"
OUTPUT_DIR = r"C:\Users\mohit\Documents\EDA-Project\docs\figures"
os.makedirs(OUTPUT_DIR, exist_ok=True)

print("==================================================")
print("     STEP 5: GENERATING UNIVARIATE PLOTS          ")
print("==================================================\n")

print("Loading curated dataset sample for plotting...")
df = pd.read_csv(CURATED_FILE, low_memory=False)

parameters = ['Temperature, water', 'Dissolved oxygen (DO)', 'pH', 'Turbidity', 'Conductivity', 'Nitrate']

for param in parameters:
    sub = df[df['CharacteristicName'] == param]['ResultNumeric'].dropna()
    if sub.empty:
        continue
        
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5))
    
    # 1. Histogram
    ax1.hist(sub, bins=30, color='#1f77b4', edgecolor='black', alpha=0.7)
    ax1.set_title(f'Histogram: {param}', fontsize=12, fontweight='bold')
    ax1.set_xlabel('Measured Value')
    ax1.set_ylabel('Frequency')
    ax1.grid(True, linestyle='--', alpha=0.5)
    
    # 2. Boxplot
    ax2.boxplot(sub, vert=False, patch_artist=True, boxprops=dict(facecolor='#2ca02c', color='black'))
    ax2.set_title(f'Box Plot: {param}', fontsize=12, fontweight='bold')
    ax2.set_xlabel('Measured Value')
    ax2.grid(True, linestyle='--', alpha=0.5)
    
    plt.tight_layout()
    
    # Save figure
    filename = param.replace(', ', '_').replace(' ', '_').replace('(', '').replace(')', '')
    save_path = os.path.join(OUTPUT_DIR, f"{filename}_distribution.png")
    plt.savefig(save_path, dpi=300)
    plt.close()
    print(f" Saved plot: {save_path}")

print("\n==================================================")
print("      ALL UNIVARIATE PLOTS GENERATED SUCCESSFULLY! ")
print("==================================================")