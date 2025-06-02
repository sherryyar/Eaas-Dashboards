export interface Stream {
  id: string;
  name: string;
  url: string;
  description: string;
}

export interface StreamPlayerProps {
  stream: Stream;
  onTransition: () => void;
} 