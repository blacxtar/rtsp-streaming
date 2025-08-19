import { ChevronRight } from "lucide-react";
import React from "react";

// Define the shape of a single stream object
export type Stream = {
  streamId: string;
  running: boolean;
  hlsUrl: string;
};

// Update props to accept the full stream objects
type StreamListProps = {
  streams: Stream[];
  activeStreamId?: string | null;
  onStreamSelect: (id: string) => void;
};

const StreamList = ({
  streams,
  activeStreamId,
  onStreamSelect,
}: StreamListProps) => {
  return (
    <div className="w-full mx-auto bg-gray-100 text-black rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-bold mb-4">Available Streams</h2>
      
      {streams.length > 0 ? (
        <ul className="space-y-2">
          {streams.map((stream) => (
            <li key={stream.streamId}>
              <button
                onClick={() => onStreamSelect(stream.streamId)}
                className={`
                  w-full flex items-center justify-between p-4 rounded-lg text-left
                  transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 
                  focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500
                  ${
                    stream.streamId === activeStreamId
                      ? "bg-indigo-600 shadow-md"
                      : "bg-gray-800 hover:bg-gray-700 hover:scale-[1.02]"
                  }
                `}
              >
                {/* Left side: Status indicator and ID */}
                <div className="flex items-center gap-3">
                  <span 
                    className={`h-2.5 w-2.5 rounded-full ${stream.running ? 'bg-green-500' : 'bg-gray-500'}`}
                    title={stream.running ? 'Running' : 'Stopped'}
                  />
                  <span className="font-mono text-sm text-white truncate">{stream.streamId}</span>
                </div>
                
                {/* Right side: Chevron icon */}
                <ChevronRight className="h-5 w-5 text-gray-300 flex-shrink-0" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center text-gray-500 py-8">
          <p>No streams available.</p>
        </div>
      )}
    </div>
  );
};

export default StreamList;