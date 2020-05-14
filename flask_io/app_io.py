from flask import Flask, render_template
from flask_socketio import SocketIO

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)


"""
    Flask Routes
"""


@app.route('/')
def index():
    return render_template('index.html')

""" 
    Socket-IO
    The names message, json, connect and disconnect are reserved and cannot be used for named events
"""

@socketio.on('connect')
def test_connect():
    # emit('my response', {'data': 'Connected'})
    print('Client Connected!')

    
@socketio.on('disconnect')
def test_disconnect():
    print('Client disconnected')

    
@socketio.on('message')
def handle_message(message):
    print('received message: ' + message)

    
@socketio.on('json')
def handle_json(json):
    print('received json: ' + str(json))


@socketio.on('my event')
def handle_my_custom_event(json):
    print('received json: ' + str(json))
    socketio.emit('messages_list', {'user_name': 'MED', 'message': 'todo way'})


# @socketio.on('my event')
# def handle_my_custom_event(arg1, arg2, arg3):
#     print('received args: ' + arg1 + arg2 + arg3)


# Uncalled Server Message
def some_function():
    socketio.emit('some event', {'data': 42})




if __name__ == '__main__':
    socketio.run(app, debug=True)

