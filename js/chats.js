Bmob.initialize("c7401c529e15dad3f96901ac95e087dd", "8e9ecc1c5a2df4e02efe6a602f0566b9");

// 跳过条数
var skip = 0;
// 条数(每页条数)
var size = 5;
// 总条数
var countSize = 0;
// 总页数
var pageSize = 0;
var url = window.location.href.split('?')[0];
// var url =  "https://msg.wang64.cn/";

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
        console.log(res);
        var ul = document.getElementById("ul");
        ul.innerHTML = "";
        // 将查询的留言填写进ul li
        for (var i = 0; i < res.length; i++) {
            var li = document.createElement("li");
            var html = "<b>" + res[i].name + "</b>";
            if (res[i].web !== '') {
                html = "<a href='"+ res[i].web +"' target='_blank'><img src='http://www.gravatar.com/avatar/" + res[i].email.MD5(32) + "' /></a>" + html;
            } else {
                html = "<img src='http://www.gravatar.com/avatar/" + res[i].email.MD5(32) + "' />" + html;
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
    const query = Bmob.Query('chats');
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
        console.log(skip + ',' + countSize);
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

function me() {
    window.location.href = "https://msg.wang64.cn?type=me";
}