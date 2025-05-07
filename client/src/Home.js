import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { messageService } from './services/apiService';
import { getSocket, disconnectSocket } from './services/socketService';
import './Home.css';

function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      const parsed = JSON.parse(stored);
      setUser(parsed);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    if (user?._id) {
      const socket = getSocket();
      socket.emit('register', user._id);
    }
  }, [user]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await messageService.getUsers();
        setFriends(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    if (user && selectedFriend) {
      const fetchMessages = async () => {
        try {
          const messages = await messageService.getMessages(user._id, selectedFriend._id);
          setMessages(messages);
        } catch (error) {
          console.error('Error fetching messages:', error);
        }
      };
      fetchMessages();
    }
  }, [selectedFriend, user]);

  useEffect(() => {
    if (!user) return;

    const socket = getSocket();
    const handleNewMessage = (msg) => {
      const isCurrentChat =
        selectedFriend &&
        ((msg.sender === user._id && msg.receiver === selectedFriend._id) ||
        (msg.sender === selectedFriend._id && msg.receiver === user._id));

      if (isCurrentChat) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.on('newMessage', handleNewMessage);
    return () => socket.off('newMessage', handleNewMessage);
  }, [selectedFriend, user]);

  const sendMessage = async () => {
    if (!content.trim()) return;

    const newMsg = {
      sender: user._id,
      receiver: selectedFriend._id,
      content,
      timestamp: new Date(),
      status: 'sent'
    };

    try {
      await messageService.sendMessage(newMsg);
      setMessages(prev => [...prev, newMsg]);
      const socket = getSocket();
      socket.emit('send-message', newMsg);
      setContent('');
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const handleLogout = () => {
    disconnectSocket();
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const scrollToLastMessages = () => {
    const container = document.querySelector('.messages');
    if (container) {
      const all = container.children;
      if (all.length > 10) {
        const target = all[all.length - 11];
        target?.scrollIntoView({ behavior: 'auto' });
      } else {
        container.scrollTop = container.scrollHeight;
      }
    }
  };
  


  const formatMessage = (text = '', wordsPerLine = 10) => {
    const words = text.split(' ');
    let result = '';
    for (let i = 0; i < words.length; i++) {
      result += words[i] + ' ';
      if ((i + 1) % wordsPerLine === 0) result += '\n';
    }
    return result.trim();
  };
  
  



  useEffect(() => {
    scrollToLastMessages();
  }, [messages]);

  if (!user) return <div>Loading...</div>;

  return (


    


    <div className="chat-app">
      <div className="sidebar">
      <div className="menu">
      
      <div class="dropdown">
  <button class="dropbtn"><span>&#9776;</span></button>
  <div class="dropdown-content">
  <button onClick={handleProfileClick}>Profile</button><br></br>
  <button onClick={handleLogout}>Logout</button>
    
  </div>
</div>
     
              
<h1>Telegram</h1>
              
            </div>

            
        
        <div className="sidebar-header">
          <div className="profile">
            <div className="limon"><img src={user.profileImage || '/default-profile.png'} alt="Profile" className="profile-img" />
            <h2>{user.name}</h2>
            </div>
            

           
          </div>
        </div>

        <input
          type="text"
          placeholder="Search friend"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-bar"
        />

        <div className="friend-list">
          <h2>Chat List</h2>
          {friends
            .filter(f => f._id !== user._id && f.name && f.name.toLowerCase().includes((searchQuery || '').toLowerCase()))
            .map(friend => (
              <div
                key={friend._id}
                className="friend"
                onClick={() => fetchMessages(friend)}
              >
                {friend.name}
              </div>
            ))}
        </div>
      </div>

      <div className="chatbox">
        {selectedFriend ? (
          <>
            <div className="chat-header">
              <h2>{selectedFriend.name}</h2>
            </div>
            <div className="messages">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={msg.sender === user._id ? 'message me' : 'message friend'}
                >
                  {formatMessage(msg.content)}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="input-area">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Type message"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
              />
              <input type="file" style={{ display: 'none' }} id="fileInput" />
              <label htmlFor="fileInput" className="file-upload"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="s-icon s-icon-icon-file-upload" viewBox="0 0 16 16">
  <path fill-rule="evenodd" d="M10.534 2.027c-.533 0-1.04.213-1.413.587L2.994 8.74a3.348 3.348 0 0 0-.066 4.734 3.342 3.342 0 0 0 4.733.06l.08-.08 6.094-6.094c.26-.26.686-.26.946 0 .26.26.26.687 0 .947l-6.1 6.127a4.698 4.698 0 0 1-6.646-.014C.207 12.58.207 9.6 2.054 7.774L8.18 1.647a3.332 3.332 0 0 1 4.72 0 3.332 3.332 0 0 1 0 4.72l-6.133 6.127c-.78.78-2.053.78-2.833 0a2.008 2.008 0 0 1 0-2.834l5.66-5.626c.26-.26.686-.26.946 0 .26.26.26.686 0 .946l-5.66 5.654a.67.67 0 0 0-.006.94c.126.126.3.2.48.2a.651.651 0 0 0 .466-.2l6.133-6.127a2 2 0 0 0 0-2.827 2.015 2.015 0 0 0-1.42-.593Z"/>
</svg></label>
              <button className="voice-btn"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="s-icon s-icon-icon-mic" viewBox="0 0 16 16">
  <path fill-rule="evenodd" d="M8 10.667A2.666 2.666 0 0 0 10.667 8V2.667A2.67 2.67 0 0 0 9.887.78a2.672 2.672 0 0 0-3.773 0c-.5.5-.78 1.18-.78 1.887V8A2.666 2.666 0 0 0 8 10.667Zm-1.333-8c0-.734.6-1.334 1.333-1.334.734 0 1.334.6 1.334 1.334V8c0 .733-.6 1.333-1.334 1.333-.733 0-1.333-.6-1.333-1.333V2.667Zm6.667 4V8c0 2.72-2.034 4.96-4.667 5.287v1.38h2c.367 0 .667.3.667.666 0 .367-.3.667-.667.667H5.334a.669.669 0 0 1-.667-.667c0-.366.3-.666.667-.666h2v-1.38A5.326 5.326 0 0 1 2.667 8V6.667c0-.367.3-.667.667-.667C3.7 6 4 6.3 4 6.667V8c0 2.207 1.794 4 4 4 2.207 0 4-1.793 4-4V6.667c0-.367.3-.667.667-.667.367 0 .667.3.667.667Z"/>
</svg></button>
              <button onClick={sendMessage}><span>&#10148;</span>
              </button>
            </div>
          </>
        ) : (
          <div className="chat-placeholder">Select a friend to start chatting!</div>
        )}
      </div>
    </div>
  );
}






export default Home;
