let map, polyline, isPaused = false;
let currentMarker = null;  // 현재 위치 마커를 저장할 변수
let stepCount = 0;         // 걸음 수 저장
let threshold = 12;        // 가속도 값의 임계값 설정
let lastAcceleration = { x: 0, y: 0, z: 0 };
let isTrackingSteps = false;

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 15,
        center: { lat: 37.5665, lng: 126.9780 },  // 예시 위치: 서울
    });

    polyline = new google.maps.Polyline({
        map: map,
        path: [],
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 2
    });
}

function handleLocation(position) {
    const { latitude, longitude } = position.coords;
    const newPos = new google.maps.LatLng(latitude, longitude);
    // 마커 위치 업데이트
    updateMarker(newPos);
    if (!isPaused) {
        polyline.getPath().push(newPos);
        map.setCenter(newPos);
        console.log({ lat: latitude, lng: longitude, timestamp: new Date().toISOString() });  // 현재 위치 콘솔에 로그
    }
}

function updateMarker(position) {
    if (currentMarker) {
        // 마커가 이미 존재하면 위치만 업데이트
        currentMarker.setPosition(position);
    } else {
        // 마커가 존재하지 않으면 새로 생성
        currentMarker = new google.maps.Marker({
            position: position,
            map: map,
            title: "Your Location"
        });
    }
}

function watchPosition() {
    navigator.geolocation.watchPosition(handleLocation, handleError, {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 27000
    });
}

function handleError(error) {
    console.error("Geolocation error: ", error.message);
}

// 걸음 수 측정 시작
function startStepTracking() {
    if (window.DeviceMotionEvent) {
        window.addEventListener('devicemotion', (event) => {
            if (!isPaused && isTrackingSteps) {
                let acceleration = event.acceleration;

                if (acceleration && acceleration.x !== null && acceleration.y !== null && acceleration.z !== null) {
                    let deltaX = Math.abs(lastAcceleration.x - acceleration.x);
                    let deltaY = Math.abs(lastAcceleration.y - acceleration.y);
                    let deltaZ = Math.abs(lastAcceleration.z - acceleration.z);

                    // 가속도 변화량이 임계값을 넘으면 걸음 수를 증가시킴
                    if (deltaX > threshold || deltaY > threshold || deltaZ > threshold) {
                        stepCount++;
                        document.getElementById('stepCounter').innerText = `Steps: ${stepCount}`;
                    }

                    lastAcceleration = {
                        x: acceleration.x,
                        y: acceleration.y,
                        z: acceleration.z
                    };
                }
            }
        });
    } else {
        alert('DeviceMotion API not supported by this device.');
    }
}

document.getElementById('startBtn').addEventListener('click', function() {
    document.getElementById('startBtn').style.display = 'none';
    document.getElementById('pauseBtn').style.display = 'block';
    document.getElementById('stopBtn').style.display = 'block';
    isTrackingSteps = true;
    initMap();
    watchPosition();
    startStepTracking(); // 걸음 수 측정도 시작
});

document.getElementById('pauseBtn').addEventListener('click', function() {
    isPaused = true;
    document.getElementById('pauseBtn').style.display = 'none';
    document.getElementById('resumeBtn').style.display = 'block';
});

document.getElementById('resumeBtn').addEventListener('click', function() {
    isPaused = false;
    document.getElementById('resumeBtn').style.display = 'none';
    document.getElementById('pauseBtn').style.display = 'block';
});

// 걸음 수를 초기화하고 멈추는 기능 추가
document.getElementById('stopBtn').addEventListener('click', function() {
    isPaused = true;
    isTrackingSteps = false;
    stepCount = 0;  // 걸음 수 초기화
    document.getElementById('stepCounter').innerText = `Steps: ${stepCount}`;
    document.getElementById('startBtn').style.display = 'block';
    document.getElementById('pauseBtn').style.display = 'none';
    document.getElementById('resumeBtn').style.display = 'none';
    document.getElementById('stopBtn').style.display = 'none';
});
