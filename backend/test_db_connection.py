import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.exc import OperationalError
import ssl

# Load environment variables
load_dotenv()

# Get database URL from environment
database_url = os.getenv("DATABASE_URL")

if not database_url:
    print("ERROR: DATABASE_URL not found in environment variables")
    print("Please make sure your .env file has the DATABASE_URL variable set")
    exit(1)

print(f"Testing database connection to: {database_url}")

try:
    # Create engine
    engine = create_engine(database_url, echo=True)

    # Test the connection
    with engine.connect() as connection:
        result = connection.execute(text("SELECT 1"))
        print("SUCCESS: Database connection successful!")
        print(f"Result: {result.fetchone()}")

    print("\\nDatabase connection test completed successfully!")

except OperationalError as e:
    print(f"ERROR: Database connection failed: {str(e)}")
    print("\\nThis could be due to:")
    print("1. Incorrect database URL or credentials")
    print("2. Network connectivity issues")
    print("3. Database server not running")
    print("4. Firewall blocking the connection")

except Exception as e:
    print(f"ERROR: An error occurred: {str(e)}")
    print("\\nPossible issues:")
    print("- Missing dependencies (psycopg2-binary)")
    print("- SSL configuration issues")
    print("- Invalid connection string format")