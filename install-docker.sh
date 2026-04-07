sudo apt update
sudo apt install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
sudo tee /etc/apt/sources.list.d/docker.sources <<EOF
Types: deb
URIs: https://download.docker.com/linux/debian
Suites: $(. /etc/os-release && echo "$VERSION_CODENAME")
Components: stable
Architectures: $(dpkg --print-architecture)
Signed-By: /etc/apt/keyrings/docker.asc
EOF

sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin -y

sudo groupadd docker
sudo usermod -aG docker $USER

sudo mkdir -p /var/osb/sounder-docker

sudo chown $USER:docker /var/osb/sounder-docker

cd /var/osb/sounder-docker

curl -fsSL https://raw.githubusercontent.com/Open-School-Bell/sounder/refs/heads/main/support/docker-compose.yml -o docker-compose.yml
curl -fsSL https://raw.githubusercontent.com/Open-School-Bell/sounder/refs/heads/main/support/docker-bin.sh -o docker-bin.sh

sudo cp ./docker-bin.sh /bin/sounder
sudo chmod +x /bin/sounder

configure_docker() {
  read -p "Controller Address (http://192.168.1.1:3000) " ca
  read -p "Sounder Key " sk
  sed -i "s#<CONTROLLER_ADDRESS>#$ca#" ./docker-compose.yml
  sed -i "s/<SOUNDER_KEY>/$sk/" ./docker-compose.yml

  sudo docker compose pull
  sudo docker compose up -d
}

read -p "Do you want to configure the sounder now? [Y|n] " yn
case $yn in
  [Yy]* ) configure_docker; break;;
  [Nn]* ) exit;;
  * ) exit;;
esac