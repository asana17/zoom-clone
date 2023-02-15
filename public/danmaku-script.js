window.addEventListener('load', function () {
  var CM = new CommentManager($('#my-comment-stage'));
  CM.init();
  CM.start();
    
  var socket = io();
  socket.on('danmaku show', function (msg) {
    console.log(msg);
    $('#messages').append($('<li>').text(msg));
    var danmaku = JSON.parse(msg);
    CM.send(danmaku);
  });
  
  $('#btnSend').click(function(e){
    e.preventDefault();
    var danmaku = {
      "text": $('#msg').val(),
      "mode": Number($("#mode").val()),
      "size": Number($("#size").val()),
      "color":parseInt($("#color").val(),16)
    };
    var msg=JSON.stringify(danmaku);
    socket.emit('danmaku send',msg);
    $('#msg').val("");
  });

  window.CM = CM;
  
});