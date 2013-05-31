if(!window.hlt){
	window.hlt = {};
}

(function(hlt, $){
	
	/**
	 * @var OpenLayers.Map
	 */
	hlt.map = '1';
	
	/**
	 * @var OpenLayers.Layer.Vector
	 */
	hlt.map_vector = '1';
	
	hlt.obj_tree["map_pj_gg"] = new OpenLayers.Projection("EPSG:4326");
	hlt.obj_tree["map_pj_sm"] = new OpenLayers.Projection("EPSG:900913");	
	
	hlt.initer = {};
	
	hlt.initer.map = function(dom_id){
        var options = {
        	projection: hlt.obj_tree["map_pj_sm"],
        	//displayProjection: hlt.obj_tree["map_pj_gg"],   //http://sautter.com/map/?zoom=4&lat=50.82333&lon=4.59951&layers=0000B00TFFFFFFFF
        	numZoomLevels: 17,    //最大zoom + 1 (因为有一个Zoom 0 -_-||)
            controls: [
                       new OpenLayers.Control.Navigation(),
                       new OpenLayers.Control.PanZoomBar(),
                       new OpenLayers.Control.LayerSwitcher({'div':OpenLayers.Util.getElement('layerswitcher')}),
                       new OpenLayers.Control.Attribution(),
                       new OpenLayers.Control.ScaleLine()
                   ]
        };
        
        hlt.map = new OpenLayers.Map(dom_id, options);
        //hlt.map.addControl();
        
        hlt.map_vector = new OpenLayers.Layer.Vector("Vector Layer", {});
        hlt.map.addLayer(hlt.map_vector);
        
	};
	
	hlt.initer.layer_OSM = function(){
		var layer_name = "OpenStreetMap";
        var layer_option = {
            	attribution : '<a href="http://www.openstreetmap.org/" target="_blank">OpenStreetMap</a>',
            	isBaseLayer: false,
            	opacity: 0.4,
            	tileOptions: {
            		/**
            		 * http://dev.openlayers.org/docs/files/OpenLayers/Layer/OSM-js.html
            		 * http://lists.osgeo.org/pipermail/openlayers-users/2012-July/025754.html
            		 */
            		
            		crossOriginKeyword: null
            	}            	
            };
        
        hlt.map.addLayer(new OpenLayers.Layer.OSM( layer_name, '', layer_option));
	};
	
	hlt.initer.layer_YAHOO = function(){
		var layer_name = "Yahoo TW Satellite";
        var layer_option = {
        	attribution : '<a href="http://tw.maps.yahoo.com/" target="_blank">Yahoo!(tw)</a> & <a href="http://www.i3.com/" target="_blank">I-Cubed</a>',
        	isBaseLayer: true,
        	getURL: function(bounds){
            	var xyz = hlt.map.getLayersByName(layer_name)[0].getXYZ(bounds);
            	return hlt.yahoo_satellite_xyz_conv.getURL(xyz);
            },
        	tileOptions: {
        		/**
        		 * http://dev.openlayers.org/docs/files/OpenLayers/Layer/OSM-js.html
        		 * http://lists.osgeo.org/pipermail/openlayers-users/2012-July/025754.html
        		 */
        		
        		crossOriginKeyword: null
        	}            
        };
        
        hlt.map.addLayer(new OpenLayers.Layer.OSM(layer_name, "", layer_option));
        
	};
	
	hlt.initer.set_zoom = function(lat, lon, accuracy, zoom){
        lon = lon || 113;
        lat = lat || 22;
        accuracy = accuracy || 1;
        zoom = zoom || hlt.map.getZoom();
        
        //transform不能省略，否则会出事
        var lonlat = new OpenLayers.LonLat(lon, lat).transform(
            	hlt.obj_tree["map_pj_gg"],
                hlt.map.getProjectionObject()
            );
        hlt.map.setCenter(lonlat, zoom);
        
        var geo_point = new OpenLayers.Geometry.Point(lonlat.lon, lonlat.lat);
        
        hlt.map_vector.removeAllFeatures();
        hlt.map_vector.addFeatures([
                            new OpenLayers.Feature.Vector(
                            	geo_point,
                                {},
                                {
                                    graphicName: 'cross',
                                    strokeColor: '#f00',
                                    strokeWidth: 1,
                                    strokeOpacity: 1,
                                    fillOpacity: 0,
                                    pointRadius: 10
                                }
                            ),
                            new OpenLayers.Feature.Vector(
                                OpenLayers.Geometry.Polygon.createRegularPolygon(
                                	geo_point,
                                    accuracy,
                                    50,
                                    0
                                ),
                                {},
                                {
                                    fillOpacity: 0.1,
                                    fillColor: '#000',
                                    strokeColor: '#f00',
                                    strokeOpacity: 1
                                }
                            )
                        ]);
	};
	
	//http://openlayers.org/blog/2010/07/10/google-maps-v3-for-openlayers/
	hlt.initer.layer_GOOGLE = function(){
		hlt.map.addLayer(new OpenLayers.Layer.Google("Google Street", {visibility: false}));   //总会自动载入...屏蔽
		hlt.map.addLayer(new OpenLayers.Layer.Google("Google Satellite", {type: google.maps.MapTypeId.SATELLITE, visibility: false}));    //竟然不是卫星图？！
		hlt.map.addLayer(new OpenLayers.Layer.Google("Google Terrain", {type: google.maps.MapTypeId.TERRAIN, visibility: false}));
		hlt.map.addLayer(new OpenLayers.Layer.Google("Google Hybrid", {type: google.maps.MapTypeId.HYBRID, visibility: false}));
	};
	
	
	hlt.initer.layer_ESRI_ARCGIS_IMG = function(){
		var layer_name = "ArcGIS Satellite";
        var layer_option = {
            	attribution : '<a href="http://www.arcgis.com/home/webmap/viewer.html" target="_blank">esri ArcGIS</a>',
            	isBaseLayer: true,
            	tileOptions: {
            		/**
            		 * http://dev.openlayers.org/docs/files/OpenLayers/Layer/OSM-js.html
            		 * http://lists.osgeo.org/pipermail/openlayers-users/2012-July/025754.html
            		 */
            		
            		crossOriginKeyword: null
            	}
            	
            };
            
            var map_url = "http://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}";
            
            //var map_url = "server/mbtiles_reader.php?db=test_world&z=${z}&x=${x}&y=${y}";
            
            hlt.map.addLayer(new OpenLayers.Layer.OSM( layer_name, map_url, layer_option));
		
	};
	

	
	/**
	 * NOKIA HEREMAPS卫星地图
	 */
	hlt.initer.layer_NOKIA_HEREMAPS = function(){
		var layer_name = "Nokia HereMaps Satellite";
        var layer_option = {
            	attribution : '<a href="http://heremaps.com/" target="_blank">Nokia HereMaps</a>',
            	isBaseLayer: true,
            	tileOptions: {
            		/**
            		 * http://dev.openlayers.org/docs/files/OpenLayers/Layer/OSM-js.html
            		 * http://lists.osgeo.org/pipermail/openlayers-users/2012-July/025754.html
            		 */            		
            		crossOriginKeyword: null
            	}
            };
            
            //var map_url = "http://1.maps.nlp.nokia.com.cn/maptile/2.1/maptile/newest/satellite.day/${z}/${x}/${y}/256/jpg?token=BIl5zlMQF2fUaQLYWcxE&app_id=tGvvOZHNwj1-4guzYwIU";    //heremaps.cn version
        	var map_url = "http://1.maps.nlp.nokia.com/maptile/2.1/maptile/b6d442adca/satellite.day/${z}/${x}/${y}/256/png8?lg=ENG&app_id=SqE1xcSngCd3m4a1zEGb&token=r0sR1DzqDkS6sDnh902FWQ&xnlp=CL_JSMv2.5.0.8,SID_CC9BB16F-4F25-4771-A5CC-4B24E749957F";
        
            hlt.map.addLayer(new OpenLayers.Layer.OSM( layer_name, map_url, layer_option));
		
	};
	
	/**
	 * 天地图（WMTS）
	 * @link //http://blog.csdn.net/arcgis_all/article/details/8848120
	 * @link http://download.csdn.net/download/ynfynf/5255469
	 * @link http://www.openlayers.org/dev/examples/wmts-capabilities.html
	 */
	hlt.initer.layer_TIANDITU_STREET = function(){
	    // If tile matrix identifiers differ from zoom levels (0, 1, 2, ...)
	    // then they must be explicitly provided.
	    var matrixIds = new Array(26);
	    for (var i=0; i<=21; i++) {
	        matrixIds[i] = {
	        	identifier: i
	        };
	    }
		
	    var wmts = new OpenLayers.Layer.WMTS({
	        name: "Tianditu Street",
	        url: "http://t0.tianditu.cn/vec_c/wmts/",
            layer: "vec",
            matrixSet: "c",
	        matrixIds: matrixIds,
            format: "tiles",
	        style: "default",
	        //projection: hlt.obj_tree["map_pj_gg"],
	        isBaseLayer: true,
	        zoomOffset: 2,
	        numZoomLevels: 15,
	        //resolutions: [0.3515625, 0.17578125, 0.087890625, 0.0439453125, 0.02197265625, 0.010986328125, 0.0054931640625, 0.00274658203125, 0.001373291015625, 0.0006866455078125, 0.00034332275390625, 0.000171661376953125, 0.0000858306884765625, 0.00004291534423828125, 0.000021457672119140625, 0.000010728836059570312, 0.000005364418029785156]	        
	        resolutions: [39135.7585, 19567.87925, 9783.939625, 4891.9698125, 2445.98490625, 1222.992453125, 611.4962265625, 305.74811328125, 152.874056640625, 76.4370283203125, 38.21851416015625, 19.109257080078127, 9.554628540039063, 4.777314270019532, 2.388657135009766, 1.194328567504883, 0.5971642837524415]
	    });
	    
	    console.log(wmts);

	    wmts.getTileInfo_ori = wmts.getTileInfo;
	    
        wmts.getTileInfo = function(loc) {
            var res = this.getServerResolution();
            
            var fx = (loc.lon - this.tileOrigin.lon) / (res * this.tileSize.w);
            var fy = (this.tileOrigin.lat / 2  - loc.lat) / (res * this.tileSize.h);

            //Math.round((this.topTileFromY - n.top) / f)    90
            
            var col = Math.floor(fx);   //无偏差
            var row = Math.floor(fy);   //有偏差
            
            var result = {
                    col: col, 
                    row: row,
                    i: Math.floor((fx - col) * this.tileSize.w),
                    j: Math.floor((fy - row) * this.tileSize.h)
                };
            
            console.log(res, loc, this.tileOrigin, this.tileSize, result);
            
            return result;
        };
        	    
	    
	    hlt.map.addLayer(wmts);
	};
	

	/**
	 * 天地图（WMTS）服务器读取版（有问题，暂不用）
	 * @link //http://blog.csdn.net/arcgis_all/article/details/8848120
	 * @link http://download.csdn.net/download/ynfynf/5255469
	 * @link http://www.openlayers.org/dev/examples/wmts-capabilities.html
	 */	
	/*
	hlt.initer.layer_TIANDITU_STREET = function(){
	    var format = new OpenLayers.Format.WMTSCapabilities({
	        yx: {
	            "urn:ogc:def:crs:EPSG::900913": true
	        }
	    });

	    OpenLayers.Request.GET({
	    	//http://t0.tianditu.cn/vec_c/wmts?SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetCapabilities
	        url: "public/tianditu_wmts/xml_1.0.0/vec_c_getCapabilities.xml",
	        success: function(request) {
	            var doc = request.responseXML;
	            if (!doc || !doc.documentElement) {
	                doc = request.responseText;
	            }
	            console.log('no log 12');
	            var capabilities = format.read(doc);
	            
	            console.log(capabilities);
	            
	            var layer = format.createLayer(capabilities, {
	            	name: "Tianditu Street",
	                layer: "vec",
	                matrixSet: "c",
	                format: "tiles",
	        		//zoomOffset: 2,	                
	                isBaseLayer: true
	            });
	            console.log(layer);
	            
	            layer.getTileInfo = function(loc) {
	                var res = this.getServerResolution();
	                
	                var fx = (loc.lon - this.tileOrigin.lon) / (res * this.tileSize.w);
	                var fy = (this.tileOrigin.lat - loc.lat) / (res * this.tileSize.h);

	                var col = Math.floor(fx);
	                var row = Math.floor(fy);
	                
	                console.log(res, col, row);
	                
	                return {
	                    col: col, 
	                    row: row,
	                    i: Math.floor((fx - col) * this.tileSize.w),
	                    j: Math.floor((fy - row) * this.tileSize.h)
	                };
	            };
	            
	            hlt.map.addLayer(layer);
	        },
	        failure: function() {
	            alert("Trouble getting capabilities doc");
	            //OpenLayers.Console.error.apply(OpenLayers.Console, arguments);
	        }
	    });
	};
	*/
	
	//@see http://openlayers.org/dev/examples/bing.html
	hlt.initer.layer_BING_MAPS = function(){
		var apiKey = 'At4EmJ8c6tZChaEWy_1LJBNnxgQ-nGo5Tzm3QfXsVuLe_0Wejf5D3kCh_BO0lvZ_';  //change this please. appkey apply website: http://bingmapsportal.com/
		
		var hybrid = new OpenLayers.Layer.Bing({
		    key: apiKey,
		    type: "Aerial",
		    name: "Bing Aerial",
		    transitionEffect: 'resize'
		});
		hlt.map.addLayer(hybrid);
	};
	
	/**
	 * 雅虎tw地图卫星图TMS转换工具
	 */
	hlt.yahoo_satellite_xyz_conv = {
		"urls": [
		    "http://maps.yimg.com/ae/ximg?v=1.9&t=a&s=256&r=1&",
		    "http://maps1.yimg.com/ae/ximg?v=1.9&t=a&s=256&r=1&",
		    "http://maps2.yimg.com/ae/ximg?v=1.9&t=a&s=256&r=1&",
		    "http://maps3.yimg.com/ae/ximg?v=1.9&t=a&s=256&r=1&"
		],
		
		"getSrvUrl": function(x, y){
			return this.urls[((x + y) % 4 + 4) % 4];
		},
		
		"getURL": function(xyz){
			var z = xyz.z + 1;
			var y = (1 << xyz.z) / 2 - xyz.y - 1;
			var x = xyz.x;

			return this.getSrvUrl(x, y) + 'x=' + x + '&y=' + y + '&z=' + z;
		}
		
	};
	
	hlt.initer.html5_getCurrentPosition = function(){
		var handleSuccess = function(position){
			hlt.initer.set_zoom(position.coords["latitude"], position.coords["longitude"], position.coords['accuracy']);
		};
		var handleError = function(error){
			if(error){
				hlt.ui.showDialog('定位失败', error.message + '(PositionError.code:' + error.code + ')');
			}
			//hlt.initer.set_zoom();
		};
		if (window.navigator.geolocation) {
    		window.navigator.geolocation.getCurrentPosition(
    				handleSuccess, 
    				handleError, 
    				{
    	            	enableHighAccuracy: true,
    	                timeout: 10000,
    	                maximumAge: 1000
    	            }
    		);
		} else {
			hlt.ui.showDialog('定位失败', '当前浏览器不支持html5的地理相关接口，无法定位');
		}
	};
	
	hlt.initer.ip_getPosition = function(){
		var jsonp = new OpenLayers.Protocol.Script();
        jsonp.createRequest('http://freegeoip.net/json/', 
        		{}, 
        		function(data){
        			$('#ip_position').text('ip定位：' + data['ip']);
        			hlt.initer.set_zoom(data["latitude"], data["longitude"]);
        		}
        );
	}
	
})(hlt, $);