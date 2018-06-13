/**
 * showcase.js
 */

(function () {
    'use strict';

    var nearListEl = document.getElementById('near-list'),
        tpl = document.getElementById('tpl').innerHTML;

    initPage();

    function initPage() {
        // 初始化组件
        new AMAP({
            container: '#container',
            poiCallback: function (data) {
                nearListEl.innerHTML = Mustache.render(tpl, {
                    items: data.pois
                });
            },
            radius: 500
        });
        
        initListeners();
    }

    function initListeners() {
        // 点击考勤签到
        nearListEl.addEventListener('tap', function(e) {
            var self = e.target;
            
            while (self && self.tagName !== 'LI') {
                self = self.parentElement;
            }
            
            if (self) {
                alert('签到地址：' + self.dataset.name + ' ' + self.dataset.addr); 
            }
        });
    }
}());