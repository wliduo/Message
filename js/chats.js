Bmob.initialize("c7401c529e15dad3f96901ac95e087dd", "8e9ecc1c5a2df4e02efe6a602f0566b9");

var skip = 0;
var size = 5;
var url =  window.location.href;

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
function addChats(){
    var name = document.getElementById("name").value;
    var email = document.getElementById("email").value;
    var web = document.getElementById("web").value;
    var msg = document.getElementById("msg").value;
    if(name.trim() === ''){
        layer.msg('昵称为空');
        return;
    }
    if(msg.trim() === ''){
        layer.msg('内容为空');
        return;
    }
    if(name.indexOf("/script") != -1 || email.indexOf("/script") != -1 || web.indexOf("/script") != -1 || msg.indexOf("/script") != -1){
        layer.msg('请勿输入特殊字符');
        return;
    }
    const query = Bmob.Query('chats');
    query.set("url", url);
    query.set("name", name);
    query.set("email", email);
    query.set("web", web);
    query.set("msg", msg);
    
    query.save().then(res => {
        // console.log(res);
        reset();
        layer.msg('留言成功');
        skip = 0;
        queryChats(skip, size);
    }).catch(err => {
        layer.msg('留言失败，请联系管理员');
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
function previous(){
    if(skip == 0){
        layer.msg('当前是第一页');
        return;
    }else{
        skip = skip - size;
        queryChats(skip, size);
    }
}

// 下一页
function next(){
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
        }
    });
}