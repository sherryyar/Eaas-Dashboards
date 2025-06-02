import os
from slack_sdk import WebClient
from slack_sdk.errors import SlackApiError
from dotenv import load_dotenv
import time
import platform

# Load environment variables
load_dotenv()

# Initialize Slack client
slack_token = os.getenv("SLACK_TOKEN")
slack_channel_id = os.getenv("SLACK_CHANNEL_ID")
client = WebClient(token=slack_token)

def clear_screen():
    """Clear the terminal screen based on the operating system"""
    if platform.system() == "Windows":
        os.system('cls')
    else:
        os.system('clear')

def get_username(user_id):
    """Get username from Slack user ID"""
    try:
        result = client.users_info(user=user_id)
        return result["user"]["real_name"]
    except SlackApiError as e:
        print(f"Error getting user info: {e}")
        return f"Unknown User ({user_id})"

def get_location_data():
    """Get location data from Slack reactions"""
    try:
        # Get messages from channel
        result = client.conversations_history(
            channel=slack_channel_id,
            limit=100
        )

        # Find the check-in message
        check_in_message = None
        for msg in result["messages"]:
            if msg.get("text", "").startswith("Hi Fantastic Humans"):
                check_in_message = msg
                break

        if not check_in_message:
            return {
                "error": "No check-in message found",
                "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
            }

        # Get reactions for the message
        reactions_result = client.reactions_get(
            channel=slack_channel_id,
            timestamp=check_in_message["ts"]
        )

        location_data = {
            "office": [],
            "home": [],
            "sick": [],
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
        }

        if reactions_result.get("message", {}).get("reactions"):
            for reaction in reactions_result["message"]["reactions"]:
                usernames = [get_username(user_id) for user_id in reaction["users"]]
                
                if reaction["name"] == "office":
                    location_data["office"] = usernames
                elif reaction["name"] == "house":
                    location_data["home"] = usernames
                elif reaction["name"] in ["face_vomiting", "face_with_thermometer", "nauseated_face", 
                                       "sneezing_face", "sick", "brain", "face_with_head_bandage", 
                                       "mending_heart"]:
                    location_data["sick"] = usernames

        return location_data

    except SlackApiError as e:
        return {
            "error": f"Failed to fetch location data: {str(e)}",
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
        }

def print_location_data():
    """Print location data in a simple format"""
    clear_screen()  # Clear the screen before displaying new data
    data = get_location_data()
    
    if "error" in data:
        print(f"Error: {data['error']}")
        return

    print("\n=== Team Locations ===")
    print(f"Last Updated: {data['timestamp']}\n")

    print("Working from Office:")
    for name in data["office"]:
        print(f"- {name}")

    print("\nWorking from Home:")
    for name in data["home"]:
        print(f"- {name}")

    print("\nOn Sick Leave:")
    for name in data["sick"]:
        print(f"- {name}")

if __name__ == "__main__":
    print_location_data() 