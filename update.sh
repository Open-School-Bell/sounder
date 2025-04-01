git pull origin main
npm install
npm run build
sudo cp /var/osb/sounder/bin.sh /bin/sounder
sudo chmod +x /bin/sounder
sudo service sounder stop

sudo cp /var/osb/sounder/init.sh /etc/init.d/sounder
sudo chmod +x /etc/init.d/sounder
sudo service sounder start