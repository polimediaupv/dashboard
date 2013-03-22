var site = {};
site.Messages = Class.create({
	msg:{},
	lang:null,
        
	load:function(onSuccess) {
		var thisClass = this;
		var lang = "en";
		if (/es/i.test(navigator.language)) {
			lang = "es";
		}
		thisClass.lang = lang;
		$.ajax({url:'localization/messages_' + lang + '.json'}).complete(function(data) {
			thisClass.msg = JSON.parse(data.responseText);
			if (onSuccess) onSuccess();
		});
	},
                
        getLang:function(){
            this.lang = navigator.language.toLowerCase();
            return this.lang;
        },

        add:function(key,value){
            this.msg[key] = value;
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
		if (!params) params = {};
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
		if (!params) params = {};
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
		if (!params) params = {};
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
	filterValue:null,
        filterGroup:[],
	hostFilters:[],
	mhFilters:[],
	calFilters:[],
        caFilters:[],
        enrichFilters:[],
	
	initialize:function(parent,dashboard) {
		this.itemSizeInc = site.instance.initConfig.zoomIncrement;
		var thisClass = this;
		this.parentContainer = parent;
		this.dashboard = dashboard;
                dashboard.setUtilityView(this);
		this.container = base.dom.createElement('div',{className:'utilityView'});
		this.parentContainer.appendChild(this.container);
		
		var sizeField = base.dom.createElement('div',{className:'utilityField'});
		
		var sizeText = base.dom.createElement('input',{className:'utilityText',id:'itemSize'},{'type':'text','disabled':'disabled','hidden':'hidden','value':""+site.instance.config.agentItemSize});
		sizeField.appendChild(base.dom.createElement('label',{className:'utilityLabel',innerHTML:site.messages.translate('size') + ': '},{'for':'itemSize'}));
		sizeField.appendChild(sizeText);
		var subBtn = base.dom.createElement('input',{className:'stepper'},{'type':'button','value':'-'});
		var addBtn = base.dom.createElement('input',{className:'stepper'},{'type':'button','value':'+'});
		$(subBtn).click(function(event) { thisClass.decItemSize(); });
		$(addBtn).click(function(event) { thisClass.incItemSize(); });
		sizeField.appendChild(subBtn);
		sizeField.appendChild(addBtn);
		
		this.container.appendChild(sizeField);
		
		this.container.appendChild(this.getCheckBox('showHidden',site.messages.translate('showhidden'),site.instance.config.showHiddenAgents,function(checkbox) {
			if ($(checkbox).is(':checked')) {
				thisClass.applyFilters(true,site.instance.config.showFilteredAgents);
			}
			else {
				thisClass.applyFilters(false,site.instance.config.showFilteredAgents);
			}
		}));
		this.container.appendChild(this.getCheckBox('showFiltered',site.messages.translate('showfiltered'),site.instance.config.showFilteredAgents,function(checkbox) {
			if ($(checkbox).is(':checked')) {
				thisClass.applyFilters(site.instance.config.showHiddenAgents,true);
			}
			else {
				thisClass.applyFilters(site.instance.config.showHiddenAgents,false);
			}
		}));
                
		this.container.appendChild(this.getCheckBox('hideMessages',site.messages.translate('hideWarningMessages'),site.instance.config.hideWarningMessages,function(checkbox) {
			if ($(checkbox).is(':checked')) {
				site.instance.config.hideWarningMessages = true;
				thisClass.applyFilters(site.instance.config.showHiddenAgents,site.instance.config.showFilteredAgents);
			}
			else {
				site.instance.config.hideWarningMessages = false;
				thisClass.applyFilters(site.instance.config.showHiddenAgents,site.instance.config.showFilteredAgents);
			}
		}));
		
		if (!site.instance.config.filters || typeof(site.instance.config.filters)!="object") {
			site.instance.config = {};
		}
		this.container.appendChild(base.dom.createElement('div',{className:'utilityTitleLabel',innerHTML:site.messages.translate('filterby')}));
                this.container.appendChild(this.getFilterGroup('host',site.messages.translate('filterbyhost'),this.filterGroup,true));
                this.container.appendChild(this.getFilterGroup('mh',site.messages.translate('filterbymh'),this.filterGroup));
                this.container.appendChild(this.getFilterGroup('cal',site.messages.translate('filterbycal'),this.filterGroup));

                $('#div_host').append(this.getFilterField('offline',site.messages.translate('offline'),site.instance.config.filters.host.offline,this.hostFilters));
		$('#div_host').append(this.getFilterField('online',site.messages.translate('online'),site.instance.config.filters.host.online,this.hostFilters));
		$('#div_host').append(this.getFilterField('vncerror',site.messages.translate('vncerror'),site.instance.config.filters.host.vncerror,this.hostFilters));
                
                $('#div_mh').append(this.getFilterField('idle',site.messages.translate('idle'),site.instance.config.filters.mh.idle,this.mhFilters));
		$('#div_mh').append(this.getFilterField('offline',site.messages.translate('offline'),site.instance.config.filters.mh.offline,this.mhFilters));
		$('#div_mh').append(this.getFilterField('capturing',site.messages.translate('capturing'),site.instance.config.filters.mh.capturing,this.mhFilters));
		$('#div_mh').append(this.getFilterField('unregistered',site.messages.translate('unregistered'),site.instance.config.filters.mh.unregistered,this.mhFilters));
		$('#div_mh').append(this.getFilterField('unknown',site.messages.translate('unknown'),site.instance.config.filters.mh.unknown,this.mhFilters));
                $('#div_mh').hide();
		
		$('#div_cal').append(this.getFilterField('capturing',site.messages.translate('capturing'),site.instance.config.filters.cal.capturing,this.calFilters));
		$('#div_cal').append(this.getFilterField('impending',site.messages.translate('impending'),site.instance.config.filters.cal.impending,this.calFilters));
		$('#div_cal').append(this.getFilterField('today',site.messages.translate('today'),site.instance.config.filters.cal.today,this.calFilters));
		$('#div_cal').append(this.getFilterField('idle',site.messages.translate('tomorroworlater'),site.instance.config.filters.cal.idle,this.calFilters));
                $('#div_cal').hide();
		
//              	this.container.appendChild(base.dom.createElement('div',{className:'utilityTitleLabel subtitle',innerHTML:site.messages.translate('filterbycagroup') + ':'}));
//                this.container.appendChild(base.dom.createElement('div',{id:"caFilters"}));
                
		new base.Timer(function(timer) {
			thisClass.applyFilters(site.instance.config.showHiddenAgents,site.instance.config.showFilteredAgents);
                        
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
	
	saveFilters:function(fieldArray,filterObject, filter, name) {
            var group_filter_none = false;
            var group_filter_all = true;
            for (var i=0; i<fieldArray.length;++i) {
                var field = fieldArray[i];
                if (filter) {
                    field.checked = filterObject[field.id];
                            //= this.getFieldValue(field);
                } else {
                    filterObject[field.id] = this.getFieldValue(field);
                } 
                group_filter_none = group_filter_none || filterObject[field.id];
                group_filter_all =  group_filter_all &&  filterObject[field.id];
                
            }
            if (!group_filter_none) {
                $(name).attr('class','utilityCheck3 middle');
            } else if(group_filter_all) {
                $(name).attr('class','utilityCheck3 middle all');
            } else {
                $(name).attr('class','utilityCheck3 middle some');
            }
	},
	saveCaFilters:function(fieldArray,filterObject, filter) {
            var group_filter = {};

            for (var i=0; i<fieldArray.length;++i) {
                var field = fieldArray[i];
                var id=field.id;
                var p = /(.*?)_:_(.*?)$/g.exec(id);
                var pos = p[1].length;
                var group = id.substr(0,pos);
                var item = id.substr(pos+3);
                if (filter){
                    field.checked = filterObject[group][item];
                } else {                          
                    filterObject[group][item] = this.getFieldValue(field);
                }
                if (!group_filter.hasOwnProperty(group)){
                    group_filter[group] = {};
                    group_filter[group].none  = false;
                    group_filter[group].all = true;
                } else {
                    group_filter[group].none = group_filter[group].none || filterObject[group][item];   
                    group_filter[group].all = group_filter[group].all && filterObject[group][item];
                }
            }
            for (var i in group_filter) {
                if (!group_filter[i].none) {
                    $("#"+i+"_all").attr('class','utilityCheck3 middle'); 
                } else if(group_filter[i].all) {
                    $("#"+i+"_all").attr('class','utilityCheck3 middle all'); 
                } else {
                    $("#"+i+"_all").attr('class','utilityCheck3 middle some');
                }
            }
	},
	
	applyFilters:function(showHidden,showFiltered,filterall) {
                var filter = false;
                if (filterall && typeof(filterall)=="object") {
                    var filters;
                    if (site.instance.config.filters.hasOwnProperty(filterall.filter)){
                        filters = site.instance.config.filters[filterall.filter];
                    } else if (site.instance.config.filters.enrich.hasOwnProperty(filterall.filter)){
                        filters = site.instance.config.filters.enrich[filterall.filter];
                    }
                    if (filterall.hasOwnProperty('selected')) {
                        for (var f in filters){
                            if (filterall.selected == 'all'){
                                filters[f] = true;
                                filter = true;
                      //          filterall.selected == 'all'
                            } else {
                                
                                filters[f] = false;
                                filter = true;
                            }
                        }
                    }
                }
		// host filters
		this.saveFilters(this.hostFilters,site.instance.config.filters.host,filter, '#host_all');
		
		// matterhorn filters
		this.saveFilters(this.mhFilters,site.instance.config.filters.mh,filter, '#mh_all');

		// 		
		this.saveFilters(this.calFilters,site.instance.config.filters.cal,filterall,'#cal_all');

                this.saveCaFilters(this.enrichFilters,site.instance.config.filters.enrich, filterall);
                
		site.instance.config.showHiddenAgents = showHidden;
		site.instance.config.showFilteredAgents = showFiltered;
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
		var label = base.dom.createElement('span',{className:'utilityCheckLabel',innerHTML:label});
		field.appendChild(label);
		$(field).click(function(event) { 
                    
                    thisClass.applyFilters(site.instance.config.showHiddenAgents,site.instance.config.showFilteredAgents); 
                });
		filterArray.push(filterField);
		return field;
	},
                
	getFilterGroup:function(fieldId,label,filterArray,selected) {
		var thisClass = this;
		var field = base.dom.createElement('div',{className:'utilityField'});
		var fieldBtn = base.dom.createElement('input',{className:'stepper'},{'type':'button','value':label});
                
		var filterCheck = base.dom.createElement('div',{className:'utilityCheck3 middle all',id:fieldId+"_all"},{'selected':'all','filter':fieldId});
		var filterField = base.dom.createElement('input',{className:'utilityButton',id:fieldId},{'type':'button','value':label});//'type':'checkbox'});
		field.appendChild(filterCheck);
                field.appendChild(filterField);
                
		var label = base.dom.createElement('div',{className:'utilityCheckLabel',id:"div_"+fieldId},{innerHTML:fieldId});
		field.appendChild(label);
                $("#div_"+fieldId).hide();
		if (selected) { 
                    $("#div_"+fieldId).show();
		};
                
                $(filterCheck).click(function(event) {
                    var v = event.target.id;
                    var val = event.target.attributes.selected.value;
                    var group = {};
                    
                    if (val == 'all'){
                        event.target.attributes.selected.value = 'none';
                        event.target.className = 'utilityCheck3 middle';
                    } else {
                        event.target.attributes.selected.value = 'all';
                        event.target.className = 'utilityCheck3 middle all';
                    } 
                    group.filter  = event.target.attributes.filter.value;
                    group.selected = event.target.attributes.selected.value;
                    thisClass.applyFilters(site.instance.config.showHiddenAgents,site.instance.config.showFilteredAgents, group);
                });
                
		$(filterField).click(function(event) {
                    for (var i=0; i<filterArray.length;++i) {
                        var f  = filterArray[i];
                        $("#div_"+f).hide();
                    }                  
                    $("#div_"+event.target.id).show();
                });
                 //   thisClass.applyFilters(site.instance.config.showHiddenAgents,site.instance.config.showFilteredAgents); });
		filterArray.push(fieldId);
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
        updateFilters:function(caFilters){
        	// var caFilters = this.dashboard.getCAFilters();
                this.caFilters = caFilters;
                site.instance.config.filters.enrich={};
                for (var enrichFilter in caFilters){
                    if (!/^- /.test(enrichFilter)) {
                        var filter = enrichFilter.replace(/ /g,"_");
                        site.instance.config.filters.enrich[filter] = {};caFilters[enrichFilter];
                        var message = site.messages.translate(enrichFilter);
                        if (site.messages.msg.hasOwnProperty("_" + enrichFilter)){
                            message = site.messages.translate("_" + enrichFilter);
                        }
                        this.container.appendChild(this.getFilterGroup(filter,message,this.filterGroup));
                        for (var content in caFilters[enrichFilter]){
                            var contentLabel=content.replace(/ /g,"_");
                            site.instance.config.filters.enrich[filter][contentLabel] = caFilters[enrichFilter][content];
                            var contentId = filter+"_:_"+contentLabel;
                             $('#div_'+filter).append(this.getFilterField(contentId,content,site.instance.config.filters.enrich[filter][contentLabel],this.enrichFilters));
                        }
                        $('#div_'+filter).hide();
                    }
                }
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
        utilityView:null,
	defaultItemProperties:{w:130,h:130},
	minSize:100,
	maxSize:450,
        caGroups:{},

	initialize:function(parent,utility) {
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
                
	setUtilityView:function (utilityView){
            this.utilityView = utilityView;
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
			thisClass.loadFilteredAgentsFromCookie();
			thisClass.setItemSize(site.instance.config.agentItemSize);
			new base.Timer(function(timer) {
				thisClass.applyFilters();
				onSuccess();
			},700);
		});
	},
        
        reload:function(url,onSuccess) {
		var thisClass = this;
		jQuery.ajax({url:url}).always(function(data) {
			if (typeof(data)=="string") {
				data = JSON.parse(data);
			}
			thisClass.agentData = data;
                        thisClass.reloadDashboard();
                });
            },
 	
	parseDateTime:function(dateTime) {
		var result = {};
		if (/(\d\d\d\d)-(\d\d)-(\d\d)T(\d\d):(\d\d):(\d\d)Z/i.test(dateTime)) {
			result.year = RegExp.$1;
			result.month = RegExp.$2;
			result.day = RegExp.$3;
			result.hour = RegExp.$4;
			result.minute = RegExp.$5;
			result.second = RegExp.$6;
		}
		return result;
	},
	
	getTimeFormat:function(rawTimer) {		
		return new Date(rawTimer).toLocaleString();
	},

	getLastUpdate:function() {
		var date = this.agentData.datetime;
		return this.getTimeFormat(date);
	},

	buildDashboard:function() {
		this.agentElem = [];
		this.dashboardContainer.innerHTML = "";
		var recordingAgents = 0;
		var lastUpdate = this.getLastUpdate();
                for (var i in this.agentData.agents){
                    var agent = this.agentData.agents[i];
                    if (/^-lang-/i.test(agent.agentname)){
                        // language agent ... defines language settings
                        var lang = agent.agentname.replace(/^-lang-/,"");
                        if (lang == site.messages.lang){
                            for (var name in agent.enrich) {
                                var val = agent.enrich[name]; 
                                var n = name;
                                if (/^- /.test(name)){
                                    n = name.replace(/^- /,"");
                                }
                                site.messages.add("_"+n,val);
                            }
                        }
                    }
                }
		for (var i in this.agentData.agents) {
                    var agent = this.agentData.agents[i];
                    if (!/^-lang-/i.test(agent.agentname)) {
			var agent = this.agentData.agents[i];
			if (typeof(agent)=="object") {
				var item = this.createItem(agent, 0);
                                item.agentStatus.donwCount=0;
//                                this.donwCount[agent.agentname.replace(".","_")] = 0;
				if (this.getMHStatus(agent)=='capturing') {
					++recordingAgents;
				}
				this.dashboardContainer.appendChild(item);
				base.dom.prepareToScaleTexts(item);
				this.agentElem.push(item);
			}
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
                this.utilityView.updateFilters(this.caGroups);
	},
	
        reloadDashboard:function(){
                var recordingAgents = 0;
                var lastUpdate = this.getLastUpdate();
		for (var i in this.agentData.agents) {
                    var agent = this.agentData.agents[i];
                    if (typeof(agent)=="object") {
                        var item = this.createItem(agent);
                        var url = agent.agenturl;
                        var ord=Math.random()*10000000000000000;
                        var imageUrl = "screenshots/" + agent.image.replace(".jpg","-25.jpg") + "?n=" + ord;
                                //var imageUrl = url + "/snapshots/gc-snapshot25.jpg?n="+ord; 
                        var agentId = agent.agentname.replace(".","_");

                        if (this.getMHStatus(agent)=='capturing') {
                            ++recordingAgents;
                        }
                        if (item.agentStatus.hostStatus=='online') {
                            $("#screen_"+agentId).attr("src", imageUrl);
                            $("#screen_"+agentId).attr('alt',agent.agentname);
                            $("#online_status_"+agentId).removeClass('offlineIcon');
                            $("#online_status_"+agentId).addClass('onlineIcon');
                        } else if (item.agentStatus.hostStatus=='vncerror') {
                            $("#screen_"+agentId).attr("src", 'resources/vnc_error_screen.png');
                            $("#screen_"+agentId).attr('alt','vnc error');
                            $("#online_status_"+agentId).removeClass('onlineIcon');
                            $("#online_status_"+agentId).addClass('offlineIcon');
                        } else {
                            $("#screen_"+agentId).attr("src", 'resources/offline_agent.png');
                            $("#screen_"+agentId).attr('alt','offline agent');
                            $("#online_status_"+agentId).removeClass('onlineIcon');
                            $("#online_status_"+agentId).addClass('offlineIcon');
                        }
                        var statusMessage = this.getStatusMessage(item.agentStatus);
                        var downCount = this.getDownCount(agentId);
                        $("#statusText_"+agentId).attr('class','dashboardItem statusText ' + statusMessage.className);
                        $("#statusText_"+agentId).text(statusMessage.message);// + " " + downCount);
//                        $("#statusText_"+agentId).innerHTML = statusMessage.message;
       
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
	loadFilteredAgentsFromCookie:function() {
		if (!site.instance.config.filteredAgents || typeof(site.instance.config.filteredAgents)!="object") {
			site.instance.config.filteredAgents = {};
		}
		for (var i=0; i<this.agentElem.length;++i) {
			var agent = this.agentElem[i];
			configAgentFiltered = site.instance.config.filteredAgents[agent.agentData.agentname];
			var button = $(agent).find('.dashboardItem.hideButton')[0];
			if (configAgentHidden) {
				button.className = "dashboardItem hideButton hide";
				agent.isAgentFiltered = true;
			}
			else {
				button.className = "dashboardItem hideButton show";
				agent.isAgentFiltered = false;
			}	
		}
	},
	
	// online, offline, vncerror
	getHostStatus:function(agentData) {
		var status = 'offline';
		if (/true/i.test(agentData.online)) {
			status = 'online';
		//		status = 'vncerror';
		}
                var downCount = this.getDownCount(agentData.agentname.replace(".","_"));
                if (downCount < 100) {
			status = 'online';
		//		status = 'vncerror';
		}
	/*	if (/true/i.test(agentData.VNC)) {
			status = 'online';
		}
	*/	return status;
	},

	// idle, offline, capturing, unregistered, unknown
	getMHStatus:function(agentData) {
		var status = 'unregistered';
		if (agentData.mhinfo && agentData.mhinfo.state) {
			status = agentData.mhinfo.state;
		}
		return status;
	},
                
        initDownCount:function(agentId){
            site.instance.config.downAgents[agentId]=0;
        },
                
        incrementDownCount:function(agentId){
            if (!site.instance.config.downAgents || typeof(site.instance.config.downAgents)!="object") {
                    site.instance.config.downAgents = {};
            };
            if (!site.instance.config.downAgents[agentId]){
                site.instance.config.downAgents[agentId] = 0;
            };
            
            site.instance.config.downAgents[agentId]++;
        },
                
        getDownCount:function(agentId){
             if (!site.instance.config.downAgents || typeof(site.instance.config.downAgents)!="object") {
                    site.instance.config.downAgents = {};
            };
            if (!site.instance.config.downAgents[agentId]){
                site.instance.config.downAgents[agentId] = 0;
            };
            return site.instance.config.downAgents[agentId];
        },  
                
        getRecordingStatus:function(startDate,endDate) {
		var today = new Date();
		var dsec = (today - startDate) / 1000;
		
                var diff = dsec / 60;
		var endDsec = (today - endDate) / 1000;
		var endDiff = endDsec / 60;
		var status = 'idle';
		
		if (today.getDate()==startDate.getDate() && today.getMonth()==startDate.getMonth() && today.getFullYear()==startDate.getFullYear()) {
			status = 'today';
		}

		if (diff<0) { // Incomming recording
			if (Math.abs(diff)<site.instance.initConfig.recordingAlertTresshold) {
				status = 'impending';
			}
		}
		if (diff>0 && endDiff<0) {
			status = 'capturing';
		}
                if (dsec>-15 && dsec <15) {
                    status = 'startCapturing';
                }
                if (endDsec>-15 && endDsec <15) {
                    status = 'endCapturing';
                }
                if (endDsec>15) {
			status = 'idle';
		}
		return status;
	},

	getNextScheduledRecording:function(calendar) {
		var today = new Date();
		var recording = null;
		var minDiff = 999999;
			
		for (var i=0;i<calendar.length;++i) {
			var start = new Date(calendar[i].start);
			var end = new Date(calendar[i].end);
			var endDiff = ((today - end) / 1000) / 60;
			var diff = ((today - start) / 1000) / 60;
			if (diff<0 && Math.abs(diff)<minDiff) {
				recording = calendar[i];
				minDiff = Math.abs(diff);
			}
			if (diff>0 && endDiff<0) {	// Is recording now!
				recording = calendar[i];
				break;
			}
		}
		return recording;
	},

	// unknown, idle, impending, capturing, today
	getCalendarStatus:function(agentData) {
		var status = 'unknown';
		if (agentData.calendar) {
			var nextRecording = this.getNextScheduledRecording(agentData.calendar);
			status = 'idle';
			if (nextRecording) {
				var start = new Date(nextRecording.start);
				var end = new Date(nextRecording.end);
				status = this.getRecordingStatus(start,end);
			}
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
	
	getStatusMessage:function(agentStatus, update ) {
    
		var host = agentStatus.hostStatus;
		var mh = agentStatus.mhStatus;
		var cal = agentStatus.calendarStatus;
                var agentId = agentStatus.agentId;
                
		var calRec = (cal=='startCapturing' || cal=='capturing' || cal=='endCapturing' || cal=='impending' || cal=='today' || cal=='idle');
		var hostDown = (host=='offline');
		var mhRecording = (mh=='capturing');
		var mhDown = (mh!='idle' && mh!='capturing');
                var statusMessage = {};
                
		var message = '';
		var className = '';	// ok, warning, error

                if (update==""){
                    update = false;
                }
		if (calRec) {
			if (hostDown) {
				message = 'offline';
				className = 'error';
			}
			else if (mhDown) {
				message = 'Matterhorn error';
				className = 'error';
			}
			else if (!mhRecording && cal=='capturing') {
				message = 'recording error';
				className = 'error';
			}
			else if (mhRecording && cal=='capturing') {
				message = 'capturing';
				className = 'recording';
			}
			else if (cal=='startCapturing') {
				message = 'start capturing';
				className = 'recording';
			}
			else if (cal=='endCapturing') {
  				message = 'end capturing';
				className = 'recording';
                        }
			else if (cal=='impending') {
				message = 'impending';
				className = 'recording';
			}
			else if (cal=='today') {
				message = 'recording today';
                                className = 'ok';
			}
			else if (cal=='idle'){
                        	message = '';
                                className = '';
                        }
                        else {
				message = 'unknown';
				className = 'error';
			}
		}
		else if (mhDown) {
			message = 'Matterhorn error';
			className = 'warning';
		}
		else if (hostDown) {
                        this.incrementDownCount(agentId);
			message = 'offline';
			className = 'warning';
		}
		else if (!mhDown && !hostDown) {
			message = '';
			className = 'ok';
		}
                if (className == 'error') {
                    this.incrementDownCount(agentId);
                } else if (className != 'warning') {
                    this.initDownCount(agentId);
                }
                    
                statusMessage.message = site.messages.translate(message);
                statusMessage.className = className;
                return statusMessage;
        /*        if (update){
                    $("#statusText_"+agentId).attr('class','dashboardItem statusText ' + className);
                    var msg = site.messages.translate(message);
                    $("#statusText_"+agentId).attr('innerHTML',site.messages.translate(message));
                    return base.dom.createElement('div',{className:'dashboardItem statusText ' + className,id:'statusText_'+agentId,innerHTML:site.messages.translate(message)});
               }
                else {
                    var msg = site.messages.translate(message);
                    return base.dom.createElement('div',{className:'dashboardItem statusText ' + className,id:'statusText_'+agentId,innerHTML:site.messages.translate(message)});
		}
		return null;*/
	},
        getCAFilters:function(){
            return this.caGroups;
        },
                
	createItem:function(agentData) {
		var item = base.dom.createElement('div',{className:'dashboardItemContainer',id:agentData.agentname});
		var url = agentData.agenturl;
		if (!(/http:\/\/(.+)/.test(url))) {
			url = "http://" + url;
		}
		var ord=Math.random()*10000000000000000;
		var imageUrl = "screenshots/" + agentData.image.replace(".jpg","-25.jpg") + "?n=" + ord;
		//var imageUrl = url + "/snapshots/gc-snapshot25.jpg?n="+ord;
		item.agentData = agentData;
                var agentId = agentData.agentname.replace(".","_");
                item.agentStatus = {};
                item.agentStatus.hostStatus = this.getHostStatus(agentData);
               // item.agentStatus.downCount = this.getDownCount(agentId);
                item.agentStatus.mhStatus = this.getMHStatus(agentData);
		item.agentStatus.calendarStatus = this.getCalendarStatus(agentData);
                item.agentStatus.agentId = agentId;

                if (item.agentStatus.hostStatus=='online') {
			item.appendChild(base.dom.createElement('img',{className:'dashboardItem image'},{'src':imageUrl,'alt':agentData.agentname,'id':"screen_"+agentId}));
			item.appendChild(base.dom.createElement('img',{className:'dashboardItem screenGlass'},{'src':'resources/monitor_glass.png','alt':'screen glass'}));
			item.appendChild(base.dom.createElement('div',{className:'dashboardItem onlineIcon'},{'id':"online_status_"+agentId}));
		}
		else if (item.agentStatus.hostStatus=='vncerror') {
			item.appendChild(base.dom.createElement('img',{className:'dashboardItem offlineImage'},{'src':'resources/vnc_error_screen.png','alt':'vnc error','id':"screen_"+agentId}));
			item.appendChild(base.dom.createElement('img',{className:'dashboardItem screenGlass'},{'src':'resources/monitor_glass.png','alt':'screen glass'}));
			item.appendChild(base.dom.createElement('div',{className:'dashboardItem offlineIcon'},{'id':"online_status_"+agentId}));
		}
		else {
			item.appendChild(base.dom.createElement('img',{className:'dashboardItem offlineImage'},{'src':'resources/offline_agent.png','alt':'offline agent','id':"screen_"+agentId}));
			item.appendChild(base.dom.createElement('img',{className:'dashboardItem screenGlass'},{'src':'resources/monitor_glass.png','alt':'screen glass'}));
			item.appendChild(base.dom.createElement('div',{className:'dashboardItem offlineIcon'},{'id':"online_status_"+agentId}));
		}
		
		var statusMessage = this.getStatusMessage(item.agentStatus);
                item.appendChild(base.dom.createElement('div',{className:'dashboardItem statusText ' + statusMessage.className,id:'statusText_'+agentId,innerHTML:statusMessage.message}));

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

	//	item.appendChild(base.dom.createElement('div',{className:'dashboardItem statusIcon ' + iconStatus}));
		var agentname = agentData.agentname;
                if (agentData.enrich.hasOwnProperty('name')) {
                    agentname = agentData.enrich.name; 
//                    infoContainer.appendChild(base.dom.createElement('div',{className:'dashboardDetail info name',innerHTML:'<span class="dashboardDetail info label">' + site.messages.translate('name') + '</span>: ' + agentname}));
                } else if (agentData.enrich.hasOwnProperty('- name')) {
                    agentname = agentData.enrich['- name'];
                }
                
                for (var name in agentData.enrich) {
                    if (!this.caGroups.hasOwnProperty(name)){
                        this.caGroups[name] = {};
                    }
                    var s = this.caGroups[name];
                    s[agentData.enrich[name]] = true;
                };

                item.appendChild(base.dom.createElement('div',{className:'dashboardItem info name',innerHTML:agentname}));
/*		if (agentData.enrich) {
			item.appendChild(base.dom.createElement('div',{className:'dashboardItem info campus',innerHTML:agentData.enrich.campus}));
			item.appendChild(base.dom.createElement('div',{className:'dashboardItem info building',innerHTML:agentData.enrich.building}));
			item.appendChild(base.dom.createElement('div',{className:'dashboardItem info center',innerHTML:agentData.enrich.center}));
			item.appendChild(base.dom.createElement('div',{className:'dashboardItem info classroom',innerHTML:agentData.enrich.classroom}));
		}	*/	
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

        reloadInfoItem:function(agentData){
 		var hostStatus = this.getHostStatus(agentData);
		var ord=Math.random()*10000000000000000;
		var imageUrl = "screenshots/" + agentData.image.replace(".jpg","-50.jpg") + "?n=" + ord;
		//var imageUrl = url + "/snapshots/gc-snapshot25.jpg?n="+ord;
                var agentId = agentData.agentname.replace(".","_");
                if (hostStatus=='online') {
                    $("#infoscreen_"+agentId).attr("src", imageUrl);
                    $("#infoscreen_"+agentId).attr('alt',agentData.agentname);
                } else if (hostStatus=='vncerror') {
                    $("#infoscreen_"+agentId).attr("src", 'resources/vnc_error_screen.png');
                    $("#infoscreen_"+agentId).attr('alt','vnc error');
                } else {
                    $("#infoscreen_"+agentId).attr("src", 'resources/offline_agent.png');
                    $("#infoscreen_"+agentId).attr('alt','offline agent');
                }
        },

	createInfoItem:function(agentData) {
		var thisClass = this;
                var item = base.dom.createElement('div',{className:'dashboardDetailContainer',id:agentData.agentname});
		var url = agentData.agenturl;
		if (!(/http:\/\/(.+)/.test(url))) {
			url = "http://" + url;
		}
		var imageUrl = "screenshots/" + agentData.image.replace(".jpg","-50.jpg"); //+ "?n=" + ord;
                
                var reloadTime = 1000;
		var reloadInfoTimer = new base.Timer(function(timer) {
			thisClass.reloadInfoItem(agentData,function() {});
		},reloadTime);
                reloadInfoTimer.repeat = true;
                
                var agentId = agentData.agentname.replace(".","_");
               
		var hostStatus = this.getHostStatus(agentData);
		if (hostStatus=='online') {
			item.appendChild(base.dom.createElement('img',{className:'dashboardDetail image'},{'src':imageUrl,'alt':agentData.agentname,'id':'infoscreen_'+agentId}));
		}
		else if (hostStatus=='vncerror') {
			item.appendChild(base.dom.createElement('img',{className:'dashboardDetail offlineImage'},{'src':'resources/vnc_error_screen.png','alt':'vnc error','id':'infoscreen_'+agentId}));
		}
		else {
			item.appendChild(base.dom.createElement('img',{className:'dashboardDetail offlineImage'},{'src':'resources/offline_agent.png','alt':'offline agent','id':'infoscreen_'+agentId}));
		}
		var infoContainer = base.dom.createElement('div',{className:'dashboardDetailInfoContainer'});
                var agentname = agentData.agentname;
                if (agentData.enrich.hasOwnProperty('name')) {
                    agentname = agentData.enrich.name; 
                    infoContainer.appendChild(base.dom.createElement('div',{className:'dashboardDetail info name',innerHTML:'<span class="dashboardDetail info label">' + site.messages.translate('name') + '</span>: ' + agentname}));
                } 
                infoContainer.appendChild(base.dom.createElement('div',{className:'dashboardDetail info',innerHTML:'<span class="dashboardDetail info label">' + site.messages.translate('id') + '</span>: ' + agentData.agentname}));
                // infoContainer.appendChild(base.dom.createElement('div',{className:'dashboardDetail info name',innerHTML:'<span class="dashboardDetail info label">' + site.messages.translate('name') + '</span>: ' + agentname}));
		infoContainer.appendChild(base.dom.createElement('div',{className:'dashboardDetail info name',innerHTML:'<span class="dashboardDetail info label">' + site.messages.translate('address') + '</span>: ' + agentData.agenturl}));
		if (agentData.enrich) {
                        for (var name in agentData.enrich) {
                            var n = name.replace(/^- /,"");;
                                var message = site.messages.translate(n)
                                if (site.messages.msg.hasOwnProperty("_" + n)){
                                    message = site.messages.translate("_" + n);
                                }
                                infoContainer.appendChild(base.dom.createElement('div',{className:'dashboardDetail info',innerHTML:'<span class="dashboardDetail info label">' + message + '</span>: ' + agentData.enrich[name]}));
                        }
			
			hostStatus = this.getHostStatus(agentData);
			mhStatus = this.getMHStatus(agentData);
			calStatus = this.getCalendarStatus(agentData);
			infoContainer.appendChild(base.dom.createElement('div',{className:'dashboardDetail info hostStatus',innerHTML:'<span class="dashboardDetail info label">' + site.messages.translate('hostStatus') + '</span>:' + hostStatus}));	
			infoContainer.appendChild(base.dom.createElement('div',{className:'dashboardDetail info mhStatus',innerHTML:'<span class="dashboardDetail info label">' + site.messages.translate('mhStatus') + '</span>:' + mhStatus}));	
			infoContainer.appendChild(base.dom.createElement('div',{className:'dashboardDetail info calStatus',innerHTML:'<span class="dashboardDetail info label">' + site.messages.translate('calStatus') + '</span>:' +calStatus}));	
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
		var filteredItems = 0;
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
				},
				cal:{
					capturing:true,
					impending:true,
					today:true,
					idle:true
				}
			};
		}
		var showHidden = site.instance.config.showHiddenAgents;
                var showFiltered = site.instance.config.showFilteredAgents;

		for (var i=0;i<this.agentElem.length;++i) {
			var agent = this.agentElem[i];
			if (agent && agent.agentData) {
				var hostStatus = agent.agentStatus.hostStatus;
				var mhStatus = agent.agentStatus.mhStatus;
				var calStatus = agent.agentStatus.calendarStatus;
				var visible = false;
                                var filtered = true;
                                var enrich = agent.agentData.enrich;
                                var filterEnrich = true;
                                
                                if (!agent.isAgentHidden){
                                    visible = true;
                                }

                                for (var g in enrich){
                                    if (!/^- /.test(g)) {
                                        var group = g.replace(/ /g,"_");
                                        var item = enrich[g].replace(/ /g,"_");
                                        if (!filters.enrich[group][item]){
                                            filterEnrich = false;
                                            break;
                                        }
                                    }
                                }
                                
				if (filters.host[hostStatus] && filters.mh[mhStatus] && filters.cal[calStatus] && filterEnrich) {
                                    filtered = false;
				}

				if (visible && !filtered) {
					this.showAgent(agent,animate);
				} else  if ((!visible && showHidden) || (filtered && showFiltered)) {
                                        this.showAgent(agent,animate,0.5);
				} else if (!visible) {
					this.hideAgent(agent,animate);
					++hiddenItems;
				} else if (filtered) {
					this.filterAgent(agent,animate);
					++filteredItems;
				}
			}
		}
		var message = "";
		if (hiddenItems==1) {
                        message = site.messages.translate('thereIs') + ' ' + hiddenItems + ' ' + site.messages.translate('hiddenItem') + '<br\>';
		} else if (hiddenItems > 1) {
			message =  site.messages.translate('thereAre') + ' ' + hiddenItems + ' ' + site.messages.translate('hiddenItems') + '<br\>';
                }
                if (filteredItems == 1 ) {
                        message += site.messages.translate('thereIs') + ' ' + filteredItems + ' ' + site.messages.translate('filteredItem');
		} else if (filteredItems > 1) {
			message +=  site.messages.translate('thereAre') + ' ' + filteredItems + ' ' + site.messages.translate('filteredItems');
                }
                this.messageContainer.innerHTML = message;
                if (message !="") {
                        $(this.messageContainer).show();
                } else {
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
	filterAgent:function(agentElem,animate) {
		if (animate) {
			$(agentElem).animate({opacity:0},{complete:function() {
				$(this).hide();
			}});
		}
		else {
			$(agentElem).hide();
		}
		if (!site.instance.config.filteredAgents || typeof(site.instance.config.filteredAgents)!="object") {
			site.instance.config.filteredAgents = {};
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
		if (!site.instance.config.filteredAgents || typeof(site.instance.config.filteredAgents)!="object") {
			site.instance.config.filteredAgents = {};
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
	reloadAllTimer:null,
	initConfig:{
            reloadMinutes:20,
            reloadAllMinutes:60,
            agentDataUrl:'agents.json',
            imagesDir:'screenshots',
            thumbsDir:'screenshots',
            zoomIncrement:50,
            recordingAlertTresshold:120
	},

	initialize:function(container,initConfig) {
		if (initConfig) {
			if (initConfig.reloadMinutes) this.initConfig.reloadMinutes = initConfig.reloadMinutes;
			if (initConfig.agentDataUrl) this.initConfig.agentDataUrl = initConfig.agentDataUrl;
			if (initConfig.imagesDir) this.initConfig.imagesDir = initConfig.imagesDir;
			if (initConfig.thumbsDir) this.initConfig.thumbsDir = initConfig.thumbsDir;
			if (initConfig.zoomIncrement) this.initConfig.zoomIncrement = initConfig.zoomIncrement;
			if (initConfig.recordingAlertTresshold) this.initConfig.recordingAlertTresshold = initConfig.recordingAlertTresshold;
			if (initConfig.reloadAllMinutes) this.initConfig.reloadAllMinutes = initConfig.reloadAllMinutes;
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
                
		var reloadTime = this.initConfig.reloadMinutes * 1000;
		this.reloadTimer = new base.Timer(function(timer) {
			thisClass.dashboard.reload(thisClass.initConfig.agentDataUrl,function() {});
		},reloadTime);
		this.reloadTimer.repeat = true;
	/*	if (this.initConfig.reloadAllMinutes>0) {
			var reloadAllTime = this.initConfig.reloadAllMinutes  * 1000;
			this.reloadAllTimer = new base.Timer(function(timer) {
				window.location = window.location;
			},reloadAllTime);
		}	*/	
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
			filteredAgents:{},
                        downAgents:{},
			showHiddenAgents:false,
			showFilteredAgents:false,
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
				},
				cal: {
					capturing:true,
					impending:true,
					today:true,
					idle:true
				}
			}
		};
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
		
		if (!this.config || !this.config.filters || !this.config.filters.host || !this.config.filters.cal) {
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
				this.innerHTML = '<';
				thisClass.utils.show(true);
			}
			else if (this.className==showUtilsButtonClass + " expanded") {
				this.className = showUtilsButtonClass + " collapsed";
				this.innerHTML = '>';
				thisClass.utils.hide(true);
			}
		});
		this.dashboard.mainContainer.appendChild(showButton);
		this.loader = base.dom.createElement('div',{className:'loaderContainer'});
		this.mainContainer.appendChild(this.loader);
	}
});
