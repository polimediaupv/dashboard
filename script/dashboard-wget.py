#!/usr/bin/python

import os,sys, glob, csv
import datetime
import subprocess
import ConfigParser
import pycurl, urllib
import hashlib, json
import codecs
import argparse


class MatterhornClient:
	def __init__(self, url, username, passwd):
		self.server_url = url
		self.username = username
		self.passwd=passwd
		self.contents = ''
		
	def body_callback(self, buf):
		self.contents = self.contents + buf		

	def getAgentInfo(self, agentName):
		self.contents = ""
		fullurl = self.server_url + "/capture-admin/agents/"+agentName+".json" 
		curl = pycurl.Curl()
		curl.setopt(pycurl.URL, fullurl)
		curl.setopt(pycurl.USERPWD, self.username+':'+self.passwd)
		curl.setopt(pycurl.HTTPHEADER, ["X-Requested-Auth: Digest"])
		curl.setopt(pycurl.HTTPAUTH, pycurl.HTTPAUTH_DIGEST)
		curl.setopt(curl.WRITEFUNCTION, self.body_callback)
		curl.perform()
		retcode = curl.getinfo(pycurl.HTTP_CODE)
		curl.close()
		return (retcode, self.contents)

	def getAgentsInfo(self):
		self.contents = ""
		fullurl = self.server_url + "/capture-admin/agents.json" 
		curl = pycurl.Curl()
		curl.setopt(pycurl.URL, fullurl)
		curl.setopt(pycurl.USERPWD, self.username+':'+self.passwd)
		curl.setopt(pycurl.HTTPHEADER, ["X-Requested-Auth: Digest"])
		curl.setopt(pycurl.HTTPAUTH, pycurl.HTTPAUTH_DIGEST)
		curl.setopt(curl.WRITEFUNCTION, self.body_callback)
		curl.perform()
		retcode = curl.getinfo(pycurl.HTTP_CODE)
		curl.close()
		return (retcode, self.contents)
		
	def getCalendar(self, date_from, date_to):
		self.contents = ""		
		d_from = "%04d-%02d-%02dT00:00:00Z" % (date_from.year, date_from.month, date_from.day)
		d_to = "%04d-%02d-%02dT00:00:00Z" % (date_to.year, date_to.month, date_to.day)
		fullurl = self.server_url + "/recordings/recordings.json?sort=CREATED&startsfrom="+d_from+"&endsto="+d_to
		curl = pycurl.Curl()
		curl.setopt(pycurl.URL, fullurl)
		curl.setopt(pycurl.USERPWD, self.username+':'+self.passwd)
		curl.setopt(pycurl.HTTPHEADER, ["X-Requested-Auth: Digest"])
		curl.setopt(pycurl.HTTPAUTH, pycurl.HTTPAUTH_DIGEST)
		curl.setopt(curl.WRITEFUNCTION, self.body_callback)
		curl.perform()
		retcode = curl.getinfo(pycurl.HTTP_CODE)
		curl.close()
		return (retcode, self.contents)
		



def md5_for_file(filename):
	try:
		md5 = hashlib.md5()
		with open(filename,'rb') as f: 
			for chunk in iter(lambda: f.read(8192), b''): 
				md5.update(chunk)
		ret = md5.hexdigest()
	except:
		ret = ""
	return ret

def write_file(filename, str):
	fout = codecs.open(filename,"w", "utf-8-sig")
	fout.write(str)
	fout.close()

def isComputerOnline(ip):
	response = 1;
	if (ip != None):
		print "checking ip:" + ip
		response = subprocess.call("ping -c 1 -w 1 " + ip , shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
	return (response == 0)

def generateAgentScreenShoot(ip, passwdFile, snapshotFolder, agentSection):
	outimg = snapshotFolder + agentSection + ".jpg"
	outthumb50 = snapshotFolder + agentSection + "-50.jpg"
	outthumb25 = snapshotFolder + agentSection + "-25.jpg"
	outthumb10 = snapshotFolder + agentSection + "-10.jpg"
	
	vnc_cmd = "wget " + ip + "/snapshots/gc-snapshot-full.jpg -O" + outimg
	vncErr = subprocess.call(vnc_cmd , shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
	if (vncErr == 0):
		subprocess.Popen(["convert", outimg, "-resize", "50%", outthumb50], env={"PATH": "/usr/bin"}) #, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
		subprocess.Popen(["convert", outimg, "-border", "35x45", "-resize","25%", outthumb25], env={"PATH": "/usr/bin"}) #, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
		subprocess.Popen(["convert", outimg, "-resize", "10%", outthumb10], env={"PATH": "/usr/bin"}) #, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
	return (vncErr == 0)

def getMatterHornInfo(MHAgentsInfo, agentName):
	for a in MHAgentsInfo:
		if (a["name"] == agentName):			
			return a	
	return {}

def getMatterHornAgentsInfo(config):
	MH_server = config.get("dashboard-config", "MHServer")
	MH_user = config.get("dashboard-config", "MHuser")
	MH_passwd = config.get("dashboard-config", "MHPassword")
	
	MH = MatterhornClient(MH_server, MH_user, MH_passwd)
	info = MH.getAgentsInfo()
	if info[0] != 200:
		return []
	else:		
		jj = json.loads(info[1])
		return jj["agents"]["agent"]

def getMatterHornCalendarInfo(config):
	MH_server = config.get("dashboard-config", "MHServer")
	MH_user = config.get("dashboard-config", "MHuser")
	MH_passwd = config.get("dashboard-config", "MHPassword")
	
	MH = MatterhornClient(MH_server, MH_user, MH_passwd)
	calendar = MH.getCalendar(datetime.datetime.utcnow().date(), datetime.datetime.utcnow().date()+datetime.timedelta(days=7))
	ret = {}
	if calendar[0] == 200:
		catalogs =  json.loads(calendar[1])
		for c in catalogs["catalogs"]:
			try:
				agent = c["http://purl.org/dc/terms/"]["spatial"][0]["value"]
				title = c["http://purl.org/dc/terms/"]["title"][0]["value"]
				spatial = c["http://purl.org/dc/terms/"]["temporal"][0]["value"]
				ss = spatial.split(";")
				start=ss[0].split("=")[1]
				end=ss[1].split("=")[1]
				if (ret.has_key(agent) == False):
					ret[agent] = []
				ret[agent].append({"title":title, "start":start, "end":end})
			except:
				pass
			
	return ret

def getJSONitems(config, agentSection):
	json_items = ""
	try:
		items = config.items(agentSection)
	except:
		items = {}
	for k,v in items:
		uv = v.decode("utf8","ignore")
		uk = k.decode("utf8","ignore")
		json_items += "\"" + uk + "\": \"" + uv + "\",\t"
	return json_items[:-2]


def generateAgentJSON(config, MHAgentsInfo, MHCalendarInfo, agentSection):
	MHinfo = getMatterHornInfo(MHAgentsInfo, agentSection)
	agent_url = getConfigOption(config, agentSection, "url")
	if (agent_url == None):
		try:
			agent_url = MHinfo["url"]
		except:
			pass
	snapshotFolder = getConfigOption(config, "dashboard-config", "snapShotFolder")
	agent_vncpasswdFile = getConfigOption(config, agentSection, "vncpasswdFile")
	if (agent_vncpasswdFile == None):
		agent_vncpasswdFile = getConfigOption(config, "dashboard-config", "vncpasswdFile")
	
	agent_online = isComputerOnline(agent_url)
	vncOk = False
	filenameshot = ""
	filenamethumb = ""	
	if (agent_online):		
		vncOk = generateAgentScreenShoot(agent_url, agent_vncpasswdFile, snapshotFolder, agentSection)
		if (vncOk == True):
			filenameshot = agentSection+".jpg"
			filenamethumb= agentSection+"-thumb.jpg"
		MHinfo = getMatterHornInfo(MHAgentsInfo, agentSection)	
	else:
		MHinfo = {}
				
	json_items = getJSONitems(config, agentSection)	
	
	calendar = []
	if MHCalendarInfo.has_key(agentSection):
		calendar = MHCalendarInfo[agentSection]
	
	if (agent_url == None):
		agent_url="";	
	
	line_str = "{ "
	line_str += "\"agentname\": \"" + agentSection +"\",\t"
	line_str += "\"agenturl\": \"" + agent_url +"\",\t"
	line_str += "\"online\": \"" + str(agent_online) +"\",\t"
	line_str += "\"VNC\": \"" + str(vncOk) +"\",\t"
	line_str += "\"image\": \"" + filenameshot + "\",\t"
	line_str += "\"thumb\": \"" + filenamethumb + "\",\t"	
	line_str += "\"enrich\": {" + json_items + "},\t" 
	line_str += "\"mhinfo\": " + json.dumps(MHinfo) + ", \t"
	line_str += "\"calendar\": " + json.dumps(calendar) + " \t"
	line_str += " }"
		
	return line_str

def getAgentsNames(config, MHAgentsInfo):
	agents = {}
	for a in MHAgentsInfo:
		name = str(a["name"])
		agents[name]=name		
	
	sections = config.sections()
	sections.remove("dashboard-config")
	for s in sections:
		if (agents.has_key(s)==False):
			agents[s]=s
	ret = agents.keys()
	
	try:
		ret.remove("demo_capture_agent")
	except:
		pass
	ret.sort()		
	return ret



def generateAllAgentsJSON(config, datetime_str):
	MHAgentsInfo = getMatterHornAgentsInfo(config)
	MHCalendarInfo = getMatterHornCalendarInfo(config)
	
	agentNames = getAgentsNames(config, MHAgentsInfo)	
	
	json_agents=""
	for a in agentNames:		
		a_out = generateAgentJSON(config, MHAgentsInfo, MHCalendarInfo, a)
		json_agents += "\t"+a_out +",\n"
	json_agents = json_agents[:-2]
	
	json="{\n"
	json+="\"datetime\": \""+datetime_str+"\",\n"
	json+="\"agents\": [\n"
	json+= json_agents + "\n"
	json+="]}\n"
	
	return json


def readAgentsConfig(config, configAgentsFolder):	
	for r,d,f in os.walk(configAgentsFolder):		
		for files in f:
			if files.endswith(".conf"):
				fileconf = os.path.join(r,files)				
				config.read(fileconf)
			if files.endswith(".csv"):
				filecsv  = os.path.join(r, files)
				csvfile = open(filecsv, "rb")
				dialect = csv.Sniffer().sniff(csvfile.read(1024))
				csvfile.seek(0)
				csvreader = csv.DictReader(csvfile)
				for row in csvreader :
					try:
						config.add_section(row['id'])
					except ConfigParser.DuplicateSectionError :
						print section + "already there"
					for item in row :
						if item != 'id' :
							config.set(row['id'],item, row[item])

def getConfigOption(config, section,option):
	try:
		ret = config.get(section, option)	
	except ConfigParser.NoOptionError:
		ret = None
	except ConfigParser.NoSectionError:
		ret = None
		
	return ret;


def process(conf_file):	
	config = ConfigParser.RawConfigParser(allow_no_value=True)
	config.read(conf_file)
	snapshotFolder = getConfigOption(config, "dashboard-config", "snapShotFolder")	
	outputJSONFile = getConfigOption(config, "dashboard-config", "outputJSONFile")
	outputLangFile = getConfigOption(config, "dashboard-config", "outputJSONLangFile")
	configAgentsFolder = getConfigOption(config, "dashboard-config", "configAgentsFolder")
	
	if (snapshotFolder == None):
		print "Error: snapShotFolder not defined in config file!"
		sys.exit(1)
	if (outputJSONFile == None):
		print "Error: outputJSONFile not defined in config file!"
		sys.exit(1)
	if (configAgentsFolder != None):
		readAgentsConfig(config, configAgentsFolder)
		
	utcnow = datetime.datetime.utcnow()
	datetime_str = "%04d-%02d-%02dT%02d:%02d:%02dZ" % (utcnow.year, utcnow.month, utcnow.day, utcnow.hour, utcnow.minute, utcnow.second)
	sys.stdout.write("Writting JSON file (" + datetime_str + ")... ")
	sys.stdout.flush()
	json = generateAllAgentsJSON(config, datetime_str)	
	write_file(outputJSONFile, json)
	print "Done."
	
	
def main():
	# argument parser
	parser = argparse.ArgumentParser(
		description='Generates the necessary files for MH-DashBoard.')
		
	parser.add_argument('-c', '--config-file', dest='config_file',
		action='store', default="/etc/mh-dashboard/dashboard.conf", 
		help='confgiguration file')
		
	args = parser.parse_args()
	if (os.path.isfile(args.config_file) == True):
		process(args.config_file)
	else:		
		print parser.format_help()
		exit(1)

if __name__ == "__main__":
	main()

