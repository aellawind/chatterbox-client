var app = {

  server: 'https://api.parse.com/1/classes/chatterbox',
  username: 'anonymous',
  allRooms: [],
  userFriends: [],
  currentRoom: undefined,

  // Run when the browser is ready, see index.html
  init: function() {
    console.log("We are running init");
    app.username = document.URL.substr(document.URL.indexOf('username=')+9);
    app.getRooms();
    app.fetchAllMessages(); //refresh the page constantly

    // Event listener for when user wants to send message
    $("#send").on('click', app.sendMessage);
    $("#createRoom").on('click', app.createRoom);
    $("#gotoroom").on('click', function() {
      app.currentRoom = $("#roomSelect").val();
      app.fetch();
    });

    // Cache a reference to the dom
    app.$text = $("#message"); 

  },

  fetchAllMessages: function() {
    app.fetch();
    //setInterval(app.fetch, 1000);
  },

  fetch: function() {
    $.ajax({
      url: app.server,
      type: 'GET',
      data: {order: '-createdAt', 
              limit: 50,
              where: {roomname: app.currentRoom}},
      contentType: 'application/json',
      success: function (data) {
        app.processNewMessages(data.results);
      },
      error: function (data) {
        console.error('chatterbox: Failed to receive message');
      },
    });
  },

  processNewMessages: function(messages) {
    $("#chats").html("");
    for (var i = messages.length-1; i > -1; i--) {
      console.log(messages[i]);
      if (app.currentRoom) {
        if (messages[i].roomname === app.currentRoom) {
          console.log(app.currentRoom);
          app.addMessage(messages[i]);
        }
      } else {
        app.addMessage(messages[i]);
      }
    }

    // Add an event listener to the username of all of these new messages
    $(".username").on("click", function() {
      var newFriend = $(this).text();
      if (app.userFriends.indexOf(newFriend) === -1) {
        app.userFriends.push(newFriend);
      }
    });
  },

  addMessage: function(message) {
    if (message.username) {message.username = app.escapeUserInput(message.username).slice(0,100);}
    if (app.userFriends.indexOf(message.username) !== -1) { message.username = "<u>" + message.username + "</u>";}
    if (message.text) {message.text = app.escapeUserInput(message.text).slice(0,400);}
    if (message.roomname) { message.roomname = app.escapeUserInput(message.roomname);}
    var $message = "<div class='chat'><span class='username'>" + message.roomname+ message.username + "</span>: " + message.text + "<br>" + "<span class='date'>" + new Date(message.createdAt) + "</span></div>";
    $('#chats').prepend($message);
   // console.log($message);
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

  escapeUserInput: function(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;').replace(/>/g, '&gt;').replace(/'/g, '&quot;').replace(/!/g, '&#33;').replace(/%/g, '&#37;').replace(/\(/g, '&#40;').replace(/\)/g, '&#41;').replace(/{/g, '&#123;').replace(/}/g, '&#125;').replace(/=/g, '&#61;');
  },

  // Fetch function specifically to get list of rooms
  // Also puts the rooms into the html page dropdown
  getRooms: function() {
    $.ajax({
      url: app.server,
      type: 'GET',
      data: {limit:1000, order:'-createdAt'},
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
  },

  sendMessage: function(event) {
    // Prevent page from refreshing (default action for forms)
    event.preventDefault();
    // Create message object
    var messageObj = {
      username: app.username,
      text: app.$text.val(),
      roomname: app.currentRoom
    };
    // Clear our send box
    app.$text.val('');
    // Send our message to the server
    app.send(messageObj);
    // Refresh the page to display all our messages including the one we just sent
    app.fetch();
  },

  createRoom: function() {
    app.currentRoom = prompt("Name a new room");
    if (app.allRooms.indexOf(app.currentRoom) === -1) {
      app.addRooms(app.currentRoom);
    }
    $('#roomSelect').val(app.currentRoom);
    app.fetch();
  }


};

 
  









