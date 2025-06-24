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
    <div className="bg-gray-800 rounded-lg p-6 md:p-8">
      <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">About</h2>
      <div className="prose prose-invert max-w-none text-gray-200">
        <div 
          dangerouslySetInnerHTML={{ __html: description }} 
          className="leading-relaxed"
        />
      </div>
    </div>
  );
} 