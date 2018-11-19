Bmob.initialize("c7401c529e15dad3f96901ac95e087dd", "8e9ecc1c5a2df4e02efe6a602f0566b9");

var skip = 0;
var size = 5;
var url =  window.location.href;

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
    String(hours).length < 2 ? (hours = "0" + hours): hours;
    String(minutes).length < 2 ? (minutes = "0" + minutes): minutes;
    String(seconds).length < 2 ? (seconds = "0" + seconds): seconds;
    var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate
            + " " + hours + seperator2 + minutes + seperator2 + seconds;
    return currentdate;
}

// 查询留言
function queryChats(skip, size){
    const query = Bmob.Query("chats");
    query.equalTo("url", "==", url);
    // 时间降序排列
    query.order("-createdAt");
    query.skip(skip);
    query.limit(size);
    query.find().then(res => {
        // console.log(res);
        var ul = document.getElementById("ul");
        ul.innerHTML = "";
        // 将查询的留言填写进ul li
        for(var i=0; i<res.length; i++){
            var li = document.createElement("li");
            var html = "<b>" + res[i].name + "</b>";
            if(res[i].web !== ''){
                html = html + "<label>" + res[i].web + "</label>";
            }else{
                if(res[i].email !== ''){
                    html = html + "<label>" + res[i].email + "</label>";
                }
            }
            html = html + "<label>" + res[i].createdAt + "</label><p>" + res[i].msg + "</p>";
            li.innerHTML = html;
            ul.appendChild(li);
        }
        // 留言为空
        if(res.length == 0){
            layer.msg('还没有留言哦~');
            var li = document.createElement("li");
            li.innerHTML = "<label>还没有留言哦~</label>";
            ul.appendChild(li);
        }
    });
}

// 添加留言
function addChats(btn){
    // 开始执行，先将按钮置为不可用，执行完后设置可用
    btn.disabled = true;
    var name = document.getElementById("name").value;
    var email = document.getElementById("email").value;
    var web = document.getElementById("web").value;
    var msg = document.getElementById("msg").value;
    if(name.trim() === ''){
        layer.msg('昵称为空');
        btn.disabled = false;
        return;
    }
    if(msg.trim() === ''){
        layer.msg('内容为空');
        btn.disabled = false;
        return;
    }
    if(name.indexOf("/script") != -1 || email.indexOf("/script") != -1 || web.indexOf("/script") != -1 || msg.indexOf("/script") != -1){
        layer.msg('请勿输入特殊字符');
        btn.disabled = false;
        return;
    }
    const query = Bmob.Query('chats');
    query.set("url", url);
    query.set("name", name);
    query.set("email", email);
    query.set("web", web);
    query.set("msg", msg);
    query.set("date", getNowFormatDate());
    
    query.save().then(res => {
        // console.log(res);
        reset();
        layer.msg('留言成功');
        skip = 0;
        queryChats(skip, size);
        document.getElementById("page").innerHTML = '1';
        btn.disabled = false;
    }).catch(err => {
        layer.msg('留言失败，请联系管理员');
        btn.disabled = false;
        console.log(err);
    })
}

// 重置
function reset(){
    document.getElementById("name").value = "";
    document.getElementById("email").value = "";
    document.getElementById("web").value = "";
    document.getElementById("msg").value = "";
}

// 初始化
queryChats(skip, size);

// 上一页
function previous(btn){
    // 开始执行，先将按钮置为不可用，执行完后设置可用
    btn.disabled = true;
    if(skip == 0){
        layer.msg('当前是第一页');
        btn.disabled = false;
        return;
    }else{
        skip = skip - size;
        queryChats(skip, size);
        var page = (parseInt(skip) / parseInt(size)) + parseInt(1);
        document.getElementById("page").innerHTML = page;
        btn.disabled = false;
    }
}

// 下一页
function next(btn){
    // 开始执行，先将按钮置为不可用，执行完后设置可用
    btn.disabled = true;
    skip = skip + size;
    const query = Bmob.Query("chats");
    query.equalTo("url", "==", url);
    // 时间降序排列
    query.order("-createdAt");
    query.skip(skip);
    query.limit(size);
    query.find().then(res => {
        // console.log(res);
        // 留言为空
        if(res.length == 0){
            skip = skip - size;
            layer.msg('当前是最后一页');
            btn.disabled = false;
            return;
        }else{
            var ul = document.getElementById("ul");
            ul.innerHTML = "";
            // 将查询的留言填写进ul li
            for(var i=0; i<res.length; i++){
                var li = document.createElement("li");
                var html = "<b>" + res[i].name + "</b>";
                if(res[i].web !== ''){
                    html = html + "<label>" + res[i].web + "</label>";
                }else{
                    if(res[i].email !== ''){
                        html = html + "<label>" + res[i].email + "</label>";
                    }
                }
                html = html + "<label>" + res[i].createdAt + "</label><p>" + res[i].msg + "</p>";
                li.innerHTML = html;
                ul.appendChild(li);
            }
            var page = (parseInt(skip) / parseInt(size)) + parseInt(1);
            // console.log(page);
            document.getElementById("page").innerHTML = page;
            btn.disabled = false;
        }
    });
}

// 页面跳转
function jump(){
    layer.prompt({title: '请输入页码', formType: 0}, function(text, index){
        layer.close(index);
        var reg = /^\d(\.\d)?$|^[1-9]\d(\.\d)?$/;
        if(reg.test(text)){
            if(text == 0){
                layer.msg('请输入1-99的正整数');
                return;
            }
            const query = Bmob.Query("chats");
            query.equalTo("url", "==", url);
            // 时间降序排列
            query.order("-createdAt");
            query.skip((parseInt(text) - parseInt(1)) * size);
            query.limit(size);
            query.find().then(res => {
                // 留言为空
                if(res.length == 0){
                    layer.msg('超过最大页码');
                    return;
                }else{
                    skip = (parseInt(text) - parseInt(1)) * size;
                    var ul = document.getElementById("ul");
                    ul.innerHTML = "";
                    // 将查询的留言填写进ul li
                    for(var i=0; i<res.length; i++){
                        var li = document.createElement("li");
                        var html = "<b>" + res[i].name + "</b>";
                        if(res[i].web !== ''){
                            html = html + "<label>" + res[i].web + "</label>";
                        }else{
                            if(res[i].email !== ''){
                                html = html + "<label>" + res[i].email + "</label>";
                            }
                        }
                        html = html + "<label>" + res[i].createdAt + "</label><p>" + res[i].msg + "</p>";
                        li.innerHTML = html;
                        ul.appendChild(li);
                    }
                    var page = (parseInt(skip) / parseInt(size)) + parseInt(1);
                    document.getElementById("page").innerHTML = page;
                    layer.msg('跳转到第' + text + '页');
                }
            });
        }else{
            layer.msg('请输入1-99的正整数');
        }
    });
}