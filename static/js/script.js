/* Author: YOUR NAME HERE
*/

$(document).ready(function() {   

  var socket = io.connect();

  $('#sender').bind('click', function() {
   socket.emit('create_db', 'Message Sent on ' + new Date());
  });

  socket.on('database_created', function(data){
    $('#receiver').append('<li>' + data.url + '</li>');
  });
});
