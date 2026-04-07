import unittest
import uuid

from app import create_app
from app.extensions import db
from app.models import Community, CommunityMember, User


class ProfileApiTestCase(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.app = create_app('development')
        cls.client = cls.app.test_client()

    def make_identity(self, prefix='profile', role='admin'):
        token = uuid.uuid4().hex[:10]
        return {
            'email': f'{prefix}-{token}@example.com',
            'full_name': f'{prefix.title()} User',
            'password': 'SecurePass123',
            'community_name': f'{prefix.title()} Community',
            'invite_code': f'{token[:6].upper()}X',
            'role': role,
        }

    def create_user_with_community(self, *, identity=None, community=None, role='admin'):
        identity = identity or self.make_identity(role=role)
        with self.app.app_context():
            user = User(full_name=identity['full_name'], email=identity['email'])
            user.set_password(identity['password'])
            db.session.add(user)
            db.session.flush()

            if community is None:
                community = Community(
                    community_name=identity['community_name'],
                    group_number='G-99',
                    disaster_type='flood',
                    region='Northern Rivers, NSW',
                    invite_code=identity['invite_code'],
                    created_by=user.id,
                )
                db.session.add(community)
                db.session.flush()

            membership = CommunityMember(
                user_id=user.id,
                community_id=community.id,
                role=role,
            )
            db.session.add(membership)
            db.session.commit()
            return {
                'identity': identity,
                'user_id': user.id,
                'community_id': community.id,
            }

    def login_and_get_token(self, email, password):
        response = self.client.post('/api/login', json={'email': email, 'password': password})
        self.assertEqual(response.status_code, 200)
        return response.get_json()['data']['token']

    def cleanup_email(self, email):
        with self.app.app_context():
            user = User.query.filter_by(email=email).first()
            if not user:
                return

            memberships = CommunityMember.query.filter_by(user_id=user.id).all()
            community_ids = [membership.community_id for membership in memberships]
            if community_ids:
                CommunityMember.query.filter(CommunityMember.community_id.in_(community_ids)).delete(
                    synchronize_session=False
                )
                Community.query.filter(Community.id.in_(community_ids)).delete(synchronize_session=False)

            User.query.filter_by(id=user.id).delete(synchronize_session=False)
            db.session.commit()

    def test_profile_requires_token(self):
        response = self.client.put('/api/profile', json={'fullName': 'New Name'})
        body = response.get_json()

        self.assertEqual(response.status_code, 401)
        self.assertEqual(body, {
            'success': False,
            'error': 'Missing authorization token',
        })

    def test_profile_updates_full_name_and_region_for_admin(self):
        admin = self.create_user_with_community(identity=self.make_identity(prefix='profile-admin', role='admin'))
        token = self.login_and_get_token(admin['identity']['email'], admin['identity']['password'])

        response = self.client.put(
            '/api/profile',
            json={'fullName': 'New Name', 'region': 'Sydney, NSW'},
            headers={'Authorization': f'Bearer {token}'},
        )
        body = response.get_json()

        self.assertEqual(response.status_code, 200)
        self.assertEqual(body, {
            'success': True,
            'message': 'Profile updated successfully',
            'data': {
                'fullName': 'New Name',
                'region': 'Sydney, NSW',
            },
        })

        with self.app.app_context():
            user = User.query.filter_by(email=admin['identity']['email']).first()
            community = Community.query.filter_by(id=admin['community_id']).first()
            self.assertEqual(user.full_name, 'New Name')
            self.assertEqual(community.region, 'Sydney, NSW')

        self.cleanup_email(admin['identity']['email'])

    def test_profile_allows_member_to_update_full_name_only(self):
        admin = self.create_user_with_community(identity=self.make_identity(prefix='profile-parent', role='admin'))
        with self.app.app_context():
            community = Community.query.filter_by(id=admin['community_id']).first()
        member_identity = self.make_identity(prefix='profile-member', role='member')
        self.create_user_with_community(identity=member_identity, community=community, role='member')
        token = self.login_and_get_token(member_identity['email'], member_identity['password'])

        response = self.client.put(
            '/api/profile',
            json={'fullName': 'Updated Member'},
            headers={'Authorization': f'Bearer {token}'},
        )
        body = response.get_json()

        self.assertEqual(response.status_code, 200)
        self.assertEqual(body, {
            'success': True,
            'message': 'Profile updated successfully',
            'data': {
                'fullName': 'Updated Member',
                'region': 'Northern Rivers, NSW',
            },
        })

        self.cleanup_email(member_identity['email'])
        self.cleanup_email(admin['identity']['email'])

    def test_profile_rejects_region_update_for_non_admin(self):
        admin = self.create_user_with_community(identity=self.make_identity(prefix='profile-parent', role='admin'))
        with self.app.app_context():
            community = Community.query.filter_by(id=admin['community_id']).first()
        member_identity = self.make_identity(prefix='profile-member', role='member')
        self.create_user_with_community(identity=member_identity, community=community, role='member')
        token = self.login_and_get_token(member_identity['email'], member_identity['password'])

        response = self.client.put(
            '/api/profile',
            json={'region': 'Sydney, NSW'},
            headers={'Authorization': f'Bearer {token}'},
        )
        body = response.get_json()

        self.assertEqual(response.status_code, 403)
        self.assertEqual(body, {
            'success': False,
            'error': 'Insufficient permissions',
        })

        with self.app.app_context():
            unchanged_community = Community.query.filter_by(id=admin['community_id']).first()
            self.assertEqual(unchanged_community.region, 'Northern Rivers, NSW')

        self.cleanup_email(member_identity['email'])
        self.cleanup_email(admin['identity']['email'])

    def test_profile_rejects_empty_object(self):
        admin = self.create_user_with_community(identity=self.make_identity(prefix='profile-empty', role='admin'))
        token = self.login_and_get_token(admin['identity']['email'], admin['identity']['password'])

        response = self.client.put(
            '/api/profile',
            json={},
            headers={'Authorization': f'Bearer {token}'},
        )
        body = response.get_json()

        self.assertEqual(response.status_code, 400)
        self.assertEqual(body, {
            'success': False,
            'error': 'Validation failed',
            'details': {'body': 'At least one updatable field is required'},
        })

        self.cleanup_email(admin['identity']['email'])

    def test_profile_rejects_non_object_json(self):
        admin = self.create_user_with_community(identity=self.make_identity(prefix='profile-non-object', role='admin'))
        token = self.login_and_get_token(admin['identity']['email'], admin['identity']['password'])

        response = self.client.put(
            '/api/profile',
            data='"hello"',
            headers={
                'Authorization': f'Bearer {token}',
                'Content-Type': 'application/json',
            },
        )
        body = response.get_json()

        self.assertEqual(response.status_code, 400)
        self.assertEqual(body, {
            'success': False,
            'error': 'Validation failed',
            'details': {'body': 'Request body must be a JSON object'},
        })

        self.cleanup_email(admin['identity']['email'])


if __name__ == '__main__':
    unittest.main()
