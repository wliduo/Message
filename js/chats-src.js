Bmob.initialize("c7401c529e15dad3f96901ac95e087dd", "8e9ecc1c5a2df4e02efe6a602f0566b9");

function me() {
    layer.prompt({ title: '请输入密码', formType: 0 }, function (text, index) {
        if (text == 'dolyw') {
            window.location.href = "https://msg.dolyw.com?type=me";
        } else {
            layer.msg('密码不正确');
            layer.close(index);
        }
    });
}

var url = window.location.href.split('?')[0];
// var url =  "https://msg.dolyw.com/";

// 跳过条数
var skip = 0;
// 条数(每页条数)
var size = 5;
// 总条数
var countSize = 0;
// 总页数
var pageSize = 0;

// 获取当前时间
function getNowFormatDate() {
    var date = new Date();
    var seperator1 = "-";
    var seperator2 = ":";
    var month = date.getMonth() + 1;
    var strDate = date.getDate();
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
    }
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();
    String(hours).length < 2 ? (hours = "0" + hours) : hours;
    String(minutes).length < 2 ? (minutes = "0" + minutes) : minutes;
    String(seconds).length < 2 ? (seconds = "0" + seconds) : seconds;
    var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate
        + " " + hours + seperator2 + minutes + seperator2 + seconds;
    return currentdate;
}

// 取地址栏参数
function getQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) {
        return unescape(r[2]);
    }
    return null;
}

// 查询留言
function queryChats(skip, size) {
    const query = Bmob.Query("chats");
    // 根据当前url查询数据
    query.equalTo("url", "==", url);
    if (getQueryString("type")) {
        // query.or(query.equalTo("type", '==', '0'), query.equalTo("type", '==', '1'));
        query.equalTo("type", '==', '1');
    } else {
        query.equalTo("type", '==', '0');
    }
    // 查询总条数
    query.count().then(res => {
        countSize = res;
        // console.log(countSize);
        // 获取总页数
        if (parseInt(countSize % size) != 0) {
            pageSize = parseInt(countSize / size) + parseInt(1);
        } else {
            pageSize = parseInt(countSize / size);
        }
        // 获取当前页数
        var page = parseInt(skip / size) + parseInt(1);
        if (countSize == 0) {
            page = 0;
        }
        document.getElementById("page").innerHTML = page + '/' + pageSize;
    });
    // 时间降序排列
    query.order("-date");
    query.skip(skip);
    query.limit(size);
    query.find().then(res => {
        // console.log(res);
        var ul = document.getElementById("ul");
        ul.innerHTML = "";
        // 将查询的留言填写进ul li
        for (var i = 0; i < res.length; i++) {
            var li = document.createElement("li");
            var html = "<b>" + res[i].name + "</b>";
            // https://www.gravatar.com/avatar/
            // https://cn.gravatar.com/avatar/
            // https://cdn.v2ex.com/gravatar/
            // https://dn-qiniu-avatar.qbox.me/avatar/
            // 统一换成七牛的的转发
            if (res[i].web !== '') {
                html = "<a href='" + res[i].web + "' target='_blank'><img src='https://dn-qiniu-avatar.qbox.me/avatar/" + res[i].email.MD5(32) + "' /></a>" + html;
            } else {
                html = "<img src='https://dn-qiniu-avatar.qbox.me/avatar/" + res[i].email.MD5(32) + "' />" + html;
            }
            /* if (res[i].web !== '') {
                html = html + "<label>" + res[i].web + "</label>";
            } else {
                if (res[i].email !== '') {
                    html = html + "<label>" + res[i].email + "</label>";
                }
            } */
            html = html + "<label>" + res[i].date + "</label><p>" + res[i].msg + "</p>";
            li.innerHTML = html;
            ul.appendChild(li);
        }
        // 留言为空
        if (res.length == 0) {
            layer.msg('还没有留言哦~');
            var li = document.createElement("li");
            li.innerHTML = "<label>还没有留言哦~</label>";
            ul.appendChild(li);
        }
    });
}

// 添加留言
function addChats(btn) {
    // 开始执行，先将按钮置为不可用，执行完后设置可用
    btn.disabled = true;
    var name = document.getElementById("name").value;
    var email = document.getElementById("email").value;
    var web = document.getElementById("web").value;
    var msg = document.getElementById("msg").value;
    if (msg.trim() === '') {
        layer.msg('内容为空');
        btn.disabled = false;
        return;
    }
    if (name.indexOf("/script") != -1 || email.indexOf("/script") != -1 || web.indexOf("/script") != -1 || msg.indexOf("/script") != -1) {
        layer.msg('请勿输入特殊字符');
        btn.disabled = false;
        return;
    }
    if (name.trim() === '') {
        name = '匿名';
    }
    const query = Bmob.Query("chats");
    query.set("url", url);
    query.set("name", name);
    query.set("email", email);
    query.set("web", web);
    query.set("msg", msg);
    query.set("date", getNowFormatDate());
    if (getQueryString("type")) {
        query.set("type", '1');
    } else {
        query.set("type", '0');
    }

    query.save().then(res => {
        // console.log(res);
        reset();
        layer.msg('留言成功');
        // myHome.$refs.myDanmaku.add(msg)
        myHome.$refs.myDanmaku.danmus.push(msg)
        skip = 0;
        queryChats(skip, size);
        btn.disabled = false;
    }).catch(err => {
        layer.msg('留言失败，请联系管理员');
        btn.disabled = false;
        console.log(err);
    })
}

// 重置
function reset() {
    document.getElementById("name").value = "";
    document.getElementById("email").value = "";
    document.getElementById("web").value = "";
    document.getElementById("msg").value = "";
}

// 初始化
queryChats(skip, size);

// 上一页
function previous(btn) {
    // 开始执行，先将按钮置为不可用，执行完后设置可用
    btn.disabled = true;
    if (skip == 0) {
        layer.msg('当前是第一页');
        btn.disabled = false;
        return;
    } else {
        skip = skip - size;
        queryChats(skip, size);
        var page = (parseInt(skip) / parseInt(size)) + parseInt(1);
        btn.disabled = false;
    }
}

// 下一页
function next(btn) {
    // 开始执行，先将按钮置为不可用，执行完后设置可用
    btn.disabled = true;
    skip = skip + size;
    if (skip >= countSize) {
        // console.log(skip + ',' + countSize);
        skip = skip - size;
        layer.msg('当前是最后一页');
        btn.disabled = false;
        return;
    } else {
        queryChats(skip, size);
        var page = (parseInt(skip) / parseInt(size)) + parseInt(1);
        btn.disabled = false;
    }
}

// 页面跳转
function jump() {
    layer.prompt({ title: '请输入页码', formType: 0 }, function (text, index) {
        layer.close(index);
        /* var reg = /^\d(\.\d)?$|^[1-9]\d(\.\d)?$/;
        if(reg.test(text)){
            if(text > pageSize){
                layer.msg('超过最大页码');
                return;
            }
            skip = (parseInt(text) - parseInt(1)) * size;
            queryChats(skip, size);
            layer.msg('跳转到第' + text + '页');
        }else{
            layer.msg('请输入1-99的正整数');
        } */
        if (text <= 0 || text >= 100) {
            layer.msg('请输入1-99的正整数');
            return;
        }
        if (text > pageSize) {
            layer.msg('超过最大页码');
            return;
        }
        skip = (parseInt(text) - parseInt(1)) * size;
        queryChats(skip, size);
        layer.msg('跳转到第' + text + '页');
    });
}

// 新建组件
var myDanmakuTpl = Vue.extend({
    template: '#danmakuTpl',
    props: {
        danmus: {
            type: Array,
            required: true
        },
        config: {
            type: Object,
            default: () => {
                return {}
            }
        }
    },
    data: function () {
        return {
            container: null,
            isActive: false,
            timer: null,
            $danmaku: null,
            $danmus: null,
            danmaku: {
                danmus: [],
                width: 0, // danmaku宽度
                channels: 0, // 轨道数量
                loop: false // 是否循环
            },
            danmu: {
                height: 30,
                fontSize: 18,
                speed: 5
            },
            hidden: false,
            paused: false,
            index: 0,
            continue: true,
            danChannel: {}
        }
    },
    // 启动时就执行
    mounted: function () {
        this.$nextTick(() => {
            this.init()
            this.$emit('inited')
        })
    },
    methods: {
        init() {
            this.initCore()
            this.initConfig()
        },
        reset() {
            this.initConfig()
        },
        mouseIn() {
            this.$emit('mouseIn')
        },
        mouseOut() {
            this.$emit('mouseOut')
        },
        initCore() {
            this.$danmaku = this.$refs.danmaku
            this.$danmus = this.$refs.danmus
        },
        initConfig() {
            this.danmaku.width = this.$danmaku.offsetWidth
            this.danmaku.height = this.$danmaku.offsetHeight
            this.danmaku.danmus = this.danmus
            this.danmaku.channels = this.config.channels || parseInt(this.danmaku.height / this.danmu.height)
            this.danmaku.loop = this.config.loop || this.danmaku.loop
            this.danmu.speed = this.config.speed || this.danmu.speed
            this.danmu.fontSize = this.config.fontSize || this.danmu.fontSize
        },
        play() {
            if (this.paused) {
                this.paused = false
                return
            }
            if (!this.timer) {
                this.draw()
            }
        },
        draw() {
            this.$nextTick(() => {
                this.timer = setInterval(() => {
                    if (this.index > this.danmus.length - 1) {
                        // console.log('1')
                        this.config.loop ? this.insert() : this.clear()
                    } else {
                        // console.log('2')
                        this.insert()
                    }
                }, 50)
            })
        },
        insert() {
            const index = this.config.loop ? this.index % this.danmus.length : this.index
            const el = document.createElement(`p`)
            if (this.continue) {
                el.classList.add(`dm`)
                el.classList.add(`move`)
                el.style.animationDuration = `${this.danmu.speed}s`
                el.style.fontSize = `${this.danmu.fontSize}px`
                el.innerHTML = this.danmus[index]
                el.setAttribute('index', this.index)
                this.$danmus.appendChild(el)
            }
            this.$nextTick(() => {
                let channelIndex = this.getChannel(el)
                if (channelIndex >= 0) {
                    this.continue = true
                    const width = el.offsetWidth
                    const height = this.danmu.height > this.danmu.fontSize ? this.danmu.height : this.danmu.fontSize + 4
                    el.style.top = channelIndex * height + 'px'
                    el.style.width = width + 1 + 'px'
                    el.style.transform = `translateX(-${this.danmaku.width}px)`
                    el.addEventListener('animationend', () => {
                        this.$danmus.removeChild(el)
                    })
                    if (el.classList.length > 0) {
                        this.index++
                    }
                } else {
                    if (el.classList.length > 0) {
                        this.$danmus.removeChild(el)
                    }
                }
            })
        },
        getChannel(el) {
            const tmp = this.$danmus.offsetWidth / ((this.$danmus.offsetWidth + el.offsetWidth) / 6)
            for (let i = 0; i < this.danmaku.channels; i++) {
                const items = this.danChannel[i + '']
                if (items && items.length) {
                    for (let j = 0; j < items.length; j++) {
                        const danRight = this.getDanRight(items[j]) - 10
                        if (danRight <= this.$danmus.offsetWidth - tmp * ((this.$danmus.offsetWidth + parseInt(items[j].offsetWidth)) / 6) || danRight <= 0) {
                            break
                        }
                        if (j === items.length - 1) {
                            this.danChannel[i + ''].push(el)
                            el.addEventListener('animationend', () => {
                                this.danChannel[i + ''].splice(0, 1)
                            })
                            return i % this.danmaku.channels
                        }
                    }
                } else {
                    this.danChannel[i + ''] = [el]
                    el.addEventListener('animationend', () => {
                        this.danChannel[i + ''].splice(0, 1)
                    })
                    return i % this.danmaku.channels
                }
            }
            return -1
        },
        // 弹幕到右侧的距离
        getDanRight(el) {
            const eleWidth = el.offsetWidth || parseInt(el.style.width)
            const eleRight = el.getBoundingClientRect().right || this.$danmus.getBoundingClientRect().right + eleWidth
            return this.$danmus.getBoundingClientRect().right - eleRight
        },
        // 添加弹幕
        add(danmu) {
            const index = this.index % this.danmaku.danmus.length
            this.danmaku.danmus.splice(index, 0, danmu)
        },
        pause() {
            this.paused = true
        },
        stop() {
            this.danChannel = {}
            this.$refs.danmus.innerHTML = ''
            this.paused = false
            this.hidden = false
            this.clear()
        },
        clear() {
            clearInterval(this.timer)
            this.timer = null
            this.index = 0
        },
        show() {
            this.hidden = false
        },
        hide() {
            this.hidden = true
        },
        resize() {
            this.initConfig()
            const items = this.$danmaku.getElementsByClassName('dm')
            for (let i = 0; i < items.length; i++) {
                items[i].style.transform = `translateX(-${this.danmaku.width}px)`
            }
        }
    }
});

// 全局注册组件每个Vue实例都可以使用
Vue.component('my-danmaku', myDanmakuTpl);

var myHome = new Vue({
    el: '#app',
    data: {
        config: {
            channels: 5,
            loop: true,
            speed: 15,
            fontSize: 18
        },
        danmus: []
    },
    // 启动时就执行
    mounted: function () {
        this.$nextTick(() => {
            this.queryData()
        })
    },
    methods: {
        queryData() {
            const query = Bmob.Query("chats");
            // 根据当前url查询数据
            query.equalTo("url", "==", url);
            if (getQueryString("type")) {
                // query.or(query.equalTo("type", '==', '0'), query.equalTo("type", '==', '1'));
                query.equalTo("type", '==', '1');
            } else {
                query.equalTo("type", '==', '0');
            }
            // 时间降序排列
            query.order("-date");
            query.find().then(res => {
                var msgArray = []
                for (var key in res) {
                    msgArray.push(res[key].msg)
                }
                // 判断手机还是PC
                var viewType = navigator.userAgent.toLowerCase()
                viewType = viewType.match(/(phone|pad|pod|midp|iphone|ipod|iphone os|ios|ipad|android|mobile|blackberry|iemobile|mqqbrowser|juc|rv:1.2.3.4|ucweb|fennec|wosbrowser|browserng|webos|symbian|windows ce|windows mobile|windows phone)/i)
                if (viewType) {
                    this.config.speed = 8
                }
                if (msgArray.length > 0) {
                    this.danmus = msgArray
                } else {
                    this.danmus = ['还没有留言哦~']
                }
                // console.log(this.danmus)
                this.$refs.myDanmaku.reset()
                this.$refs.myDanmaku.play()
            });
        }
    }
});