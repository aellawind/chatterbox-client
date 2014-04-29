var app = {

  server: 'https://api.parse.com/1/classes/chatterbox',

  init: function() {
    // get a list of all of the rooms
  },

  fetch: function() {
    $.ajax({
      url: 'https://api.parse.com/1/classes/chatterbox?order=-createdAt',
      type: 'GET',
      contentType: 'application/json',
      success: function (data) {
        console.log(data);
        data.results.sort(function(a,b) {
          return b.createdAt - a.createdAt;
        });
        for (var i = data.results.length-1; i>-1; i--) {
          app.addMessage(data.results[i]);
        }
      },
      error: function (data) {
        console.error('chatterbox: Failed to receive message');
      }
    });
  },

  send: function(message) {
    $.ajax({
      url: 'https://api.parse.com/1/classes/chatterbox',
      type: 'POST',
      data: JSON.stringify(message),
      contentType: 'application/json',
      success: function (data) {
        console.log('chatterbox: Message sent');
      },
      error: function (data) {
        console.error('chatterbox: Failed to send message');
      }
    });
  },

  clearMessages: function() {
    $('#chats').html('');
  },

  addMessage: function(message) {
    if (message.text) {message.text = app.escapeUserInput(message.text).slice(0,400);}
    if (message.username) {message.username = app.escapeUserInput(message.username).slice(0,100);}
    if (message.roomname) { message.roomname = app.escapeUserInput(message.roomname);}
    var $message = "<div class='chat'><span class='username'>" + message.username + "</span>:" + message.text + "</div>";
    $('#chats').append($message);
    console.log($message);
  },

  escapeUserInput: function(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;').replace(/>/g, '&gt;').replace(/'/g, '&quot;').replace(/!/g, '&#33;').replace(/%/g, '&#37;').replace(/\(/g, '&#40;').replace(/\)/g, '&#41;').replace(/{/g, '&#123;').replace(/}/g, '&#125;').replace(/=/g, '&#61;');
  }

};

$(document).ready(function() {


  // Event listener to add
  $("#send").on('click', function(event) {
    event.preventDefault();
    var $text = $("#message").val();
    var messageObj = {
      username: 'nick',
      text: $text,
      roomname: 'hoppin'
    };
    console.dir(messageObj);
    app.send(messageObj);
    $("#message").val('');
  });

  // Event listener to add
  $("#fetch").on('click', function(event) {
    event.stopPropagation();
    $('#chats').html('');
    app.fetch();
  });


  //setInterval(app.fetch, 100);


});










