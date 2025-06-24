import React from 'react';

interface SystemRequirementsProps {
  minimum?: string;
  recommended?: string;
}

const SystemRequirements: React.FC<SystemRequirementsProps> = ({ minimum, recommended }) => {
  const formatRequirements = (requirements: string | undefined): string[] => {
    if (!requirements) return [];
    return requirements
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
  };

  const minimumRequirements = formatRequirements(minimum);
  const recommendedRequirements = formatRequirements(recommended);

  if (!minimumRequirements.length && !recommendedRequirements.length) {
    return null;
  }

  return (
    <div className="mt-6 md:mt-8 bg-gray-800 rounded-lg p-4 md:p-6 border border-gray-700">
      <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-white">System Requirements</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
        {minimumRequirements.length > 0 && (
          <div className="bg-gray-900 p-4 rounded-lg">
            <h3 className="text-base md:text-xl font-semibold mb-2 md:mb-4 text-green-400">Minimum</h3>
            <ul className="space-y-2">
              {minimumRequirements.map((req, index) => (
                <li key={index} className="text-gray-300">
                  {req}
                </li>
              ))}
            </ul>
          </div>
        )}
        {recommendedRequirements.length > 0 && (
          <div className="bg-gray-900 p-4 rounded-lg">
            <h3 className="text-base md:text-xl font-semibold mb-2 md:mb-4 text-blue-400">Recommended</h3>
            <ul className="space-y-2">
              {recommendedRequirements.map((req, index) => (
                <li key={index} className="text-gray-300">
                  {req}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemRequirements; 