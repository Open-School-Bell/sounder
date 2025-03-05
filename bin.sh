#!/bin/bash
ret=$(pwd)
cd /var/osb/sounder
node /var/osb/sounder/lib/bin.js $@
rm /var/osb/sounder/sounder.pid
cd $ret