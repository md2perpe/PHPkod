// Namnrymd f粠PHPkod
var phpkod = {

	init : function () {

		var menu = document.getElementById('contentAreaContextMenu');
		menu.addEventListener('popupshowing', phpkod.showHide, false);

	},


	showHide : function () {
	
		var constrain;
		var sites;
		
		try {                
			var prefs = Components.classes["@mozilla.org/preferences-service;1"].
					getService(Components.interfaces.nsIPrefBranch);
					
			constrain = prefs.getBoolPref("phpkod.constrain.phpportalen");
			if(!constrain)
				sites = prefs.getCharPref("phpkod.constrain.sites");
		}
		catch(e) {
			constrain = true;
		}

		if(constrain)
			sites = "phpportalen\\.net";
		
		var currentHost = document.getElementById('content').currentURI.spec; //host;
		document.getElementById('phpkod-popup').hidden = 
				document.getElementById('context-undo').hidden
				|| !currentHost.match(new RegExp(sites));

	},

	home : function () {
		var c = document.getElementById('content');
		c.loadURI('http://www.phpportalen.net', c.currentURI, '');
	},
	
	insert : function (what, extra) {

		function createWidget(widget_name, iface_name) {
			var widget = Components.classes["@mozilla.org/widget/" + widget_name];
			var iface = Components.interfaces[iface_name];
			return widget.createInstance(iface);
		}
		
		try {
			var trans = createWidget("transferable;1", "nsITransferable");
			trans.addDataFlavor("text/unicode");

			var clip = createWidget("clipboard;1", "nsIClipboard");
			clip.getData(trans, clip.kGlobalClipboard);
		
			var clipData = new Object;
			var clipLength = new Object;
			trans.getTransferData("text/unicode", clipData, clipLength);

			clipData.value.QueryInterface(Components.interfaces.nsISupportsString); 
			var strClipboard = clipData.value.data;
		}
		catch(exc) {
			var strClipboard = "";
		}
		
		
	    var theBox = document.commandDispatcher.focusedElement;
		var startPos = theBox.selectionStart;
		var endPos = theBox.selectionEnd;
		strSelection = theBox.value.substring(startPos, endPos);

		strUsed = strSelection.length > 0 ? strSelection : strClipboard;

		
		var subst;
		switch(what) {
		
		case 'bold':
		case 'italic':
		case 'underline':
			what = what.charAt(0);
			// fall through

		case 'php':
		case 'code':
		case 'inline':
		case 'man':
		case 'img':
		case 'quote':
			subst = '[' + what + ']' + strUsed + '[/' + what + ']';
			break;
			
		case 'welcome':
			subst = '[color=blue][size=18]Välkommen till PHPportalen, ' + strUsed + '![/size][/color] :)';
			break;
			
		case 'url':
			if(strSelection.length > 0) {
				if(strSelection.match(/^((ht|f)tps?:\/\/)|www\.|ftp\./i))
					subst = '[url]' + strSelection + '[/url]';
				else
					subst = '[url=' + strClipboard + ']' + strSelection + '[/url]';
			}
			else
				subst = '[url]' + strClipboard + '[/url]';
			break;
			
		case 'color':
			subst = '[color=' + extra + ']' + strUsed + '[/color]';
			break;
			
		case 'size':
			var sizes = {
				"tiny"		: 7,
				"small"		: 9,
				"normal"	: 12,
				"large"		: 18,
				"huge"		: 24,
			};
			var size = sizes[extra];
			if(size)
				subst = '[size=' + size + ']' + strUsed + '[/size]';
			else
				alert("Fel! Ok寤 storlek: " + extra);
			break;
			
		case 'list':
            subst = strUsed.replace(/^\*\s*/mg, "[*]");
            subst = "[list]" + subst + "[/list]";
			break;
			
		case 'smilie':
			var smilie_code = {
				"veryhappy"		:	":-D",
				"smile"			:	":)",
				"sad"			:	":(",
				"surprised"		:	":o",

				"shocked"		:	"8-O",
				"confused"		:	":?",
				"cool"			:	"8)",
				"laughing"		:	":-p",

				"mad"			:	":x",
				"razz"			:	":P",
				"embarassed"	:	":r",
				"verysad"		:	":((",
				
				"verymad"		:	"§-)",
				"twistedevil"	:	"§=)",
				"rollingeyes"	:	":roll:",
				"wink"			:	":wink:",
				
				"exclamation"	:	":!:",
				"question"		:	":?:",
				"idea"			:	":idea:",
				"arrow"			:	":arrow:",
				
				"neutral"		:	":|",
				"mrgreen"		:	":mrgreen:",
				"semula"		:	":semla:",
			};
			var code = smilie_code[extra];
			if(code) {
				subst = " " + code + " ";
			}
			else
				alert("Fel! Ok寤 smilie: " + extra);
			break;
						
		default:
			alert('Fel! Ok寴 kommando: ' + what);
		}

		var command = "cmd_insertText";
		var controller = document.commandDispatcher.getControllerForCommand(command);

		if (controller && controller.isCommandEnabled(command)) {
			controller = controller.QueryInterface(Components.interfaces.nsICommandController);
			var params = Components.classes["@mozilla.org/embedcomp/command-params;1"];
			params = params.createInstance(Components.interfaces.nsICommandParams);
			params.setStringValue("state_data", subst);
			controller.doCommandWithParams(command, params);
		}

	}

};

window.addEventListener('load', phpkod.init, false);
