#!/bin/bash

# create screenshot on the capture agent to be served by apache with cron
# run this every minute to get a screenupdate every 5 seconds
# crontab:
# */1 * * * * /usr/local/bin/snapshot.sh

outpath="/var/www/snapshots"
c=0
export PATH=/usr/lib/lightdm/lightdm:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games
export DISPLAY=127.0.0.1:0.0
while [ $c -lt 11 ]
do
        gst-launch-0.10 ximagesrc ! ffmpegcolorspace ! pngenc ! filesink location=$outpath/gc-snapshot-full.jpg
        let c=$c+1
        sleep 4
done
