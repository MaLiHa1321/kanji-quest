import requests
import json
import time

def fetch_kanji_data():
    base_url = "https://kanjiapi.dev/v1/kanji/"
    n5_list = requests.get(base_url + "jlpt-5").json()
    n4_list = requests.get(base_url + "jlpt-4").json()
    
    # Trim to requirements if needed, but let's take what we get
    # The prompt says N5: 100, N4: 200.
    # N5 usually has ~80, N4 ~170. I will augment if needed.
    
    full_data = {"n5": [], "n4": []}
    
    def process_list(kanji_chars, level_key):
        count = 0
        limit = 100 if level_key == "n5" else 200
        for char in kanji_chars:
            if count >= limit: break
            print(f"Fetching {char}...")
            res = requests.get(base_url + char).json()
            
            # Simple examples/meanings
            # We need: onyxomi, kunyomi, meaning, examples, similar
            
            kanji_obj = {
                "char": char,
                "onyomi": ", ".join(res.get("on_readings", [])),
                "kunyomi": ", ".join(res.get("kun_readings", [])),
                "meaning": ", ".join(res.get("meanings", [])),
                "examples": [f"{char}...", f"Example..."], # Placeholders for manual refinement or further logic
                "similar": [] # We'll fill this with 2-3 of the same level for now or specific ones
            }
            full_data[level_key].append(kanji_obj)
            count += 1
            time.sleep(0.1) # Be nice to the API
            
    process_list(n5_list, "n5")
    process_list(n4_list, "n4")
    
    return full_data

if __name__ == "__main__":
    # Note: 300 kanji is a lot for a one-shot fetch in a task. 
    # I might have to do it in chunks or use a pre-existing list.
    pass
