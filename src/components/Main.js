import React from 'react';

import Login from './Login.js'
import Chatroom from './Chatroom.js';

class Main extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loggedIn: false,
      userName: "",
    }

    this.userNameSet = this.userNameSet.bind(this);
  }

  userNameSet(userName) {
    this.setState({
      userName: userName,
      loggedIn: true
     })
  }

  render() {
    return(
      <>
        { !this.state.loggedIn ?
            <Login userNameSet={this.userNameSet} /> :
            <Chatroom userName={this.state.userName} />
        }

      </>
    )
  }
}

export default Main;
