För att starta servern: 

cd server 
node server

http://localhost:3000/


--------------------------------
För att kunna göra ändringer i både client och server (i två olika terminaler samtidigt): 
cd client 
npm run watch-build

cd server 
node --watch server


-------------------------------

# 
git add . 
git status 
git commit -m "V"
git push -u origin main 


git config --global user.name "ISamPrime"
git config --global user.email "isssamawad3@gmail.com"


#
git pull origin main

# …or create a new repository on the command line
git init
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/iSamPrime/SP2026.git
git push -u origin main


# …or push an existing repository from the command line
git remote add origin https://github.com/iSamPrime/SP2026.git
git branch -M main
git push -u origin main