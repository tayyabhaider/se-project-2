if you have your own db atlas, go to .env, and put in your own url and password in your own link

Instructions for installing and starting a Redis server using WSL on Windows:

1. **Open your Command Prompt (CMD) and enter WSL**  
   Type the following command to open your WSL terminal:
   ```sh
   wsl
   ```

2. **Update Package Lists and Install Redis**  
   Run the following commands in your WSL terminal:
   ```sh
   sudo apt update && sudo apt install redis-server -y
   ```
   - **Note:** If you see an error like  
     `E: dpkg was interrupted, you must manually run 'sudo dpkg --configure -a' to correct the problem`,  
     then run:
     ```sh
     sudo dpkg --configure -a
     ```
     After that, re-run:
     ```sh
     sudo apt update && sudo apt install redis-server -y
     ```

3. **Start the Redis Server**  
   Once installation is complete, start the Redis server with:
   ```sh
   sudo service redis-server start
   ```

4. **Verify the Redis Server is Running**  
   Check the connection by running:
   ```sh
   redis-cli ping
   ```
   - If everything is working, you should see:
     ```
     PONG
     ```


make sure redis is started on wsl

use flask run to run code,

should print connected to mongodb and connected to redis

now install postman

once installed enter url in accordance with the functions in routers/authController ( gpt it if you want) enter method as POST go to header and write Content-Type: application/json go to body and write { "username": "testuser", "email": "test@example.com", "password": "testpass", "name": "Test User" } for signup and select raw option

{ "email": "test@example.com", "password": "testpass" } for login

etc (signup) you can gpt( give routers/authController as prompt) 


Deployed web app link:
[link](https://se-project-2-fn7s.vercel.app/)