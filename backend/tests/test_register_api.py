import unittest
import uuid

from app import create_app
from app.extensions import db
from app.models import Community, CommunityMember, User


class RegisterApiTestCase(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.app = create_app('development')
        cls.client = cls.app.test_client()

    def make_payload(self, email=None):
        return {
            'fullName': 'Codex Register Test',
            'email': email or f"codex-{uuid.uuid4().hex[:10]}@example.com",
            'password': 'SecurePass123',
            'communityName': 'Codex Recovery Group',
            'groupNumber': 'G-99',
            'disasterType': 'flood',
            'region': 'Sydney',
        }

    def cleanup_email(self, email):
        with self.app.app_context():
            user = User.query.filter_by(email=email).first()
            if not user:
                return

            communities = Community.query.filter_by(created_by=user.id).all()
            community_ids = [community.id for community in communities]
            if community_ids:
                CommunityMember.query.filter(CommunityMember.community_id.in_(community_ids)).delete(synchronize_session=False)
                Community.query.filter(Community.id.in_(community_ids)).delete(synchronize_session=False)

            User.query.filter_by(email=email).delete(synchronize_session=False)
            db.session.commit()

    def test_register_success_matches_documented_contract(self):
        payload = self.make_payload()

        response = self.client.post('/api/register', json=payload)
        body = response.get_json()

        self.assertEqual(response.status_code, 200)
        self.assertEqual(set(body.keys()), {'success', 'message', 'data'})
        self.assertTrue(body['success'])
        self.assertEqual(body['message'], 'Registration successful')
        self.assertEqual(set(body['data'].keys()), {'userId', 'groupName', 'inviteCode', 'createdAt'})
        self.assertEqual(body['data']['groupName'], payload['communityName'])
        self.assertNotIn('communityName', body['data'])

        self.cleanup_email(payload['email'])

    def test_register_validation_errors_use_field_map(self):
        payload = self.make_payload()
        del payload['password']

        response = self.client.post('/api/register', json=payload)
        body = response.get_json()

        self.assertEqual(response.status_code, 400)
        self.assertEqual(body, {
            'success': False,
            'error': 'Validation failed',
            'details': {'password': 'This field is required'},
        })

    def test_register_empty_object_returns_field_level_errors(self):
        response = self.client.post('/api/register', json={})
        body = response.get_json()

        self.assertEqual(response.status_code, 400)
        self.assertEqual(body, {
            'success': False,
            'error': 'Validation failed',
            'details': {
                'fullName': 'This field is required',
                'email': 'This field is required',
                'password': 'This field is required',
                'communityName': 'This field is required',
                'disasterType': 'This field is required',
                'region': 'This field is required',
            },
        })

    def test_register_duplicate_email_returns_documented_validation_shape(self):
        payload = self.make_payload()

        first_response = self.client.post('/api/register', json=payload)
        second_response = self.client.post('/api/register', json=payload)
        body = second_response.get_json()

        self.assertEqual(first_response.status_code, 200)
        self.assertEqual(second_response.status_code, 400)
        self.assertEqual(body, {
            'success': False,
            'error': 'Validation failed',
            'details': {'email': 'Email already exists'},
        })

        self.cleanup_email(payload['email'])


if __name__ == '__main__':
    unittest.main()
