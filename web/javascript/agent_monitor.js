var site = {}
site.Messages = Class.create({
	msg:[],
	
	load:function(onSuccess) {
		if (/es/i.test(navigator.language)) {
			this.msg['name'] = 'nombre';
			this.msg['campus'] = 'campus';
			this.msg['building'] = 'edificio';
			this.msg['center'] = 'centro';
			this.msg['classroom'] = 'clase';
			this.msg['showhidden'] = 'Ver agentes ocultos';
			this.msg['size'] = 'Tamaño';
			this.msg['filterby'] = 'Filtrar por';
			this.msg['filterbyhost'] = 'Estado del host';
			this.msg['filterbymh'] = 'Estado de Matterhorn';
			this.msg['hideAgent'] = 'Ocultar agente. Para volver a mostrar desplegar la barra lateral y seleccionar "ver agentes ocultos", y luego pulsra el botón mostrar del agente';
			this.msg['showAgent'] = 'Mostrar agente';
			this.msg['numberOfHiddenItems'] = 'Número de elementos ocultos';
			this.msg['thereAre'] = 'Hay';
			this.msg['hiddenItem'] = 'agente oculto';
			this.msg['hiddenItems'] = 'agentes ocultos';
			this.msg['hideWarningMessages'] = 'Ocultar mensajes de advertencia';
			this.msg['vncerror'] = 'Error VNC';
			this.msg['agentsRecording'] = 'agentes grabando';
			this.msg['agentRecording'] = 'agente grabando';
			this.msg['lastUpdate'] = 'última actualización';
		}
		else {
			this.msg['name'] = 'name';
			this.msg['campus'] = 'campus';
			this.msg['building'] = 'building';
			this.msg['center'] = 'center';
			this.msg['classroom'] = 'classroom';
			this.msg['showhidden'] = 'Show hidden agents';
			this.msg['size'] = 'Size';
			this.msg['filterby'] = 'Filter by';
			this.msg['filterbyhost'] = 'Host status';
			this.msg['filterbymh'] = 'Matterhorn status';
			this.msg['hideAgent'] = 'Hide agent. To show this agent again, unfold the lateral bar and select "Show hidden agents", and then click on unhide button';
			this.msg['showAgent'] = 'Show agent';
			this.msg['numberOfHiddenItems'] = 'Number of hidden agents';
			this.msg['thereAre'] = 'There are';
			this.msg['hiddenItem'] = 'hidden agent';
			this.msg['hiddenItems'] = 'hidden agents';
			this.msg['hideWarningMessages'] = 'Hide warning messages';
			this.msg['vncerror'] = 'VNC Error';
			this.msg['agentsRecording'] = 'agents recording';
			this.msg['agentRecording'] = 'agent recording';
			this.msg['lastUpdate'] = 'last update';
		}
		
		onSuccess();
	},

	translate:function(key) {
		if (this.msg[key]) return this.msg[key];
		return key;
	}
});

site.MessageBox = Class.create({
	modalContainerClassName:'modalMessageContainer',
	frameClassName:'frameContainer',
	messageClassName:'messageContainer',
	errorClassName:'errorContainer',
	currentMessageBox:null,
	messageContainer:null,
	onClose:null,

	initialize:function() {
		var thisClass = this;
		$(window).resize(function(event) { thisClass.adjustTop(); });
	},

	showFrame:function(src,params) {
		if (!params) params = {}
		if (!params.width) params.width = "80%";
		if (!params.height) params.height = "80%";
		if (!params.className) params.className = this.frameClassName;
		var iframeContainer = document.createElement('iframe');
		iframeContainer.src = src;
		iframeContainer.setAttribute("frameborder", "0");
		iframeContainer.style.width = "100%";
		iframeContainer.style.height = "100%";
		this.showElement(iframeContainer,params);
	},
	
	showMessage:function(message,params) {
		if (!params) params = {}
		if (!params.width) width = "60%";
		if (!params.height) height = "40%";
		
		var msgContent = document.createElement('div');
		if (params.title) {
			var titleElem = document.createElement('div');
			titleElem.className = "messageTitle";
			titleElem.innerHTML = params.title;
			msgContent.appendChild(titleElem);
		}
		
		var msgElem = document.createElement('div');
		msgElem.className = "messageContent";
		msgElem.innerHTML = message;
		msgContent.appendChild(msgElem);
		
		this.showElement(msgContent,params);
	},

	showError:function(message,params) {
		if (!params) params = {}
		if (!params.width) params.width = "60%";
		if (!params.height) params.height = "20%";
		if (!params.className) params.className = this.errorClassName;
		
		var msgContent = document.createElement('div');
		if (params.title) {
			var titleElem = document.createElement('div');
			titleElem.className = "messageErrorTitle";
			titleElem.innerHTML = params.title;
			msgContent.appendChild(titleElem);
		}
		
		var msgElem = document.createElement('div');
		msgElem.className = "messageErrorContent";
		msgElem.innerHTML = message;
		msgContent.appendChild(msgElem);
		
		this.showElement(msgContent,params);
	},

	showElement:function(elem,params) {
		var closeButton = true;
		var width = "60%";
		var height = "40%";
		var onClose = null;
		var className = this.messageClassName;
		var modal = false;
		if (params) {
			if (params.className) className = params.className;
			if (params.closeButton!==undefined) closeButton = params.closeButton;
			if (params.width) width = params.width;
			if (params.height) height = params.height;
			if (params.onClose) onClose = params.onClose;
			if (params.modal!==undefined) modal = params.modal;
		}
		this.doShowElement(elem,closeButton,width,height,className,onClose,modal);
	},
	
	doShowElement:function(elem,closeButton,width,height,className,onClose,modal) {
		this.onClose = onClose;
		var thisClass = this;

		if (this.currentMessageBox) {
			this.close();
		}
		if (!className) className = this.messageClassName;
		
		if (!width) { width = '80%'; }
		
		if (!height) { height = '30%'; }
		
		var modalContainer = document.createElement('div');
		modalContainer.className = this.modalContainerClassName;
		modalContainer.style.position = 'fixed';
		modalContainer.style.top = '0px';
		modalContainer.style.left = '0px';
		modalContainer.style.right = '0px';
		modalContainer.style.bottom = '0px';
		modalContainer.style.zIndex = 100000;
		
		
		var messageContainer = document.createElement('div');
		messageContainer.className = className;
		messageContainer.style.width = width;
		messageContainer.style.height = height;
		messageContainer.style.position = 'relative';
		messageContainer.appendChild(elem);
		modalContainer.appendChild(messageContainer);
		
		
		$('body')[0].appendChild(modalContainer);
		
		this.currentMessageBox = modalContainer;
		this.messageContainer = messageContainer;
		var thisClass = this;
		this.adjustTop();
		
		if (closeButton) {
			this.createCloseButton();
		}
	},
	
	createCloseButton:function() {
		if (this.messageContainer) {
			var thisClass = this;
			var closeButton = document.createElement('div');
			this.messageContainer.appendChild(closeButton);
			closeButton.className = 'messageContainer_closeButton';
			$(closeButton).click(function(event) { thisClass.onCloseButtonClick(); });
		}
	},
	
	adjustTop:function() {
		if (this.currentMessageBox) {
			var windowHeight = $(window).height();
			var contentHeight = $(this.messageContainer).outerHeight();

			var top = windowHeight/2 - contentHeight/2;
			this.messageContainer.style.marginTop = top + 'px';
		}
	},
	
	adjustWidthToHeight:function() {
		if (this.currentMessageBox) {
			var contentHeight = $(this.messageContainer).height();
			this.messageContainer.style.width = contentHeight + 'px';
		}
	},
	
	close:function() {
		if (this.currentMessageBox && this.currentMessageBox.parentNode) {
			var msgBox = this.currentMessageBox;
			var parent = msgBox.parentNode;
			$(msgBox).animate({opacity:0.0},300,function() {
				parent.removeChild(msgBox);
			});
			if (this.onClose) {
				this.onClose();
			}
		}
	},
	
	onCloseButtonClick:function() {
		this.close();
	}
});

site.messageBox = new site.MessageBox();

var UtilityView = Class.create({
	parentContainer:null,
	container:null,
	width:200,
	
	dashboard:null,
	
	itemSizeInc:50,
	
	hostFilters:[],
	mhFilters:[],
	
	initialize:function(parent,dashboard) {
		this.itemSizeInc = site.instance.initConfig.zoomIncrement;
		var thisClass = this;
		this.parentContainer = parent;
		this.dashboard = dashboard;
		this.container = base.dom.createElement('div',{className:'utilityView'});
		this.parentContainer.appendChild(this.container);
		
		var sizeField = base.dom.createElement('div',{className:'utilityField'});
		
		var sizeText = base.dom.createElement('input',{className:'utilityText',id:'itemSize'},{'type':'text','disabled':'disabled','hidden':'hidden','value':""+site.instance.config.agentItemSize});
		sizeField.appendChild(base.dom.createElement('label',{className:'utilityLabel',innerHTML:site.messages.translate('size') + ': '},{'for':'itemSize'}));
		sizeField.appendChild(sizeText);
		var subBtn = base.dom.createElement('input',{className:'stepper'},{'type':'button','value':'-'});
		var addBtn = base.dom.createElement('input',{className:'stepper'},{'type':'button','value':'+'});
		$(subBtn).click(function(event) { thisClass.decItemSize(); })
		$(addBtn).click(function(event) { thisClass.incItemSize(); })
		sizeField.appendChild(subBtn);
		sizeField.appendChild(addBtn);
		
		this.container.appendChild(sizeField);
		
		this.container.appendChild(this.getCheckBox('showHidden',site.messages.translate('showhidden'),site.instance.config.showHiddenAgents,function(checkbox) {
			if ($(checkbox).is(':checked')) {
				thisClass.applyFilters(true);
			}
			else {
				thisClass.applyFilters(false);
			}
		}));
		
		this.container.appendChild(this.getCheckBox('hideMessages',site.messages.translate('hideWarningMessages'),site.instance.config.hideWarningMessages,function(checkbox) {
			if ($(checkbox).is(':checked')) {
				site.instance.config.hideWarningMessages = true;
				thisClass.applyFilters(site.instance.config.showHiddenAgents);
			}
			else {
				site.instance.config.hideWarningMessages = false;
				thisClass.applyFilters(site.instance.config.showHiddenAgents);
			}
		}));
		
		if (!site.instance.config.filters || typeof(site.instance.config.filters)!="object") {
			site.instance.config = {};
		}
		
		this.container.appendChild(base.dom.createElement('div',{className:'utilityTitleLabel',innerHTML:site.messages.translate('filterby')}));
		this.container.appendChild(base.dom.createElement('div',{className:'utilityTitleLabel subtitle',innerHTML:site.messages.translate('filterbyhost') + ':'}));
		this.container.appendChild(this.getFilterField('offline',site.messages.translate('offline'),site.instance.config.filters.host.offline,this.hostFilters));
		this.container.appendChild(this.getFilterField('online',site.messages.translate('online'),site.instance.config.filters.host.online,this.hostFilters));
		this.container.appendChild(this.getFilterField('vncerror',site.messages.translate('vncerror'),site.instance.config.filters.host.vncerror,this.hostFilters));
		
		this.container.appendChild(base.dom.createElement('div',{className:'utilityTitleLabel subtitle',innerHTML:site.messages.translate('filterbymh') + ':'}));
		this.container.appendChild(this.getFilterField('idle',site.messages.translate('idle'),site.instance.config.filters.mh.idle,this.mhFilters));
		this.container.appendChild(this.getFilterField('offline',site.messages.translate('offline'),site.instance.config.filters.mh.offline,this.mhFilters));
		this.container.appendChild(this.getFilterField('capturing',site.messages.translate('capturing'),site.instance.config.filters.mh.capturing,this.mhFilters));
		this.container.appendChild(this.getFilterField('unregistered',site.messages.translate('unregistered'),site.instance.config.filters.mh.unregistered,this.mhFilters));
		this.container.appendChild(this.getFilterField('unknown',site.messages.translate('unknown'),site.instance.config.filters.mh.unknown,this.mhFilters));

		new base.Timer(function(timer) {
			thisClass.applyFilters(site.instance.config.showHiddenAgents);
		},500);
		
		new base.Timer(function(timer) {
			if (site.instance.config.showUtils) {
				thisClass.show();
			}
			else {
				thisClass.hide();
			}
		},300);
	},
	
	getFieldValue:function(field) {
		return $(field).is(':checked');
	},
	
	saveFilters:function(fieldArray,filterObject) {
		for (var i=0; i<fieldArray.length;++i) {
			var field = fieldArray[i];
			filterObject[field.id] = this.getFieldValue(field);
		}
	},
	
	applyFilters:function(showHidden) {
		// host filters
		this.saveFilters(this.hostFilters,site.instance.config.filters.host);
		
		// matterhorn filters
		this.saveFilters(this.mhFilters,site.instance.config.filters.mh);
		site.instance.config.showHiddenAgents = showHidden;
		site.instance.saveConfig();
		this.dashboard.applyFilters(true);
	},
	
	getCheckBox:function(id,label,defaultValue,onClick) {
		var thisClass = this;
		var field = base.dom.createElement('div',{className:'utilityField'});
		var filterField = base.dom.createElement('input',{className:'utilityCheck',id:id},{'type':'checkbox'});
		if (defaultValue) {
			filterField.setAttribute('checked','checked');
		}		
		field.appendChild(filterField);
		var label = base.dom.createElement('span',{className:'utilityCheckLabel',innerHTML:label});
		field.appendChild(label);
		$(field).click(function(event) { onClick(this.childNodes[0]); });
		$(label).click(function(event) { onClick(this.childNodes[0]); });
		return field;
	},

	getFilterField:function(fieldId,label,value,filterArray) {
		var thisClass = this;
		var field = base.dom.createElement('div',{className:'utilityField'});
		var filterField = base.dom.createElement('input',{className:'utilityCheck',id:fieldId},{'type':'checkbox'});
		if (value) {
			filterField.setAttribute("checked", "checked");
		}
		field.appendChild(filterField);
		var label = base.dom.createElement('span',{className:'utilityCheckLabel',innerHTML:label})
		field.appendChild(label);
		$(field).click(function(event) { thisClass.applyFilters(site.instance.config.showHiddenAgents); });
		filterArray.push(filterField);
		return field;
	},
	
	incItemSize:function() {
		var size = parseInt($('#itemSize').val());
		size += this.itemSizeInc;
		var actualSize = this.dashboard.setItemSize(size,true,200);
		$('#itemSize').val(actualSize);
	},
	
	decItemSize:function() {
		var size = parseInt($('#itemSize').val());
		size -= this.itemSizeInc;
		var actualSize = this.dashboard.setItemSize(size,true,200);
		$('#itemSize').val(actualSize);
	},

	show:function(animate) {
		site.instance.config.showUtils = true;
		site.instance.saveConfig();
		if (animate) $(this.dashboard.mainContainer).animate({'left':this.width + 'px'},{duration:200});
		else $(this.dashboard.mainContainer).css({'left':this.width + 'px'});
	},
	
	hide:function(animate) {
		site.instance.config.showUtils = false;
		site.instance.saveConfig();
		if (animate) $(this.dashboard.mainContainer).animate({'left':'0px'},{duration:200});
		else $(this.dashboard.mainContainer).css({'left':'0px'});
	}
});

var MonitorDashboard = Class.create({
	parentContainer:null,
	mainContainer:null,
	messageContainer:null,
	messageContainerLeft:null,
	dashboardContainer:null,
	agentData:null,
	agentElem:null,
	defaultItemProperties:{w:130,h:130},
	minSize:100,
	maxSize:450,

	initialize:function(parent) {
		this.parentContainer = parent;
		this.mainContainer = base.dom.createElement('div',{className:'dashboardMainContainer'});
		this.dashboardContainer = base.dom.createElement('div',{className:'dashboardContainer'});
		this.parentContainer.appendChild(this.mainContainer);
		this.mainContainer.appendChild(this.dashboardContainer);
		this.messageContainer = base.dom.createElement('div',{className:'dashboardMessageContainer'});
		this.mainContainer.appendChild(this.messageContainer);
		
		this.messageContainerLeft = base.dom.createElement('div',{className:'dashboardMessageContainerLeft'});
		this.mainContainer.appendChild(this.messageContainerLeft);
	},
	
	load:function(url,onSuccess) {
		var thisClass = this;
		jQuery.ajax({url:url}).always(function(data) {
			if (typeof(data)=="string") {
				data = JSON.parse(data);
			}
			thisClass.agentData = data;
			thisClass.buildDashboard();
			thisClass.loadHiddenAgentsFromCookie();
			thisClass.setItemSize(site.instance.config.agentItemSize);
			new base.Timer(function(timer) {
				thisClass.applyFilters();
				onSuccess();
			},700);
		});
	},

	getLastUpdate:function() {
		var date = this.agentData.datetime;
		return date;
	},

	buildDashboard:function() {
		this.agentElem = [];
		this.dashboardContainer.innerHTML = "";
		var recordingAgents = 0;
		var lastUpdate = this.getLastUpdate();
		for (var i in this.agentData.agents) {
			var agent = this.agentData.agents[i];
			if (typeof(agent)=="object") {
				var item = this.createItem(agent);
				if (this.getMHStatus(agent)=='capturing') {
					++recordingAgents;
				}
				this.dashboardContainer.appendChild(item);
				base.dom.prepareToScaleTexts(item);
				this.agentElem.push(item);
			}
		}
		var message = "";
		if (recordingAgents==1) {
			message = recordingAgents + " " + site.messages.translate('agentRecording') + '<br/>';
		}
		else if (recordingAgents>1) {
			message = recordingAgents + " " + site.messages.translate('agentsRecording') + '<br/>';
		}
		message += site.messages.translate('lastUpdate') + ': ' + lastUpdate;
		this.messageContainerLeft.innerHTML = message;
		this.setupCapturingAnimation();
	},
	
	loadHiddenAgentsFromCookie:function() {
		if (!site.instance.config.hiddenAgents || typeof(site.instance.config.hiddenAgents)!="object") {
			site.instance.config.hiddenAgents = {};
		}
		for (var i=0; i<this.agentElem.length;++i) {
			var agent = this.agentElem[i];
			configAgentHidden = site.instance.config.hiddenAgents[agent.agentData.agentname];
			var button = $(agent).find('.dashboardItem.hideButton')[0];
			if (configAgentHidden) {
				button.className = "dashboardItem hideButton hide";
				agent.isAgentHidden = true;
			}
			else {
				button.className = "dashboardItem hideButton show";
				agent.isAgentHidden = false;
			}	
		}
	},
	
	// online, offline, vncerror
	getHostStatus:function(agentData) {
		var status = 'offline';
		if (/true/i.test(agentData.online)) {
			status = 'vncerror';
		}
		if (/true/i.test(agentData.VNC)) {
			status = 'online';
		}
		return status;
	},

	// idle, offline, capturing, unregistered, unknown
	getMHStatus:function(agentData) {
		var status = 'unregistered';
		if (agentData.mhinfo && agentData.mhinfo.state) {
			status = agentData.mhinfo.state;
		}
		return status;
	},
	
	// unknown, idle, impending, capturing
	getCalendarStatus:function(agentData) {
		var status = 'unknown';
		if (agentData.calendar) {
			var date = "2013-02-08T17:30:00Z";
			
		}
		return status;
	},

	capturingStatus:'',
	capturingAnimationTimer:null,

	setupCapturingAnimation:function() {
		if (this.capturingAnimationTimer) {
			this.capturingAnimationTimer.cancel();
			this.capturingAnimationTimer = null;
		}
		var thisClass = this;
		this.capturingAnimationTimer = new base.Timer(function(timer) {
			thisClass.capturingAnimation();
		},1000);
		this.capturingAnimationTimer.repeat = true;
	},

	capturingAnimation:function() {
		var capturingElems = $('.dashboardItem.statusIcon.capturing' +  this.capturingStatus);
		
		if (this.capturingStatus=='') this.capturingStatus = '1';
		else this.capturingStatus = '';
		
		for (var i=0;i<capturingElems.length;++i) {
			var elem = capturingElems[i];
			elem.className = 'dashboardItem statusIcon capturing' +  this.capturingStatus;
		}
	},

	createItem:function(agentData) {
		var item = base.dom.createElement('div',{className:'dashboardItemContainer',id:agentData.agentname});
		var url = agentData.agenturl;
		if (!(/http:\/\/(.+)/.test(url))) {
			url = "http://" + url;
		}
		var imageUrl = site.instance.initConfig.thumbsDir + '/' + agentData.thumb;
		item.agentData = agentData;
		item.agentStatus = {};
		item.agentStatus.hostStatus = this.getHostStatus(agentData);
		item.agentStatus.mhStatus = this.getMHStatus(agentData);
		item.agentStatus.calendarStatus = this.getCalendarStatus(agentData);
		if (item.agentStatus.hostStatus=='online') {
			item.appendChild(base.dom.createElement('img',{className:'dashboardItem image'},{'src':imageUrl,'alt':agentData.agentname}));
			item.appendChild(base.dom.createElement('img',{className:'dashboardItem screenGlass'},{'src':'resources/monitor_glass.png','alt':'screen glass'}));
			item.appendChild(base.dom.createElement('div',{className:'dashboardItem onlineIcon'}));
		}
		else if (item.agentStatus.hostStatus=='vncerror') {
			item.appendChild(base.dom.createElement('img',{className:'dashboardItem offlineImage'},{'src':'resources/vnc_error_screen.png','alt':'vnc error'}));
			item.appendChild(base.dom.createElement('img',{className:'dashboardItem screenGlass'},{'src':'resources/monitor_glass.png','alt':'screen glass'}));
			item.appendChild(base.dom.createElement('div',{className:'dashboardItem offlineIcon'}));
		}
		else {
			item.appendChild(base.dom.createElement('img',{className:'dashboardItem offlineImage'},{'src':'resources/offline_agent.png','alt':'offline agent'}));
			item.appendChild(base.dom.createElement('img',{className:'dashboardItem screenGlass'},{'src':'resources/monitor_glass.png','alt':'screen glass'}));
			item.appendChild(base.dom.createElement('div',{className:'dashboardItem offlineIcon'}));
		}
		
		if (item.agentStatus.mhStatus!='idle' && item.agentStatus.mhStatus!='capturing') {
			item.appendChild(base.dom.createElement('div',{className:'dashboardItem statusText warning',innerHTML:item.agentStatus.mhStatus}));
		}

		var iconStatus = 'unreachable';
		if (item.agentStatus.hostStatus=='vncerror') {
			iconStatus = 'idle';
		}
		else if (item.agentStatus.hostStatus=='online') {
			iconStatus = 'idle';
		}
		
		if (item.agentStatus.mhStatus == 'capturing' && iconStatus=='idle') {
			iconStatus = 'capturing';
		}

		item.appendChild(base.dom.createElement('div',{className:'dashboardItem statusIcon ' + iconStatus}));
		item.appendChild(base.dom.createElement('div',{className:'dashboardItem info name',innerHTML:agentData.agentname}));
		if (agentData.enrich) {
			item.appendChild(base.dom.createElement('div',{className:'dashboardItem info campus',innerHTML:agentData.enrich.campus}));
			item.appendChild(base.dom.createElement('div',{className:'dashboardItem info building',innerHTML:agentData.enrich.building}));
			item.appendChild(base.dom.createElement('div',{className:'dashboardItem info center',innerHTML:agentData.enrich.center}));
			item.appendChild(base.dom.createElement('div',{className:'dashboardItem info classroom',innerHTML:agentData.enrich.classroom}));
		}		
		var infoButton = base.dom.createElement('div',{className:'dashboardItem infoButton',innerHTML:'i'});
		item.appendChild(infoButton);
		var thisClass = this;
		$(infoButton).click(function(event) { thisClass.showInfo(this.parentNode); });
		var hideButton = base.dom.createElement('div',{className:'dashboardItem hideButton show'},{'title':site.messages.translate('hideAgent')});
		item.appendChild(hideButton);
		$(hideButton).click(function(event) {
			if (/show/.test(this.className)) {
				this.className = 'dashboardItem hideButton hide';
				this.title = site.messages.translate('showAgent');
				thisClass.hideItem(this.parentNode);
				site.instance.config.hiddenAgents[this.parentNode.agentData.agentname] = true;
				site.instance.saveConfig();
			}
			else {
				this.className = 'dashboardItem hideButton show';
				this.title = site.messages.translate('hideAgent');
				thisClass.showItem(this.parentNode);
				site.instance.config.hiddenAgents[this.parentNode.agentData.agentname] = false;
				site.instance.saveConfig();
			}
		});
		if (item.agentStatus.hostStatus=='online') {
			var vncButton = base.dom.createElement('div',{className:'dashboardItem vncButton'});
			item.appendChild(vncButton);
			$(vncButton).click(function(event) { thisClass.connectVnc(this.parentNode); });
		}

		$(item).css({
			'width':this.defaultItemProperties.w + 'px',
			'height':this.defaultItemProperties.h + 'px',
			'float':'left'
		});
		return item;
	},
	
	hideItem:function(agentElem) {
		agentElem.isAgentHidden = true;
		this.applyFilters(true);
	},
	
	showItem:function(agentElem) {
		agentElem.isAgentHidden = false;
		this.applyFilters(true);
	},
	
	createInfoItem:function(agentData) {
		var item = base.dom.createElement('div',{className:'dashboardDetailContainer',id:agentData.agentname});
		var url = agentData.agenturl;
		if (!(/http:\/\/(.+)/.test(url))) {
			url = "http://" + url;
		}
		var imageUrl = site.instance.initConfig.thumbsDir + '/' + agentData.image;
		var hostStatus = this.getHostStatus(agentData);
		if (hostStatus=='online') {
			item.appendChild(base.dom.createElement('img',{className:'dashboardDetail image'},{'src':imageUrl,'alt':agentData.agentname}));
		}
		else if (hostStatus=='vncerror') {
			item.appendChild(base.dom.createElement('img',{className:'dashboardDetail offlineImage'},{'src':'resources/vnc_error_screen.png','alt':'vnc error'}));
		}
		else {
			item.appendChild(base.dom.createElement('img',{className:'dashboardDetail offlineImage'},{'src':'resources/offline_agent.png','alt':'offline agent'}));
		}
		var infoContainer = base.dom.createElement('div',{className:'dashboardDetailInfoContainer'});
		infoContainer.appendChild(base.dom.createElement('div',{className:'dashboardDetail info name',innerHTML:'<span class="dashboardDetail info label">' + site.messages.translate('name') + '</span>:' + agentData.agentname}));
		if (agentData.enrich) {
			infoContainer.appendChild(base.dom.createElement('div',{className:'dashboardDetail info campus',innerHTML:'<span class="dashboardDetail info label">' + site.messages.translate('campus') + '</span>:' + agentData.enrich.campus}));
			infoContainer.appendChild(base.dom.createElement('div',{className:'dashboardDetail info building',innerHTML:'<span class="dashboardDetail info label">' + site.messages.translate('building') + '</span>:' + agentData.enrich.building}));
			infoContainer.appendChild(base.dom.createElement('div',{className:'dashboardDetail info center',innerHTML:'<span class="dashboardDetail info label">' + site.messages.translate('center') + '</span>:' + agentData.enrich.center}));
			infoContainer.appendChild(base.dom.createElement('div',{className:'dashboardDetail info classroom',innerHTML:'<span class="dashboardDetail info label">' + site.messages.translate('classroom') + '</span>:' + agentData.enrich.classroom}));	
		}
		item.appendChild(infoContainer);
		return item;
	},

	showInfo:function(agentElem) {
		var infoContainer = this.createInfoItem(agentElem.agentData);
		
		site.messageBox.showElement(infoContainer,{width:'80%',height:'70%',closeButton:true});
		
	},
	
	connectVnc:function(agentElem) {
		window.open('agent_vnc.htm?host=' + agentElem.agentData.agenturl);
	},

	applyFilters:function(animate) {
		var filters = site.instance.config.filters;
		var hiddenItems = 0;
		var showAll = false;
		if (filters==undefined || typeof(filters)!="object") {
			filters = {
				host:{
					offline:true,
					online:true,
					vncerror:true
				},
				mh:{
					idle:true,
					offline:true,
					capturing:true,
					unregistered:true,
					unknown:true
				}
			};
		}
		var showHidden = site.instance.config.showHiddenAgents;

		for (var i=0;i<this.agentElem.length;++i) {
			var agent = this.agentElem[i];
			if (agent && agent.agentData) {
				var hostStatus = agent.agentStatus.hostStatus;
				var mhStatus = agent.agentStatus.mhStatus;
				var visible = false;
				if (filters.host[hostStatus] && filters.mh[mhStatus] && !agent.isAgentHidden) {
					visible = true;
				}

				if (visible) {
					this.showAgent(agent,animate);
				}
				else if (!visible && showHidden) {
					this.showAgent(agent,animate,0.5);
				}
				else {
					this.hideAgent(agent,animate);
					++hiddenItems;
				}
			}
		}
		
		if (hiddenItems==1) {
			this.messageContainer.innerHTML = site.messages.translate('thereAre') + ' ' + hiddenItems + ' ' + site.messages.translate('hiddenItem');
			$(this.messageContainer).show();
		}
		else if (hiddenItems>1) {
			this.messageContainer.innerHTML = site.messages.translate('thereAre') + ' ' + hiddenItems + ' ' + site.messages.translate('hiddenItems');
			$(this.messageContainer).show();
		}
		else {
			this.messageContainer.innerHTML = "";
			$(this.messageContainer).hide();
		}
		
		if (site.instance.config.hideWarningMessages) {
			$(this.messageContainer).hide();
		}
	},
	
	hideAgent:function(agentElem,animate) {
		if (animate) {
			$(agentElem).animate({opacity:0},{complete:function() {
				$(this).hide();
			}});
		}
		else {
			$(agentElem).hide();
		}
		if (!site.instance.config.hiddenAgents || typeof(site.instance.config.hiddenAgents)!="object") {
			site.instance.config.hiddenAgents = {};
		}
		site.instance.saveConfig();
	},

	showAgent:function(agentElem,animate,showOpacity) {
		if (showOpacity===undefined) showOpacity = 1;
		if (animate) {
			$(agentElem).show();
			$(agentElem).animate({opacity:showOpacity});
		}
		else if (showOpacity==1) {
			$(agentElem).show();
		}
		else {
			$(agentElem).show();
			$(agentElem).css({'opacity':showOpacity});
		}
		if (!site.instance.config.hiddenAgents || typeof(site.instance.config.hiddenAgents)!="object") {
			site.instance.config.hiddenAgents = {};
		}
		site.instance.saveConfig();
	},
	
	setItemSize:function(width,animate,duration) {
		if (width<this.minSize) {
			width = this.minSize;
		}
		if (width>this.maxSize) {
			width = this.maxSize;
		}
		site.instance.config.agentItemSize = width;
		var height = width;
		var style = {
						"width":width + "px",
						"height":height + "px"
					};
		if (duration===undefined) duration = 500;
		for (var i=0;i<this.agentElem.length;++i) {
			var agent = this.agentElem[i];
			if (animate) {
				$(agent).animate(style,{complete:function() {
					base.dom.scaleTexts(this);
				},duration:duration});
			}
			else {
				$(agent).css(style);
				base.dom.scaleTexts(agent);
			}
		}
		site.instance.saveConfig();
		return width;
	}
});

var AgentMonitor = Class.create({
	mainContainer:null,
	dashboard:null,
	utils:null,
	config:{},
	saveConfigTimer:null,
	loader:null,
	reloadTimer:null,
	reloadMinutes:5,
	initConfig:{
		reloadMinutes:5,
		agentDataUrl:'agents.json',
		imagesDir:'screenshots',
		thumbsDir:'screenshots',
		zoomIncrement:50
	},

	initialize:function(container,initConfig) {
		if (initConfig) {
			if (initConfig.reloadMinutes) this.initConfig.reloadMinutes = initConfig.reloadMinutes;
			if (initConfig.agentDataUrl) this.initConfig.agentDataUrl = initConfig.agentDataUrl;
			if (initConfig.imagesDir) this.initConfig.imagesDir = initConfig.imagesDir;
			if (initConfig.thumbsDir) this.initConfig.thumbsDir = initConfig.thumbsDir;
			if (initConfig.zoomIncrement) this.initConfig.zoomIncrement = initConfig.zoomIncrement;
		}
		this.mainContainer = container;
		var thisClass = this;
		site.instance = this;
		this.loadConfig();
		site.messages = new site.Messages();
		site.messages.load(function() {
			thisClass.create();
			thisClass.dashboard.load(thisClass.initConfig.agentDataUrl,function(){
				$(thisClass.loader).hide();
			});
		});
		this.saveConfigTimer = new base.Timer(function(timer) {
			timer.repeat = true;
			thisClass.saveConfig();
		},10000);
		var reloadTime = this.initConfig.reloadMinutes * 60 * 1000;
		this.reloadTimer = new base.Timer(function(timer) {
			thisClass.dashboard.load(thisClass.initConfig.agentDataUrl,function() {});
		},reloadTime);
		this.reloadTimer.repeat = true;
	},
	
	saveConfig:function() {
		base.cookies.set('config',JSON.stringify(this.config));
	},
	
	loadDefaultConfig:function() {
		this.config = {
			showUtils:false,
			hideWarningMessages:false,
			agentItemSize:300,
			hiddenAgents:{},
			showHiddenAgents:false,
			filters: {
				host:{
					offline:true,
					online:true,
					vncerror:true
				},
				mh:{
					idle:true,
					offline:true,
					capturing:true,
					unregistered:true,
					unknown:true
				}
			}
		}
	},

	loadConfig:function() {
		// Update to new filter system
		var config = base.cookies.get('config');
		try {
			this.config = JSON.parse(config);
		}
		catch (e) {
			this.loadDefaultConfig();
		}
		
		if (!this.config || !this.config.filters || !this.config.filters.host) {
			this.loadDefaultConfig();
		}
	},

	create:function() {
		var thisClass = this;
		this.dashboard = new MonitorDashboard(this.mainContainer);
		this.utils = new UtilityView(this.mainContainer,this.dashboard);
		var showUtilsButtonClass = "showUtilsButton";
		var showButton = null;
		if (this.config.showUtils) {
			var showButton = base.dom.createElement('div',{className:showUtilsButtonClass + ' expanded',innerHTML:'<'});
		}
		else {
			var showButton = base.dom.createElement('div',{className:showUtilsButtonClass + ' collapsed',innerHTML:'>'});
		}
		$(showButton).click(function(event) {
			if (this.className==showUtilsButtonClass + " collapsed") {
				this.className = showUtilsButtonClass + " expanded";
				this.innerHTML = '<'
				thisClass.utils.show(true);
			}
			else if (this.className==showUtilsButtonClass + " expanded") {
				this.className = showUtilsButtonClass + " collapsed";
				this.innerHTML = '>'
				thisClass.utils.hide(true);
			}
		});
		this.dashboard.mainContainer.appendChild(showButton);
		this.loader = base.dom.createElement('div',{className:'loaderContainer'});
		this.mainContainer.appendChild(this.loader);
	}
});
