'use client';

import Image from 'next/image';

type ContentDescriptor = {
  id: number;
  description: string;
};

type AgeRating = {
  id: number;
  rating_cover_url?: string;
  organization?: {
    name: string;
  };
  rating_category?: {
    rating: string;
  };
  rating_content_descriptions_v2?: ContentDescriptor[];
};

export default function AgeRatingDisplay({ ratings }: { ratings: AgeRating[] }) {
  // Filter out ratings that are all 'Unknown' or 'Rating not listed' and have no content descriptions
  const filteredRatings = (ratings || []).filter(
    r =>
      (r.organization?.name && r.organization.name !== 'Unknown') ||
      (r.rating_category?.rating && r.rating_category.rating !== 'Rating not listed') ||
      (r.rating_content_descriptions_v2 && r.rating_content_descriptions_v2.length > 0)
  );

  if (!filteredRatings || filteredRatings.length === 0) {
    return null;
  }

  return (
    <div className="mt-6">
      <h3 className="text-xl font-semibold mb-4">Age Rating</h3>
      <div className="space-y-4">
        {filteredRatings.map(rating => (
          <div 
            key={rating.id || Math.random()} 
            className="bg-gray-800 rounded-lg p-4 border border-gray-700"
          >
            <div className="flex items-center gap-3 mb-3">
              {rating.rating_cover_url && (
                <div className="relative w-12 h-12 flex-shrink-0">
                  <Image
                    src={rating.rating_cover_url}
                    alt={`${rating.organization?.name || 'Rating'} icon`}
                    fill
                    className="object-contain"
                  />
                </div>
              )}
              <div>
                {rating.organization?.name && (
                  <div className="font-medium text-lg">
                    {rating.organization.name}
                  </div>
                )}
                {rating.rating_category?.rating && (
                  <div className="text-gray-400">
                    {rating.rating_category.rating}
                  </div>
                )}
              </div>
            </div>
            {rating.rating_content_descriptions_v2 && 
             rating.rating_content_descriptions_v2.length > 0 && (
              <div className="text-sm text-gray-400">
                {rating.rating_content_descriptions_v2.map((desc, idx, arr) => (
                  <span key={desc.id}>
                    {desc.description}
                    {idx < arr.length - 1 && <span key={desc.id + '-sep'} className="mx-1">•</span>}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 