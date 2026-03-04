from fastapi.testclient import TestClient

from backend.app import app


client = TestClient(app)


def test_health() -> None:
    response = client.get('/api/health')
    assert response.status_code == 200
    assert response.json() == {'ok': True}


def test_video_outline_contains_topic_content() -> None:
    payload = {
        'conceptId': 'linear_equations',
        'conceptTitle': 'Linear Equations',
        'conceptDescription': 'they model relationships with a constant rate of change',
    }
    response = client.post('/api/generate-video-outline', json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data['conceptId'] == 'linear_equations'
    assert len(data['slides']) == 5
    narrations = ' '.join(slide['narration'] for slide in data['slides'])
    assert 'Linear Equations' in narrations
