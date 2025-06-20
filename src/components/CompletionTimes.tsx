interface CompletionTimesProps {
  hastily?: { value: number; unit: string };
  normally?: { value: number; unit: string };
  completely?: { value: number; unit: string };
}

const formatTime = (time?: { value: number; unit: string }) => {
  if (!time) return 'N/A';
  
  const value = Math.round(time.value);
  const unit = time.unit.toLowerCase();
  
  if (unit === 'h') {
    if (value === 1) return '1 hour';
    return `${value} hours`;
  } else if (unit === 'm') {
    if (value === 1) return '1 minute';
    return `${value} minutes`;
  } else if (unit === 's') {
    const hours = Math.floor(value / 3600);
    const minutes = Math.floor((value % 3600) / 60);
    
    if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''}${minutes > 0 ? ` ${minutes} minute${minutes > 1 ? 's' : ''}` : ''}`;
    }
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  }
  
  return `${value} ${unit}`;
};

export default function CompletionTimes({ hastily, normally, completely }: CompletionTimesProps) {
  if (!hastily && !normally && !completely) {
    return null;
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">How Long to Beat</h2>
      <div className="space-y-3">
        {hastily && (
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Main Story</span>
            <span className="font-medium">{formatTime(hastily)}</span>
          </div>
        )}
        {normally && (
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Main + Extras</span>
            <span className="font-medium">{formatTime(normally)}</span>
          </div>
        )}
        {completely && (
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Completionist</span>
            <span className="font-medium">{formatTime(completely)}</span>
          </div>
        )}
      </div>
    </div>
  );
} 