npm install
npm run build
sudo cp /var/osb/sounder/support/bin.sh /bin/sounder
sudo chmod +x /bin/sounder
sudo service sounder stop

sudo cp /var/osb/sounder/support/init.sh /etc/init.d/sounder
sudo chmod +x /etc/init.d/sounder

sudo systemctl daemon-reload

sudo service sounder start