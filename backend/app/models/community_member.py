import uuid

from app.extensions import db
from sqlalchemy.dialects.postgresql import UUID


class CommunityMember(db.Model):
    __tablename__ = 'community_members'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    community_id = db.Column(UUID(as_uuid=True), db.ForeignKey('communities.id', ondelete='CASCADE'), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='member')
    joined_at = db.Column(db.DateTime(timezone=True), nullable=False, server_default=db.func.now())

    __table_args__ = (
        db.UniqueConstraint('user_id', 'community_id', name='uq_user_community'),
        db.CheckConstraint("role IN ('admin', 'member')", name='chk_role'),
        db.Index('idx_cm_user_id', 'user_id'),
        db.Index('idx_cm_community_id', 'community_id'),
    )

    def to_dict(self):
        return {
            'id': str(self.id),
            'userId': str(self.user_id),
            'communityId': str(self.community_id),
            'role': self.role,
            'joinedAt': self.joined_at.isoformat() + 'Z',
        }
