import random  
from flask import Flask, render_template, request, jsonify 
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

app = Flask(__name__)

# 1. SETUP THE DATABASE
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///badminton.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# 2. DEFINE THE DATA STRUCTURE
class Match(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.String(20), default=datetime.now().strftime("%Y-%m-%d"))
    p1_name = db.Column(db.String(50), nullable=False)
    p2_name = db.Column(db.String(50), nullable=False)
    winner = db.Column(db.String(50))
    score_sets = db.Column(db.String(20))

# 3. THE ROUTES

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/tournament')
def tournament():
    return render_template('tournament.html')

@app.route('/api/save_match', methods=['POST'])
def save_match():
    data = request.json
    new_match = Match(
        p1_name=data['p1'],
        p2_name=data['p2'],
        winner=data['winner'],
        score_sets=data['score']
    )
    db.session.add(new_match)
    db.session.commit() 
    return jsonify({"message": "Match Saved Successfully!"})

@app.route('/api/matches')
def get_matches():
    matches = Match.query.order_by(Match.id.desc()).all()
    history = []
    for m in matches:
        history.append({
            "date": m.date,
            "p1": m.p1_name,
            "p2": m.p2_name,
            "winner": m.winner,
            "score": m.score_sets
        })
    return jsonify(history)

@app.route('/api/toss', methods=['GET'])
def toss_coin_api():
    result = random.choice(['Heads', 'Tails'])
    return jsonify({"result": result})

# 4. START THE APP 
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)