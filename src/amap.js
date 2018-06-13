/**
 * 作者: 郭天琦
 * 创建时间: 2018-06-12 14:55:10
 * 版本: [1.0, 2018-06-12 ]
 * 描述: 依赖高德定位，百度周边检索
 * 需要依赖于百度地图sdk-forjs、高德地图sdk-forjs
 */

(function (AMap, BMap) {
    'use strict';

    var defaultSetting = {
        container: '#amap',
        map: {
            resizeEnable: true
        },
        geolocation: {
            enableHighAccuracy: true,
            timeout: 10000,
            buttonOffset: new AMap.Pixel(10, 20),
            zoomToAccuracy: true,
            buttonPosition: 'RB'
        },
        radius: 1000
    };

    /**
     * 组件的构造函数
     * @param {Object} options 配置项
     */
    function AMAP(options) {
        if (!options.container) {
            throw new Error('请传入地图容器元素');
        }

        window._addrFrameCallback = this._addrFrameCallback.bind(this);
        options.container = this.getHTMLElement(options.container);
        
        this.extend(options, defaultSetting);
        this.options = options;
        // 初始化组件定位
        this._initializationGeo(options);
    }

    /**
     * 组件原型
     */
    AMAP.prototype = {

        /**
         * 初始化定位
         * @param {Object} options 配置项
         */
        _initializationGeo: function (options) {
            var map,
                geolocation,
                self = this;

            // 加载地图，调用浏览器定位服务
            map = new AMap.Map(options.container, options.map);

            map.plugin('AMap.Geolocation', function () {
                geolocation = new AMap.Geolocation(options.geolocation);

                map.addControl(geolocation);
                geolocation.getCurrentPosition();
                AMap.event.addListener(geolocation, 'complete', self._onComplete.bind(self));
                AMap.event.addListener(geolocation, 'error', self._onError.bind(self));
            });
        },

        /**
         * 定位成功后触发
         * @param {Object} data 高德地图返回的坐标内容
         */
        _onComplete: function (data) {
            this.position = data.position;
            this._coordConvert(this.position);
            data.position = this.position;
            this.options.onComplete && this.options.onComplete.call(this, data);
        },

        /**
         * 定位失败后触发
         * @param {Object} err 报错信息
         */
        _onError: function (err) {
            this.options.onError && this.options.onError.call(this, err);
        },

        /**
         * 高德坐标转换成百度坐标
         * @param {Object} position 坐标位置
         */
        _coordConvert: function (position) {
            var x = position.lng;
            var y = position.lat;
            var ggPoint = new BMap.Point(x, y);
            var convertor = new BMap.Convertor();
            var pointArr = [];
            var that = this;
            
            pointArr.push(ggPoint);
            convertor.translate(pointArr, 3, 5, function(data) {
                var points = data.points[0];
                
                position.lng = points.lng;
                position.lat = points.lat;
                
                // 周边检索
                that.searchQuery(position.lng, position.lat);
            });
        },
        
        /**
         * 周边检索
         * @param {Object} lng 百度地图的纬度
         * @param {Object} lat 百度地图的精度
         */
        searchQuery: function(lng, lat) {
            var scriptEl = document.createElement('script');
            
            scriptEl.src = 'http://api.map.baidu.com/geocoder/v2/?callback=_addrFrameCallback&location=' + lat + ',' + lng + '&output=json&pois=1&ak=K5LXDCfHLnGvLDQsZx0AKyXNV5kLObYF&radius=' + this.options.radius;
            document.body.appendChild(scriptEl);
        },
        
        /**
         * 百度地图周边返回的数据
         * @param {Object} data 返回数据
         */
        _addrFrameCallback: function(data) {
            this.options.poiCallback && this.options.poiCallback.call(this, data.result || {});
        },

        /**
         * 获取 HTMLElement
         * @param {String | HTMLElement} el dom元素
         * @return {HTMLElement} el 元素
         */
        getHTMLElement: function (el) {
            if (el.nodeType !== 1) {
                el = document.querySelector(el);
            }

            return el;
        },
        
        /**
         * 对象合并，将往后几项均合并到第一项当中
         */
        extend: function() {
            var args = [].slice.call(arguments),
                result = args[0];
                
            for (var i = 1, len = args.length; i < len; i++) {
                var item = args[i];
                
                for (var key in item) {
                    if (result[key] === undefined) {
                        result[key] = item[key];
                    }
                }
            }
        }
    };
    
    window.AMAP = AMAP;
    
}(window.AMap, window.BMap));