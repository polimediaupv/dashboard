#!/bin/bash

# create the agents.json and fetches the screenshots from the Capture agents
# run this through cron on the monitoring machine every minute to get a updates every 5 seconds
# crontab:
# */1 * * * * /usr/local/bin/dashboard.sh

c=0
while [ $c -lt 11 ]
do
	/usr/local/share/ca-dash/dashboard.py -c /usr/local/share/ca-dash/etc/dashboard.conf >/dev/null
	let c=$c+1
	sleep 3
done

