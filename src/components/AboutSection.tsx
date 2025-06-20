interface AboutSectionProps {
  description?: string;
}

export default function AboutSection({ description }: AboutSectionProps) {
  if (!description) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">About</h2>
        <p className="text-gray-400">No description available for this game.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">About</h2>
      <div className="prose prose-invert max-w-none">
        <div 
          dangerouslySetInnerHTML={{ __html: description }} 
          className="text-gray-300 leading-relaxed"
        />
      </div>
    </div>
  );
} 