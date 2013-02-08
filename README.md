MH-DashBoard
============

MH-DashBoard is a simple monitor for Matterhorn/Galicaster agents.

It has two parts, a web page and a python script.

Requirements
- A linux machine holding the python script, and vncsnapshot and convert utilities installed (Maybe you'll need to apt-get vncsnapshot and imagemagick)
- A web server, that can be on the same machine of the script or not.
- (Optional, but highly recommended) VNC server on each capture agent, to be able to capture the screen.

How to install?

1 Copy the folder named "web", that holds the .html and .css somewhere in your web server.
2 Copy the folder named "script" to the linux box you use to run the actual monitor
2 Modify the example config file in /script/etc
3 Execute the script. Usually you will do it inside of a cron job


The script generate the json file needed by the web page, and you can call the script to your crontab file like
*/5 * * * * /monitor/script/dashboard.py -c /monitor/script/etc/mh-dashboard/dashboard.conf >> /monitor/log/dashboard.log
