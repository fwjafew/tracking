from flask import Flask, render_template, request, jsonify
import json

app = Flask(__name__)

# 메모리에 데이터를 임시 저장 (데이터베이스 대신 간단한 임시 저장소)
data_storage = {
    'steps': [],
    'locations': []
}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/track-steps', methods=['POST'])
def track_steps():
    # 클라이언트에서 걸음 수 데이터를 받음
    data = request.json
    steps = data.get('steps', 0)
    data_storage['steps'].append(steps)
    return jsonify({'message': 'Steps recorded', 'total_steps': sum(data_storage['steps'])})

@app.route('/track-location', methods=['POST'])
def track_location():
    # 클라이언트에서 위치 데이터를 받음
    data = request.json
    latitude = data.get('latitude')
    longitude = data.get('longitude')
    if latitude and longitude:
        data_storage['locations'].append({'lat': latitude, 'lng': longitude})
    return jsonify({'message': 'Location recorded', 'total_locations': len(data_storage['locations'])})

@app.route('/get-data', methods=['GET'])
def get_data():
    # 저장된 걸음 수와 위치 데이터를 반환
    return jsonify({
        'steps': data_storage['steps'],
        'locations': data_storage['locations']
    })

if __name__ == '__main__':
    app.run(debug=True)
