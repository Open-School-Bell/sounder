npm install
npm run build
npx prisma migrate deploy
sudo cp /var/osb/sounder/support/bin.sh /bin/sounder
sudo chmod +x /bin/sounder
sudo service sounder stop

sudo cp /var/osb/sounder/support/init.sh /etc/init.d/sounder
sudo chmod +x /etc/init.d/sounder

sudo systemctl daemon-reload

if [ -f /var/osb/sounder/sounder.json ]; then
  echo "You have a 1.x configuration file. Please re-enroll this sounder and delete /var/osb/sounder/sounder.json"
  echo ""
  echo "YOUR SOUNDER WILL NOT AUTO-START AFTER THIS UPDATE"
else
  sudo service sounder start
fi