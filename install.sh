sudo apt-get update
sudo apt-get install -y curl

# Install Nodesource
curl -fsSL https://deb.nodesource.com/setup_22.x -o nodesource_setup.sh
sudo -E bash nodesource_setup.sh
rm nodesource_setup.sh

sudo apt-get install -y nodejs mpg321 git

currentuser=$(whoami)

sudo addgroup openschoolbell
sudo usermod -a -G openschoolbell $currentuser

sudo mkdir -p /var/osb
sudo chown $currentuser:openschoolbell /var/osb

cd /var/osb

git clone https://github.com/Open-School-Bell/sounder.git

cd /var/osb/sounder

npm install
npm run build

sudo cp /var/osb/sounder/bin.sh /bin/sounder
sudo chmod +x /bin/sounder

sudo cp /var/osb/sounder/init.sh /etc/init.d/sounder
sudo chmod +x /etc/init.d/sounder
sudo update-rc.d sounder defaults
