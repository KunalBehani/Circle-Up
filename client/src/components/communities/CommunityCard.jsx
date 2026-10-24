import React from 'react';
import { Link } from 'react-router-dom';
import { Users } from 'lucide-react';
import { JoinButton } from './JoinButton.jsx';
import { Badge } from '../common/Badge.jsx';

export const CommunityCard = ({ community, onMembershipChange }) => {
  return (
    <div className="editorial-card p-5 flex flex-col justify-between hover:shadow-card transition-shadow">
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <Link to={`/c/${community.slug}`} className="flex items-center gap-3 group min-w-0">
            <span
              className="w-10 h-10 rounded-xl flex items-center justify-center text-sm text-white font-bold shrink-0 shadow-sm"
              style={{ backgroundColor: community.bannerColor || '#4F46E5' }}
            >
              c/
            </span>
            <div className="min-w-0">
              <h3 className="font-bold text-neutral-900 group-hover:text-brand-600 transition-colors truncate">
                {community.name}
              </h3>
              <p className="text-xs text-neutral-500 font-medium">c/{community.slug}</p>
            </div>
          </Link>

          <JoinButton
            communityId={community._id}
            initialIsMember={community.isMember}
            size="sm"
            onToggle={(newMemberState, newCount) => {
              if (onMembershipChange) onMembershipChange(community._id, newMemberState, newCount);
            }}
          />
        </div>

        <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed mb-4">
          {community.description}
        </p>
      </div>

      <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
        <span className="flex items-center gap-1.5 font-medium">
          <Users className="w-3.5 h-3.5 text-neutral-400" />
          {community.memberCount} {community.memberCount === 1 ? 'member' : 'members'}
        </span>
        <Badge variant="brand">{community.category || 'General'}</Badge>
      </div>
    </div>
  );
};

export default CommunityCard;
