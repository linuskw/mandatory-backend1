import React from 'react';

import io from 'socket.io-client';

class Chatroom extends React.Component {
  constructor(props){
    super(props);

    this.socket = io.connect('http://localhost:8000');

    this.state = {
      roomPick: false,
      roomArray: [],
      chatArray: [],
      chatMessage: "",
      room: "",
      newRoom: ""
    }

    this.change = this.change.bind(this);
    this.submit = this.submit.bind(this);
    this.roomJoin = this.roomJoin.bind(this);
    this.roomLeave = this.roomLeave.bind(this);
    this.roomCreate = this.roomCreate.bind(this);
    this.roomDelete = this.roomDelete.bind(this);
  }

  componentDidMount(){

    this.socket.on('connect', () => {
      this.socket.emit('get_rooms');
    });

    this.socket.on('rooms', (data) => {
      this.setState({ roomArray: data })
    })

    this.socket.on('messages', (data) => {
      this.setState({chatArray: data});
    });

    this.socket.on('message', (message) => {
      let newMessage = {
        username: message.username,
        content: message.content
      }

      this.setState({chatArray: this.state.chatArray.concat(newMessage)});
    });
  }

  componentWillUnmount(){
    this.socket.disconnect();
  }

  roomJoin(e){
    e.preventDefault();
    this.setState({ roomPick: true });
    this.socket.emit('join', this.state.room);
  }

  roomLeave(){
    this.setState({ roomPick: false });
  }

  roomCreate(e){
    e.preventDefault();
    if (!this.state.roomArray.includes(this.state.newRoom) && this.state.newRoom.length > 0 && this.state.newRoom.length < 20) {
      this.socket.emit('create_room', this.state.newRoom);
      this.setState({ newRoom: "" });
    }
  }

  roomDelete(e){
    e.preventDefault();
    this.socket.emit('delete', this.state.room)
  }

  change(e){
    let value = e.target.value;
    this.setState({
      ...this.state,
      [e.target.name]: value
    })
  }

  submit(e){
    e.preventDefault();
    let localMessage = {
      room: this.state.room,
      username: this.props.userName,
      content: this.state.chatMessage
    };

    if (localMessage.content.length >= 1 && localMessage.content.length <= 200) {
      this.socket.on(this.state.room).emit('new_message', localMessage);
      this.setState({chatArray: this.state.chatArray.concat(localMessage)});
      this.setState({chatMessage: ""})
    }
  }

  render(){
    return(
      <>
        { !this.state.roomPick ?
          <>
            <form onSubmit={this.roomCreate}>
              <label htmlFor="newRoom">Room Name</label>
              <input type="text" id="newRoom" name="newRoom" value={ this.state.newRoom } onChange={this.change} />
              <button type="submit">Create Room</button>
            </form>
            <form onChange={this.change} onSubmit={this.roomJoin}>
              {this.state.roomArray.map((value, index) => {
                return(
                  <>
                    <input type="radio" id={ value } value={ value } name="room" />
                    <label htmlFor={ value }>{ value }</label>
                    <br></br>
                  </>
                )
              })}
              <button type="submit">Connect</button>
              <button onClick={this.roomDelete}>Delete</button>
            </form>
          </> :
          <>
            <div id="chatContainer">
              <div id="chatHead">
                <p>{this.state.room}</p>
              </div>
              <div id="chatBox">{ this.state.chatArray.map((value, index) => {
                return <li key={ index }>{ value.username }: { value.content }</li>
                })}
              </div>
            </div>
            <form onSubmit={this.submit}>
              <input type="text" name="chatMessage" value={this.state.chatMessage} onChange={this.change} maxLength="200"/>
              <input type="submit" value="Send"/>
            </form>
            <button onClick={this.roomLeave}>Leave</button>
          </>
          }
      </>
    )
  }
}

export default Chatroom;
