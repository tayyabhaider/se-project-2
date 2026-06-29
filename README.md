## NoteGenius: AI-Powered Note-Taking Web Application

NoteGenius is a full-stack web application that elevates note-taking with AI. Whether you want to generate study quizzes, beautify your notes, or listen to them while you drive to your exam, NoteGenius uses cutting-edge AI to make your notes work harder for you.

This project was made for our Software Engineering course. Here are the developers who worked on this:
* **Muhammad Rayed** - [Rider9797](https://github.com/Rider9797)
* **Aleena Abbas** - [aleenaabbas2003](https://github.com/aleenaabbas2003)
* **Tayyab Haider** - [tayyabhaider](https://github.com/tayyabhaider)
* **Abubakar Minhas** - [AbubakarMin1](https://github.com/AbubakarMin1)
* **Hammad Yousaf** - [HammadYousaf](https://github.com/HammadYousaf-26100387)

## Features

* **Full CRUD Operations**: Create, read, update, and delete your notes.
  
<img width="1884" height="918" alt="image" src="https://github.com/user-attachments/assets/3772b481-6d62-4839-95cc-cedf3176b7cc" />


* **AI Powered Features**: 
  * Enhance Text: Provide a prompt to rephrase, beautify, or organize your content automatically.
  * Text-to-Speech: Generate an audio file that reads out your notes to you (uses an API call to OpenAI's whiper model).
  * Summarize: Condense long notes into key points with one click.
  * Quiz It: Automatically generate a quiz based on your note's content.
    

<img width="1900" height="900" alt="image" src="https://github.com/user-attachments/assets/00003d75-974a-4117-b079-29fb627be9db" />


* **User Authentication**: User signup and login system.
  
  <img width="1900" height="907" alt="image" src="https://github.com/user-attachments/assets/950fa501-c12e-43c0-b61e-6543d51547ce" />






    
## Tech Stack

**Frontend**
* React with TypeScript
* Build Tool: Vite
* Styling: CSS/Tailwind

**Backend**
* Language: Python
* Framework: Flask
* API calls to OpenAI's Whipser and ChatGPT

**Database**
* MongoDB Atlas

## How to Run the App
**Prerequisties**:
* Node.js & npm
* MongoDB Atlas Account
* Active MongoDB IP Address
* Redis Server (Running on port 6379)
* OpenAI API Key

**Clone the repo**:
```bash
git clone https://github.com/ryder-4/NoteGenius.git
cd NoteGenius
```

**Backend Setup**

```bash
cd backend
# Install dependancies
pip install -r requirements.txt
python config.py
python generate_env.py

```

* In generate_env.py, assign your mongodb connection string to the variable `MONGO_URI` in the function `create_env_file()`
* Make sure `redis-server.exe` is running

**Frontend Setup**

In a new terminal, enter the following commands:
```bash
cd frontend
npm install
npm run dev
```





 





