#! /bin/sh
# /etc/init.d/sounder

### BEGIN INIT INFO
# Provides:          sounder
# Required-Start:    $remote_fs $syslog
# Required-Stop:     $remote_fs $syslog
# Default-Start:     2 3 4 5
# Default-Stop:      0 1 6
# Short-Description: Open School Bell Sounder
# Description:       This file should be used to construct scripts to be
#                    placed in /etc/init.d.
### END INIT INFO

# Carry out specific functions when asked to by the system
case "$1" in
   start)
    echo "Starting sounder"
    # run application you want to start
    #node /home/pi/test.js > /home/pi/test.log
    sounder --start > /dev/null &
   ;;
   ensure)
    pid=$(cat /var/osb/sounder/sounder.pid)
    if ps -p $pid > /dev/null
    then
        echo "running"
    else
        /etc/init.d/sounder start
    fi
   ;;
   restart)
    /etc/init.d/sounder stop
    /etc/init.d/sounder start
   ;;
   stop)
    echo "Stopping sounder"
    # kill application you want to stop
    pid=$(cat /var/osb/sounder/sounder.pid)
    kill $pid
    rm /var/osb/sounder/sounder.pid
    # Not a great approach for running
    # multiple node instances
    ;;
  *)
    echo "Usage: /etc/init.d/sounder {start|stop}"
    exit 1
    ;;
esac

exit 0