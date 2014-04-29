var app = {

  // server: 'https://api.parse.com/1/classes/chatterbox',

  user: function() {
    return document.URL.substr(document.URL.indexOf('username=')+9);
  }(),

  currentRoom: undefined,

  allRooms: [],

  userFriends: [],

  init: function() {
    console.log("We are running init");
    app.getRooms();
    console.log(app.user);
  },

  fetch: function() {
    $.ajax({
      url: 'https://api.parse.com/1/classes/chatterbox?order=-createdAt',
      type: 'GET',
      data: {limit: function(){
        if ($('#roomSelect').val()) {
          return 1000;
        } else {
          return 100;
        }
      }},
      contentType: 'application/json',
      success: function (data) {
        console.log(data);
        var userSelectedRoom = app.currentRoom;
        data.results.sort(function(a,b) {
          return b.createdAt - a.createdAt;
        });
        for (var i = data.results.length-1; i>-1; i--) {
          if (userSelectedRoom) {
            if (data.results[i].roomname === userSelectedRoom) {
              app.addMessage(data.results[i]);
              console.log(data.results[i]);
            }
          } else {
            app.addMessage(data.results[i]);
          }
        }
        $(".username").on('click', function() {
          var newFriend = $(this).text();
          if (app.userFriends.indexOf(newFriend) === -1) {
            app.userFriends.push(newFriend);
          }
          console.log(app.userFriends);
        });
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
    if (message.username) {message.username = app.escapeUserInput(message.username).slice(0,100);}
    if (app.userFriends.indexOf(message.username) !== -1) { message.username = "<u>" + message.username + "</u>";}
    if (message.text) {message.text = app.escapeUserInput(message.text).slice(0,400);}
    if (message.roomname) { message.roomname = app.escapeUserInput(message.roomname);}
    var $message = "<div class='chat'><span class='username'>" + message.username + "</span>: " + message.text + "<br>" + "<span class='date'>" + new Date(message.createdAt) + "</span></div>";
    $('#chats').append($message);
  },

  escapeUserInput: function(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;').replace(/>/g, '&gt;').replace(/'/g, '&quot;').replace(/!/g, '&#33;').replace(/%/g, '&#37;').replace(/\(/g, '&#40;').replace(/\)/g, '&#41;').replace(/{/g, '&#123;').replace(/}/g, '&#125;').replace(/=/g, '&#61;');
  },

  // Fetch function specifically to get list of rooms
  // Also puts the rooms into the html page dropdown
  getRooms: function() {
    $.ajax({
      url: 'https://api.parse.com/1/classes/chatterbox?order=-createdAt',
      type: 'GET',
      data: {limit:1000},
      contentType: 'application/json',
      success: function (data) {
        var roomsList = _.uniq(_.pluck(data.results, 'roomname'));
        roomsList.sort();
        // console.log(roomsList);
        $('#roomSelect').html('<option></option>');
        for (var i = 0; i < roomsList.length; i++) {
          var cleanRoom = roomsList[i];
          if (cleanRoom) {
            cleanRoom = app.escapeUserInput(cleanRoom);
            app.addRooms(cleanRoom);
            app.allRooms.push(cleanRoom);
          }
        }
      },
      error: function (data) {
        console.error('chatterbox: Failed to receive message');
      }
    });
  },

  addRooms: function(roomName) {
    var $room = "<option>" + roomName + "</option>";
    $('#roomSelect').append($room);
  }

};

$(document).ready(function() {

  app.init(); //Initialize our stuff

  $("#refreshrooms").on('click', app.getRooms);

  $("#createRoom").on('click', function() {
    var userCreatedRoom = prompt("Name a new room");
    app.currentRoom = userCreatedRoom;
    //console.log( $('#roomSelect').val());
    if (app.allRooms.indexOf(app.currentRoom) !== -1) {
      app.fetch();
    } else {
      app.addRooms(app.currentRoom);
    }
    $('#roomSelect').val(app.currentRoom);
  });

  // Event listener to add
  $("#send").on('click', function(event) {
    event.preventDefault();
    var $text = $("#message").val();
    var messageObj = {
      username: app.user,
      text: $text,
      roomname: app.currentRoom
    };
    console.dir(messageObj);
    app.send(messageObj);
    $("#message").val('');
    app.fetch();
  });

  // Event listener to add
  $("#fetch").on('click', function(event) {
    event.stopPropagation();
    $('#chats').html('');
    app.fetch();
  });


  //setInterval(app.fetch, 100);
});







