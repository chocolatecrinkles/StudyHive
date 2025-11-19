# Study Hive – Study Space Finder for CIT-U Students

Study Hive aims to provide CIT-U students with a centralized, easy-to-use platform to discover, compare, and assess study spaces in Cebu City. Currently, students waste time searching for suitable study spots, often relying on guesswork, word-of-mouth, or visiting multiple locations only to find them full or unsuitable.

By enabling students to view verified study spaces, see amenities, check historical busyness trends, and see crowdsourced availability updates from peers, Study Hive will help students make informed decisions, reduce stress, and improve productivity—especially during exam periods.

# Tech Stack used
Backend: Django 

Frontend: HTML, Django templates

Database: PostgreSQL (hosted on Supabase)

ORM: Django ORM

Environment Management: Python venv

Version Control: Git & GitHub

# Setup & Run instructions
    1. Clone the repository
    git clone https://github.com/<your-username>/StudyHive.git
    cd StudyHive

    2. Create and activate a virtual environment
    python -m venv .venv
    .venv\Scripts\activate  # (Windows)
    source .venv/bin/activate  # (Mac/Linux)

    3. Install dependencies
    pip install -r requirements.txt

    4. Connect to Supabase
    Create a .env file in your project root and add the Supabase database credentials.

    5. Run migrations
    python manage.py migrate

    6. Start the development server
    python manage.py runserver

    Visit the app at http://127.0.0.1:8000/

# Team Members
Leanda, John Luis C. - Lead Developer (johnluis.leanda@cit.edu)

Libato, Michael Grant S. - Developer (michaelgrant.libato@cit.edu)

Macansantos, Axcelson O. - Developer (axcelson.macansantos@cit.edu)

# Deployed Link
[https://studyhive-4bn3.onrender.com/](https://studyhive-4bn3.onrender.com/)

