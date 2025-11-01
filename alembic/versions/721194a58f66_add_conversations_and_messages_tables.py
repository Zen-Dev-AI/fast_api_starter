"""Add users, conversations and todos tables

Revision ID: 721194a58f66
Revises: 
Create Date: 2025-07-09 10:16:56.672081
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '721194a58f66'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ── create users ─────────────────────────────────────────────────────────
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('email', sa.String(), nullable=False, unique=True),
        sa.Column('hashed_password', sa.String(), nullable=False),
    )
    op.create_index('ix_users_email', 'users', ['email'], unique=True)

    # ── create conversations ─────────────────────────────────────────────────────
    op.create_table(
        'conversations',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('thread_id', sa.String(), nullable=False, unique=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
    )
    op.create_index('ix_conversations_thread_id', 'conversations', ['thread_id'], unique=True)
    op.create_index('ix_conversations_id', 'conversations', ['id'], unique=False)

    # ── create todos ─────────────────────────────────────────────────────────
    op.create_table(
        'todos',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('description', sa.String(), nullable=True),
    )


def downgrade() -> None:
    op.drop_table('todos')
    
    op.drop_index('ix_conversations_id', table_name='conversations')
    op.drop_index('ix_conversations_thread_id', table_name='conversations')
    op.drop_table('conversations')

    op.drop_index('ix_users_email', table_name='users')
    op.drop_table('users')
