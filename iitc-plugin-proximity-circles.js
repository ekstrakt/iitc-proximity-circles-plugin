// ==UserScript==
// @id             proximity-circles-plugin
// @name           IITC Plugin: Proximity circles
// @category       Misc
// @version        0.0.1
// @namespace      https://github.com/ekstrakt/iitc-proximity-circles-plugin
// @updateURL      https://raw.githubusercontent.com/ekstrakt/iitc-proximity-circles-plugin/main/iitc-plugin-proximity-circles.js
// @downloadURL    https://raw.githubusercontent.com/ekstrakt/iitc-proximity-circles-plugin/main/iitc-plugin-proximity-circles.js
// @description    Proximity circles 20m
// @match          https://intel.ingress.com/*
// @grant          none
// ==/UserScript==

function wrapper(plugin_info) {
    // ensure plugin framework is there, even if iitc is not yet loaded
    if (typeof window.plugin !== 'function') {
        window.plugin = function() {};
    }

    // PLUGIN START ////////////////////////////////////////////////////////
	
	if (window.plugin.proximityCircles) {
        alert("BANNERGRESS PLUGIN ALREADY INSTALLED - DO YOU HAVE 2 COPIES OF IT ??");
        return;
    }
    const PLUGIN = window.plugin.proximityCircles = function () { };
	
	PLUGIN.visible = false;
	PLUGIN.nearbyCircles = {};
	PLUGIN.nearbyLayerGroup = null;
	
	PLUGIN.setup = function () {
		this.nearbyLayerGroup = L.featureGroup();
		map.addLayer(this.nearbyLayerGroup);

		let btn = L.Control.extend({
            options: {
                position: 'topleft'
            },
            onAdd(map) {
				let el = $('<div class="leaflet-bar"><a class="leaflet-bar-part btn-toggle-proximity_circles" title="Toggle proximity circles">&#9711;</a><div>');
				$('.btn-toggle-proximity_circles', el).click(e => {
					window.plugin.proximityCircles.toggle();
				});
				return el[0];
            }
    
        });
		map.addControl(new btn());
		
		//$('#toolbox').append(' <a onclick="window.plugin.proximityCircles.toggle()" title="Draw 20m circles around portals">Toggle proximity circles</a>');
		
		addHook('mapDataRefreshEnd', this.draw);
	}.bind(PLUGIN);
	
	PLUGIN.addNearbyCircle = function(guid) {
		const portal = window.portals[guid];
		if (!portal){
			return;
		}

		const circleSettings = {
			color: '#FF0000',
			opacity: 0.3,
			fillColor: '#FF0000',
			fillOpacity: 0.3,
			weight: 1,
			clickable: false,
			interactive: false
		};

		const center = portal._latlng;
		const circle = L.circle(center, 20, circleSettings);
		this.nearbyLayerGroup.addLayer(circle);
		this.nearbyCircles[guid] = circle;
	}.bind(PLUGIN);

	PLUGIN.removeNearbyCircle = function(guid) {
		const circle = this.nearbyCircles[guid];
		if (circle != null) {
			this.nearbyLayerGroup.removeLayer(circle);
			delete this.nearbyCircles[guid];
		}
	}.bind(PLUGIN);

	PLUGIN.draw = function() {
		const keys = Object.keys(window.portals);
		keys.forEach(guid => {
			this.removeNearbyCircle(guid);
			if(this.visible){
				this.addNearbyCircle(guid);
			}
		});
	}.bind(PLUGIN);
	
	PLUGIN.toggle = function() {
		this.visible = !this.visible;
		this.draw();
	}.bind(PLUGIN);
	
	let setup = function () {
        setTimeout(() => PLUGIN.setup(), 100);
    }
	
    // PLUGIN END //////////////////////////////////////////////////////////

    setup.info = plugin_info; //add the script info data to the function as a property

    if (!window.bootPlugins) {
        window.bootPlugins = [];
    }
    window.bootPlugins.push(setup);

    // if IITC has already booted, immediately run the 'setup' function
    if (window.iitcLoaded) {
        setup();
    }

} // wrapper end
// inject code into site context
var script = document.createElement('script');
var info = {};
if (typeof GM_info !== 'undefined' && GM_info && GM_info.script) {
info.script = {
    version: GM_info.script.version,
    name: GM_info.script.name,
    description: GM_info.script.description
};
}
script.appendChild(document.createTextNode('(' + wrapper + ')(' + JSON.stringify(info) + ');'));
(document.body || document.head || document.documentElement).appendChild(script);