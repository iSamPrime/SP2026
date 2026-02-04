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
git remote add "origin" git@github.com/iSamPrime/SP2026
git remote set-url "origin" github.com/iSamPrime/SP2026

git push --set-upstream origin main --force

git push origin main


git init 

git add . 

git commit -m "V0.0.0"

git push -u origin main 




git config --global user.name "ISamPrime"
git config --global user.email "isssamawad3@gmail.com"


git clone https://github.com/iSamPrime/SP2026.git
git pull origin main







# …or create a new repository on the command line
echo "# SP2026" >> README.md
git init
git add README.md
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/iSamPrime/SP2026.git
git push -u origin main


# …or push an existing repository from the command line
git remote add origin https://github.com/iSamPrime/SP2026.git
git branch -M main
git push -u origin main