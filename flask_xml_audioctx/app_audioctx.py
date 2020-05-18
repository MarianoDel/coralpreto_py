from flask import Flask, render_template, send_file


app = Flask(__name__)


"""
    Flask Routes
"""
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/2minutos.wav')
def sendfile():
    return send_file('static/2minutos.wav')


if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)

