import requests
from pprint import pprint
from typing import Dict, List, Optional

"""This module provides a wrapper around the IMDb API to search for movies and TV shows.

# IMDbParser class provides a wrapper around the IMDb API to search for movies and TV shows. 
# It allows you to search for a given query UNOFFICIALLY. DO NOT USE THIS IN PRODUCTION.
# We should use this only for testing and development purposes, use real implementation with API key for production.

Returns:
    List[Dict]: A list of dictionaries containing parsed information about the search results.
"""


class IMDbParser:
    def __init__(self):
        self.base_url = "https://v3.sg.media-imdb.com/suggestion/x/{query}.json" # URL to search for movies and TV shows
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36", # User-Agent header to avoid blocking
            "Accept": "application/json",
        }

    def _parse_image(self, image_data: Optional[Dict]) -> Dict:
        """Extract structured image information"""
        if not image_data:
            return None
        return {
            "url": image_data.get("imageUrl"),
            "dimensions": f"{image_data.get('width')}x{image_data.get('height')}",
            "aspect_ratio": (
                round(image_data["width"] / image_data["height"], 2)
                if image_data.get("width") and image_data.get("height")
                else None
            ),
        }

    def _parse_videos(self, video_list: List[Dict]) -> List[Dict]:
        """Parse nested video data"""
        return [
            {
                "id": vid.get("id"),
                "title": vid.get("l"),
                "duration": vid.get("s"),
                "thumbnail": self._parse_image(vid.get("i")),
            }
            for vid in video_list or []
        ]

    def parse_entry(self, entry: Dict) -> Dict:
        """Parse individual entry from the 'd' array"""
        # 'd' array contains the search results I found from looking at the API response
        return {
            "imdb_id": entry.get("id"),
            "title": entry.get("l"),
            "year": entry.get("y"),
            "type": entry.get("q"),
            "category": entry.get("qid"),
            "rank": entry.get("rank"),
            "cast": (
                [s.strip() for s in entry.get("s", "").split(",")]
                if entry.get("s")
                else []
            ),
            "poster": self._parse_image(entry.get("i")),
            "videos": self._parse_videos(entry.get("v")),
            "video_count": entry.get("vt"),
            "metadata": {
                "is_feature": entry.get("qid") == "movie",
                "is_video_content": entry.get("qid") == "video",
            },
        }

    def search(self, query: str) -> List[Dict]:
        """Perform search and return parsed results"""
        # lower case the query to avoid case sensitivity
        url = self.base_url.format(query=query.lower())
        try:
            response = requests.get( # Send a GET request to the IMDb API
                url, headers=self.headers, params={"includeVideos": 1}
            )
            response.raise_for_status() # Exception incase of HTTP error
            data = response.json() # Parse the JSON response
            return [self.parse_entry(entry) for entry in data.get("d", [])] # Parse the 'd' array

        except requests.exceptions.RequestException as e:
            print(f"API Error: {e}")
            return []


# Usage example
if __name__ == "__main__":
    parser = IMDbParser()
    q = input("Please enter your search query: ")
    results = parser.search(q)

    print(f"Found {len(results)} results:")
    try:
        pprint(results[0])  # Show parsed data for 1 res
        print("\n\n----------------------\n\n")
        print(
            results[0]['imdb_id'],
            results[0]['cast'],
            "\n",
            results[0]['poster']['url'],)
    except IndexError:
        print("No results found or incorrect index provided.")
        
