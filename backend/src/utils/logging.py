import logging
from typing import Any, Dict
import sys

# Set up basic logging configuration
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)

def get_logger(name: str) -> logging.Logger:
    """
    Get a configured logger instance
    """
    logger = logging.getLogger(name)
    logger.setLevel(logging.INFO)
    return logger

# Create a general application logger
app_logger = get_logger("textbook_app")

# Create specific loggers for different parts of the application
user_story_1_logger = get_logger("user_story_1")
user_story_2_logger = get_logger("user_story_2")
user_story_3_logger = get_logger("user_story_3")
user_story_4_logger = get_logger("user_story_4")
user_story_5_logger = get_logger("user_story_5")