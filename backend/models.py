from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Vehicle(db.Model):
    __tablename__ = 'vehicles'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False, unique=True)
    price = db.Column(db.Float, nullable=False)
    range = db.Column(db.Float, nullable=False)
    top_speed = db.Column(db.Float, nullable=False)
    battery = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'price': self.price,
            'range': self.range,
            'top_speed': self.top_speed,
            'battery': self.battery
        }


class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.String(255), unique=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    results = db.relationship('Result', backref='user', lazy=True)


class Result(db.Model):
    __tablename__ = 'results_history'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    
    weight_price = db.Column(db.Float)
    weight_range = db.Column(db.Float)
    weight_top_speed = db.Column(db.Float)
    weight_battery = db.Column(db.Float)
    
    consistency_ratio = db.Column(db.Float)
    ranking_results = db.Column(db.JSON)
    total_vehicles_processed = db.Column(db.Integer)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
