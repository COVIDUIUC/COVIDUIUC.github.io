from datetime import datetime
from time import sleep
import requests
import csv
import json


def epoch_time(time: datetime):
    t0 = datetime(1970,1,1)
    return (time-t0).total_seconds()
    
def scrape(lower_time, upper_time):
    sleep(.3) # Rate limiting issues
    url = f"https://api.pushshift.io/reddit/search/submission/?subreddit=uiuc&after={lower_time}&before={upper_time}&sort_type=created_utc&sort=asc&fields=created_utc,link_flair_text,title,full_link&size=100"
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        data: list = data["data"] # JSON is formatted wierd....
        if (len(data) == 100):
            # That means there might be more posts. Trigger another scrape, append to this scrape (this could happend multiple times recursively)
            last_timestamp = data[-1]["created_utc"]
            data += scrape(last_timestamp, upper_time)
        return data
    else:
        print(f"Error: {response.status_code}")
        if (response.status_code == 429):
            # We were rate limited :(
            # Let's just try again
            return scrape(lower_time+1, upper_time)

SECONDS_PER_DAY = 86400
FIRST_DAY = datetime(2020, 8, 1)
LAST_DAY = datetime(2021, 2, 23)
DATA_DIR = "./reddit-data"


count_result_lines = []
example_result_lines = []
example_json_data = {}
# Loop through each day
prev_timestamp = None
for timestamp in range(int(epoch_time(FIRST_DAY)), int(epoch_time(LAST_DAY)) + SECONDS_PER_DAY, SECONDS_PER_DAY):
    if prev_timestamp is None:
        prev_timestamp = timestamp
        continue
    # Get the data
    data = scrape(prev_timestamp+1, timestamp)
    filtered_covid_posts = [post for post in data if ("link_flair_text" in post and post["link_flair_text"] == "COVID-19")]

    # Getup to 3 examples
    num_examples = min(len(filtered_covid_posts), 3)
    example_json_data[prev_timestamp] = ([[post["title"], post["full_link"]] for post in filtered_covid_posts[:num_examples]])
    example_result_lines  += ([[prev_timestamp, post["title"], post["full_link"]] for post in filtered_covid_posts[:num_examples]])

    count_result_lines.append([prev_timestamp, len(data), len(filtered_covid_posts)])
    print(count_result_lines[-1])
    prev_timestamp = timestamp

# Save to csv
with open(f"{DATA_DIR}/timestamped_post_count_data.csv", newline='', mode='w', encoding="utf-8") as data_file:
    writer = csv.writer(data_file, delimiter=',', quotechar='"', quoting=csv.QUOTE_MINIMAL)
    writer.writerows(count_result_lines)

with open(f"{DATA_DIR}/timestamped_example_post_data.csv", newline='', mode='w', encoding="utf-8") as data_file:
    writer = csv.writer(data_file, delimiter=',', quotechar='"', quoting=csv.QUOTE_MINIMAL)
    writer.writerows(example_result_lines)

with open(f"{DATA_DIR}/timestamped_example_post_data.json", newline='', mode='w', encoding="utf-8") as data_file:
    json.dump(example_json_data, data_file, indent=4)